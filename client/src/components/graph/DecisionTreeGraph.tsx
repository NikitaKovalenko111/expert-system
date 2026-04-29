import { useMemo, useRef, useState } from 'react'
import dagre from 'dagre'
import type { DecisionEdge, DecisionNode } from '../../api/decisionTree'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'

interface DecisionTreeGraphProps {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
}

interface LayoutNode extends DecisionNode {
  x: number
  y: number
  width: number
  height: number
}

interface LayoutEdge extends DecisionEdge {
  points: { x: number; y: number }[]
}

interface TransformState {
  scale: number
  translateX: number
  translateY: number
}

const NODE_SIZES: Record<DecisionNode['kind'], { width: number; height: number }> = {
  question: { width: 250, height: 118 },
  factor: { width: 240, height: 102 },
  goal: { width: 244, height: 106 },
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const pointToPath = (points: { x: number; y: number }[]) => {
  if (!points.length) {
    return ''
  }

  const [start, ...rest] = points
  return `M ${start.x} ${start.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`
}

function DecisionTreeGraph({ nodes, edges, selectedNodeId, onSelectNode }: DecisionTreeGraphProps) {
  const [transform, setTransform] = useState<TransformState>({ scale: 0.72, translateX: 52, translateY: 48 })
  const dragState = useRef<{ startX: number; startY: number; translateX: number; translateY: number } | null>(null)

  const layout = useMemo(() => {
    const graph = new dagre.graphlib.Graph()

    graph.setGraph({ rankdir: 'LR', nodesep: 42, ranksep: 132, marginx: 48, marginy: 48 })
    graph.setDefaultEdgeLabel(() => ({}))

    nodes.forEach((node) => {
      const size = NODE_SIZES[node.kind]
      graph.setNode(node.id, { width: size.width, height: size.height })
    })

    edges.forEach((edge) => {
      graph.setEdge(edge.source, edge.target)
    })

    dagre.layout(graph)

    const graphInfo = graph.graph() as { width?: number; height?: number }

    const layoutNodes: LayoutNode[] = nodes.map((node) => {
      const position = graph.node(node.id) as { x: number; y: number; width: number; height: number }
      return {
        ...node,
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
      }
    })

    const layoutEdges: LayoutEdge[] = edges.map((edge) => {
      const edgeLayout = graph.edge({ v: edge.source, w: edge.target }) as { points?: { x: number; y: number }[] } | undefined

      return {
        ...edge,
        points: edgeLayout?.points ?? [],
      }
    })

    return {
      width: (graphInfo.width ?? 0) + 96,
      height: (graphInfo.height ?? 0) + 96,
      nodes: layoutNodes,
      edges: layoutEdges,
    }
  }, [edges, nodes])

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const direction = event.deltaY > 0 ? -0.06 : 0.06
    setTransform((current) => ({
      ...current,
      scale: clamp(current.scale + direction, 0.42, 1.35),
    }))
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      translateX: transform.translateX,
      translateY: transform.translateY,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStateSnapshot = dragState.current

    if (!dragStateSnapshot) {
      return
    }

    const deltaX = event.clientX - dragStateSnapshot.startX
    const deltaY = event.clientY - dragStateSnapshot.startY

    setTransform((current) => ({
      ...current,
      translateX: dragStateSnapshot.translateX + deltaX,
      translateY: dragStateSnapshot.translateY + deltaY,
    }))
  }

  const handlePointerUp = () => {
    dragState.current = null
  }

  return (
    <div className="graph-stage">
      <div className="graph-stage__hint">Колесо мыши масштабирует, а перетаскивание двигает дерево</div>
      <div className="graph-stage__viewport" onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <div
          className="graph-stage__surface"
          style={{
            width: `${layout.width}px`,
            height: `${layout.height}px`,
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          }}
        >
          <svg className="graph-stage__edges" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
            <defs>
              <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(109, 155, 255, 0.8)" />
              </marker>
            </defs>

            {layout.edges.map((edge) => {
              const labelPoint = edge.points[Math.floor(edge.points.length / 2)] ?? edge.points[0]

              return (
                <g key={edge.id}>
                  <path className="graph-edge__path" d={pointToPath(edge.points)} markerEnd="url(#graph-arrow)" />
                  {labelPoint ? (
                    <text className="graph-edge__label" x={labelPoint.x} y={labelPoint.y - 12} textAnchor="middle">
                      {edge.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>

          <div className="graph-stage__nodes" style={{ width: `${layout.width}px`, height: `${layout.height}px` }}>
            {layout.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`graph-node graph-node--${node.kind} graph-node--${node.tone}${selectedNodeId === node.id ? ' graph-node--selected' : ''}`}
                style={{ left: `${node.x - node.width / 2}px`, top: `${node.y - node.height / 2}px`, width: `${node.width}px`, height: `${node.height}px` }}
                onClick={() => onSelectNode(node.id)}
              >
                <span className="graph-node__kind">{node.kind === 'question' ? 'Уточняющий вопрос' : node.kind === 'factor' ? 'Фактор' : 'Цель'}</span>
                <span className="graph-node__title">{node.title}</span>
                <span className="graph-node__subtitle">{node.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DecisionTreeGraph