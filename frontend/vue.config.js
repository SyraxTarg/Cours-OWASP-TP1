module.exports = {
  outputDir: '../backend/public',
  devServer: {
    port: 8080,
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}