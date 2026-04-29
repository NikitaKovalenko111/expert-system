import type { DecisionNode } from '../../api/decisionTree'

interface InspectorPanelProps {
  selectedNode: DecisionNode
  connectedEdgesCount: number
}

function InspectorPanel({ selectedNode, connectedEdgesCount }: InspectorPanelProps) {
  return (
    <aside className="inspector" aria-label="Панель свойств узла">
      <div className="inspector__head">
        <div>
          <h2 className="inspector__title">Свойства узла</h2>
          <p className="inspector__hint">Редактирование выбранного элемента дерева</p>
        </div>
        <span className="chip">Node #{selectedNode.id}</span>
      </div>

      <div className="inspector__grid">
        <div className="inspector__row">
          <span>Тип</span>
          <span className="inspector__value">{selectedNode.kind}</span>
        </div>
        <div className="inspector__row">
          <span>Связей</span>
          <span className="inspector__value">{connectedEdgesCount}</span>
        </div>
        <div className="inspector__row">
          <span>Статус</span>
          <span className="inspector__value">Активен</span>
        </div>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Текст узла</span>
          <input className="field__control" type="text" value={selectedNode.title} readOnly />
        </label>
        <label className="field">
          <span className="field__label">Подсказка</span>
          <textarea className="field__control field__control--textarea" value={selectedNode.subtitle} readOnly />
        </label>
      </div>

      <div className="modal-window__actions">
        <button className="button button--primary" type="button">
          Применить
        </button>
        <button className="button button--ghost" type="button">
          Отмена
        </button>
      </div>
    </aside>
  )
}

export default InspectorPanel