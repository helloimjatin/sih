'use client'

import React, { useState } from 'react'
import VoiceInput from './VoiceInput'
import DocScanner from './DocScanner'
import Toast, { ToastProps } from './Toast'

interface Question {
  key: string
  prompt_en: string
  prompt_hi: string
  type: 'choice' | 'scale' | 'yesno' | 'text'
  options?: { label_en: string; label_hi: string; value: string }[]
}

const ONTOLOGY_QUESTIONS: Record<string, Question[]> = {
  chest_pain: [
    {
      key: 'onset',
      prompt_en: 'When did the chest pain start?',
      prompt_hi: 'छाती में दर्द कब शुरू हुआ?',
      type: 'choice',
      options: [
        { label_en: 'Today (Sudden)', label_hi: 'आज (अचानक)', value: 'Today' },
        { label_en: '2–7 days ago', label_hi: '2–7 दिन पहले', value: '2-7 days' },
        { label_en: '1–4 weeks ago', label_hi: '1–4 सप्ताह पहले', value: '1-4 weeks' },
        { label_en: 'More than a month', label_hi: 'एक महीने से अधिक', value: 'More than a month' },
      ],
    },
    {
      key: 'severity',
      prompt_en: 'On a scale of 0–10, how severe is the pain?',
      prompt_hi: '0 से 10 पर दर्द कितना तेज है?',
      type: 'scale',
    },
    {
      key: 'radiation',
      prompt_en: 'Does the pain spread to your arm, jaw, or back?',
      prompt_hi: 'क्या दर्द बांह, जबड़े या पीठ में फैलता है?',
      type: 'yesno',
      options: [
        { label_en: 'Yes — it spreads', label_hi: 'हाँ — फैलता है', value: 'yes' },
        { label_en: 'No — stays in place', label_hi: 'नहीं — नहीं फैलता', value: 'no' },
      ],
    },
    {
      key: 'breathlessness',
      prompt_en: 'Do you have shortness of breath?',
      prompt_hi: 'क्या सांस लेने में तकलीफ है?',
      type: 'yesno',
      options: [
        { label_en: 'Yes — breathing is hard', label_hi: 'हाँ — सांस लेना कठिन है', value: 'yes' },
        { label_en: 'No — breathing is fine', label_hi: 'नहीं — ठीक है', value: 'no' },
      ],
    },
    {
      key: 'sweating',
      prompt_en: 'Are you experiencing cold sweating?',
      prompt_hi: 'क्या ठंडा पसीना आ रहा है?',
      type: 'yesno',
      options: [
        { label_en: 'Yes — cold sweats', label_hi: 'हाँ — ठंडा पसीना', value: 'yes' },
        { label_en: 'No — no sweating', label_hi: 'नहीं', value: 'no' },
      ],
    },
    {
      key: 'trigger',
      prompt_en: 'Does the pain worsen after meals or exertion?',
      prompt_hi: 'क्या भोजन या चलने से बढ़ता है?',
      type: 'text',
    },
  ],
  cough: [
    {
      key: 'duration',
      prompt_en: 'How long have you had the cough?',
      prompt_hi: 'खांसी कितने समय से है?',
      type: 'choice',
      options: [
        { label_en: 'Started today', label_hi: 'आज शुरू हुई', value: 'Today' },
        { label_en: '2–7 days', label_hi: '2–7 दिन से', value: '2-7 days' },
        { label_en: '1–4 weeks', label_hi: '1–4 सप्ताह से', value: '1-4 weeks' },
        { label_en: 'More than a month', label_hi: 'एक महीने से अधिक', value: 'More than a month' },
      ],
    },
    {
      key: 'productive',
      prompt_en: 'Is it dry, or does it bring up phlegm?',
      prompt_hi: 'सूखी खांसी है या बलगम आता है?',
      type: 'choice',
      options: [
        { label_en: 'Dry cough', label_hi: 'सूखी खांसी', value: 'Dry' },
        { label_en: 'Cough with phlegm', label_hi: 'बलगम वाली', value: 'With mucus' },
        { label_en: 'Not sure', label_hi: 'पक्का नहीं', value: 'Not sure' },
      ],
    },
    {
      key: 'fever',
      prompt_en: 'Do you have fever along with the cough?',
      prompt_hi: 'क्या खांसी के साथ बुखार है?',
      type: 'yesno',
      options: [
        { label_en: 'Yes — I have fever', label_hi: 'हाँ — बुखार है', value: 'yes' },
        { label_en: 'No fever', label_hi: 'नहीं', value: 'no' },
      ],
    },
    {
      key: 'breathlessness',
      prompt_en: 'Any difficulty breathing or chest tightness?',
      prompt_hi: 'सांस लेने में कोई परेशानी?',
      type: 'yesno',
      options: [
        { label_en: 'Yes — trouble breathing', label_hi: 'हाँ — दिक्कत है', value: 'yes' },
        { label_en: 'No — breathing fine', label_hi: 'नहीं', value: 'no' },
      ],
    },
  ],
}

