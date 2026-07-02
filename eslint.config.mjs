import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintPluginImport from "eslint-plugin-import";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ...tailwind.configs.recommended,
    settings: {
      tailwindcss: {
        cssConfigPath: "src/app/globals.css",
      },
    },
  },
  {
    plugins: {
      eslintPluginImport,
    },
    rules: {
      "eslintPluginImport/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
          },
        },
      ],
    },
  },
];

export default eslintConfig;
