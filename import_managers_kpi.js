const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, 'KPI Quan Ly.xlsx');
const sampleJsonPath = path.join(__dirname, 'src', 'data', 'sampleEvaluations.json');

const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets['KQQLDGKPI'];
const raw = xlsx.utils.sheet_to_json(ws);
const valid = raw.filter(r => r['Mã số nhân viên'] && String(r['Mã số nhân viên']).trim() !== '');

console.log('Total valid manager evaluation rows:', valid.length);

function parseExcelDate(dateStr) {
  if (!dateStr) return { period: '10-2026', iso: new Date().toISOString() };
  const [datePart, timePart] = String(dateStr).trim().split(' ');
  const [m, d, y] = datePart.split('/').map(Number);
  let hours = 0, mins = 0, secs = 0;
  if (timePart) {
    const [hh, mm, ss] = timePart.split(':').map(Number);
    hours = hh || 0;
    mins = mm || 0;
    secs = ss || 0;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const period = pad(m) + '-' + y;
  const iso = y + '-' + pad(m) + '-' + pad(d) + 'T' + pad(hours) + ':' + pad(mins) + ':' + pad(secs) + '.000Z';
  return { period, iso, year: y, month: m, day: d };
}

const deptMap = {
  'TKV02': 'IT',
  'TKV08': 'PHÒNG TCHC',
  'TKV09': 'IT',
  'TKV10': 'KHO',
  'TKV16': 'XUẤT NHẬP KHẨU',
  'TKV27': 'PHÒNG KINH DOANH',
  'TKV42': 'ĐIỂM TẬP KẾT',
  'NVTKV025': 'Vi tính'
};

const nameMap = {
  'TKV02': 'ĐẶNG NGỌC TRUNG',
  'TKV08': 'NGUYỄN THANH THÙY DUNG',
  'TKV09': 'NGUYỄN KHẮC DIỆP',
  'TKV10': 'TRẦN VĂN DƯƠNG',
  'TKV16': 'PHAN KHẮC NINH',
  'TKV27': 'VÕ KIM HỒNG',
  'TKV42': 'LÂM TẤN ĐẠT',
  'NVTKV025': 'Admin'
};

const managerEvaluations = valid.map((r, idx) => {
  let manv = String(r['Mã số nhân viên']).trim();
  if (manv === 'TKV002') manv = 'TKV02';

  const dateInfo = parseExcelDate(r['Ngày Đánh giá']);
  const name = nameMap[manv] || String(r['Họ và tên']).trim();
  const dept = deptMap[manv] || String(r['Bộ phận']).trim();

  const q1 = Number(r['Câu 1. Thái độ làm việc']) || 0;
  const q2 = Number(r['Câu 2. Kiến thức ']) || 0;
  const q3 = Number(r['Câu 3. Mức độ hoàn thành']) || 0;
  const q4 = Number(r['Câu 4. Kỹ năng quản lý']) || 0;
  const q5 = Number(r['Câu 5. Quản lý tài nguyên']) || 0;
  const q6 = Number(r['Câu 6. Phân tích']) || 0;
  const q7 = Number(r['Câu 7. Đóng góp ý tưởng sáng tạ']) || 0;
  const total = q1 + q2 + q3 + q4 + q5 + q6 + q7;
  const classification = String(r['Xếp Loại'] || 'Giỏi').trim();

  return {
    id: `eval-mgr-excel-${idx + 1}`,
    period: dateInfo.period,
    evaluationType: 'MANAGER',
    evaluatorManv: manv,
    evaluatorName: name,
    evaluatorDept: dept,
    targetManv: manv,
    targetName: name,
    targetDept: dept,
    scores: {
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8: 0,
      q9: 0,
      q10: 0
    },
    selfTotalScore: total,
    selfClassification: classification,
    selfFeedback: '',
    managerScore: null,
    managerClassification: null,
    managerFeedback: null,
    councilScore: null,
    councilClassification: null,
    councilFeedback: null,
    status: 'SUBMITTED',
    createdAt: dateInfo.iso,
    updatedAt: dateInfo.iso
  };
});

// Update sampleEvaluations.json
let currentSample = [];
if (fs.existsSync(sampleJsonPath)) {
  try {
    currentSample = JSON.parse(fs.readFileSync(sampleJsonPath, 'utf-8'));
  } catch (err) {
    console.error('Error reading sample evaluations, starting fresh:', err);
  }
}

// Remove any prior eval-mgr-excel records to avoid duplicates
currentSample = currentSample.filter(item => !item.id.startsWith('eval-mgr-excel-'));
const mergedSample = [...currentSample, ...managerEvaluations];

fs.writeFileSync(sampleJsonPath, JSON.stringify(mergedSample, null, 2), 'utf-8');
console.log(`Updated sampleEvaluations.json with ${mergedSample.length} total records (${managerEvaluations.length} manager records added).`);

// Save SQL statements to a file for Supabase insertion
const sqlStatements = managerEvaluations.map(e => {
  const escapeStr = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "''");
  return `(
    ${escapeStr(e.id)},
    ${escapeStr(e.period)},
    'MANAGER',
    ${escapeStr(e.evaluatorManv)},
    ${escapeStr(e.evaluatorName)},
    ${escapeStr(e.evaluatorDept)},
    ${escapeStr(e.targetManv)},
    ${escapeStr(e.targetName)},
    ${escapeStr(e.targetDept)},
    ${e.scores.q1},
    ${e.scores.q2},
    ${e.scores.q3},
    ${e.scores.q4},
    ${e.scores.q5},
    ${e.scores.q6},
    ${e.scores.q7},
    0,
    0,
    0,
    ${e.selfTotalScore},
    ${escapeStr(e.selfClassification)},
    '',
    'SUBMITTED',
    '${e.createdAt}',
    '${e.updatedAt}'
  )`;
});

const sqlFile = path.join(__dirname, 'import_mgr_evaluations.sql');
const fullSql = `INSERT INTO evaluations (
  id, period, evaluation_type, evaluator_manv, evaluator_name, evaluator_dept,
  target_manv, target_name, target_dept,
  q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
  self_total_score, self_classification, self_feedback,
  status, created_at, updated_at
) VALUES 
${sqlStatements.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  period = EXCLUDED.period,
  evaluation_type = EXCLUDED.evaluation_type,
  evaluator_manv = EXCLUDED.evaluator_manv,
  evaluator_name = EXCLUDED.evaluator_name,
  evaluator_dept = EXCLUDED.evaluator_dept,
  target_manv = EXCLUDED.target_manv,
  target_name = EXCLUDED.target_name,
  target_dept = EXCLUDED.target_dept,
  q1 = EXCLUDED.q1,
  q2 = EXCLUDED.q2,
  q3 = EXCLUDED.q3,
  q4 = EXCLUDED.q4,
  q5 = EXCLUDED.q5,
  q6 = EXCLUDED.q6,
  q7 = EXCLUDED.q7,
  q8 = EXCLUDED.q8,
  q9 = EXCLUDED.q9,
  q10 = EXCLUDED.q10,
  self_total_score = EXCLUDED.self_total_score,
  self_classification = EXCLUDED.self_classification,
  self_feedback = EXCLUDED.self_feedback,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;`;

fs.writeFileSync(sqlFile, fullSql, 'utf-8');
console.log(`Generated import SQL with ${sqlStatements.length} statements in ${sqlFile}.`);
