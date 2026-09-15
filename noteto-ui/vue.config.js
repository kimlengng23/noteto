const { defineConfig } = require("@vue/cli-service");
const fs = require("fs");

const httpsConfig =
  fs.existsSync("./certs/server.key") && fs.existsSync("./certs/server.crt")
    ? {
        key: fs.readFileSync("./certs/server.key"),
        cert: fs.readFileSync("./certs/server.crt"),
      }
    : false;

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  devServer: {
    https: httpsConfig,
    port: 8080,
    allowedHosts: "all",
    proxy: {
      "^/api": {
        target: process.env.VUE_APP_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
      "^/public": {
        target: process.env.VUE_APP_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
