# 百度翻译API代理服务

这是一个部署在Vercel上的百度翻译API代理服务，用于解决跨域问题和简化API调用。

## 功能特性

- 🔄 代理百度翻译API，解决跨域问题
- 🌍 支持多种语言翻译
- ⚡ 基于Vercel Serverless，响应快速
- 🔒 支持CORS，可在前端直接调用
- 📝 详细的错误处理和日志

## 部署步骤

### 1. 获取百度翻译API密钥

1. 访问 [百度翻译开放平台](http://api.fanyi.baidu.com/api/trans/product/desktop)
2. 注册账号并创建应用
3. 获取 `APP ID` 和 `密钥`

### 2. 部署到Vercel

#### 方法一：使用Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add BAIDU_APP_ID
vercel env add BAIDU_SECRET_KEY
# 可选：当你希望暂时禁用百度翻译提供方时设置为 true/1/yes/on
vercel env add BAIDU_TRANSLATION_DISABLED

# 部署到生产环境
vercel --prod
```

#### 方法二：使用GitHub集成

1. 将代码推送到GitHub仓库
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. 在项目设置中添加环境变量：
   - `BAIDU_APP_ID`: 你的百度翻译APP ID
   - `BAIDU_SECRET_KEY`: 你的百度翻译密钥
   - `BAIDU_TRANSLATION_DISABLED`（可选）：当设置为 `true`/`1`/`yes`/`on`（忽略大小写）时，接口将直接返回 500，并提示改用其他翻译提供方

## API使用说明

### 配置接口（只读）

用于查询运行时的禁用标记状态，供演示页面展示使用。

```
GET /api/config
```

响应示例：

```json
{
  "success": true,
  "data": {
    "baiduTranslationDisabled": false
  }
}
```

### 请求格式

**GET请求：**
```
GET /api/translate?q=你好&from=zh&to=en
```

**POST请求：**
```json
POST /api/translate
Content-Type: application/json

{
  "q": "你好",
  "from": "zh",
  "to": "en"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| q | string | 是 | 要翻译的文本 | - |
| from | string | 否 | 源语言代码 | auto |
| to | string | 否 | 目标语言代码 | en |

### 语言代码

常用语言代码：
- `zh`: 中文
- `en`: 英语
- `ja`: 日语
- `ko`: 韩语
- `fr`: 法语
- `de`: 德语
- `es`: 西班牙语
- `auto`: 自动检测

### 响应格式

**成功响应：**
```json
{
  "success": true,
  "data": [
    {
      "src": "你好",
      "dst": "Hello"
    }
  ],
  "from": "zh",
  "to": "en"
}
```

**错误响应（禁用开关触发，HTTP 500）：**
```json
{
  "success": false,
  "errorCode": "BAIDU_PROVIDER_DISABLED",
  "errorMessage": "Baidu translation API has been disabled. Please use another translation provider."
}
```

**其他错误响应（统一结构）：**
```json
{
  "success": false,
  "errorCode": "MISSING_PARAMETER_Q",
  "errorMessage": "Missing required parameter: q"
}
```

## 前端调用示例

### JavaScript (Fetch API)

```javascript
// GET请求
async function translateText(text, from = 'zh', to = 'en') {
  const response = await fetch(
    `https://translateproxy-eta.vercel.app/api/translate?q=${encodeURIComponent(text)}&from=${from}&to=${to}`
  );
  const result = await response.json();
  return result;
}

// POST请求
async function translateTextPost(text, from = 'zh', to = 'en') {
  const response = await fetch('https://translateproxy-eta.vercel.app/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      from: from,
      to: to
    })
  });
  const result = await response.json();
  return result;
}

// 使用示例
translateText('你好世界', 'zh', 'en').then(result => {
  if (result.success) {
    console.log('翻译结果:', result.data[0].dst);
  } else {
    console.error(`[${result.errorCode || 'ERROR'}] ${result.errorMessage || 'Unknown error'}`);
  }
});
```

### jQuery

```javascript
$.ajax({
  url: 'https://translateproxy-eta.vercel.app/api/translate',
  method: 'POST',
  data: JSON.stringify({
    q: '你好世界',
    from: 'zh',
    to: 'en'
  }),
  contentType: 'application/json',
  success: function(result) {
    if (result.success) {
      console.log('翻译结果:', result.data[0].dst);
    } else {
      console.error('翻译失败:', `[${result.errorCode || 'ERROR'}] ${result.errorMessage || 'Unknown error'}`);
    }
  },
  error: function(xhr, status, error) {
    console.error('请求失败:', error);
  }
});
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 设置本地环境变量
# 在项目根目录创建 .env.local 文件
echo "BAIDU_APP_ID=你的APP_ID" > .env.local
echo "BAIDU_SECRET_KEY=你的密钥" >> .env.local
# 可选：禁用百度翻译提供方
# echo "BAIDU_TRANSLATION_DISABLED=true" >> .env.local
```

## 注意事项

1. **API限制**: 百度翻译API有调用频率限制，请合理使用
2. **环境变量**: 确保在Vercel中正确设置环境变量
   - 可选 `BAIDU_TRANSLATION_DISABLED` 用于一键禁用百度提供方（返回结构化 500 错误，便于程序处理）
3. **CORS**: 服务已配置CORS，支持跨域请求
4. **错误处理**: 服务包含完整的错误处理机制

## 许可证

MIT License

## Author

David Wu
