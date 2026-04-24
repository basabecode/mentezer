# CODEX — Especificación Profesional del Grabador de Audio Web
## Módulo: Grabador profesional tipo periodista · API Web

> Este archivo define las condiciones funcionales, técnicas, visuales y de calidad que debe cumplir el grabador de audio profesional dentro de una aplicación web.
> El objetivo es construir un grabador robusto, confiable y usable en sesiones clínicas, entrevistas o contextos profesionales similares a un grabador periodista.
> Codex debe usar este archivo como documento rector para implementar, auditar, mejorar y cerrar la funcionalidad del grabador.

## Estado verificado — 2026-04-24

Implementado en `components/recorder` y `app/api/sessions`:

- permisos y captura real con `getUserMedia` / `getDisplayMedia`
- inicio, pausa, reanudación, descarte y finalización con upload a transcripción
- cronómetro basado en timestamps reales para reducir drift
- medidor de nivel con `AudioContext` y clasificación silencio/bajo/óptimo/alto/saturado
- selección de micrófono, calidad, formato preferido y opciones de reducción de ruido
- bloqueo real por consentimiento informado y autorización del paciente
- metadata técnica enviada al endpoint de transcripción y audit log
- eliminación de simulaciones de transcripción en vivo

Limitaciones reales:

- `wav`, pregrabación, pista de seguridad y 32-bit float quedan como configuración/metadata preparada; el navegador no garantiza soporte real sin procesamiento adicional.
- la transcripción en vivo no está implementada como streaming; hoy se procesa al finalizar o subir el audio.
- el test de micrófono valida captura de audio local aunque la transcripción de muestra falle por API externa.

---

# 1. Objetivo principal

Construir un **grabador de audio profesional dentro de una API/web app**, inspirado en grabadoras de periodista y dispositivos clínicos de alta confiabilidad.

El grabador debe permitir:

- solicitar y validar permisos de micrófono
- iniciar grabación
- pausar grabación
- reanudar grabación
- detener grabación
- visualizar tiempo transcurrido
- visualizar nivel de audio en tiempo real
- mostrar estado técnico del micrófono
- configurar calidad de grabación
- configurar formato de audio
- activar o desactivar reducción de ruido
- preparar arquitectura para pregrabación
- preparar arquitectura para pista de seguridad
- guardar metadata de la grabación
- manejar errores de forma profesional
- funcionar correctamente en escritorio y móvil

El resultado esperado es **código funcional**, no solo una maqueta.

---

# 2. Principio rector

El grabador debe comportarse como una herramienta profesional de captura de audio:

- confiable
- simple de operar
- clara en sus estados
- resistente a errores
- visualmente precisa
- no intimidante para el paciente o entrevistado
- optimizada para sesiones largas
- preparada para integrarse con transcripción, almacenamiento y procesamiento posterior

---

# 3. Alcance obligatorio del grabador

## 3.1 Permisos de micrófono

Codex debe implementar una capa clara para:

- detectar disponibilidad de `navigator.mediaDevices`
- solicitar permiso de micrófono
- detectar permiso concedido
- detectar permiso denegado
- detectar ausencia de micrófono
- manejar errores del navegador
- mostrar feedback visual claro al usuario

Estados mínimos:

```ts
type MicrophonePermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error'
```

---

## 3.2 Estados del grabador

El grabador debe trabajar con estados explícitos.

```ts
type RecorderStatus =
  | 'idle'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'completed'
  | 'error'
```

La UI debe cambiar visualmente según el estado:

- `idle`: esperando permiso o configuración inicial
- `ready`: listo para grabar
- `recording`: grabación activa
- `paused`: grabación pausada
- `stopping`: cerrando archivo
- `completed`: grabación finalizada
- `error`: fallo técnico

---

## 3.3 Controles principales

El grabador debe incluir controles grandes, visibles y seguros:

- botón **Iniciar grabación**
- botón **Pausar**
- botón **Reanudar**
- botón **Detener**
- botón **Marcar momento**
- botón **Descartar borrador**, si aplica
- botón **Guardar grabación**, si aplica

Reglas:

- durante `recording`, no mostrar botón de iniciar
- durante `paused`, mostrar reanudar y detener
- durante `completed`, permitir revisar, guardar, subir o descartar
- las acciones críticas deben tener confirmación cuando exista riesgo de pérdida

