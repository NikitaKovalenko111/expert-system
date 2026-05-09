import type { DecisionNode } from '../../api/decisionTree'

interface ProjectSidebarProps {
  nodes: DecisionNode[]
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
}

function ProjectSidebar({ nodes, selectedNodeId, onSelectNode }: ProjectSidebarProps) {
  return (
    <aside className="sidebar sidebar--left" aria-label="Панель дерева и инструментов">
      <section className="sidebar__section">
        <div className="sidebar__header">
          <h2 className="sidebar__title">Дерево проекта</h2>
          <span className="chip">
            <span className="chip__dot" />
            Live
          </span>
        </div>

        <ul className="tree-list">
          {nodes.map((node) => (
            <li key={node.id} className={`tree-list__item${selectedNodeId === node.id ? ' tree-list__item--active' : ''}`}>
              <button className="tree-list__button" type="button" onClick={() => onSelectNode(node.id)}>
                <span>{node.title}</span>
                <span className="tree-list__meta">{node.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Инструменты временно скрыты — убрано по запросу */}

      <section className="sidebar__section">
        <div className="sidebar__header">
          <h2 className="sidebar__title">Состояние</h2>
          <span className="sidebar__text">autosave</span>
        </div>

        <article className="sidebar__card">
          <strong>Файл проекта</strong>
          <p className="sidebar__text">diagnostic-system.json</p>
        </article>
        <article className="sidebar__card">
          <strong>Изменения</strong>
          <p className="sidebar__text">15 узлов, 17 связей, 3 цели</p>
        </article>
      </section>
    </aside>
  )
}

export default ProjectSidebar