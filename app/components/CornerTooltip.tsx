"use client"

import { ReactNode, useId, useState } from 'react'

type CornerTooltipProps = {
  title?: string
  content: ReactNode | (() => ReactNode)
  ariaLabel?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
  // Helps external AI tooling understand when tooltip content should change
  // Provide any reactive state snapshot used to render the tooltip
  aiContext?: Record<string, any>
}

export default function CornerTooltip({
  title,
  content,
  ariaLabel,
  position = 'top-right',
  className,
  aiContext,
}: CornerTooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const renderContent = typeof content === 'function' ? (content as () => ReactNode) : () => content

  const posClass = position
    .replace('top', 'corner-top')
    .replace('bottom', 'corner-bottom')
    .replace('right', 'right')
    .replace('left', 'left')

  return (
    <div className={`corner-tooltip ${posClass} ${className || ''}`} data-ai-context={aiContext ? JSON.stringify(aiContext) : undefined}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`tooltip-${id}`}
        aria-label={ariaLabel || title || 'Section help'}
        className="corner-help-button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className="corner-help-icon">❔</span>
      </button>
      {open && (
        <div id={`tooltip-${id}`} role="dialog" className="corner-help-popover" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          {title && <div className="corner-help-title">{title}</div>}
          <div className="corner-help-content">{renderContent()}</div>
          <div className="corner-help-note">Tips auto-update based on live settings.</div>
        </div>
      )}
    </div>
  )
}
