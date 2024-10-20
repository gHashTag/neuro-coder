module.exports = {
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": "error", // Добавьте это правило
  },
  overrides: [
    {
      files: ["src/*/*"],
      rules: {
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
