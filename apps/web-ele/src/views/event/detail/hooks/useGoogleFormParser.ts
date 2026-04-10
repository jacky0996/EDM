export function useGoogleFormParser() {
  /**
   * 解析 Google Forms API 原始資料回填至前端 config 結構
   * @param googleInfo Google Forms API 回傳的原始物件 (data.google_info)
   */
  const parseGoogleForm = (googleInfo: any) => {
    if (!googleInfo) return null;

    const { info, items = [] } = googleInfo;

    // 1. 基本資訊
    const config = {
      title: info.title || '',
      description: info.description || '',
      standardFields: [] as string[],
      customQuestions: [] as any[],
    };

    // 標準欄位關鍵字定義 (對應 RegistrationForm 的 fieldOptions)
    const standardMap: Record<string, string> = {
      '姓名': 'name',
      '行動電話': 'mobile',
      '手機': 'mobile',
      '電子郵件': 'email',
      'Email': 'email',
      '公司名稱': 'company',
      '公司單位': 'company',
      '職稱': 'job_title',
      '餐旅需求': 'dietary',
    };

    // 2. 遍歷項目進行解析
    items.forEach((item: any) => {
      const title = item.title || '';
      const question = item.questionItem?.question;
      
      if (!question) return;

      // 檢查是否為標準欄位
      const standardKey = standardMap[title];
      if (standardKey) {
        if (!config.standardFields.includes(standardKey)) {
          config.standardFields.push(standardKey);
        }
        return; // 跳過，不放入自訂問項
      }

      // 解析自訂問項
      const customQ: any = {
        label: title,
        required: !!question.required,
        type: 'text',
        options: [],
      };

      // 判定類型
      if (question.textQuestion) {
        customQ.type = question.textQuestion.paragraph ? 'textarea' : 'text';
      } else if (question.choiceQuestion) {
        const cq = question.choiceQuestion;
        // 映射類型
        if (cq.type === 'RADIO') customQ.type = 'radio';
        else if (cq.type === 'CHECKBOX') customQ.type = 'checkbox';
        else if (cq.type === 'DROP_DOWN') customQ.type = 'dropdown';

        // 提取選項
        if (cq.options) {
          customQ.options = cq.options.map((opt: any) => opt.value || '');
        }
      } else if (question.dateQuestion) {
        customQ.type = 'date';
      } else if (question.timeQuestion) {
        customQ.type = 'time';
      }

      config.customQuestions.push(customQ);
    });

    return config;
  };

  return {
    parseGoogleForm,
  };
}