const STEPS = [
  { num: 1, label_en: 'Registration', label_hi: 'पंजीकरण', icon: 'badge' },
  { num: 2, label_en: 'Complaint', label_hi: 'समस्या', icon: 'medical_information' },
  { num: 3, label_en: 'Questions', label_hi: 'प्रश्न', icon: 'quiz' },
  { num: 4, label_en: 'Documents', label_hi: 'दस्तावेज', icon: 'document_scanner' },
  { num: 5, label_en: 'Token', label_hi: 'टोकन', icon: 'confirmation_number' },
]

export default function PatientKiosk() {
  const [step, setStep] = useState<number>(1)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const [patientName, setPatientName] = useState('Rajesh Sharma')
  const [patientAge, setPatientAge] = useState(48)
  const [abhaId] = useState('91-2234-5567-8901')
  const [consentGiven, setConsentGiven] = useState(true)

  const [chiefComplaint, setChiefComplaint] = useState<'chest_pain' | 'cough'>('chest_pain')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { value: string; source: 'touch' | 'voice' }>>({})
  const [currentTextAnswer, setCurrentTextAnswer] = useState('')

  const [scannedDocs, setScannedDocs] = useState<any[]>([])
  const [ayushNotes, setAyushNotes] = useState('Taking herbal tulsi syrup for 2 days.')
  const [generatedToken, setGeneratedToken] = useState('')
  const [isPriority, setIsPriority] = useState(false)

  const t = (en: string, hi: string) => (language === 'hi' ? hi : en)

  const addToast = (type: 'info' | 'warning' | 'success', message: string) => {
    const id = Date.now().toString(36)
    setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }])
  }
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const currentQuestions = ONTOLOGY_QUESTIONS[chiefComplaint] || []
  const activeQuestion = currentQuestions[currentQuestionIndex]
  const progressPct = ((step - 1) / 4) * 100

  const checkRedFlags = (ansMap: Record<string, { value: string; source: string }>) => {
    if (chiefComplaint === 'chest_pain') return ansMap['breathlessness']?.value === 'yes' || ansMap['sweating']?.value === 'yes'
    if (chiefComplaint === 'cough') return ansMap['breathlessness']?.value === 'yes' && ansMap['fever']?.value === 'yes'
    return false
  }

  const handleSaveAnswer = (val: string, source: 'touch' | 'voice' = 'touch') => {
    if (!activeQuestion) return
    const updated = { ...answers, [activeQuestion.key]: { value: val, source } }
    setAnswers(updated)
    setCurrentTextAnswer('')
    setIsPriority(checkRedFlags(updated))
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setStep(4)
      addToast('success', t('All questions completed!', 'सभी प्रश्न पूर्ण!'))
    }
  }

  const handleCompleteIntake = () => {
    const token = `TK-${Math.floor(1000 + Math.random() * 9000)}`
    setGeneratedToken(token)
    const encounter = {
      id: Date.now(), patient: { id: Date.now(), name: patientName, age: patientAge, language, abha_mock: abhaId },
      chief_complaint: chiefComplaint, status: 'waiting_doctor', priority_flag: isPriority, token,
      created_at: new Date().toISOString(),
      answers: Object.entries(answers).map(([key, obj]) => ({ field_key: key, value: obj.value, source: obj.source })),
      documents: scannedDocs, ayush_notes: ayushNotes, summary: null,
    }
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('medikiosk_queue') || '[]')
      localStorage.setItem('medikiosk_queue', JSON.stringify([encounter, ...existing]))
    }
    setStep(5)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 pb-24 sm:pb-10">
      {/* Toast Container */}
      <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm sm:w-full">
        {toasts.map((t) => <Toast key={t.id} {...t} />)}
      </div>

      {/* ── Progress Bar ── */}
      <section className="flex flex-col gap-3 animate-fade-in">
        <div className="flex justify-between items-center">
          <span className="text-label-sm font-body text-on-surface-variant">
            {t(`Step ${step} of 5`, `चरण ${step} / 5`)}
          </span>
          <span className="text-label-sm font-body text-primary font-bold">
            {t(STEPS[step - 1]?.label_en ?? '', STEPS[step - 1]?.label_hi ?? '')}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        {/* Step dots */}
        <div className="flex justify-between px-1">
          {STEPS.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                step === s.num ? 'bg-primary text-on-primary scale-110' :
                step > s.num ? 'bg-secondary-container text-primary' : 'bg-surface-container text-on-surface-variant'
              }`}
                style={step === s.num ? { boxShadow: '0 4px 10px rgba(21,66,18,0.3)' } : {}}
              >
                {step > s.num
                  ? <span className="material-symbols-outlined text-[18px] icon-fill">check</span>
                  : <span className="material-symbols-outlined text-[16px] icon-fill">{s.icon}</span>
                }
              </div>
              <span className={`text-[10px] font-body hidden sm:block ${step === s.num ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {t(s.label_en, s.label_hi)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STEP 1 — Registration ══ */}
      {step === 1 && (
        <div className="animate-slide-up flex flex-col gap-6">
          {/* Language */}
          <section className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 neo">
            <h3 className="font-display font-bold text-headline-md text-on-surface border-b border-outline-variant pb-3">
              {t('Select Language', 'भाषा चुनें')}
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { code: 'en', label: 'English', sub: 'Continue in English' },
                { code: 'hi', label: 'हिंदी', sub: 'हिंदी में जारी रखें' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as 'en' | 'hi')}
                  className={`option-pill ${language === lang.code ? 'option-pill-active' : 'option-pill-inactive'}`}
                >
                  <div>
                    <div className="font-bold">{lang.label}</div>
                    <div className={`text-[13px] font-normal mt-0.5 ${language === lang.code ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                      {lang.sub}
                    </div>
                  </div>
                  {language === lang.code && (
                    <span className="material-symbols-outlined text-[24px] icon-fill text-on-primary shrink-0">check_circle</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => { addToast('warning', 'Gujarati coming soon! Switched to Hindi.'); setLanguage('hi') }}
                className="option-pill option-pill-inactive opacity-60"
              >
                <div>
                  <div className="font-bold">ગુજરાતી</div>
                  <div className="text-[13px] font-normal mt-0.5 text-on-surface-variant">Coming soon</div>
                </div>
                <span className="text-[11px] bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded-full font-semibold">Soon</span>
              </button>
            </div>
          </section>

          {/* Patient Info */}
          <section className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-5 neo">
            <h3 className="font-display font-bold text-headline-md text-on-surface border-b border-outline-variant pb-3">
              {t('Patient Details', 'मरीज़ का विवरण')}
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-body text-on-surface-variant px-1" htmlFor="fullName">
                {t('Full Name', 'पूरा नाम')}
              </label>
              <input id="fullName" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                className="input-field" placeholder={t('Enter full name', 'पूरा नाम दर्ज करें')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-body text-on-surface-variant px-1" htmlFor="age">
                {t('Age (years)', 'उम्र (वर्ष)')}
              </label>
              <input id="age" type="number" value={patientAge} onChange={(e) => setPatientAge(Number(e.target.value))}
                className="input-field w-32" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-body text-primary px-1 flex items-center gap-1" htmlFor="abhaId">
                <span className="material-symbols-outlined text-[16px]">id_card</span>
                {t('ABHA ID (auto-linked)', 'आभा आईडी')}
              </label>
              <input id="abhaId" type="text" value={abhaId} readOnly
                className="input-field font-mono text-[15px] opacity-75 cursor-not-allowed" />
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 p-4 bg-secondary-container/40 rounded-xl border border-outline-variant cursor-pointer" htmlFor="consent">
              <input id="consent" type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-primary bg-surface-bright border-outline-variant rounded focus:ring-primary" />
              <div>
                <div className="text-body-md font-body text-on-surface font-semibold">
                  {t('ABHA Data Consent', 'आभा डेटा सहमति')}
                </div>
                <p className="text-label-sm font-body text-on-surface-variant mt-1">
                  {t('I agree to link my health records for this visit.', 'मैं इस दौरे के लिए अपने स्वास्थ्य रिकॉर्ड जोड़ने की सहमति देता हूँ।')}
                </p>
              </div>
            </label>

            <button
              disabled={!consentGiven || !patientName.trim()}
              onClick={() => setStep(2)}
              className="btn-primary w-full text-headline-md"
            >
              <span>{t('Next — Select Complaint', 'आगे बढ़ें')}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </section>
        </div>
      )}

      {/* ══ STEP 2 — Chief Complaint ══ */}
      {step === 2 && (
        <div className="animate-slide-up flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-[28px] sm:text-[36px] text-on-surface tracking-tight leading-tight mb-2">
              {t("What brings you in today?", "आज किस समस्या के लिए आए हैं?")}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {t('Tap the option that best describes your concern.', 'अपनी मुख्य समस्या चुनें।')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => { setChiefComplaint('chest_pain'); setCurrentQuestionIndex(0); setAnswers({}); setStep(3) }}
              className="complaint-card group">
              <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                style={{ boxShadow: '4px 4px 10px rgba(186,26,26,0.15)' }}>
                <span className="material-symbols-outlined icon-fill text-error text-[44px]">monitor_heart</span>
              </div>
              <h3 className="font-display font-bold text-headline-md text-on-surface text-center">
                {t('Chest Pain', 'छाती में दर्द')}
              </h3>
              <p className="text-body-md text-on-surface-variant text-center mt-2">
                {t('Tightness, pressure, radiating pain', 'दबाव, जकड़न या फैलता दर्द')}
              </p>
              <span className="mt-3 text-label-sm font-body text-primary font-bold flex items-center gap-1">
                {t('Select', 'चुनें')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </button>

            <button onClick={() => { setChiefComplaint('cough'); setCurrentQuestionIndex(0); setAnswers({}); setStep(3) }}
              className="complaint-card group">
              <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                style={{ boxShadow: '4px 4px 10px rgba(85,97,88,0.15)' }}>
                <span className="material-symbols-outlined icon-fill text-secondary text-[44px]">air</span>
              </div>
              <h3 className="font-display font-bold text-headline-md text-on-surface text-center">
                {t('Cough & Respiratory', 'खांसी और श्वसन')}
              </h3>
              <p className="text-body-md text-on-surface-variant text-center mt-2">
                {t('Dry/wet cough, fever, breathlessness', 'सूखी/गीली खांसी, बुखार')}
              </p>
              <span className="mt-3 text-label-sm font-body text-primary font-bold flex items-center gap-1">
                {t('Select', 'चुनें')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </button>
          </div>

          <button onClick={() => setStep(1)} className="btn-ghost w-full">
            <span className="material-symbols-outlined">arrow_back</span>
            {t('Back to Registration', 'वापस')}
          </button>
        </div>
      )}

      {/* ══ STEP 3 — Clinical Questions ══ */}
      {step === 3 && activeQuestion && (
        <div className="animate-slide-up flex flex-col gap-5">
          {/* Red Flag Banner */}
          {isPriority && (
            <div className="red-flag-banner animate-fade-in">
              <span className="material-symbols-outlined text-error text-[36px] icon-fill shrink-0">warning</span>
              <div>
                <h3 className="font-display font-semibold text-headline-md text-error mb-1">
                  {t('Critical Symptom Alert', 'गंभीर लक्षण चेतावनी')}
                </h3>
                <p className="text-body-md text-on-error-container">
                  {t('Please notify staff immediately if symptoms worsen.', 'लक्षण बिगड़ें तो तुरंत कर्मचारियों को सूचित करें।')}
                </p>
              </div>
            </div>
          )}

          {/* Question Card */}
          <section className="bg-surface rounded-2xl p-5 sm:p-7 flex flex-col gap-5 neo-lg">
            <div className="text-center">
              <span className="text-label-sm font-body text-outline uppercase tracking-widest block mb-2">
                {t(`Q ${currentQuestionIndex + 1} / ${currentQuestions.length}`, `प्र ${currentQuestionIndex + 1} / ${currentQuestions.length}`)}
              </span>
              <h2 className="font-display font-bold text-[26px] sm:text-[32px] text-on-surface leading-tight">
                {language === 'hi' ? activeQuestion.prompt_hi : activeQuestion.prompt_en}
              </h2>
            </div>

            {/* Voice Input */}
            <VoiceInput language={language} promptText={language === 'hi' ? activeQuestion.prompt_hi : activeQuestion.prompt_en}
              onTranscript={(spoken) => { addToast('info', `Voice: "${spoken}"`); handleSaveAnswer(spoken, 'voice') }} />

            {/* Choice Options */}
            {activeQuestion.type === 'choice' && activeQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeQuestion.options.map((opt) => (
                  <button key={opt.value} onClick={() => handleSaveAnswer(opt.value)}
                    className="min-h-[64px] px-4 py-3 rounded-xl bg-surface-bright text-on-surface font-display font-semibold text-body-lg text-left interactive border-2 border-outline-variant hover:border-primary hover:bg-secondary-container"
                    style={{ boxShadow: '4px 4px 8px #dbd9d9, -4px -4px 8px #ffffff' }}>
                    {language === 'hi' ? opt.label_hi : opt.label_en}
                  </button>
                ))}
              </div>
            )}

            {/* Yes/No — Clear Primary vs Secondary hierarchy */}
            {activeQuestion.type === 'yesno' && activeQuestion.options && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* YES — Primary filled */}
                <button onClick={() => handleSaveAnswer(activeQuestion.options![0].value)} className="yesno-btn-yes">
                  <span className="material-symbols-outlined text-[36px] icon-fill">check_circle</span>
                  <span>{language === 'hi' ? activeQuestion.options![0].label_hi : activeQuestion.options![0].label_en}</span>
                </button>
                {/* NO — Secondary outlined */}
                <button onClick={() => handleSaveAnswer(activeQuestion.options![1].value)} className="yesno-btn-no">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant">cancel</span>
                  <span>{language === 'hi' ? activeQuestion.options![1].label_hi : activeQuestion.options![1].label_en}</span>
                </button>
              </div>
            )}

            {/* Pain Scale */}
            {activeQuestion.type === 'scale' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                    const color = num < 4 ? 'text-primary' : num < 7 ? 'text-tertiary' : 'text-error'
                    const bg = num < 4 ? 'hover:bg-secondary-container' : num < 7 ? 'hover:bg-tertiary-fixed' : 'hover:bg-error-container'
                    return (
                      <button key={num} onClick={() => handleSaveAnswer(num.toString())}
                        className={`scale-pill ${color} ${bg}`}>
                        {num}
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between px-2 text-secondary text-label-sm font-body">
                  <span>0 — {t('No pain', 'दर्द नहीं')}</span>
                  <span>5 — {t('Moderate', 'मध्यम')}</span>
                  <span>10 — {t('Severe', 'गंभीर')}</span>
                </div>
              </div>
            )}

            {/* Text input */}
            {activeQuestion.type === 'text' && (
              <div className="flex flex-col gap-3">
                <textarea rows={3} value={currentTextAnswer} onChange={(e) => setCurrentTextAnswer(e.target.value)}
                  placeholder={t('Type your answer here...', 'यहाँ लिखें...')}
                  className="input-field resize-none" />
                <button disabled={!currentTextAnswer.trim()} onClick={() => handleSaveAnswer(currentTextAnswer)}
                  className="btn-primary self-end">
                  {t('Submit Answer', 'जमा करें')}
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            )}
          </section>

          {/* Footer Nav */}
          <div className="sticky-footer rounded-xl">
            <button onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(currentQuestionIndex - 1) : setStep(2)}
              className="btn-secondary">
              <span className="material-symbols-outlined">arrow_back</span>
              {t('Back', 'वापस')}
            </button>
            <span className="text-label-sm font-body text-on-surface-variant capitalize flex-1 text-center hidden sm:block">
              {chiefComplaint === 'chest_pain' ? t('Chest Pain', 'छाती दर्द') : t('Cough', 'खांसी')}
            </span>
          </div>
        </div>
      )}

      {/* ══ STEP 4 — Scans & AYUSH ══ */}
      {step === 4 && (
        <div className="animate-slide-up flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-[28px] text-on-surface mb-2">
              {t('Document Scan & AYUSH', 'दस्तावेज़ और आयुष')}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {t('Optional: Upload prior records or enter traditional wellness details.', 'वैकल्पिक: पुराने रिकॉर्ड अपलोड करें।')}
            </p>
          </div>

          <DocScanner onScanComplete={(doc) => { setScannedDocs((p) => [...p, doc]); addToast('success', `Scanned: ${doc.file_name}`) }} />

          {/* AYUSH */}
          <section className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-3 neo">
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-body text-surface-tint font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] icon-fill text-surface-tint">spa</span>
                {t('AYUSH / Traditional Notes', 'आयुष / हर्बल नोट')}
              </span>
              <span className="text-[11px] bg-secondary-container text-secondary px-2 py-0.5 rounded-full font-semibold">
                {t('Optional', 'वैकल्पिक')}
              </span>
            </div>
            <input type="text" value={ayushNotes} onChange={(e) => setAyushNotes(e.target.value)} className="input-field"
              placeholder={t('e.g., Tulsi syrup, Ashwagandha...', 'उदा: तुलसी सिरप, अश्वगंधा...')} />
          </section>

          <div className="flex flex-col gap-3">
            <button onClick={handleCompleteIntake} className="btn-primary w-full text-headline-md">
              <span>{t('Get OPD Token', 'टोकन प्राप्त करें')}</span>
              <span className="material-symbols-outlined">confirmation_number</span>
            </button>
            <button onClick={() => setStep(3)} className="btn-secondary w-full">
              <span className="material-symbols-outlined">arrow_back</span>
              {t('Back to Questions', 'प्रश्नों पर वापस')}
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 5 — Token ══ */}
      {step === 5 && (
        <div className="animate-slide-up flex flex-col items-center gap-6 text-center py-4">
          {/* Token badge */}
          <div className={`w-28 h-28 rounded-full flex items-center justify-center ${isPriority ? 'bg-error-container' : 'bg-secondary-container'}`}
            style={{ boxShadow: isPriority ? '0 8px 24px rgba(186,26,26,0.3)' : '0 8px 24px rgba(21,66,18,0.2)' }}>
            <span className={`material-symbols-outlined text-[60px] icon-fill ${isPriority ? 'text-error' : 'text-primary'}`}>
              confirmation_number
            </span>
          </div>

          <div>
            <h2 className="font-display font-bold text-[32px] text-on-surface">
              {t('Intake Complete!', 'प्रक्रिया पूर्ण!')}
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-2">
              {t('Your OPD Token', 'आपका ओपीडी टोकन')}
            </p>
            <div className="text-[64px] font-display font-bold text-primary my-4 tracking-widest px-8 py-4 rounded-2xl bg-surface-container-low neo-inner inline-block">
              {generatedToken}
            </div>
            <p className="text-label-sm font-body text-on-surface-variant">
              {t('Please proceed to the OPD waiting area.', 'कृपया ओपीडी प्रतीक्षा क्षेत्र में जाएं।')}
            </p>
          </div>

          {/* Priority status */}
          {isPriority ? (
            <div className="w-full p-4 rounded-xl bg-error-container border-2 border-error/40 text-on-error-container flex items-center gap-3 animate-pulse-red">
              <span className="material-symbols-outlined text-error text-[32px] icon-fill shrink-0">emergency</span>
              <span className="text-body-md font-body font-bold text-left">
                {t('EMERGENCY — You will be seen immediately.', 'आपातकाल — आपको तुरंत देखा जाएगा।')}
              </span>
            </div>
          ) : (
            <div className="w-full p-4 rounded-xl bg-secondary-container border border-outline-variant text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px] icon-fill shrink-0">check_circle</span>
              <span className="text-body-md font-body text-left">
                {t('Routine OPD queue. Estimated wait: ~10 minutes.', 'नियमित कतार। अनुमानित प्रतीक्षा: ~10 मिनट।')}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <a href="/doctor" className="btn-primary flex-1">
              <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              {t('View Doctor Console', 'डॉक्टर कंसोल')}
            </a>
            <button onClick={() => { setStep(1); setAnswers({}); setScannedDocs([]) }} className="btn-secondary flex-1">
              {t('New Patient', 'नया मरीज़')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
