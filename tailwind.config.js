// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      // 嫌麻烦，你也可以直接使用 `src` 目录
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  