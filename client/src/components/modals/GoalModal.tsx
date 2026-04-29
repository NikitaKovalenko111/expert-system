import Modal from '../ui/Modal'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
}

function GoalModal({ isOpen, onClose }: GoalModalProps) {
  return (
    <Modal id="goal-modal" title="Модуль целей" description="Окно для добавления итоговых ответов" isOpen={isOpen} onClose={onClose}>
      <div className="modal-window__body">
        <label className="field">
          <span className="field__label">Название цели</span>
          <input className="field__control" type="text" defaultValue="Назначить итоговый вывод" />
        </label>
        <label className="field">
          <span className="field__label">Комментарий</span>
          <textarea className="field__control field__control--textarea" defaultValue="Используется как конечный ответ в ветке дерева." />
        </label>
      </div>

      <div className="modal-window__actions">
        <button className="button button--primary" type="button" onClick={onClose}>
          Сохранить
        </button>
        <button className="button button--ghost" type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </Modal>
  )
}

export default GoalModal