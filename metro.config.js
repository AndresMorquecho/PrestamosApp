module.exports = {
  web: {
    build: {
      babel: {
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
          },
        },
      },
    },
  },
};
