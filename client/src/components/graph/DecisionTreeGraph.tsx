import { useMemo, useRef, useState } from 'react'
import dagre from 'dagre'
import type { DecisionEdge, DecisionNode } from '../../api/decisionTree'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'

interface DecisionTreeGraphProps {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onAddNodeConnected?: (parentNodeId: string) => void
  onCreateFirstNode?: () => void
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
  // increased sizes to allow for larger internal padding
  question: { width: 300, height: 148 },
  goal: { width: 284, height: 136 },
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const pointToPath = (points: { x: number; y: number }[]) => {
  if (!points.length) {
    return ''
  }

  const [start, ...rest] = points
  return `M ${start.x} ${start.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`
}

function DecisionTreeGraph({ nodes, edges, selectedNodeId, onSelectNode, onAddNodeConnected, onCreateFirstNode }: DecisionTreeGraphProps) {
  const [transform, setTransform] = useState<TransformState>({ scale: 0.72, translateX: 52, translateY: 48 })
  const dragState = useRef<{ startX: number; startY: number; translateX: number; translateY: number } | null>(null)

  const layout = useMemo(() => {
    // Handle empty graph
    if (nodes.length === 0) {
      return {
        width: 800,
        height: 600,
        nodes: [],
        edges: [],
      }
    }

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

    const targetElement = event.target as HTMLElement | null
    // if the pointer target is an interactive control (buttons, inputs, links) or inside a node,
    // don't start canvas panning — let that control handle the interaction.
    if (targetElement?.closest('.graph-node') || targetElement?.closest('button, a, input, textarea, select, [role="button"]')) {
      return
    }

    event.preventDefault()
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

    if (event.buttons === 0) {
      dragState.current = null
      return
    }

    event.preventDefault()

    const deltaX = event.clientX - dragStateSnapshot.startX
    const deltaY = event.clientY - dragStateSnapshot.startY

    setTransform((current) => ({
      ...current,
      translateX: dragStateSnapshot.translateX + deltaX,
      translateY: dragStateSnapshot.translateY + deltaY,
    }))
  }

  const handlePointerUp = (event?: ReactPointerEvent<HTMLDivElement>) => {
    // release pointer capture if possible
    try {
      if (event?.currentTarget && typeof event.currentTarget.releasePointerCapture === 'function') {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    } catch (e) {
      // ignore
    }

    dragState.current = null
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      if (event.currentTarget && typeof event.currentTarget.releasePointerCapture === 'function') {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    } catch (e) {
      // ignore
    }

    dragState.current = null
  }

  const handleLostPointerCapture = () => {
    // fallback cleanup when capture is lost
    dragState.current = null
  }

  return (
    <div className="graph-stage">
      <div className="graph-stage__hint">Колесо мыши масштабирует, а перетаскивание двигает дерево</div>
      <div
        className="graph-stage__viewport"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
      >
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
              // compute a label point slightly along the edge and offset perpendicular for clarity
              let labelX = 0
              let labelY = 0

              if (edge.points.length >= 2) {
                const idx = Math.max(1, Math.floor(edge.points.length * 0.35))
                const p = edge.points[idx]
                const prev = edge.points[idx - 1]
                const dx = p.x - prev.x
                const dy = p.y - prev.y
                const len = Math.hypot(dx, dy) || 1
                const nx = -dy / len
                const ny = dx / len
                const offset = 12

                labelX = p.x + nx * offset
                labelY = p.y + ny * offset
              } else {
                const mid = edge.points[Math.floor(edge.points.length / 2)] ?? edge.points[0]
                labelX = mid.x
                labelY = mid.y
              }

              return (
                <g key={edge.id}>
                  <path className="graph-edge__path" d={pointToPath(edge.points)} markerEnd="url(#graph-arrow)" />
                  {edge.label ? (() => {
                    const labelText = edge.label || ''
                    // reduce horizontal padding so short labels (e.g. "ДА") aren't too roomy
                    const labelPaddingX = 8
                    const labelTextLimit = 14
                    const displayLabelText = labelText.length > labelTextLimit ? `${labelText.slice(0, labelTextLimit - 1)}…` : labelText
                    const labelBoxWidth = Math.min(180, Math.max(56, displayLabelText.length * 7 + labelPaddingX * 2))

                    return (
                      <g className="graph-edge__label-group">
                        <title>{labelText}</title>
                        <rect x={labelX - labelBoxWidth / 2} y={labelY - 20} width={labelBoxWidth} height={20} rx={10} ry={10} fill="rgba(255, 255, 255, 0.96)" stroke="rgba(77, 25, 204, 0.12)" />
                        <text className="graph-edge__label" x={labelX} y={labelY - 6} textAnchor="middle">
                          {displayLabelText}
                        </text>
                      </g>
                    )
                  })() : null}
                </g>
              )
            })}
          </svg>

          <div className="graph-stage__nodes" style={{ width: `${layout.width}px`, height: `${layout.height}px` }}>
            {layout.nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x - node.width / 2}px`,
                  top: `${node.y - node.height / 2}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
              >
                <button
                  type="button"
                  className={`graph-node graph-node--${node.kind} graph-node--${node.tone}${selectedNodeId === node.id ? ' graph-node--selected' : ''}`}
                  style={{ width: '100%', height: '100%' }}
                  onClick={() => onSelectNode(node.id)}
                >
                  {node.kind === 'goal' ? (
                    <span className="graph-node__kind">Цель</span>
                  ) : null}
                  <span className="graph-node__title">{node.title}</span>
                </button>
                {onAddNodeConnected && node.kind !== 'goal' ? (
                  <button
                    type="button"
                    className="graph-node__add-btn"
                    title="Добавить узел"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddNodeConnected(node.id)
                      }}
                      onPointerUp={(e) => {
                        // pointer events can be more reliable than synthetic click in some environments
                        e.stopPropagation()
                        onAddNodeConnected(node.id)
                      }}
                    style={{
                      position: 'absolute',
                      right: '-20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px solid var(--accent)',
                      background: 'var(--accent)',
                      color: 'white',
                      fontSize: '18px',
                      lineHeight: '1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 180ms ease',
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget
                      target.style.borderColor = 'white'
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget
                      target.style.borderColor = 'var(--accent)'
                    }}
                  >
                    +
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {onCreateFirstNode && nodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              className="button button--primary button--large"
              onClick={onCreateFirstNode}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Создать первый узел
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DecisionTreeGraph