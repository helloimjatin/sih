'use client'

import React, { useState, useEffect } from 'react'
import Toast, { ToastProps } from './Toast'

interface QueueItem {
  id: number
  patient: { id: number; name: string; age: number; language: string; abha_mock: string }
  chief_complaint: string
  status: string
  priority_flag: boolean
  token: string
  created_at: string
  answers: { field_key: string; value: string; source: string }[]
  documents?: any[]
  ayush_notes?: string
  summary?: string
}

// Fixed ISO timestamps to avoid SSR vs Client hydration mismatch
const DEFAULT_QUEUE: QueueItem[] = [
  {
    id: 101,
    patient: { id: 501, name: 'Rahul Sharma', age: 54, language: 'hi', abha_mock: 'ABHA-9941-8821-3310' },
    chief_complaint: 'chest_pain',
    status: 'waiting_doctor',
    priority_flag: true,
    token: 'A-124',
    created_at: '2026-08-24T17:15:00.000Z',
    answers: [
      { field_key: 'onset', value: 'Today — sudden 2h ago', source: 'touch' },
      { field_key: 'severity', value: '8/10 Severe', source: 'touch' },
      { field_key: 'radiation', value: 'Left arm & jaw', source: 'touch' },
      { field_key: 'breathlessness', value: 'Yes — severe', source: 'voice' },
      { field_key: 'sweating', value: 'Yes — cold sweats', source: 'touch' },
      { field_key: 'trigger', value: 'Worse after exertion', source: 'voice' },
    ],
    documents: [
      {
        doc_type: 'prescription',
        file_name: 'prior_rx.jpg',
        entities: [
          { entity_type: 'medicine', value: 'Tab. Aspirin 75mg QD', confidence_note: 'Verified' },
          { entity_type: 'medicine', value: 'Tab. Sorbitrate 5mg SL', confidence_note: 'Verified' },
        ],
      },
    ],
    ayush_notes: 'Arjun Churna twice daily.',
    summary: 'Rahul Sharma, 54 y/o male, sudden severe chest pain (8/10) radiating to arm/jaw. Breathlessness + cold sweating. Exertional trigger. Prior rx: Aspirin + Sorbitrate.\n\n⚠ RED FLAG — Immediate evaluation required.',
  },
  {
    id: 102,
    patient: { id: 502, name: 'Anita Desai', age: 29, language: 'en', abha_mock: 'ABHA-1142-7731-9920' },
    chief_complaint: 'cough',
    status: 'waiting_doctor',
    priority_flag: false,
    token: 'B-042',
    created_at: '2026-08-24T17:05:00.000Z',
    answers: [
      { field_key: 'duration', value: '2–7 days', source: 'touch' },
      { field_key: 'type', value: 'Dry cough', source: 'touch' },
      { field_key: 'fever', value: 'No fever', source: 'touch' },
      { field_key: 'breathlessness', value: 'None', source: 'touch' },
    ],
    documents: [],
    ayush_notes: 'Honey & ginger tea.',
    summary: 'Anita Desai, 29 y/o female, dry cough 2–7 days. No fever or breathing difficulty. Routine OPD.',
  },
  {
    id: 103,
    patient: { id: 503, name: 'Vikram Singh', age: 62, language: 'hi', abha_mock: 'ABHA-3310-9941-2210' },
    chief_complaint: 'chest_pain',
    status: 'waiting_doctor',
    priority_flag: false,
    token: 'B-045',
    created_at: '2026-08-24T16:50:00.000Z',
    answers: [
      { field_key: 'onset', value: '1–4 weeks ago', source: 'touch' },
      { field_key: 'severity', value: '4/10 Mild', source: 'touch' },
      { field_key: 'radiation', value: 'No radiation', source: 'touch' },
      { field_key: 'breathlessness', value: 'None', source: 'touch' },
    ],
    documents: [],
    ayush_notes: 'None reported.',
    summary: 'Vikram Singh, 62 y/o male, mild intermittent chest discomfort for 2 weeks. Non-urgent routine evaluation.',
  },
]

