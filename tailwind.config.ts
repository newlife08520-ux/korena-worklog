import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        korena: {
          blue: "#0A2A43",
          gold: "#C7A265"
        }
      }
    }
  },
  plugins: []
};
export default config;