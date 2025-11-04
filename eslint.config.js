import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact_recommended from "eslint-plugin-react/configs/recommended.js";
import pluginReact_jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginImport from "eslint-plugin-import";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});
export default tseslint.config(
    {
        ignores: ["dist", "node_modules", ".wrangler", "wrangler.toml"],
    },
    ...tseslint.configs.recommended,
    {
        ...pluginReact_recommended,
        files: ["src/**/*.{ts,tsx}"],
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        ...pluginReact_jsxRuntime,
        files: ["src/**/*.{ts,tsx}"],
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "react-hooks": pluginReactHooks,
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
        },
    },
    {
        plugins: {
            import: pluginImport,
        },
        settings: {
            "import/resolver": {
                typescript: true,
                node: true,
            },
        },
        rules: {
            "import/no-unresolved": "error",
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        }
    }
);