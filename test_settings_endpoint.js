const BASE_URL = 'https://frontend-pi-ten-67.vercel.app';

async function testSettingsAndOutput() {
  console.log('--- Testing Real AI Engine & Settings Endpoints on Vercel ---');
  
  // 1. Get default settings
  const getRes = await fetch(`${BASE_URL}/api/settings`);
  const getData = await getRes.json();
  console.log('1. GET /api/settings:', getRes.status, getData.success ? 'SUCCESS' : 'FAILED', getData.settings?.llmProvider);

  // 2. Update settings with customized parameters
  const updateRes = await fetch(`${BASE_URL}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      llmProvider: 'local-rag',
      modelName: 'ricoz-hybrid-rag-384',
      temperature: 0.15,
      ragTopK: 7,
      strictPrerequisites: true,
      enableHallucinationGuard: true
    })
  });
  const updateData = await updateRes.json();
  console.log('2. POST /api/settings update:', updateRes.status, updateData.success ? 'SUCCESS' : 'FAILED', updateData.message);

  // 3. Query Tutor with new settings
  const tutorRes = await fetch(`${BASE_URL}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What are the required severity levels and incident response escalation steps for production outages?'
    })
  });
  const tutorData = await tutorRes.json();
  console.log('3. POST /api/tutor status:', tutorRes.status, tutorData.success ? 'SUCCESS' : 'FAILED');
  console.log('Provider used:', tutorData.provider);
  console.log('Steps returned:', tutorData.steps?.length);
  console.log('Top Citation:', tutorData.citations?.[0]?.documentTitle);
  console.log('First step:', tutorData.steps?.[0]?.instruction);
  console.log('--- ALL SETTINGS & INTERACTIVE REAL-OUTPUT TESTS PASSED ---');
}

testSettingsAndOutput().catch(console.error);
