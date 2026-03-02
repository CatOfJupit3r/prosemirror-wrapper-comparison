import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const app = new Hono()

const UPLOADS_DIR = './uploads'

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) {
  await mkdir(UPLOADS_DIR, { recursive: true })
}

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type'],
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'File server running' }))

// Upload endpoint
app.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file']

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const ext = file.name.split('.').pop() || ''
    const filename = `${randomUUID()}.${ext}`
    const filepath = join(UPLOADS_DIR, filename)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filepath, buffer)

    const url = `http://localhost:3001/files/${filename}`

    return c.json({
      success: true,
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// Get MIME type from extension
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// Serve files
app.get('/files/:filename', async (c) => {
  const filename = c.req.param('filename')
  const filepath = join(UPLOADS_DIR, filename)

  if (!existsSync(filepath)) {
    return c.json({ error: 'File not found' }, 404)
  }

  try {
    const buffer = await readFile(filepath)
    const mimeType = getMimeType(filename)
    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch {
    return c.json({ error: 'Failed to read file' }, 500)
  }
})

const port = 3001
console.log(`File server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
