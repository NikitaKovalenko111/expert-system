import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  isAddingNode?: boolean
  onSave?: (title: string, subtitle: string, edgeLabel?: string) => void
}

function GoalModal({ isOpen, onClose, isAddingNode = false, onSave }: GoalModalProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [edgeLabel, setEdgeLabel] = useState('')

  useEffect(() => {
    if (isOpen && isAddingNode) {
      setTitle('')
      setSubtitle('')
      setEdgeLabel('')
    }
  }, [isOpen, isAddingNode])

  const handleSave = () => {
    if (isAddingNode && onSave) {
      onSave(title || 'Новая цель', subtitle || 'Добавлено вручную', edgeLabel || 'Связь')
      setTitle('')
      setSubtitle('')
    }
    onClose()
  }

  return (
    <Modal id={isAddingNode ? 'goal-modal-add' : 'goal-modal'} title={isAddingNode ? 'Добавить цель' : 'Модуль целей'} description={isAddingNode ? 'Создание новой цели' : 'Окно для добавления итоговых ответов'} isOpen={isOpen} onClose={onClose}>
      <div className="modal-window__body">
        <label className="field">
          <span className="field__label">Название цели</span>
          <input className="field__control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Назначить итоговый вывод" />
        </label>
        <label className="field">
          <span className="field__label">Комментарий</span>
          <textarea className="field__control field__control--textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Используется как конечный ответ в ветке дерева." />
        </label>
        {isAddingNode ? (
          <label className="field">
            <span className="field__label">Подпись связи</span>
            <input className="field__control" type="text" value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} placeholder="Текст на ребре (например: Да, Нет)" />
          </label>
        ) : null}
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

export default GoalModal