import type { ReactNode } from 'react'

interface ModalProps {
  id: string
  title: string
  description: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

function Modal({ id, title, description, isOpen, onClose, children }: ModalProps) {
  if (id.includes('add-')) {
    console.log(`🟢 Modal ${id} rendering with isOpen=${isOpen}`)
  }
  return (
    <div className={`modal${isOpen ? ' is-open' : ''}`} id={id} aria-hidden={!isOpen}>
      <button className="modal__backdrop" type="button" aria-label={`Закрыть ${title}`} onClick={onClose} />
      <section className="modal-window" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <div className="modal-window__head">
          <div>
            <h3 className="modal-window__title" id={`${id}-title`}>
              {title}
            </h3>
            <p className="modal-window__text">{description}</p>
          </div>
          <button className="modal-window__close" type="button" aria-label="Закрыть окно" onClick={onClose}>
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  )
}

export default Modal