import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const PORT       = Number(process.env.PORT || 5175)
const GEMMA_URL  = process.env.GEMMA_URL  || 'http://127.0.0.1:8080/v1/chat/completions'
const MMPROJ_URL = process.env.MMPROJ_URL || 'http://127.0.0.1:8081/v1/chat/completions'

app.get('/health', (_, res) => res.json({ ok: true }))

app.post('/api/chat', async (req, res) => {
  try {
    const {
      model = 'gemma',
      question = '',
      messages,                 // اگر از UI لیست پیام بدهی، همین را استفاده می‌کنیم
      temperature = 0.7,
      max_tokens = 512,
      systemPrompt = ''
    } = req.body || {}

    const target = model === 'gemma' ? GEMMA_URL : MMPROJ_URL

    const msgs =
      messages ??
      [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: question }
      ]

    const payload = { model: 'local-gguf', messages: msgs, temperature, max_tokens }

    const r = await axios.post(target, payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    const answer = r.data?.choices?.[0]?.message?.content ?? ''
    res.json({ answer, raw: r.data })
  } catch (err: any) {
    console.error('proxy error:', err?.response?.data || err?.message)
    res.status(err?.response?.status || 500).json({
      error: 'Upstream failed',
      detail: err?.response?.data || err?.message
    })
  }
})

app.listen(PORT, () => console.log(`Proxy on http://127.0.0.1:${PORT}`))
