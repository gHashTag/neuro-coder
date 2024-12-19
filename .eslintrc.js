module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "plugin:import/recommended", "plugin:import/typescript"],
  rules: {
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": "error",
    "@typescript-eslint/no-floating-promises": ["error"],
    "import/no-absolute-path": "error",
  },
  overrides: [
    {
      files: ["src/*/*"],
      rules: {
        "import/no-absolute-path": "error",
        "max-lines": "off",
        "max-nested-callbacks": "off",
        "max-statements": "off",
      },
    },
  ],
  settings: {
    node: {
      extensions: [".ts", ".json"],
    },
  },
}
