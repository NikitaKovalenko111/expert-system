import type { DecisionEdge, DecisionNode } from '../../api/decisionTree'
import DecisionTreeGraph from '../graph/DecisionTreeGraph'
import ActivityTimeline from './ActivityTimeline'
import InspectorPanel from './InspectorPanel'

interface WorkbenchWorkspaceProps {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  selectedNode: DecisionNode
  onSelectNode: (nodeId: string) => void
}

function WorkbenchWorkspace({ nodes, edges, selectedNode, onSelectNode }: WorkbenchWorkspaceProps) {
  const connectedEdgesCount = edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).length

  return (
    <section className="workspace" aria-label="Рабочая область рисования дерева">
      <div className="workspace__toolbar">
        <div className="workspace__title-block">
          <h1 className="workspace__title">Панель рисования дерева решений</h1>
          <p className="workspace__meta">Drag-and-drop canvas, модальные окна, плавные переходы</p>
        </div>

        <div className="workspace__toolbar-group">
          <span className="chip">320px+</span>
          <span className="chip">
            <span className="chip__dot" />
            Wheel + drag
          </span>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas__viewport">
          <div className="tree-stage">
            <DecisionTreeGraph nodes={nodes} edges={edges} selectedNodeId={selectedNode.id} onSelectNode={onSelectNode} />
          </div>
        </div>

        <div className="workspace__sidecar">
          <InspectorPanel selectedNode={selectedNode} connectedEdgesCount={connectedEdgesCount} />
          <ActivityTimeline />
        </div>
      </div>
    </section>
  )
}

export default WorkbenchWorkspace