module.exports = {
  "parser": "babel-eslint",
  "extends": "airbnb-base",
  "installedESLint": true,
  "plugins": [
      "import",
      "flowtype"
  ],
  "rules": {
    "import/no-extraneous-dependencies": 0,
    "max-len": 0
  },
  "ignoreFiles": "lib/index.js"
};
