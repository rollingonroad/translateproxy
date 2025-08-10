const BAIDU_TRANSLATION_DISABLED = /^(1|true|yes|on)$/i.test(
  process.env.BAIDU_TRANSLATION_DISABLED || ''
);

module.exports = async (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 仅暴露该环境变量的布尔状态
  return res.status(200).json({
    success: true,
    data: {
      baiduTranslationDisabled: BAIDU_TRANSLATION_DISABLED
    }
  });
};


