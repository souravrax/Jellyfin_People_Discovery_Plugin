/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  // Scope every utility under our root so we can never break Jellyfin's UI.
  important: "#peoplePage",
  // No preflight: never reset Jellyfin's own styles.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        netflix: "#E50914",
        ink: "#141414",
      },
      fontFamily: {
        sans: ["Inter", "Netflix Sans", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
};
