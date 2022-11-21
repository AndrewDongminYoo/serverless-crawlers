/* eslint-env node */

module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    env: {
        node: true,
        commonjs: true,
    },
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                args: "all",
                argsIgnorePattern: "^_",
                // Allow assertion types.
                varsIgnorePattern: "^_",
                caughtErrors: "none",
                ignoreRestSiblings: true,
            },
        ],
        "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        "sort-imports": [
            "error", {
                "ignoreCase": false,
                "ignoreDeclarationSort": false,
                "ignoreMemberSort": false,
                "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
                "allowSeparatedGroups": false
            }
        ],
    },
}