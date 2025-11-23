import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#020617", // near-black slate
          card: "#020617",
          accent: "#22c55e", // emerald-500
          accentSoft: "#22c55e33",
        },
      },
    },
  },
  plugins: [],
};

export default config;


