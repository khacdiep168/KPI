const fs = require('fs');
const https = require('https');

const SUPABASE_URL = "https://jaewyxazjvqtvqifdmlw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZXd5eGF6anZxdHZxaWZkbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Mzg0MTgsImV4cCI6MjEwNzAxNDQxOH0.vXxjYEdEvK7HCefzPuKXgcguB4KPRjGkJhHcPF9uW00";

const sample = JSON.parse(fs.readFileSync('./src/data/sampleEvaluations.json', 'utf-8'));
const mgrEvals = sample.filter(e => e.evaluationType === 'MANAGER' && e.id.startsWith('eval-mgr-excel-'));

console.log(`Found ${mgrEvals.length} manager evaluations to upload.`);

const payload = mgrEvals.map(e => ({
  id: e.id,
  period: e.period,
  evaluation_type: 'MANAGER',
  evaluator_manv: e.evaluatorManv,
  evaluator_name: e.evaluatorName,
  evaluator_dept: e.evaluatorDept,
  target_manv: e.targetManv,
  target_name: e.targetName,
  target_dept: e.targetDept,
  q1: e.scores.q1,
  q2: e.scores.q2,
  q3: e.scores.q3,
  q4: e.scores.q4,
  q5: e.scores.q5,
  q6: e.scores.q6,
  q7: e.scores.q7,
  q8: 0,
  q9: 0,
  q10: 0,
  self_total_score: e.selfTotalScore,
  self_classification: e.selfClassification,
  self_feedback: '',
  status: 'SUBMITTED',
  created_at: e.createdAt,
  updated_at: e.updatedAt
}));

async function uploadInBatches(items, batchSize = 25) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Uploading batch ${i + 1} to ${Math.min(i + batchSize, items.length)}...`);
    
    await new Promise((resolve, reject) => {
      const url = new URL(`${SUPABASE_URL}/rest/v1/evaluations`);
      const postData = JSON.stringify(batch);
      
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`  ✓ Batch saved successfully (status: ${res.statusCode})`);
            resolve();
          } else {
            console.error(`  ✗ Batch failed (status: ${res.statusCode}):`, body);
            reject(new Error(`Status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

uploadInBatches(payload)
  .then(() => console.log('Successfully uploaded all manager evaluations to Supabase!'))
  .catch(err => {
    console.error('Upload failed:', err);
    process.exit(1);
  });
