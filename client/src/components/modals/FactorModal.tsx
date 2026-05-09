import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

interface FactorModalProps {
  isOpen: boolean
  onClose: () => void
  isAddingNode?: boolean
  onSave?: (title: string, subtitle: string) => void
}

function FactorModal({ isOpen, onClose, isAddingNode = false, onSave }: FactorModalProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  useEffect(() => {
    if (isOpen && isAddingNode) {
      setTitle('')
      setSubtitle('')
    }
  }, [isOpen, isAddingNode])

  const handleSave = () => {
    if (isAddingNode && onSave) {
      try {
        // record debug info for automated tests
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__debug = window.__debug || []
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__debug.push({ source: 'FactorModal.handleSave', title: title || 'Новый фактор', subtitle: subtitle || 'Добавлено вручную' })
      } catch (e) {
        // ignore
      }

      onSave(title || 'Новый фактор', subtitle || 'Добавлено вручную')
      setTitle('')
      setSubtitle('')
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__debug = window.__debug || []
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__debug.push({ source: 'FactorModal.onClose' })
    } catch (e) {
      // ignore
    }

    onClose()
  }

  return (
    <Modal id={isAddingNode ? 'factor-modal-add' : 'factor-modal'} title={isAddingNode ? 'Добавить фактор' : 'Модуль факторов'} description={isAddingNode ? 'Создание нового фактора' : 'Окно добавления и редактирования факторов'} isOpen={isOpen} onClose={onClose}>
      <div className="modal-window__body">
        <label className="field">
          <span className="field__label">Название фактора</span>
          <input className="field__control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наличие температуры" />
        </label>
        <label className="field">
          <span className="field__label">Описание</span>
          <textarea className="field__control field__control--textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Добавляется в дерево как уточняющий признак." />
        </label>
      </div>

      <div className="modal-window__actions">
        <button className="button button--primary" type="button" onClick={handleSave}>
          {isAddingNode ? 'Добавить' : 'Сохранить'}
        </button>
        {!isAddingNode && (
          <button className="button button--danger" type="button">
            Удалить
          </button>
        )}
        <button className="button button--ghost" type="button" onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  )
}

export default FactorModal