---

# 4. Interfaz visual del grabador

## 4.1 Tarjeta principal

La tarjeta principal debe mostrar:

- estado actual de grabación
- cronómetro grande
- visualización de onda o barras de audio
- controles principales
- indicador de micrófono activo
- mensaje de seguridad o guardado local/remoto
- feedback si el navegador limita alguna función

Ejemplo de jerarquía visual:

1. Estado del grabador
2. Cronómetro
3. Onda de audio / nivel de entrada
4. Controles principales
5. Estado técnico secundario

---

## 4.2 Cronómetro

Debe mostrar duración en tiempo real.

Formato recomendado:

```text
HH:MM:SS
```

Requisitos:

- iniciar desde `00:00:00`
- pausar sin perder duración acumulada
- reanudar desde el tiempo acumulado
- detener y conservar duración final
- evitar drift excesivo usando timestamps reales, no solo intervalos visuales

---

## 4.3 Visualización de audio

Debe existir una visualización en vivo mediante:

- barras de nivel
- waveform simplificada
- medidor RMS o peak aproximado

Debe reaccionar al volumen real de entrada cuando sea posible.

Requisitos:

- usar `AudioContext`
- usar `AnalyserNode`
- calcular nivel de entrada
- actualizar UI de manera fluida
- degradar con fallback si el navegador no permite análisis

Estados visuales sugeridos:

- silencio
- bajo
- óptimo
- alto
- saturado

---

## 4.4 Medidor de nivel profesional

El grabador debe incluir un medidor de nivel de entrada con lectura clara:

```ts
type AudioInputLevel = 'silent' | 'low' | 'good' | 'high' | 'clipping'
```

Interpretación:

- `silent`: no entra audio o micrófono bloqueado
- `low`: voz demasiado baja
- `good`: nivel adecuado
- `high`: nivel alto, revisar distancia
- `clipping`: posible saturación o distorsión

La UI debe advertir de forma no invasiva cuando el nivel sea malo.

---

# 5. Configuración profesional de audio

## 5.1 Calidad de audio

El panel de configuración debe permitir seleccionar:

```ts
type AudioQuality = 'low' | 'standard' | 'high' | 'professional'
```

Interpretación:

- `low`: menor peso de archivo, menor calidad
- `standard`: equilibrio para sesiones normales
- `high`: mejor calidad para transcripción
- `professional`: prioridad máxima a fidelidad y preservación

---

## 5.2 Formato de grabación

El sistema debe soportar o preparar:

```ts
type AudioFormat = 'webm' | 'wav' | 'mp3' | 'ogg'
```

Recomendaciones:

- En navegador, `webm` suele ser el formato más compatible con `MediaRecorder`.
- `wav` puede requerir procesamiento adicional.
- `mp3` puede requerir librería o conversión backend.
- El sistema debe detectar MIME types soportados con `MediaRecorder.isTypeSupported`.

---

## 5.3 Selección de micrófono

Cuando sea posible, permitir:

- listar dispositivos de entrada
- seleccionar micrófono
- recordar preferencia del usuario
- mostrar nombre del micrófono activo
- advertir si cambia o desaparece el dispositivo

Usar:

```ts
navigator.mediaDevices.enumerateDevices()
```

---

## 5.4 Reducción de ruido

La configuración debe incluir:

- noise suppression
- echo cancellation
- auto gain control

Ejemplo:

```ts
const constraints = {
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true
  }
}
```

Debe existir degradación elegante si el navegador no soporta alguna opción.

---

## 5.5 Pregrabación

Preparar arquitectura para capturar entre 2 y 5 segundos antes de presionar grabar oficialmente.

Requisito mínimo:

- dejar interface, estado y configuración preparada
- documentar limitaciones en navegador
- usar buffer circular si se implementa

```ts
type PreRecordSettings = {
  enabled: boolean
  seconds: 2 | 3 | 5
}
```

Si no se implementa completamente en MVP, debe quedar como placeholder técnico desacoplado.

---

## 5.6 Pista de seguridad

Preparar soporte conceptual para una pista secundaria a menor ganancia, inspirada en grabadoras profesionales.

Objetivo:

- reducir riesgo de saturación
- conservar respaldo si la pista principal se distorsiona

Configuración:

