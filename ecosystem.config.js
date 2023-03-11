module.exports = {
  apps: [
    {
      name: 'bot',
      script: './dist/src/index.js',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      env_local: {
        NODE_ENV: 'local',
      },
    },
  ],
};
