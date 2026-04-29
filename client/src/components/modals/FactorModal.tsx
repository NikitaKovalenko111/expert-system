import Modal from '../ui/Modal'

interface FactorModalProps {
  isOpen: boolean
  onClose: () => void
}

function FactorModal({ isOpen, onClose }: FactorModalProps) {
  return (
    <Modal id="factor-modal" title="Модуль факторов" description="Окно добавления и редактирования факторов" isOpen={isOpen} onClose={onClose}>
      <div className="modal-window__body">
        <label className="field">
          <span className="field__label">Название фактора</span>
          <input className="field__control" type="text" defaultValue="Наличие температуры" />
        </label>
        <label className="field">
          <span className="field__label">Описание</span>
          <textarea className="field__control field__control--textarea" defaultValue="Добавляется в дерево как уточняющий признак." />
        </label>
      </div>

      <div className="modal-window__actions">
        <button className="button button--primary" type="button" onClick={onClose}>
          Сохранить
        </button>
        <button className="button button--danger" type="button">
          Удалить
        </button>
        <button className="button button--ghost" type="button" onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  )
}

export default FactorModal