```ts
type SafetyTrackSettings = {
  enabled: boolean
  gainReductionDb: -6 | -9 | -12
}
```

Nota técnica:

- En navegador puro puede no ser viable como pista real sin procesamiento adicional.
- Puede implementarse después en backend, Web Audio API avanzada o hardware externo.
- Para MVP, dejar la estructura, metadata y UI preparadas.

---

## 5.7 Grabación 32-bit float

Preparar arquitectura para soportar grabación profesional 32-bit float cuando exista hardware/API compatible.

Requisito:

- no bloquear el MVP
- documentar como función avanzada
- exponer en configuración como “Preparado para hardware compatible” si aplica
- no prometer compatibilidad real si el navegador no la ofrece

```ts
type BitDepth = 16 | 24 | 32
type FloatRecordingMode = {
  enabled: boolean
  available: boolean
  reasonIfUnavailable?: string
}
```

---

# 6. Modelo de datos mínimo

## 6.1 Recording

```ts
type Recording = {
  id: string
  sessionId?: string
  patientId?: string
  psychologistId?: string
  status: RecorderStatus
  startedAt?: string
  pausedAt?: string
  resumedAt?: string
  endedAt?: string
  durationSeconds: number
  blobUrl?: string
  fileUrl?: string
  mimeType: string
  fileSizeBytes?: number
  metadata: RecordingMetadata
}
```

---

## 6.2 RecordingMetadata

```ts
type RecordingMetadata = {
  audioQuality: AudioQuality
  format: AudioFormat
  selectedDeviceId?: string
  selectedDeviceLabel?: string
  sampleRate?: number
  channelCount?: number
  bitDepth?: BitDepth
  noiseSuppression: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  preRecord: PreRecordSettings
  safetyTrack: SafetyTrackSettings
  float32Ready: boolean
  createdAt: string
}
```

---

## 6.3 CuePoint

```ts
type CuePoint = {
  id: string
  recordingId: string
  timestampSeconds: number
  label: string
  note?: string
  createdAt: string
}
```

---

## 6.4 RecorderError

```ts
type RecorderError = {
  code:
    | 'MIC_PERMISSION_DENIED'
    | 'MIC_UNAVAILABLE'
    | 'MEDIA_RECORDER_UNSUPPORTED'
    | 'FORMAT_UNSUPPORTED'
    | 'AUDIO_CONTEXT_FAILED'
    | 'RECORDING_FAILED'
    | 'UPLOAD_FAILED'
    | 'UNKNOWN'
  message: string
  technicalDetails?: string
  recoverable: boolean
}
```

---

# 7. Hooks o servicios requeridos

Codex debe separar la lógica en hooks o servicios desacoplados.

## 7.1 useProfessionalRecorder

Responsable de:

- permisos
- inicio
- pausa
- reanudación
- detención
- almacenamiento temporal
- estado del grabador
- errores

Debe exponer:

```ts
{
  status,
  permissionStatus,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  discardRecording,
  audioBlob,
  audioUrl,
  durationSeconds,
  error
}
```

---

## 7.2 useAudioLevelMeter

Responsable de:

- crear `AudioContext`
- conectar stream
- usar `AnalyserNode`
- calcular nivel RMS/peak
- determinar si hay clipping o silencio
- liberar recursos al detener

Debe exponer:

```ts
{
  inputLevel,
  inputLevelLabel,
  waveformBars,
  isClipping,
  isSilent
}
```

---

## 7.3 useRecorderSettings

Responsable de:

- estado de configuración
- persistencia local
- validación de soporte
- selección de micrófono
- detección de formatos soportados

Debe exponer:

```ts
{
  settings,
  updateSettings,
  availableDevices,
  supportedFormats,
  activeDevice,
  supportWarnings
}
```

---

## 7.4 useRecordingCuePoints

Responsable de:

- crear marcas de tiempo
- asociarlas a duración actual
- editar etiquetas
- eliminar marcas

Debe exponer:

```ts
{
  cuePoints,
  addCuePoint,
  updateCuePoint,
  removeCuePoint
}
```

---

# 8. Componentes requeridos

Codex debe organizar la UI en componentes reutilizables.

## 8.1 Componentes mínimos

