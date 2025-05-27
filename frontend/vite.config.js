import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SCRIPT_ID = 'AKfycbxDyrKL-_2bp0a_rWFWiD2PqYbmMtk-zyB2gr32rFmEMgThai-yi_VeNd0GE3xf5Xo'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sheet': {
        target: 'https://script.google.com',
        changeOrigin: true,
        followRedirects: true,         // ← follow the 302 into googleusercontent.com
        rewrite: path =>
          path.replace(/^\/sheet/, `/macros/s/${SCRIPT_ID}/exec`),
        configure: proxy => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // drop any redirect so the client never sees it
            delete proxyRes.headers.location
            // now inject CORS on the final response
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          })
        }
      }
    }
  }
})