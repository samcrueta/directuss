'use client'

import React, { useId, useState } from 'react'

import { bool, text } from './tokens'
import type { RenderProps } from './types'

export function ContactForm({ content }: RenderProps) {
  const uid = useId()
  const heading = text(content.heading, 'Send a message', 80)
  const description = text(content.description, '', 220)
  const submitLabel = text(content.submitLabel, 'Send message', 40)
  const successMessage = text(
    content.successMessage,
    'Message sent. We will reply soon.',
    140,
  )
  const showName = bool(content.showName, true)
  const showEmail = bool(content.showEmail, true)
  const showMessage = bool(content.showMessage, true)
  const [status, setStatus] = useState<{ state: 'idle' | 'error' | 'success'; message: string }>({
    state: 'idle',
    message: '',
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setStatus({
        state: 'error',
        message: 'Please complete every required field with a valid value.',
      })
      return
    }
    setStatus({ state: 'success', message: successMessage })
    form.reset()
  }

  return (
    <section className="sc-form-wrap">
      <form className="sc-form" onSubmit={handleSubmit} noValidate>
        <header className="sc-form-head">
          <p className="sc-eyebrow">Contact</p>
          <h2 className="sc-form-title">{heading}</h2>
          {description ? <p className="sc-body">{description}</p> : null}
        </header>

        {showName ? (
          <div className="sc-field">
            <label htmlFor={`${uid}-name`}>Name</label>
            <input
              id={`${uid}-name`}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              required
            />
          </div>
        ) : null}

        {showEmail ? (
          <div className="sc-field">
            <label htmlFor={`${uid}-email`}>Email</label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ada@example.com"
              required
            />
          </div>
        ) : null}

        {showMessage ? (
          <div className="sc-field">
            <label htmlFor={`${uid}-message`}>Message</label>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={4}
              placeholder="What are you building?"
              required
            />
          </div>
        ) : null}

        <button type="submit" className="sc-btn sc-btn-primary sc-btn-md">
          {submitLabel}
        </button>

        <p
          className="sc-status"
          data-state={status.state}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      </form>
    </section>
  )
}
