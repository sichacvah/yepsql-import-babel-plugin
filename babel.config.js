module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "corejs": 2,
        "useBuiltIns": "usage",
        "targets": {
          "node": "6.9.0"
        }
      }
    ],
    '@babel/preset-typescript'
  ],
};