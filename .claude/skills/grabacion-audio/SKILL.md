# SKILL: grabacion-audio
## Grabación de Sesiones — PsyAssist

### Cuándo usar este skill
- Componente de grabación presencial (Web Audio API)
- Upload de audio para sesiones virtuales
- Procesamiento y envío a Whisper API
- Manejo de estados de grabación

---

## Componente de Grabación (components/recorder/SessionRecorder.tsx)

```typescript
'use client'
import { useState, useRef, useCallback } from 'react'

type RecordingState = 'idle' | 'recording' | 'paused' | 'processing' | 'done'

interface SessionRecorderProps {
  sessionId: string
  onTranscriptReady: (transcript: string) => void
}

export function SessionRecorder({ sessionId, onTranscriptReady }: SessionRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Óptimo para Whisper
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(1000) // chunk cada segundo
      mediaRecorderRef.current = mediaRecorder

      // Timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)

      setState('recording')
    } catch (err) {
      setError('No se pudo acceder al micrófono. Verifique los permisos.')
    }
  }, [])

  const stopRecording = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current
    if (!mediaRecorder) return

    setState('processing')
    if (timerRef.current) clearInterval(timerRef.current)

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await uploadAndTranscribe(blob)
        resolve()
      }
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(t => t.stop())
    })
  }, [sessionId])

  const uploadAndTranscribe = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('audio', blob, `session-${sessionId}.webm`)
    formData.append('sessionId', sessionId)

    const res = await fetch('/api/sessions/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      setError('Error al procesar el audio. Intente de nuevo.')
      setState('idle')
      return
    }

    const { transcript } = await res.json()
    onTranscriptReady(transcript)
    setState('done')
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200">
      {/* Indicador de estado */}
      <div className="flex items-center gap-2">
        {state === 'recording' && (
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        <span className="text-sm text-gray-500 capitalize">{
          state === 'idle' ? 'Listo para grabar' :
          state === 'recording' ? `Grabando — ${formatTime(duration)}` :
          state === 'paused' ? 'En pausa' :
          state === 'processing' ? 'Procesando audio...' :
          'Transcripción lista ✓'
        }</span>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Controles */}
      <div className="flex gap-3">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            ⏺ Iniciar grabación
          </button>
        )}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            ⏹ Finalizar sesión
          </button>
        )}
        {state === 'processing' && (
          <div className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl">
            Transcribiendo con IA... esto puede tomar un momento
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## API Route: Transcripción (app/api/sessions/transcribe/route.ts)

```typescript
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'
import { verifyConsent, logAccess } from '@/lib/utils/gdpr'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const audio = formData.get('audio') as File
  const sessionId = formData.get('sessionId') as string

  if (!audio || !sessionId) {
    return Response.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Verificar que la sesión pertenece al psicólogo
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('id, patient_id, status')
    .eq('id', sessionId)
    .eq('psychologist_id', session.user.id)
    .single()

  if (!sessionData) return Response.json({ error: 'Sesión no encontrada' }, { status: 404 })

  // Verificar consentimiento del paciente
  const hasConsent = await verifyConsent(sessionData.patient_id, session.user.id, supabase)
  if (!hasConsent) {
    return Response.json({
      error: 'El paciente no ha firmado el consentimiento informado'
    }, { status: 403 })
  }

  // Actualizar estado
  await supabase.from('sessions').update({ status: 'transcribing' }).eq('id', sessionId)

  // Transcribir con Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: 'whisper-1',
    language: 'es',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  // Guardar transcripción
  const content = transcription.segments?.map(s => ({
    speaker: 'unknown', // v1.0 sin diarización
    text: s.text,
    timestamp: s.start,
  })) || [{ speaker: 'unknown', text: transcription.text, timestamp: 0 }]

  await supabase.from('transcripts').insert({
    session_id: sessionId,
    content,
  })

  await supabase.from('sessions').update({ status: 'analyzing' }).eq('id', sessionId)

  // Log de acceso
  await logAccess(supabase, session.user.id, 'session_transcribed', 'session', sessionId, req)

  return Response.json({
    transcript: transcription.text,
    segments: content,
  })
}
```

---

## Upload de Audio (modo virtual)

```typescript
// Para sesiones virtuales: el psicólogo sube el archivo
export function AudioUploader({ sessionId, onReady }: { sessionId: string; onReady: () => void }) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 100 * 1024 * 1024 // 100MB
    if (file.size > MAX_SIZE) {
      alert('El archivo no puede superar 100MB')
      return
    }

    const allowed = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/mp4']
    if (!allowed.includes(file.type)) {
      alert('Formato no soportado. Use MP3, WAV, M4A o WebM')
      return
    }

    const formData = new FormData()
    formData.append('audio', file)
    formData.append('sessionId', sessionId)

    await fetch('/api/sessions/transcribe', { method: 'POST', body: formData })
    onReady()
  }

  return (
    <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
      <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
      <p className="text-gray-500">Arrastra el audio de la sesión virtual aquí</p>
      <p className="text-sm text-gray-400 mt-1">MP3, WAV, M4A, WebM — máximo 100MB</p>
    </label>
  )
}
```
