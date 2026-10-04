const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  // 1. Health check
  console.log('1. Health check:');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('   Status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Register user
  console.log('\n2. User Registration:');
  const username = `user_${Date.now()}`;
  const email = `${username}@example.com`;
  const reg = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { username, email, password: 'password123' }
  );
  console.log('   Status:', reg.status, 'User:', reg.data?.user?.username);
  if (reg.status !== 201) throw new Error('Registration failed: ' + JSON.stringify(reg.data));

  const token = reg.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Login test
  console.log('\n3. User Login:');
  const login = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { identifier: email, password: 'password123' }
  );
  console.log('   Status:', login.status, 'Token returned:', !!login.data?.token);
  if (login.status !== 200) throw new Error('Login failed');

  // 4. Create Note
  console.log('\n4. Create Note:');
  const newNote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/notes',
      method: 'POST',
      headers: authHeaders,
    },
    {
      title: 'Meeting Notes & Milestones',
      content: 'Review product deliverables by Friday.',
      category: 'Work',
      color: '#1e3a5f',
      is_pinned: 1,
    }
  );
  console.log('   Status:', newNote.status, 'Created Note ID:', newNote.data?.id);
  if (newNote.status !== 201) throw new Error('Create note failed');
  const noteId = newNote.data.id;

  // 5. Read Notes
  console.log('\n5. Read Notes:');
  const notesList = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'GET',
    headers: authHeaders,
  });
  console.log('   Status:', notesList.status, 'Count:', notesList.data?.length);
  if (!notesList.data?.length) throw new Error('Notes list empty');

  // 6. Update Note
  console.log('\n6. Update Note:');
  const updatedNote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/notes/${noteId}`,
      method: 'PUT',
      headers: authHeaders,
    },
    {
      title: 'Updated Meeting Notes',
      content: 'Review deliverables by Friday 4 PM.',
    }
  );
  console.log('   Status:', updatedNote.status, 'New title:', updatedNote.data?.title);
  if (updatedNote.data?.title !== 'Updated Meeting Notes') throw new Error('Update note failed');

  // 7. Create Reminder
  console.log('\n7. Create Reminder:');
  const due = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const reminder = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reminders',
      method: 'POST',
      headers: authHeaders,
    },
    {
      title: 'Submit quarterly report',
      description: 'Send PDF to team manager',
      due_date: due,
      priority: 'high',
      note_id: noteId,
    }
  );
  console.log('   Status:', reminder.status, 'Reminder ID:', reminder.data?.id, 'Linked Note:', reminder.data?.note_title);
  if (reminder.status !== 201) throw new Error('Create reminder failed');
  const reminderId = reminder.data.id;

  // 8. Toggle Reminder Complete
  console.log('\n8. Toggle Reminder Completion:');
  const toggled = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reminders/${reminderId}/toggle`,
    method: 'PATCH',
    headers: authHeaders,
  });
  console.log('   Status:', toggled.status, 'is_completed:', toggled.data?.is_completed);
  if (toggled.data?.is_completed !== 1) throw new Error('Toggle reminder failed');

  // 9. Delete Reminder & Note
  console.log('\n9. Delete Reminder & Note:');
  const delRem = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reminders/${reminderId}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  const delNote = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/notes/${noteId}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log('   Del Reminder Status:', delRem.status, 'Del Note Status:', delNote.status);
  if (delRem.status !== 200 || delNote.status !== 200) throw new Error('Delete failed');

  console.log('\n✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('\n❌ Verification test failed:', err);
  process.exit(1);
});
