module.exports = {
  apps: [
    {
      name: 'user',
      script: './User/user.server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'feed',
      script: './Feeds/feeds.server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      }
    },
    {
      name: 'publish',
      script: './Publish/publish.server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      }
    },
    {
      name: 'update',
      script: './Update/update.server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3003
      }
    },
    {
      name: 'notify',
      script: './Notification/notify.server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3004
      }
    }
  ]
};
