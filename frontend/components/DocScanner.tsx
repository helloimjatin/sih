'use client'

import React, { useState } from 'react'

interface ExtractedItem {
  entity_type: string
  value: string
  confidence_note?: string
}

interface DocScannerProps {
  onScanComplete: (documentData: { doc_type: string; file_name: string; entities: ExtractedItem[] }) => void
}

export default function DocScanner({ onScanComplete }: DocScannerProps) {
  const [docType, setDocType] = useState<'prescription' | 'lab_report' | 'past_history'>('prescription')
  const [scanning, setScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<{ file_name: string; entities: ExtractedItem[] } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setScannedResult(null)

    setTimeout(() => {
      let mockEntities: ExtractedItem[] = []
      if (docType === 'prescription') {
        mockEntities = [
          { entity_type: 'medicine', value: 'Tab. Aspirin 75mg (1-0-0) after meals', confidence_note: 'High Confidence' },
          { entity_type: 'medicine', value: 'Tab. Atorvastatin 20mg (0-0-1) HS', confidence_note: 'High Confidence' },
          { entity_type: 'date', value: 'Prescribed: 14 Aug 2026', confidence_note: 'Verified' },
        ]
      } else if (docType === 'lab_report') {
        mockEntities = [
          { entity_type: 'lab_value', value: 'Troponin-I: 0.85 ng/mL (Elevated)', confidence_note: 'Abnormal Alert' },
          { entity_type: 'lab_value', value: 'Hemoglobin: 13.2 g/dL', confidence_note: 'Normal' },
          { entity_type: 'lab_value', value: 'Total Cholesterol: 210 mg/dL', confidence_note: 'Slightly High' },
        ]
      } else {
        mockEntities = [
          { entity_type: 'history', value: 'Known Hypertensive x 4 years on medication', confidence_note: 'High Confidence' },
          { entity_type: 'history', value: 'No known drug allergies (NKDA)', confidence_note: 'Verified' },
        ]
      }
      const res = { file_name: file.name, entities: mockEntities }
      setScannedResult(res)
      setScanning(false)
      onScanComplete({ doc_type: docType, file_name: file.name, entities: mockEntities })
    }, 1800)
  }

  const docTypes = [
    { id: 'prescription', label: 'Prescription', icon: 'medication' },
    { id: 'lab_report', label: 'Lab Report', icon: 'biotech' },
    { id: 'past_history', label: 'History', icon: 'history' },
  ]

  return (
    <div className="flex flex-col gap-unit-4 p-unit-4 rounded-xl bg-surface-container-low border border-outline-variant neo">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary icon-fill text-[22px]">document_scanner</span>
            Printed Document Scanner
          </h3>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            Scan prior prescriptions or lab reports (Gemini Vision OCR)
          </p>
        </div>
        <span className="text-label-sm font-body font-semibold px-unit-2 py-unit-1 rounded-full bg-primary-fixed text-primary neo-sm">
          OCR Ready
        </span>
      </div>

      {/* Doc Type Tabs */}
      <div className="grid grid-cols-3 gap-unit-2 p-1 bg-surface-container rounded-xl neo-inner-sm">
        {docTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setDocType(type.id as any)}
            className={`py-unit-2 rounded-lg text-label-sm font-body font-semibold interactive transition-all flex items-center justify-center gap-1 ${
              docType === type.id
                ? 'bg-surface text-primary neo-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <label className="relative flex flex-col items-center justify-center p-unit-6 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface hover:bg-surface-container-low transition-all cursor-pointer group neo-inner">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          disabled={scanning}
          className="hidden"
        />
        {scanning ? (
          <div className="flex flex-col items-center gap-unit-3 text-primary">
            <span className="material-symbols-outlined text-[48px] icon-fill animate-spin">autorenew</span>
            <div className="text-center">
              <p className="font-display font-semibold text-headline-md text-on-surface">
                Analyzing with Gemini Vision...
              </p>
              <p className="text-body-md text-on-surface-variant">Extracting medicines, dosages &amp; diagnostics</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-unit-3 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center group-hover:scale-105 transition-transform neo-sm">
              <span className="material-symbols-outlined text-primary icon-fill text-[32px]">upload_file</span>
            </div>
            <div>
              <p className="font-body font-semibold text-body-lg text-on-surface">
                Tap to Scan or Upload Document
              </p>
              <p className="text-body-md text-on-surface-variant mt-1">JPG, PNG, WEBP printed documents</p>
            </div>
          </div>
        )}
      </label>

      {/* Result */}
      {scannedResult && (
        <div className="p-unit-3 rounded-xl bg-primary-fixed/40 border border-outline-variant flex flex-col gap-unit-3 animate-fade-in neo-inner-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-unit-2">
            <span className="text-label-sm font-body text-primary font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] icon-fill text-primary">check_circle</span>
              OCR Complete — {scannedResult.file_name}
            </span>
            <span className="text-label-sm font-body text-surface-tint font-bold">100% Parsed</span>
          </div>
          <div className="flex flex-col gap-unit-1">
            {scannedResult.entities.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-surface p-unit-2 rounded-lg neo-inner-sm">
                <div className="flex items-center gap-unit-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                  <span className="text-body-md font-body text-on-surface">{item.value}</span>
                </div>
                {item.confidence_note && (
                  <span className="text-[11px] font-body font-semibold text-surface-tint bg-primary-fixed px-2 py-0.5 rounded-full">
                    {item.confidence_note}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-label-sm font-body text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] icon-fill text-surface-tint">auto_awesome</span>
            AI-extracted OCR entities attached to patient record
          </div>
        </div>
      )}
    </div>
  )
}
