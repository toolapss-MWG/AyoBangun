const V='10.12.2';
let app,db,auth,storage,functions,modules={},orgId='ayo-bangun-id',unsubs=[];
const COLLECTIONS=['users','projects','materials','stock','usage','attendance','progress','issues','reports','rab','suppliers','tools','toolLogs','purchases','hse','audit'];

export const FirebaseBridge={
 connected:false,
 async connect(config,organizationId,callbacks={}){
  if(!config?.apiKey||!config?.projectId) throw new Error('Konfigurasi Firebase belum lengkap');
  const [appM,fireM,authM,storageM,funcM]=await Promise.all([
   import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
   import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
   import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
   import(`https://www.gstatic.com/firebasejs/${V}/firebase-storage.js`),
   import(`https://www.gstatic.com/firebasejs/${V}/firebase-functions.js`)
  ]);
  modules={appM,fireM,authM,storageM,funcM}; orgId=organizationId||'ayo-bangun-id';
  app=appM.initializeApp(config); db=fireM.getFirestore(app); auth=authM.getAuth(app); storage=storageM.getStorage(app); functions=funcM.getFunctions(app);
  try{await fireM.enableIndexedDbPersistence(db)}catch{}
  this.connected=true; callbacks.onStatus?.('connected');
  return this;
 },
 emailFor(username){return `${String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')}@ayobangun.id`},
 async signIn(username,password){const {authM}=modules; const cred=await authM.signInWithEmailAndPassword(auth,this.emailFor(username),password); return cred.user},
 async signOut(){if(auth) await modules.authM.signOut(auth)},
 async getUserProfile(uid){const {fireM}=modules; const d=await fireM.getDoc(fireM.doc(db,'organizations',orgId,'users',uid)); return d.exists()?{id:d.id,...d.data()}:null},
 async bootstrap(localState){
  const {fireM}=modules; const pq=await fireM.getDocs(fireM.collection(db,'organizations',orgId,'projects'));
  if(pq.empty){for(const p of localState.projects||[]) await this.upsert('projects',p); for(const m of localState.materials||[]) await this.upsert('materials',m); await this.saveSettings(localState.settings||{})}
 },
 currentUid(){return auth?.currentUser?.uid||null},
 async startRealtime(callbacks){
  const {fireM}=modules; this.stopRealtime();
  for(const c of COLLECTIONS){
   const q=fireM.collection(db,'organizations',orgId,c);
   unsubs.push(fireM.onSnapshot(q,s=>callbacks.onCollection?.(c,s.docs.map(d=>({id:d.id,...d.data()}))),e=>callbacks.onError?.(e)));
  }
  const sref=fireM.doc(db,'organizations',orgId,'settings','general');
  unsubs.push(fireM.onSnapshot(sref,d=>{if(d.exists()) callbacks.onSettings?.(d.data())}));
 },
 stopRealtime(){unsubs.forEach(u=>u()); unsubs=[]},
 async upsert(collection,item){const {fireM}=modules; const data={...item}; delete data.passwordHash; await fireM.setDoc(fireM.doc(db,'organizations',orgId,collection,item.id),data,{merge:true})},
 async remove(collection,id){const {fireM}=modules; await fireM.deleteDoc(fireM.doc(db,'organizations',orgId,collection,id))},
 async saveSettings(settings){const {fireM}=modules; const data={...settings}; delete data.firebaseConfig; await fireM.setDoc(fireM.doc(db,'organizations',orgId),{id:orgId,name:data.companyName||orgId,updatedAt:new Date().toISOString()},{merge:true}); await fireM.setDoc(fireM.doc(db,'organizations',orgId,'settings','general'),data,{merge:true})},
 async upload(projectId,file,folder='reports'){
  const {storageM}=modules; const path=`organizations/${orgId}/projects/${projectId}/${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`; const ref=storageM.ref(storage,path); await storageM.uploadBytes(ref,file); return await storageM.getDownloadURL(ref);
 },
 async createUser({username,password,name,role,projectIds=[]}){
  const {funcM}=modules; const call=funcM.httpsCallable(functions,'createAppUser'); const r=await call({orgId,username,password,name,role,projectIds}); return r.data;
 },
 async setUserPassword(uid,password){const {funcM}=modules; const call=funcM.httpsCallable(functions,'setAppUserPassword'); const r=await call({orgId,uid,password}); return r.data}
 }
};
