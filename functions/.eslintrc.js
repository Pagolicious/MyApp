module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2018, // Set once, no duplicates
  },
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "error",
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", {allowTemplateLiterals: true}],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
