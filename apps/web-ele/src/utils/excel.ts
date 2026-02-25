import * as XLSX from 'xlsx';

/**
 * 讀取 Excel 檔案並轉化為 JSON 數據
 * @param file File 物件
 * @param options 解析選項，例如 skipRows: 1 表示跳過第一行
 * @returns JSON 陣列
 */
export async function readExcel(file: File, options: { skipRows?: number } = {}): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('找不到工作表');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          throw new Error('工作表內容為空');
        }
        // 使用 range 跳過指定行數
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: options.skipRows || 0,
        });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
}
