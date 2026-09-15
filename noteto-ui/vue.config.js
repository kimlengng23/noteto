const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  devServer: {
    https: false,
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
