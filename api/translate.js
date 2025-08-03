const axios = require('axios');
const crypto = require('crypto');

// 百度翻译API配置
const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

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
    // 检查环境变量
    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      return res.status(500).json({
        error: '请在Vercel环境变量中设置BAIDU_APP_ID和BAIDU_SECRET_KEY'
      });
    }

    // 获取请求参数
    const { q, from = 'auto', to = 'en' } = req.method === 'GET' ? req.query : req.body;

    if (!q) {
      return res.status(400).json({
        error: '缺少翻译文本参数 q'
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
        error: '翻译失败',
        details: response.data
      });
    }

  } catch (error) {
    console.error('翻译API错误:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: '百度翻译API错误',
        details: error.response.data
      });
    } else {
      return res.status(500).json({
        error: '服务器内部错误',
        details: error.message
      });
    }
  }
}; 