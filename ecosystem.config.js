module.exports = {
  apps: [
    {
      name: 'translateproxy',
      script: 'server.js',
      instances: process.env.WEB_CONCURRENCY || 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      }
    }
  ]
};


