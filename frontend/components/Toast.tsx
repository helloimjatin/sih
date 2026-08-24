'use client'

import React, { useEffect } from 'react'

export interface ToastProps {
  id: string
  type?: 'info' | 'warning' | 'success'
  message: string
  onClose: (id: string) => void
}

export default function Toast({ id, type = 'info', message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const config = {
    info: { icon: 'info', bg: 'bg-secondary-container', text: 'text-on-surface', iconColor: 'text-secondary' },
    warning: { icon: 'warning', bg: 'bg-tertiary-fixed', text: 'text-on-surface', iconColor: 'text-tertiary' },
    success: { icon: 'check_circle', bg: 'bg-primary-fixed', text: 'text-on-surface', iconColor: 'text-primary' },
  }[type]

  return (
    <div
      className={`flex items-center justify-between gap-3 px-unit-3 py-unit-2 rounded-xl neo-sm border border-outline-variant animate-slide-up ${config.bg} ${config.text}`}
    >
      <div className="flex items-center gap-unit-2">
        <span className={`material-symbols-outlined text-[20px] icon-fill shrink-0 ${config.iconColor}`}>
          {config.icon}
        </span>
        <span className="text-body-md font-body font-medium">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-surface-container transition-colors shrink-0"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
      </button>
    </div>
  )
}
