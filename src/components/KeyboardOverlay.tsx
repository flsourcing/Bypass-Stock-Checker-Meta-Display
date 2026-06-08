import { useRef, useState } from 'react'

type KeyboardOverlayProps = {
  value: string
  label: string
  onChange: (next: string) => void
  onClose: () => void
}

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '-', '.'],
]

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>
}

function getSpeechRecognition() {
  const win = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

export default function KeyboardOverlay({
  value,
  label,
  onChange,
  onClose,
}: KeyboardOverlayProps) {
  const [listening, setListening] = useState(false)
  const [voiceHint, setVoiceHint] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  function appendKey(key: string) {
    onChange(value + key)
  }

  function backspace() {
    onChange(value.slice(0, -1))
  }

  function startListening() {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      setVoiceHint('Voice input is not supported in this browser.')
      return
    }

    recognitionRef.current?.stop()
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      const cleaned = transcript.replace(/\s+/g, '').toUpperCase()
      if (cleaned) {
        onChange(value + cleaned)
      }
      setVoiceHint('')
    }
    recognition.onerror = () => {
      setVoiceHint('Could not capture voice. Try again.')
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    setVoiceHint('Listening...')
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
    setVoiceHint('')
  }

  return (
    <div
      className="keyboard-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Keyboard for ${label}`}
    >
      <div className="keyboard-header">
        <span className="keyboard-label">{label}</span>
        <div className="keyboard-preview" aria-label={label}>
          {value || ' '}
        </div>
        <button type="button" className="keyboard-done focusable" onClick={onClose}>
          Done
        </button>
      </div>

      {voiceHint && <p className="voice-hint">{voiceHint}</p>}

      <div className="keyboard-rows">
        {ROWS.map((row) => (
          <div className="keyboard-row" key={row.join('-')}>
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="keyboard-key focusable"
                onClick={() => appendKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        <div className="keyboard-row keyboard-actions">
          <button
            type="button"
            className="keyboard-key keyboard-key-wide focusable"
            onClick={() => appendKey(' ')}
          >
            Space
          </button>
          <button type="button" className="keyboard-key focusable" onClick={backspace}>
            ⌫
          </button>
          <button
            type="button"
            className={`keyboard-key keyboard-mic focusable ${listening ? 'listening' : ''}`}
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? 'Stop microphone' : 'Start microphone'}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  )
}
