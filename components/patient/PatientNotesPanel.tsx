"use client"

import { useRef, useState, useTransition } from "react"
import { Trash2, Plus, StickyNote } from "lucide-react"
import { addPatientNote, deletePatientNote } from "@/lib/patients/actions"

interface Note {
  id: string
  content: string
  created_at: string
}

interface PatientNotesPanelProps {
  patientId: string
  initialNotes: Note[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function PatientNotesPanel({ patientId, initialNotes }: PatientNotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [text, setText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAdd = () => {
    const trimmed = text.trim()
    if (trimmed.length < 2) return
    setError(null)

    startTransition(async () => {
      const result = await addPatientNote(patientId, trimmed)
      if (result.error) {
        setError(result.error)
        return
      }
      if (!result.note) {
        setError("No se pudo confirmar la nota guardada.")
        return
      }
      setNotes(prev => [result.note, ...prev])
      setText("")
      textareaRef.current?.focus()
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      const result = await deletePatientNote(noteId, patientId)
      if (result?.error) return
      setNotes(prev => prev.filter(n => n.id !== noteId))
    })
  }

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Escribe una observación, pregunta o dato relevante... (Enter para guardar, Shift+Enter para nueva línea)"
          className="calm-input flex-1 resize-none px-3.5 py-2.5 text-sm leading-relaxed"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || text.trim().length < 2}
          className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl bg-psy-ink text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-psy-red">{error}</p>
      )}

      {/* Lista */}
      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map(note => (
            <div
              key={note.id}
              className="group flex items-start gap-3 rounded-xl border bg-psy-cream/50 px-3.5 py-3"
              style={{ borderColor: "var(--psy-warm-border)" }}
            >
              <StickyNote size={14} className="mt-0.5 shrink-0 text-psy-amber" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-psy-ink">{note.content}</p>
                <p className="mt-1 text-[11px] text-psy-muted">{formatDate(note.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={isPending}
                className="shrink-0 rounded-lg p-1 text-psy-muted opacity-0 transition hover:bg-psy-red-light hover:text-psy-red group-hover:opacity-100 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-3 text-center text-sm text-psy-muted">
          Sin notas registradas. Agrega observaciones o preguntas para esta sesión.
        </p>
      )}
    </div>
  )
}
