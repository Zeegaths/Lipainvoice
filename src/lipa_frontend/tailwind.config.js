/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Quicksand", "system-ui", "sans-serif"],
        body: ["Quicksand", "system-ui", "sans-serif"],
        info: ["Inconsolata", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
