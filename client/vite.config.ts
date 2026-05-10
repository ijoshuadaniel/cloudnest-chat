import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1001,
    allowedHosts: ["chat.cloudnest.in"],
  },
});
