import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const blankTask = {
  title: '',
  notes: '',
  category: 'Kişisel',
  priority: 'Orta',
  date: '',
}

function TaskDialog({ task, onClose, onSave }) {
  const [form, setForm] = useState(() => (task ? { ...task } : blankTask))
  const [titleError, setTitleError] = useState('')
  const titleRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    titleRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      )
      if (!focusableElements?.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [onClose])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'title' && value.trim()) setTitleError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setTitleError('Görev adı boş bırakılamaz.')
      titleRef.current?.focus()
      return
    }
    onSave({ ...form, title, notes: form.notes.trim() })
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="task-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">GÖREV YÖNETİMİ</span>
            <h2 id="dialog-title">{task ? 'Görevi düzenle' : 'Yeni görev oluştur'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Pencereyi kapat" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="task-title">Görev adı</label>
          <input
            ref={titleRef}
            id="task-title"
            name="title"
            className="text-input"
            value={form.title}
            onChange={updateField}
            placeholder="Örn. Sunum dosyasını hazırla"
            maxLength={100}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'task-title-error' : undefined}
            required
          />
          {titleError && <p className="field-error" id="task-title-error" role="alert">{titleError}</p>}

          <label className="field-label" htmlFor="task-notes">Not <span>(isteğe bağlı)</span></label>
          <textarea
            id="task-notes"
            name="notes"
            className="text-input notes-input"
            value={form.notes}
            onChange={updateField}
            placeholder="Görevle ilgili kısa bir not ekle"
            maxLength={240}
            rows={3}
          />

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="task-category">Liste</label>
              <select id="task-category" name="category" className="text-input" value={form.category} onChange={updateField}>
                <option>İş</option>
                <option>Eğitim</option>
                <option>Kişisel</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="task-priority">Öncelik</label>
              <select id="task-priority" name="priority" className="text-input" value={form.priority} onChange={updateField}>
                <option>Yüksek</option>
                <option>Orta</option>
                <option>Düşük</option>
              </select>
            </div>
          </div>

          <label className="field-label" htmlFor="task-date">Bitiş tarihi <span>(isteğe bağlı)</span></label>
          <input
            id="task-date"
            name="date"
            type="date"
            className="text-input"
            value={form.date}
            onChange={updateField}
          />

          <div className="dialog-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="button button-primary">
              <Icon name="check" size={17} />
              {task ? 'Değişiklikleri kaydet' : 'Görevi ekle'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskDialog
