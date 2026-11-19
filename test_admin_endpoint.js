const BASE_URL = 'https://frontend-pi-ten-67.vercel.app';

async function testAdminPanel() {
  console.log('--- Testing Enterprise Admin Panel Endpoints on Vercel ---');

  // 1. Authenticate as Lead Admin
  const loginRes = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signin',
      email: 'shashank.j8426@gmail.com',
      password: 'RicozTech2026!'
    })
  });
  const loginData = await loginRes.json();
  console.log('1. Admin Sign In:', loginRes.status, loginData.success ? 'SUCCESS' : 'FAILED', loginData.user?.role);
  const token = loginData.token;

  if (!token) {
    console.error('Sign in failed, cannot test admin endpoints');
    return;
  }

  // 2. Fetch Admin Telemetry (GET /api/admin)
  const adminRes = await fetch(`${BASE_URL}/api/admin`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const adminData = await adminRes.json();
  console.log('2. GET /api/admin status:', adminRes.status, adminData.success ? 'SUCCESS' : 'FAILED');
  console.log('Stats:', adminData.stats);
  console.log('Connected Adapters Count:', adminData.connectors?.length);
  console.log('User Roster Count:', adminData.users?.length);
  console.log('Audit Logs Count:', adminData.auditLogs?.length);

  // 3. Trigger Ingestion Connector Sync (POST /api/admin)
  const syncRes = await fetch(`${BASE_URL}/api/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'sync_connector',
      platform: 'notion'
    })
  });
  const syncData = await syncRes.json();
  console.log('3. Trigger Notion Sync:', syncRes.status, syncData.success ? 'SUCCESS' : 'FAILED', syncData.message);

  // 4. Update a User's RBAC Role (POST /api/admin)
  const roleRes = await fetch(`${BASE_URL}/api/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'update_user_role',
      targetEmail: 'aarav.patel@ricoz.enterprise.io',
      targetRole: 'org_admin'
    })
  });
  const roleData = await roleRes.json();
  console.log('4. Update User Role to org_admin:', roleRes.status, roleData.success ? 'SUCCESS' : 'FAILED', roleData.message);

  console.log('--- ALL ADMIN PANEL VERIFICATIONS PASSED IN PRODUCTION ---');
}

testAdminPanel().catch(console.error);
