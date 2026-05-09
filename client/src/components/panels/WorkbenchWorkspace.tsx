import type { DecisionEdge, DecisionNode } from '../../api/decisionTree'
import DecisionTreeGraph from '../graph/DecisionTreeGraph'

interface WorkbenchWorkspaceProps {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  selectedNode: DecisionNode | null
  onSelectNode: (nodeId: string) => void
  onAddNodeConnected?: (parentNodeId: string) => void
  onCreateFirstNode?: () => void
}

function WorkbenchWorkspace({ nodes, edges, selectedNode, onSelectNode, onAddNodeConnected, onCreateFirstNode }: WorkbenchWorkspaceProps) {
  // connectedEdgesCount removed; inspector is now a modal

  return (
    <section className="workspace" aria-label="Рабочая область рисования дерева" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="canvas" style={{ height: '100%' }}>
        <div className="canvas__viewport" style={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
          <div className="tree-stage" style={{ flex: 1 }}>
            <DecisionTreeGraph nodes={nodes} edges={edges} selectedNodeId={selectedNode?.id ?? null} onSelectNode={onSelectNode} onAddNodeConnected={onAddNodeConnected} onCreateFirstNode={onCreateFirstNode} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WorkbenchWorkspace