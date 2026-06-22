import baseConfig from "@resume-builder/prettier-config"

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
}

export default config
