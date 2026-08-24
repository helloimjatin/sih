'use client'

import React, { useState } from 'react'

interface FHIRModalProps {
  isOpen: boolean
  onClose: () => void
  patientData: any
  encounterId: number | string
}

export default function FHIRModal({ isOpen, onClose, patientData, encounterId }: FHIRModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-medikiosk-${encounterId}`,
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${patientData?.id || '101'}`,
        resource: {
          resourceType: 'Patient',
          id: `pat-${patientData?.id || '101'}`,
          identifier: [{ system: 'https://abdm.gov.in/abha', value: patientData?.abha_mock || 'ABHA-9821-4412-8809' }],
          name: [{ text: patientData?.name || 'Anonymous Patient' }],
          age: patientData?.age || 45,
          gender: 'unknown',
          communication: [{ language: { coding: [{ system: 'urn:ietf:bcp:47', code: patientData?.language || 'en' }] } }],
        },
      },
      {
        fullUrl: `urn:uuid:encounter-${encounterId}`,
        resource: {
          resourceType: 'Encounter',
          id: `enc-${encounterId}`,
          status: 'in-progress',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
          subject: { reference: `Patient/pat-${patientData?.id || '101'}` },
          priority: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
              code: patientData?.priority_flag ? 'EM' : 'R',
              display: patientData?.priority_flag ? 'Emergency (Red Flag)' : 'Routine',
            }],
          },
          reasonCode: [{ text: patientData?.chief_complaint?.replace('_', ' ').toUpperCase() || 'CHEST PAIN' }],
        },
      },
      ...(patientData?.answers || []).map((ans: any, idx: number) => ({
        fullUrl: `urn:uuid:obs-${encounterId}-${idx}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-${encounterId}-${idx}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey' }] }],
          code: { text: ans.field_key },
          subject: { reference: `Patient/pat-${patientData?.id || '101'}` },
          valueString: ans.value,
        },
      })),
    ],
  }

  const jsonString = JSON.stringify(fhirBundle, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-surface-bright rounded-xl neo-lg flex flex-col overflow-hidden border border-outline-variant">

        {/* Header */}
        <div className="flex items-center justify-between px-unit-4 py-unit-3 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-unit-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center neo-sm">
              <span className="material-symbols-outlined text-primary icon-fill text-[20px]">code_blocks</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-headline-md text-on-surface flex items-center gap-2">
                HL7 FHIR R4 Bundle
                <span className="bg-secondary-container text-secondary text-[11px] font-body font-semibold px-2 py-0.5 rounded-full">
                  ABDM Ready
                </span>
              </h3>
              <p className="text-label-sm font-body text-on-surface-variant">Interoperable JSON for patient intake record</p>
            </div>
          </div>

          <div className="flex items-center gap-unit-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-unit-3 py-unit-1 rounded-full text-label-sm font-body font-semibold interactive neo-sm transition-all ${
                copied
                  ? 'bg-primary-fixed text-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] icon-fill">
                {copied ? 'check_circle' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="p-unit-1 rounded-full text-on-surface-variant hover:bg-surface-container interactive neo-sm"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* JSON Content */}
        <div className="p-unit-4 overflow-y-auto font-mono text-label-sm text-surface-tint bg-surface flex-1 leading-relaxed">
          <pre>{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-unit-4 py-unit-3 border-t border-outline-variant bg-surface-container-low">
          <span className="text-label-sm font-body text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] icon-fill text-primary">health_and_safety</span>
            Standard ABDM / EHR FHIR Document Specification
          </span>
          <button
            onClick={onClose}
            className="px-unit-4 py-unit-2 rounded-full bg-primary text-on-primary font-body font-semibold text-label-sm neo-sm interactive hover:bg-surface-tint"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
