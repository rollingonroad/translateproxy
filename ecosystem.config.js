module.exports = {
  apps: [
    {
      name: 'translateproxy',
      cwd: '/home/ecs-user/app/current',
      script: 'server.js',
      instances: process.env.WEB_CONCURRENCY || 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        ENV_FILE: '/home/ecs-user/app/shared/.env.production',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      }
    }
  ]
};


