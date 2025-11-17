import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    base: command === 'build' ? './' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
     optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/functions']
  },
    server: {
      host: '::',
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔄 [Vite] Proxying:', req.method, req.url, '→', `http://127.0.0.1:5000${req.url}`);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ [Vite] Proxy response:', proxyRes.statusCode, 'from', req.url);
            });
            proxy.on('error', (err, req, res) => {
              console.error('❌ [Vite] Proxy error:', err.message);
            });
          }
        }
      }
    }
  }
})
