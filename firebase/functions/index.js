const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const WA_TOKEN = defineSecret('WA_TOKEN');
const WA_PHONE_NUMBER_ID = defineSecret('WA_PHONE_NUMBER_ID');

const emailFor = username => `${String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')}@ayobangun.id`;

exports.createAppUser = onCall(async req => {
  if (!req.auth) throw new HttpsError('unauthenticated','Login diperlukan');
  const { orgId, username, password, name, role='mandor', projectIds=[] } = req.data || {};
  if (!orgId || !username || !password || !name) throw new HttpsError('invalid-argument','Data user belum lengkap');
  const caller = await db.doc(`organizations/${orgId}/users/${req.auth.uid}`).get();
  const callerRole = caller.data()?.role;
  if (!['owner','admin'].includes(callerRole)) throw new HttpsError('permission-denied','Tidak memiliki hak akses');
  if (role === 'owner' && callerRole !== 'owner') throw new HttpsError('permission-denied','Hanya Owner dapat membuat Owner');
  const user = await admin.auth().createUser({email:emailFor(username),password,displayName:name});
  await db.doc(`organizations/${orgId}/users/${user.uid}`).set({id:user.uid,username,name,role,projectIds,active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  return {id:user.uid,username,name,role};
});

exports.sendScheduledWhatsAppReports = onSchedule({schedule:'every 15 minutes',timeZone:'Asia/Jakarta',secrets:[WA_TOKEN,WA_PHONE_NUMBER_ID]}, async () => {
  const orgs = await db.collection('organizations').get();
  for (const org of orgs.docs) {
    const orgId = org.id;
    const settingsSnap = await db.doc(`organizations/${orgId}/settings/general`).get();
    const settings = settingsSnap.data() || {};
    if (!settings.whatsappAuto || !Array.isArray(settings.whatsappNumbers) || !settings.whatsappNumbers.length) continue;
    const reports = await db.collection(`organizations/${orgId}/reports`).where('status','==','approved').limit(50).get();
    for (const doc of reports.docs) {
      const r=doc.data();
      if (!r.whatsappAuto || r.waSent) continue;
      const projectSnap = await db.doc(`organizations/${orgId}/projects/${r.projectId}`).get();
      const p=projectSnap.data()||{};
      const text=`AYO BANGUN.ID CONTRACTOR\nLAPORAN HARIAN PROYEK\n\nProject: ${p.name||'-'}\nTanggal: ${r.date||'-'}\nCuaca: ${r.weather||'-'}\nProgress: ${r.progress||0}%\nTenaga: ${r.workers||0} orang\n\nPEKERJAAN\n${r.workSummary||'-'}\n\nMATERIAL\n${r.materialSummary||'-'}\n\nKENDALA\n${r.issues||'-'}\n\nRENCANA BESOK\n${r.planTomorrow||'-'}`;
      let ok=true;
      for(const to of settings.whatsappNumbers){
        const res=await fetch(`https://graph.facebook.com/v23.0/${WA_PHONE_NUMBER_ID.value()}/messages`,{method:'POST',headers:{Authorization:`Bearer ${WA_TOKEN.value()}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:String(to).replace(/\D/g,''),type:'text',text:{body:text}})});
        if(!res.ok){ok=false;console.error('WA send failed',await res.text())}
      }
      if(ok) await doc.ref.update({waSent:true,waSentAt:admin.firestore.FieldValue.serverTimestamp()});
    }
  }
});

exports.setAppUserPassword = onCall(async req => {
  if (!req.auth) throw new HttpsError('unauthenticated','Login diperlukan');
  const { orgId, uid, password } = req.data || {};
  if (!orgId || !uid || !password || password.length < 6) throw new HttpsError('invalid-argument','UID/password tidak valid. Password Firebase minimal 6 karakter.');
  const caller = await db.doc(`organizations/${orgId}/users/${req.auth.uid}`).get();
  const callerRole = caller.data()?.role;
  const target = await db.doc(`organizations/${orgId}/users/${uid}`).get();
  const targetRole = target.data()?.role;
  if (!['owner','admin'].includes(callerRole)) throw new HttpsError('permission-denied','Tidak memiliki hak akses');
  if (targetRole === 'owner' && callerRole !== 'owner') throw new HttpsError('permission-denied','Hanya Owner dapat mengganti password Owner');
  await admin.auth().updateUser(uid,{password});
  return {ok:true};
});
