// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** แก้ import ที่เผลอเขียนเป็น "@radix-ui/xxx" ให้กลายเป็น "@radix-ui/xxx" */
function fixRadixVersionedImports() {
  return {
    name: 'fix-radix-versioned-imports',
    enforce: 'pre' as const,
    resolveId(this: any, source: string, importer: string | undefined, opts: any) {
      const m = /^(@radix-ui\/[^@]+)@[\d].*/.exec(source)
      if (m) {
        return this.resolve(m[1], importer, { ...opts, skipSelf: true })
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [react(), fixRadixVersionedImports()],
  resolve: {
    alias: {
      // ใช้ @ ชี้ไป src โฟลเดอร์เดียวพอ (ไม่ต้องซ้อน '@/components' ฯลฯ)
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    // ใช้ esbuild minify (ไม่ต้องติดตั้ง terser)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  // ตัด console/debugger ด้วย esbuild
  esbuild: {
    drop: ['console', 'debugger']
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/api')
      },
      '/health': {
        target: 'https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', '@radix-ui/react-slot']
  }
})
