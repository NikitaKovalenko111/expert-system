import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  isAddingNode?: boolean
  onSave?: (title: string, subtitle: string, edgeLabel?: string) => void
}

function QuestionModal({ isOpen, onClose, isAddingNode = false, onSave }: QuestionModalProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [edgeLabel, setEdgeLabel] = useState('')

  useEffect(() => {
    if (isOpen && isAddingNode) {
      setTitle('')
      setSubtitle('')
    }
  }, [isOpen, isAddingNode])

  const handleSave = () => {
    if (isAddingNode && onSave) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__debug = window.__debug || []
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__debug.push({ source: 'QuestionModal.handleSave', title: title || 'Новый вопрос', subtitle: subtitle || 'Добавлено вручную', edgeLabel: edgeLabel || '' })
      } catch (e) {
        // ignore
      }

      onSave?.(title || 'Новый вопрос', subtitle || 'Добавлено вручную', edgeLabel || '')
      setTitle('')
      setSubtitle('')
      setEdgeLabel('')
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__debug = window.__debug || []
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__debug.push({ source: 'QuestionModal.onClose' })
    } catch (e) {
      // ignore
    }

    onClose()
  }

  return (
    <Modal id={isAddingNode ? 'question-modal-add' : 'question-modal'} title={isAddingNode ? 'Добавить вопрос' : 'Модуль вопросов'} description={isAddingNode ? 'Создание нового вопроса' : 'Окно для добавления вопросов'} isOpen={isOpen} onClose={onClose}>
      <div className="modal-window__body">
        <label className="field">
          <span className="field__label">Название вопроса</span>
          <input className="field__control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Какой вопрос это должно быть?" />
        </label>
        <label className="field">
          <span className="field__label">Описание</span>
          <textarea className="field__control field__control--textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Добавляется в дерево как уточняющий вопрос." />
        </label>
        {isAddingNode && (
          <label className="field">
            <span className="field__label">Подпись связи</span>
            <input className="field__control" type="text" value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} placeholder="Текст на ребре (например: Да, Нет, Связь)" />
          </label>
        )}
      </div>

      <div className="modal-window__actions">
        <button className="button button--primary" type="button" onClick={handleSave}>
          {isAddingNode ? 'Добавить' : 'Сохранить'}
        </button>
        <button className="button button--ghost" type="button" onClick={onClose}>
          {isAddingNode ? 'Отмена' : 'Закрыть'}
        </button>
      </div>
    </Modal>
  )
}

export default QuestionModal