export default function DoctorConsole() {
  const [isMounted, setIsMounted] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>(DEFAULT_QUEUE)
  const [selected, setSelected] = useState<QueueItem | null>(DEFAULT_QUEUE[0])
  const [editedSummary, setEditedSummary] = useState(DEFAULT_QUEUE[0].summary || '')
  const [isEditing, setIsEditing] = useState(false)
  const [showDetail, setShowDetail] = useState(false) // mobile drill-down
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (type: 'info' | 'warning' | 'success', msg: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, type, message: msg, onClose: id => setToasts(t => t.filter(x => x.id !== id)) }])
  }

  // Hydration fix: mark mounted after initial client render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Helper to update queue state AND sync to localStorage
  const updateQueueState = (newQueue: QueueItem[]) => {
    setQueue(newQueue)
    try {
      localStorage.setItem('medikiosk_queue', JSON.stringify(newQueue))
    } catch {}
  }

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem('medikiosk_queue')
        if (!raw) return
        const parsed: QueueItem[] = JSON.parse(raw)
        const map = new Map<number, QueueItem>()
        // Merge localStorage data with DEFAULT_QUEUE
        DEFAULT_QUEUE.forEach(q => map.set(q.id, q))
        parsed.forEach(q => map.set(q.id, q))

        const sorted = Array.from(map.values()).sort((a, b) => {
          if (a.priority_flag !== b.priority_flag) return a.priority_flag ? -1 : 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setQueue(sorted)
      } catch {}
    }
    sync()
    const iv = setInterval(sync, 4000)
    return () => clearInterval(iv)
  }, [])

  const selectPatient = (item: QueueItem) => {
    const updated = { ...item, status: item.status === 'completed' ? 'completed' : 'consulting' }
    const updatedQueue = queue.map(x => x.id === item.id ? updated : x)
    updateQueueState(updatedQueue)
    setSelected(updated)
    setEditedSummary(updated.summary || '')
    setIsEditing(false)
    setShowDetail(true)
    toast('success', `Reviewing patient: ${item.patient.name}`)
  }

  const saveSummary = () => {
    if (!selected) return
    const updated = { ...selected, summary: editedSummary }
    setSelected(updated)
    const updatedQueue = queue.map(x => x.id === updated.id ? updated : x)
    updateQueueState(updatedQueue)
    setIsEditing(false)
    toast('success', 'Summary saved!')
  }

  const completeConsultation = () => {
    if (!selected) return
    const updated = { ...selected, status: 'completed' }
    setSelected(updated)
    const updatedQueue = queue.map(x => x.id === selected.id ? updated : x)
    updateQueueState(updatedQueue)
    toast('success', `Consultation completed for ${selected.patient.name}`)
  }

  const timeAgo = (iso: string) => {
    if (!isMounted) return 'intake'
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 0) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const urgentCount = queue.filter(q => q.priority_flag && q.status !== 'completed').length
  const waitingCount = queue.filter(q => q.status === 'waiting_doctor').length
  const activeCount = queue.filter(q => q.status === 'consulting').length

  // ─── QUEUE PANEL ───────────────────────────────────────────────────────────
  const QueuePanel = () => (
    <div className="flex flex-col h-full min-h-0">
      {/* Queue Header */}
      <div className="px-4 pt-4 pb-3 shrink-0 border-b border-outline-variant bg-surface-container-low">
        <h2 className="font-display font-bold text-headline-md text-on-surface flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary icon-fill">pending_actions</span>
          Live OPD Queue
        </h2>
        <div className="flex gap-2 flex-wrap">
          {urgentCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-error-container text-error text-label-sm font-bold flex items-center gap-1 animate-pulse-red">
              <span className="material-symbols-outlined text-[14px] icon-fill">emergency</span>
              {urgentCount} Urgent
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-label-sm font-semibold">
            {waitingCount} Waiting
          </span>
          {activeCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-label-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] icon-fill">medical_services</span>
              {activeCount} Active
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Queue Cards */}
      <div className="flex-1 overflow-y-auto p-3 pb-28 sm:pb-6 flex flex-col gap-3">
        {queue.map(item => {
          const isSelected = selected?.id === item.id
          const isActive = item.status === 'consulting'
          const isCompleted = item.status === 'completed'

          return (
            <div
              key={item.id}
              onClick={() => selectPatient(item)}
              className={`rounded-2xl border-2 p-3.5 cursor-pointer transition-all relative flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-primary bg-surface-bright shadow-md scale-[1.01]'
                  : 'border-outline-variant/60 bg-surface-bright hover:border-primary/40'
              } ${isCompleted ? 'opacity-60' : ''}`}
              style={isSelected
                ? { boxShadow: '0 4px 16px rgba(21,66,18,0.18)' }
                : { boxShadow: '4px 4px 10px #dbd9d9, -4px -4px 10px #ffffff' }
              }
            >
              {item.priority_flag && !isCompleted && (
                <div className="absolute inset-x-0 top-0 h-1.5 bg-error animate-pulse rounded-t-2xl" />
              )}

              {/* LEFT: Token + Patient Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-xl bg-primary text-on-primary font-mono text-label-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {item.token}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-[16px] text-on-surface truncate">
                      {item.patient.name}
                    </h3>
                    {item.priority_flag && (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px] icon-fill">emergency</span>
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant text-[13px] truncate">
                    <strong className="text-on-surface capitalize font-semibold">{item.chief_complaint.replace('_', ' ')}</strong>
                    {' • '}{item.patient.age}y ({item.patient.language.toUpperCase()})
                  </p>
                </div>
              </div>

              {/* RIGHT: REVIEW BUTTON */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    selectPatient(item)
                  }}
                  className={`px-4 py-2 text-label-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container border-2 border-primary text-primary hover:bg-primary hover:text-on-primary'
                  }`}
                  style={{ boxShadow: '3px 3px 6px #dbd9d9, -3px -3px 6px #ffffff' }}
                >
                  <span>Review</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ─── DETAIL PANEL ──────────────────────────────────────────────────────────
  const DetailPanel = () => {
    if (!selected) return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-12">
        <span className="material-symbols-outlined text-[72px] text-outline icon-fill">stethoscope</span>
        <p className="text-body-lg font-body text-on-surface-variant">
          Select a patient from the queue to begin consultation
        </p>
      </div>
    )

    const isCompleted = selected.status === 'completed'

    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Detail Header (sticky inside panel) */}
        <div className="px-4 pt-4 pb-3 shrink-0 border-b border-outline-variant bg-surface-container-low">
          {/* Mobile back button */}
          <button
            onClick={() => setShowDetail(false)}
            className="lg:hidden flex items-center gap-1 text-primary font-body font-bold text-label-sm mb-3"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Queue
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Patient identity */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl text-on-primary font-display font-bold text-label-sm flex items-center justify-center shrink-0 ${selected.priority_flag ? 'bg-error' : 'bg-primary'}`}
                style={{ boxShadow: '0 3px 8px rgba(0,0,0,0.2)' }}
              >
                {selected.token}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-headline-md text-on-surface">{selected.patient.name}</h2>
                  {selected.priority_flag && (
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold animate-pulse-red">RED FLAG</span>
                  )}
                </div>
                <p className="text-label-sm font-body text-on-surface-variant">
                  {selected.patient.age}y • {selected.patient.language.toUpperCase()} • <span className="font-mono">{selected.patient.abha_mock}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-body font-bold text-label-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Completed
                </span>
              ) : (
                <>
                  <span className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-label-sm font-bold flex items-center gap-1.5"
                    style={{ boxShadow: '0 3px 8px rgba(21,66,18,0.3)' }}>
                    <span className="material-symbols-outlined text-[16px] icon-fill">medical_services</span>
                    In Consult
                  </span>
                  <button
                    onClick={completeConsultation}
                    className="px-3 py-1.5 rounded-xl bg-surface-bright text-primary border-2 border-primary font-body font-bold text-label-sm hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                    style={{ boxShadow: '3px 3px 6px #dbd9d9, -3px -3px 6px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Detail Body */}
        <div className="flex-1 overflow-y-auto p-4 pb-28 sm:pb-6 flex flex-col gap-5">

          {/* AI Clinical Summary */}
          <section className="bg-surface-bright rounded-2xl border border-outline-variant p-5 flex flex-col gap-4"
            style={{ boxShadow: '4px 4px 10px #dbd9d9, -4px -4px 10px #ffffff' }}>
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-body text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] icon-fill">auto_awesome</span>
                AI Clinical Summary
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-label-sm font-body text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{isEditing ? 'close' : 'edit_note'}</span>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3">
                <textarea
                  rows={5}
                  value={editedSummary}
                  onChange={e => setEditedSummary(e.target.value)}
                  className="input-field text-body-md leading-relaxed"
                />
                <button onClick={saveSummary} className="btn-primary self-end py-2.5 px-5 text-label-sm">
                  <span className="material-symbols-outlined text-[17px] icon-fill">save</span>
                  Save Summary
                </button>
              </div>
            ) : (
              <p className="text-body-md text-on-surface leading-relaxed font-body whitespace-pre-line bg-secondary-container/20 px-4 py-3 rounded-xl border border-outline-variant/40">
                {selected.summary || editedSummary || 'No summary yet.'}
              </p>
            )}

            <div className="text-[13px] font-body text-on-surface-variant bg-tertiary-fixed/30 px-3 py-2 rounded-lg flex items-center gap-1.5 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
              AI draft — clinician verification required before use.
            </div>
          </section>

          {/* Structured Answers */}
          <section className="bg-surface-bright rounded-2xl border border-outline-variant p-5 flex flex-col gap-4"
            style={{ boxShadow: '4px 4px 10px #dbd9d9, -4px -4px 10px #ffffff' }}>
            <h3 className="text-label-sm font-body text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">quiz</span>
              Patient Responses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.answers.map((ans, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-body text-outline uppercase tracking-wider">{ans.field_key.replace('_', ' ')}</span>
                    <span className={`text-[10px] font-body font-bold px-1.5 py-0.5 rounded-full ${
                      ans.source === 'voice' ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {ans.source === 'voice' ? '🎤 VOICE' : '👆 TOUCH'}
                    </span>
                  </div>
                  <span className="text-body-md font-body font-semibold text-on-surface">{ans.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Scanned Documents */}
          {selected.documents && selected.documents.length > 0 && (
            <section className="bg-surface-bright rounded-2xl border border-outline-variant p-5 flex flex-col gap-4"
              style={{ boxShadow: '4px 4px 10px #dbd9d9, -4px -4px 10px #ffffff' }}>
              <h3 className="text-label-sm font-body text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">document_scanner</span>
                Scanned Documents — Gemini OCR
              </h3>
              {selected.documents.map((doc, i) => (
                <div key={i} className="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body font-bold text-primary text-body-md">{doc.file_name}</span>
                    <span className="text-[11px] bg-primary-fixed text-primary font-bold px-2 py-0.5 rounded-full">{doc.doc_type?.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {doc.entities?.map((e: any, j: number) => (
                      <div key={j} className="flex justify-between items-center bg-surface-bright p-2.5 rounded-lg border border-outline-variant/40 text-body-md font-body">
                        <span className="font-semibold text-on-surface">{e.value}</span>
                        <span className="text-label-sm text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-full">{e.confidence_note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* AYUSH Notes */}
          {selected.ayush_notes && (
            <section className="p-4 rounded-2xl bg-secondary-container/40 border border-outline-variant flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[22px] icon-fill shrink-0 mt-0.5">spa</span>
              <div>
                <div className="text-label-sm font-body font-bold text-primary">AYUSH / Herbal Supplement</div>
                <p className="text-body-md font-body text-on-surface mt-0.5">{selected.ayush_notes}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm">
        {toasts.map(t => <Toast key={t.id} {...t} />)}
      </div>

      {/*
        APP-SHELL LAYOUT:
        Fills remaining viewport below Navbar (h-16 mobile = 4rem, h-20 sm = 5rem).
        overflow-hidden stops the outer page from scrolling.
        Only inner panes scroll independently.
      */}
      <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden">
        {/* ─── TOP STATS BAR (no scroll, stays fixed at top) ─── */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-outline-variant bg-surface-container-low"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary icon-fill text-[26px]">stethoscope</span>
            <h1 className="font-display font-bold text-[20px] sm:text-[24px] text-on-surface">Doctor Console</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {urgentCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-error-container text-error text-label-sm font-bold flex items-center gap-1.5 animate-pulse-red">
                <span className="material-symbols-outlined text-[14px] icon-fill">emergency</span>
                {urgentCount} Urgent
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-label-sm font-semibold">{waitingCount} Waiting</span>
            {activeCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-label-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] icon-fill">medical_services</span>
                {activeCount} Active
              </span>
            )}
            <span className="text-[11px] font-body text-outline">4s auto-sync</span>
          </div>
        </div>

        {/* ─── TWO-PANE BODY (each pane scrolls independently) ─── */}
        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* ── LEFT PANE: Queue List ── */}
          <div className={`${showDetail ? 'hidden lg:flex' : 'flex'} lg:w-5/12 w-full flex-col border-r border-outline-variant bg-surface-bright overflow-hidden`}>
            <QueuePanel />
          </div>

          {/* ── RIGHT PANE: Patient Detail ── */}
          <div className={`${!showDetail ? 'hidden lg:flex' : 'flex'} lg:w-7/12 w-full flex-col bg-surface-bright overflow-hidden`}>
            <DetailPanel />
          </div>

        </div>
      </div>
    </>
  )
}
