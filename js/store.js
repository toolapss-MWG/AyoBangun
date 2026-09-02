import { MATERIAL_CATALOG } from './catalog.js';

const KEY='ayoBangunContractorStateV1';
const COLLECTIONS=['users','projects','materials','stock','usage','attendance','progress','issues','reports','rab','suppliers','tools','toolLogs','purchases','hse','audit'];
const listeners=new Set();
let remote=null;

const now=()=>new Date().toISOString();
const id=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const clone=v=>JSON.parse(JSON.stringify(v));

async function sha(text){
  const b=new TextEncoder().encode(text); const d=await crypto.subtle.digest('SHA-256',b);
  return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function baseState(){
 const projectId='prj_demo';
 return {
  meta:{version:1,createdAt:now(),mode:'local'},
  settings:{orgId:'ayo-bangun-id',companyName:'Ayo Bangun.ID Contractor',tagline:'developer & construction',whatsappNumbers:['6281234567890'],whatsappAuto:false,currency:'IDR',firebaseConfig:null},
  session:{userId:null,activeProjectId:projectId},
  users:[],
  projects:[{id:projectId,name:'Proyek Demo Ayo Bangun',code:'AB-001',description:'Proyek contoh untuk memulai penggunaan aplikasi.',location:'Indonesia',client:'Owner Proyek',contractValue:0,startDate:new Date().toISOString().slice(0,10),endDate:'',status:'active',createdAt:now(),updatedAt:now()}],
  materials:MATERIAL_CATALOG.map(m=>({...m,id:`mat_${m.code.replace(/[^a-z0-9]/gi,'_')}`,projectId:null,createdAt:now(),updatedAt:now()})),
  stock:[],usage:[],attendance:[],progress:[],issues:[],reports:[],rab:[],suppliers:[],tools:[],toolLogs:[],purchases:[],hse:[],audit:[]
 };
}

let state;
try{state=JSON.parse(localStorage.getItem(KEY)||'null')||baseState();}catch{state=baseState();}
for(const c of COLLECTIONS) if(!Array.isArray(state[c])) state[c]=[];
if(!state.settings) state.settings=baseState().settings;
if(!state.session) state.session={userId:null,activeProjectId:state.projects[0]?.id||null};

async function ensureUsers(){
 if(state.users.length) return;
 state.users=[
  {id:'usr_owner',username:'owner',name:'Owner Ayo Bangun',role:'owner',passwordHash:await sha('AYOBANGUN#2026'),active:true,createdAt:now(),updatedAt:now()},
  {id:'usr_admin',username:'admin',name:'Admin Proyek',role:'admin',passwordHash:await sha('0000'),active:true,createdAt:now(),updatedAt:now()},
  {id:'usr_mandor1',username:'mandor1',name:'Mandor 1',role:'mandor',passwordHash:await sha('1234'),active:true,createdAt:now(),updatedAt:now()}
 ]; save(false);
}

function save(notify=true){localStorage.setItem(KEY,JSON.stringify(state)); if(notify) emit();}
function emit(){for(const fn of listeners) try{fn(clone(state));}catch{} }

export const Store={
 async init(){await ensureUsers(); return clone(state)},
 subscribe(fn){listeners.add(fn); return()=>listeners.delete(fn)},
 get(){return state},
 currentUser(){return state.users.find(u=>u.id===state.session.userId)||null},
 activeProject(){return state.projects.find(p=>p.id===state.session.activeProjectId)||state.projects[0]||null},
 setActiveProject(projectId){state.session.activeProjectId=projectId; save()},
 async loginLocal(username,password){
  const h=await sha(password); const u=state.users.find(x=>x.username.toLowerCase()===username.trim().toLowerCase()&&x.active!==false);
  if(!u||u.passwordHash!==h) return null; state.session.userId=u.id; save(); return clone(u);
 },
 logout(){state.session.userId=null; save()},
 list(collection,projectId=null){
  let rows=state[collection]||[];
  if(projectId!==null) rows=rows.filter(x=>x.projectId===projectId || x.projectId==null);
  return rows;
 },
 find(collection,idv){return (state[collection]||[]).find(x=>x.id===idv)||null},
 async upsert(collection,record,{audit=true}={}){
  if(!Array.isArray(state[collection])) throw new Error('Koleksi tidak dikenal');
  const idx=state[collection].findIndex(x=>x.id===record.id); const user=this.currentUser();
  const obj={...record,id:record.id||id(collection.slice(0,3)),updatedAt:now(),updatedBy:user?.id||'system'};
  if(idx<0){obj.createdAt=obj.createdAt||now(); state[collection].push(obj)} else state[collection][idx]={...state[collection][idx],...obj};
  if(audit && collection!=='audit') this.audit(idx<0?'create':'update',collection,obj.id,obj.name||obj.title||obj.code||'');
  const auditRow=audit && collection!=='audit'?clone(state.audit[0]):null; save(); if(remote){await remote.upsert(collection,clone(obj)); if(auditRow) await remote.upsert('audit',auditRow)} return clone(obj);
 },
 async remove(collection,idv){
  const old=this.find(collection,idv); state[collection]=(state[collection]||[]).filter(x=>x.id!==idv); this.audit('delete',collection,idv,old?.name||old?.title||''); const auditRow=clone(state.audit[0]); save(); if(remote){await remote.remove(collection,idv); await remote.upsert('audit',auditRow)}
 },
 async updateSettings(patch){state.settings={...state.settings,...patch,updatedAt:now()}; this.audit('update','settings','general','Pengaturan aplikasi'); save(); if(remote) await remote.saveSettings(clone(state.settings));},
 audit(action,collection,recordId,label=''){const u=this.currentUser(); state.audit.unshift({id:id('aud'),projectId:state.session.activeProjectId,userId:u?.id||'system',userName:u?.name||'System',role:u?.role||'system',action,collection,recordId,label,timestamp:now()}); if(state.audit.length>2000) state.audit.length=2000;},
 async setPassword(userId,password){const u=this.find('users',userId); if(!u) throw new Error('User tidak ditemukan'); u.passwordHash=await sha(password); u.updatedAt=now(); this.audit('password','users',userId,u.username); save(); if(remote){const copy={...u}; delete copy.passwordHash; await remote.upsert('users',copy)}},
 async createLocalUser(data,password){if(state.users.some(u=>u.username.toLowerCase()===data.username.toLowerCase())) throw new Error('Username sudah digunakan'); const u={id:id('usr'),...data,passwordHash:await sha(password),active:true,createdAt:now(),updatedAt:now()}; state.users.push(u); this.audit('create','users',u.id,u.username); save(); if(remote){const copy={...u}; delete copy.passwordHash; await remote.upsert('users',copy)} return u;},
 setRemote(adapter){remote=adapter; state.meta.mode=adapter?'firebase':'local'; save()},
 applyRemoteCollection(collection,rows){
  if(!Array.isArray(state[collection])) return;
  if(collection==='users'){
   const localPwd=Object.fromEntries(state.users.map(u=>[u.id,u.passwordHash]));
   state.users=rows.map(u=>({...u,passwordHash:localPwd[u.id]||u.passwordHash||''}));
  } else if(collection==='materials'){
   const remoteById=Object.fromEntries(rows.map(x=>[x.id,x]));
   state.materials=state.materials.map(x=>remoteById[x.id]?{...x,...remoteById[x.id]}:x);
   for(const x of rows) if(!state.materials.some(y=>y.id===x.id)) state.materials.push(x);
  } else if(rows.length || !state[collection].length) state[collection]=rows;
  save();
 },
 applyRemoteSettings(settings){state.settings={...state.settings,...settings}; save()},
 replaceAll(newState){state=newState; save()},
 exportData(){return clone(state)},
 importData(data){if(!data||!data.projects||!data.users) throw new Error('Format backup tidak valid'); state=data; save()},
 newId:id,
 now
};
