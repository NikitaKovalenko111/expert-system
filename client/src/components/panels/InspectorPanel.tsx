import { useState, useEffect } from 'react'
import type { DecisionNode, DecisionNodeKind } from '../../api/decisionTree'

interface InspectorPanelProps {
  selectedNode: DecisionNode
  embedded?: boolean
  onDeleteNode?: (nodeId: string) => void
  onUpdateNode?: (nodeId: string, updates: Partial<DecisionNode>) => void
}

function InspectorPanel({ selectedNode, embedded = false, onDeleteNode, onUpdateNode }: InspectorPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(selectedNode.title)
  const [editSubtitle, setEditSubtitle] = useState(selectedNode.subtitle)
  const [editKind, setEditKind] = useState<DecisionNodeKind>(selectedNode.kind)

  // Sync local state with selectedNode when it changes
  useEffect(() => {
    setEditTitle(selectedNode.title)
    setEditSubtitle(selectedNode.subtitle)
    setEditKind(selectedNode.kind)
    setIsEditing(false)
  }, [selectedNode.id])

  const localizedKind = selectedNode.kind === 'goal' ? 'Цель' : 'Вопрос'

  const handleStartEdit = () => {
    setEditTitle(selectedNode.title)
    setEditSubtitle(selectedNode.subtitle)
    setEditKind(selectedNode.kind)
    setIsEditing(true)
  }

  const handleApply = () => {
    onUpdateNode?.(selectedNode.id, {
      title: editTitle.trim() || selectedNode.title,
      subtitle: editSubtitle.trim() || selectedNode.subtitle,
      kind: editKind,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Удалить узел "${selectedNode.title}" и все его дочерние узлы?`)) {
      onDeleteNode?.(selectedNode.id)
    }
  }

  return (
    <aside className={`inspector${embedded ? ' inspector--embedded' : ''}`} aria-label="Панель свойств узла">
      {!embedded ? (
        <div className="inspector__head">
          <div>
            <h2 className="inspector__title">Свойства узла</h2>
            <p className="inspector__hint">{isEditing ? 'Редактирование узла' : 'Редактирование выбранного элемента дерева'}</p>
          </div>
          <span className="chip">Node #{selectedNode.id}</span>
        </div>
      ) : null}

      <div className="inspector__grid">
        <div className="inspector__row">
          <span>Тип</span>
          {isEditing ? (
            <select
              value={editKind}
              onChange={(e) => setEditKind(e.target.value as DecisionNodeKind)}
              style={{
                padding: '6px 10px',
                border: '1px solid rgba(77, 25, 204, 0.2)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="question">Вопрос</option>
              <option value="goal">Цель</option>
            </select>
          ) : (
            <span className="inspector__value">{localizedKind}</span>
          )}
        </div>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Текст узла</span>
          <input
            className="field__control"
            type="text"
            value={isEditing ? editTitle : selectedNode.title}
            onChange={(e) => isEditing && setEditTitle(e.target.value)}
            readOnly={!isEditing}
          />
        </label>
        <label className="field">
          <span className="field__label">Подсказка</span>
          <textarea
            className="field__control field__control--textarea"
            value={isEditing ? editSubtitle : selectedNode.subtitle}
            onChange={(e) => isEditing && setEditSubtitle(e.target.value)}
            readOnly={!isEditing}
          />
        </label>
      </div>

      <div className="modal-window__actions">
        {isEditing ? (
          <>
            <button className="button button--primary" type="button" onClick={handleApply}>
              Сохранить
            </button>
            <button className="button button--ghost" type="button" onClick={handleCancel}>
              Отмена
            </button>
          </>
        ) : (
          <>
            <button className="button button--primary" type="button" onClick={handleStartEdit}>
              Редактировать
            </button>
            {onDeleteNode && (
              <button className="button button--ghost button--danger" type="button" onClick={handleDelete}>
                Удалить
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export default InspectorPanel