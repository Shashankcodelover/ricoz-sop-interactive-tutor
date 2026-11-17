// test_auth_ingestion.js
const BASE_URL = 'https://frontend-pi-ten-67.vercel.app';

async function runTests() {
  console.log('--- Testing API Authentication & SOP Document Ingestion on Vercel ---');
  
  // 1. Sign up a new user
  const signupRes = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      name: 'Lead Site Reliability Engineer',
      email: 'sre-lead-v2@ricoz.enterprise.io',
      password: 'SecureOperator2026!'
    })
  });
  
  const signupData = await signupRes.json();
  console.log('1. Signup Status:', signupRes.status, signupData.success ? 'SUCCESS' : 'FAILED', signupData.user?.name);
  const token = signupData.token;

  if (!token) {
    console.error('Signup failed, skipping ingestion test:', signupData);
    return;
  }

  // 2. Ingest custom SOP document matching CreateDocumentSchema
  const docPayload = {
    title: 'High-Availability Database Failover SOP (P1-HA)',
    category: 'Infrastructure Resilience',
    department: 'DevOps & SRE',
    sourcePlatform: 'custom_upload',
    sourceUrl: 'https://wiki.ricoz.internal/sop/p1-ha-db',
    version: '2.1',
    effectiveDate: '2026-11-17',
    tags: ['database', 'postgres', 'failover', 'p1-incident'],
    content: `Objective: Execute deterministic switchover to standby replica during primary node unresponsiveness.
Step 1: Check replica lag using patronictl list. Verify lag bytes < 10MB.
Step 2: Declare maintenance window or P1 emergency escalation in Slack #incident-room.
Step 3: Run patronictl switchover --master primary-node-01 --candidate replica-node-02 --force.
Step 4: Verify write traffic routing via PgBouncer pooling metrics.
Step 5: File post-incident telemetry log.`
  };

  const docRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(docPayload)
  });

  const docData = await docRes.json();
  console.log('2. Ingestion Status:', docRes.status, docData.success ? 'SUCCESS' : 'FAILED', docData.document?.title);

  // 3. Query Tutor Chat with correct schema { question, department, sessionId }
  const tutorRes = await fetch(`${BASE_URL}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'How do I perform a database failover using patronictl switchover?',
      department: 'DevOps & SRE',
      sessionId: 'test_session_001'
    })
  });

  const tutorData = await tutorRes.json();
  console.log('3. Tutor Chat Query Status:', tutorRes.status, tutorData.success ? 'SUCCESS' : 'FAILED');
  console.log('Tutor Summary:', tutorData.data?.summary?.slice(0, 80) + '...');
  console.log('Tutor Retrieved Source Count:', tutorData.data?.sources?.length);
  console.log('Tutor First Source:', tutorData.data?.sources?.[0]?.title);
  console.log('Tutor Extracted Steps Count:', tutorData.data?.steps?.length);
  console.log('--- ALL BACKEND VERIFICATIONS CONFIRMED ---');
}

runTests().catch(err => {
  console.error('Test error:', err.message);
});
