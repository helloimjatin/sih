'use client'

import React, { useState, useEffect } from 'react'

interface VoiceInputProps {
  language: string // 'en' | 'hi'
  promptText: string
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInput({ language, promptText, onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    }
  }, [])

  const speakPrompt = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(promptText)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const toggleListening = () => {
    if (isListening) { setIsListening(false); return }
    if (typeof window === 'undefined') return
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) { alert('Speech recognition not supported. Please use Google Chrome or Edge.'); return }

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.onstart = () => { setIsListening(true); setInterimText('') }
    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setInterimText('')
          setIsListening(false)
          onTranscript(event.results[i][0].transcript)
          return
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setInterimText(interim)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  return (
    <div className="flex flex-col gap-unit-2 p-unit-3 rounded-xl bg-surface-container-low neo-inner-sm border border-outline-variant">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-unit-1">
          <span className="material-symbols-outlined text-[18px] icon-fill text-primary">auto_awesome</span>
          <span className="text-label-sm font-body text-on-surface font-semibold">
            {language === 'hi' ? 'आवाज़ से उत्तर दें (Voice Assist)' : 'Voice Assist'}
          </span>
        </div>
        <button
          type="button"
          onClick={speakPrompt}
          disabled={isSpeaking || disabled}
          className={`flex items-center gap-1.5 px-unit-2 py-unit-1 rounded-full text-label-sm font-body font-medium interactive transition-all ${
            isSpeaking
              ? 'bg-secondary-container text-secondary animate-pulse neo-inner-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high neo-sm'
          }`}
        >
          <span className={`material-symbols-outlined text-[16px] icon-fill ${isSpeaking ? 'text-secondary' : ''}`}>
            volume_up
          </span>
          <span>
            {isSpeaking
              ? (language === 'hi' ? 'बोल रहे हैं...' : 'Speaking...')
              : (language === 'hi' ? 'सवाल सुनें' : 'Read Question')}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-unit-3">
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled || !supported}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all interactive shrink-0 ${
            isListening
              ? 'bg-error text-on-error neo animate-pulse-red'
              : 'bg-primary text-on-primary neo hover:bg-surface-tint'
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-error animate-ping opacity-20" />
          )}
          <span className={`material-symbols-outlined text-[28px] icon-fill z-10`}>
            {isListening ? 'mic_off' : 'mic'}
          </span>
        </button>

        <div className="flex-1 min-w-0">
          {isListening ? (
            <div className="flex items-center gap-2 text-error animate-pulse">
              <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
              <span className="text-body-md font-body font-medium truncate">
                {interimText || (language === 'hi' ? 'सुन रहे हैं... कृपया बोलें' : 'Listening... Speak now')}
              </span>
            </div>
          ) : (
            <p className="text-body-md font-body text-on-surface-variant">
              {supported
                ? (language === 'hi'
                    ? 'माइक दबाएं और हिंदी में बोलें।'
                    : 'Tap the mic and speak your response in English.')
                : 'Speech recognition unavailable. Please use Chrome.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
