module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
    './src/pages/admin/**/*.{js,jsx,ts,tsx}',
    '../spark-flow/src/**/*.{js,jsx,ts,tsx}',
    '../spark-flow/dist/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