- `ProfessionalRecorderCard`
- `RecorderControls`
- `RecorderTimer`
- `AudioWaveformMeter`
- `AudioInputLevelBadge`
- `RecorderSettingsPanel`
- `MicrophoneSelector`
- `RecordingTechnicalStatus`
- `CuePointButton`
- `CuePointsList`
- `RecorderErrorAlert`
- `RecorderMobileDock`

---

## 8.2 ProfessionalRecorderCard

Debe contener:

- estado
- cronómetro
- waveform
- controles
- nivel de entrada
- advertencias
- enlace a configuración avanzada

---

## 8.3 RecorderSettingsPanel

Debe contener:

- calidad
- formato
- micrófono
- reducción de ruido
- auto gain
- echo cancellation
- pregrabación
- pista de seguridad
- modo profesional / 32-bit float preparado

---

## 8.4 RecordingTechnicalStatus

Debe mostrar:

- micrófono activo
- formato actual
- calidad
- sample rate, si está disponible
- estado del stream
- conexión de guardado/subida
- almacenamiento temporal
- warnings de soporte

---

# 9. Comportamiento responsive

## 9.1 Escritorio

En escritorio, el grabador debe poder vivir en una vista completa con:

- tarjeta principal amplia
- panel lateral de configuración
- panel de estado técnico
- lista de marcas de tiempo
- botones con labels visibles

---

## 9.2 Móvil

En móvil, priorizar operación rápida:

- cronómetro grande
- botones grandes
- waveform visible
- configuración en acordeón o modal
- dock inferior con acciones críticas
- evitar saturación visual

---

# 10. Seguridad, privacidad y datos sensibles

El grabador debe contemplar:

- consentimiento antes de grabar si se usa en contexto clínico
- no subir archivos sin confirmación o política clara
- cifrado en tránsito para uploads
- evitar logs con datos sensibles
- limpiar blobs temporales cuando se descartan
- registrar eventos técnicos sin exponer contenido clínico

---

# 11. Manejo de errores

El sistema debe mostrar errores claros para:

- permiso de micrófono denegado
- micrófono no encontrado
- navegador no compatible
- formato no soportado
- fallo al iniciar grabación
- fallo al pausar
- fallo al detener
- fallo al crear blob
- fallo al subir archivo
- pérdida de stream

Ejemplo de mensaje:

```text
No pudimos acceder al micrófono. Revisa los permisos del navegador y vuelve a intentarlo.
```

Evitar mensajes técnicos crudos al usuario final.

---

# 12. Criterios de aceptación

La implementación se considera terminada cuando:

- el grabador solicita permisos correctamente
- inicia grabación
- pausa grabación
- reanuda grabación
- detiene grabación
- genera un blob/audio reproducible
- muestra cronómetro funcional
- muestra nivel de audio en vivo
- permite marcar momentos
- guarda metadata básica
- permite configurar calidad, formato y micrófono
- maneja errores de forma clara
- funciona en escritorio
- funciona en móvil
- degrada correctamente funciones avanzadas no soportadas
- no rompe el build
- deja documentado qué funciones son reales y cuáles son placeholders preparados

---

# 13. Sprints de implementación

## Sprint 1 — Núcleo del grabador

- [ ] Crear hook `useProfessionalRecorder`
- [ ] Detectar soporte de MediaRecorder
- [ ] Solicitar permisos de micrófono
- [ ] Implementar iniciar
- [ ] Implementar pausar
- [ ] Implementar reanudar
- [ ] Implementar detener
- [ ] Generar blob/audioUrl
- [ ] Manejar errores iniciales
- [ ] Ejecutar build

Criterio de salida:

- [ ] El usuario puede grabar, pausar, reanudar y detener audio real desde navegador.

---

## Sprint 2 — Cronómetro, waveform y nivel de entrada

- [ ] Crear `useAudioLevelMeter`
- [ ] Crear `RecorderTimer`
- [ ] Crear `AudioWaveformMeter`
- [ ] Calcular nivel RMS/peak
- [ ] Detectar silencio
- [ ] Detectar posible saturación
- [ ] Renderizar barras/waveform en vivo
- [ ] Ejecutar build

Criterio de salida:

- [ ] El grabador muestra duración y nivel de audio en tiempo real.

---

## Sprint 3 — Configuración profesional

