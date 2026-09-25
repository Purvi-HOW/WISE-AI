import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import chatHandler from './api/chat.ts'
import testKeyHandler from './api/test-key.ts'

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/chat') || req.url.startsWith('/api/test-key')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              (req as any).body = body ? JSON.parse(body) : {};
            } catch (e) {
              (req as any).body = {};
            }

            const mockRes = {
              status(code: number) {
                res.statusCode = code;
                return mockRes;
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return mockRes;
              }
            };

            try {
              if (req.url?.startsWith('/api/chat')) {
                await chatHandler(req, mockRes);
              } else if (req.url?.startsWith('/api/test-key')) {
                await testKeyHandler(req, mockRes);
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || String(err) }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServerPlugin()],
})
