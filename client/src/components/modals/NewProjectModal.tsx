import { useState } from 'react'
import Modal from '../ui/Modal'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (projectName: string, shouldExport: boolean) => void
}

function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('')
  const [shouldExport, setShouldExport] = useState(true)

  const handleCreate = () => {
    const name = projectName.trim() || 'Новый проект'
    onCreate(name, shouldExport)
    setProjectName('')
    setShouldExport(true)
  }

  const handleClose = () => {
    setProjectName('')
    setShouldExport(true)
    onClose()
  }

  return (
    <Modal id="new-project" title="Создать новый проект" description="Введите название проекта" isOpen={isOpen} onClose={handleClose}>
      <div className="modal-window__body">
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 8, color: 'rgba(0, 0, 0, 0.7)' }}>
              Название проекта
            </label>
            <input
              type="text"
              placeholder="Введите название"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate()
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid rgba(77, 25, 204, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          </div>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={shouldExport}
              onChange={(e) => setShouldExport(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Сохранить текущий проект перед созданием нового</span>
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="button button--primary" type="button" onClick={handleCreate}>
              Создать проект
            </button>
            <button className="button button--ghost" type="button" onClick={handleClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default NewProjectModal
