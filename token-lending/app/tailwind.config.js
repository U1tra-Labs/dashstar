/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "url('../public/bg.png')",
      },
      backgroundColor: {
        "gradient1": "#9945ff",
        "gradient1": "#14f195",
      },

      backgroundOpacity: {
        "opacity": "0.10000000149011612",
      },

      color: {
        "gradient1": "#9945ff",
        "gradient1": "#14f195",
      },
    },
  },
  plugins: [],
};
