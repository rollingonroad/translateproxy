const axios = require('axios');
const crypto = require('crypto');

// 百度翻译API配置
const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
const BAIDU_TRANSLATION_DISABLED = /^(1|true|yes|on)$/i.test(process.env.BAIDU_TRANSLATION_DISABLED || '');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 若配置禁用百度翻译，直接返回 500
    if (BAIDU_TRANSLATION_DISABLED) {
      return res.status(500).json({
        success: false,
        errorCode: 'BAIDU_PROVIDER_DISABLED',
        errorMessage: 'Baidu translation API has been disabled. Please use another translation provider.'
      });
    }

    // 检查环境变量
    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        errorCode: 'MISSING_CREDENTIALS',
        errorMessage: 'BAIDU_APP_ID and BAIDU_SECRET_KEY are not configured in environment.'
      });
    }

    // 获取请求参数
    const { q, from = 'auto', to = 'en' } = req.method === 'GET' ? req.query : req.body;

    if (!q) {
      return res.status(400).json({
        success: false,
        errorCode: 'MISSING_PARAMETER_Q',
        errorMessage: 'Missing required parameter: q'
      });
    }

    // 生成签名
    const salt = Date.now();
    const sign = BAIDU_APP_ID + q + salt + BAIDU_SECRET_KEY;
    const sign_md5 = crypto.createHash('md5').update(sign).digest('hex');

    // 构建请求参数
    const params = {
      q: q,
      from: from,
      to: to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign_md5
    };

    // 调用百度翻译API
    const response = await axios.get(BAIDU_API_URL, {
      params: params,
      timeout: 10000
    });

    // 检查百度API响应
    if (response.data && response.data.trans_result) {
      return res.status(200).json({
        success: true,
        data: response.data.trans_result,
        from: response.data.from,
        to: response.data.to
      });
    } else {
      return res.status(400).json({
        success: false,
        errorCode: 'TRANSLATION_FAILED',
        errorMessage: 'Translation failed.'
      });
    }

  } catch (error) {
    console.error('翻译API错误:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        errorCode: 'BAIDU_API_ERROR',
        errorMessage: 'Baidu translation API error.'
      });
    } else {
      return res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_SERVER_ERROR',
        errorMessage: 'Internal server error.'
      });
    }
  }
}; 