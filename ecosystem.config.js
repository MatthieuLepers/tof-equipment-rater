module.exports = {
  apps: [
    {
      name: 'bot',
      script: './src/index.js',
      env_production: {
        NODE_END: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