- [ ] Crear `useRecorderSettings`
- [ ] Detectar formatos soportados
- [ ] Listar micrófonos disponibles
- [ ] Permitir seleccionar micrófono
- [ ] Configurar calidad
- [ ] Configurar formato
- [ ] Configurar noise suppression
- [ ] Configurar echo cancellation
- [ ] Configurar auto gain control
- [ ] Agregar UI de pregrabación como placeholder técnico
- [ ] Agregar UI de pista de seguridad como placeholder técnico
- [ ] Agregar UI de 32-bit float como placeholder técnico
- [ ] Ejecutar build

Criterio de salida:

- [ ] El usuario puede ajustar configuración profesional y el sistema informa limitaciones reales del navegador.

---

## Sprint 4 — Marcas, metadata y estado técnico

- [ ] Crear `useRecordingCuePoints`
- [ ] Crear botón de marcar momento
- [ ] Crear lista de marcas
- [ ] Guardar metadata de grabación
- [ ] Mostrar estado técnico del grabador
- [ ] Mostrar micrófono activo
- [ ] Mostrar calidad/formato actual
- [ ] Limpiar blobs temporales al descartar
- [ ] Ejecutar build

Criterio de salida:

- [ ] El grabador registra marcas y metadata profesional de la captura.

---

## Sprint 5 — Responsive, accesibilidad y cierre

- [ ] Optimizar escritorio
- [ ] Optimizar móvil
- [ ] Agregar labels accesibles
- [ ] Agregar estados `aria-live`
- [ ] Revisar focus states
- [ ] Revisar copy de errores
- [ ] Validar flujo completo
- [ ] Ejecutar type-check
- [ ] Ejecutar build final
- [ ] Documentar estado final

Criterio de salida:

- [ ] Grabador profesional completo, usable, responsive y estable.

---

# 14. Protocolo de ejecución para Codex

Codex debe trabajar así:

1. Leer este archivo completo.
2. Inspeccionar el proyecto.
3. Detectar stack y convenciones.
4. Implementar sprint por sprint.
5. Ejecutar build después de cada sprint.
6. Corregir errores antes de avanzar.
7. Actualizar este archivo con progreso real.
8. No detenerse hasta completar el alcance o encontrar bloqueo técnico verificable.

---

# 15. Regla de autonomía

- Si falta un componente, créalo.
- Si falta un hook, créalo.
- Si falta una ruta, intégrala donde corresponda.
- Si una función avanzada no es viable en navegador, deja placeholder técnico desacoplado y documentado.
- Si el build falla, corrige el error antes de continuar.
- Si el build pasa, avanza al siguiente sprint.
- No cierres la tarea con UI incompleta.
- No cierres la tarea si el grabador no graba audio real.

---

# 16. Estado final esperado

Al terminar, Codex debe dejar documentado:

- qué quedó implementado realmente
- qué quedó simulado
- qué quedó como placeholder técnico
- qué limitaciones tiene el navegador
- qué comandos de build se ejecutaron
- qué errores se corrigieron
- qué queda listo para integración con backend o almacenamiento

---

# 17. Checklist final

## Grabación
- [ ] Permiso de micrófono
- [ ] Iniciar
- [ ] Pausar
- [ ] Reanudar
- [ ] Detener
- [ ] Blob/audio reproducible
- [ ] Limpieza de recursos

## Visualización
- [ ] Cronómetro
- [ ] Waveform/barras
- [ ] Nivel de entrada
- [ ] Estados de saturación/silencio

## Configuración
- [ ] Calidad
- [ ] Formato
- [ ] Micrófono
- [ ] Noise suppression
- [ ] Echo cancellation
- [ ] Auto gain
- [ ] Pregrabación preparada
- [ ] Pista de seguridad preparada
- [ ] 32-bit float preparado

## Profesional
- [ ] Marcas de tiempo
- [ ] Metadata
- [ ] Estado técnico
- [ ] Responsive
- [ ] Accesibilidad
- [ ] Errores elegantes
- [ ] Build limpio

---

# 18. Nota importante

Este documento se enfoca únicamente en el **grabador profesional de audio**.

No incluye como alcance principal:

- transcripción IA
- resumen clínico IA
- diagnóstico
- análisis de libros
- panel clínico completo
- gestión completa de pacientes

Estas funciones pueden integrarse después, pero el objetivo de este archivo es que el grabador quede profesional, estable y listo para conectarse con una API web.
