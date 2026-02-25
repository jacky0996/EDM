import * as XLSX from 'xlsx';
import * as fs from 'fs';

try {
  const buf = fs.readFileSync('c:/code/edm/apps/web-ele/public/example/範例-人員名單.xlsx');
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);
  console.log('Columns:', Object.keys(json[0] || {}));
  console.log('Sample Data:', json[0]);
} catch (e) {
  console.error(e);
}
