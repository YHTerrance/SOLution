module.exports = {
  darkMode: "class",
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          100: "#ccccd8",
          200: "#b3b3c4",
          300: "#9999b1",
          400: "#80809d",
          500: "#676689",
          600: "#4d4d76",
          700: "#343362",
          800: "#1a1a4f",
          900: "#01003b",
        },
        pink: {
          100: "#FAE0E4",
          200: "#F7CAD0",
          300: "#F9BEC7",
          400: "#FBB1BD",
          500: "#FF99AC",
          600: "#FF85A1",
          700: "#FF7096",
          800: "#FF5C8A",
          900: "#FF0A54",
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
