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
  const scale = transform.scale
  const translateX = Math.round(transform.translateX)
  const translateY = Math.round(transform.translateY)
  const nodeTitleFontSize = Math.max(6, Math.round(16 * scale * scale))
  const nodeKindFontSize = Math.max(5, Math.round(10 * scale * scale))
  const nodeGap = Math.max(4, Math.round(8 * scale))
  const nodePaddingX = Math.max(10, Math.round(20 * scale))
  const nodePaddingY = Math.max(14, Math.round(28 * scale))
  const edgeLabelFontSize = Math.max(5, Math.round(10 * scale * scale))
  const edgeLabelPaddingX = Math.max(4, Math.round(8 * scale))
  const edgeLabelHeight = Math.max(14, Math.round(20 * scale))
  const edgeLabelRadius = Math.max(7, Math.round(10 * scale))
  const edgeLabelTextLimit = Math.max(3, Math.round(8 / Math.max(scale, 0.42)))

  const projectX = (value: number) => Math.round(value * scale)
  const projectY = (value: number) => Math.round(value * scale)

  const trimTextToWidth = (text: string, maxWidth: number, fontSize: number, minLimit: number) => {
    const approxCharWidth = fontSize * 0.62
    const charLimit = Math.max(minLimit, Math.floor(maxWidth / approxCharWidth))
    if (text.length <= charLimit) {
      return text
    }

    return `${text.slice(0, Math.max(1, charLimit - 1))}…`
  }

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

    graph.setGraph({ rankdir: 'LR', nodesep: 42, ranksep: 200, marginx: 48, marginy: 48 })
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

  const scaledWidth = Math.max(1, Math.round(layout.width * scale))
  const scaledHeight = Math.max(1, Math.round(layout.height * scale))

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
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            transform: `translate(${translateX}px, ${translateY}px)`,
          }}
        >
          <svg className="graph-stage__edges" width={scaledWidth} height={scaledHeight} viewBox={`0 0 ${scaledWidth} ${scaledHeight}`} aria-hidden="true">
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

                labelX = projectX(p.x + nx * offset)
                labelY = projectY(p.y + ny * offset)
              } else {
                const mid = edge.points[Math.floor(edge.points.length / 2)] ?? edge.points[0]
                labelX = projectX(mid.x)
                labelY = projectY(mid.y)
              }

              const scaledPoints = edge.points.map((point) => ({
                x: projectX(point.x),
                y: projectY(point.y),
              }))

              return (
                <g key={edge.id}>
                  <path className="graph-edge__path" d={pointToPath(scaledPoints)} markerEnd="url(#graph-arrow)" />
                  {edge.label ? (() => {
                    const labelText = edge.label || ''
                    // scale the label box with zoom so it stays proportional to the graph
                    const displayLabelText = trimTextToWidth(labelText, 76, edgeLabelFontSize, edgeLabelTextLimit)
                    const labelBoxWidth = Math.min(180, Math.max(56, Math.round(displayLabelText.length * edgeLabelFontSize * 0.72 + edgeLabelPaddingX * 2)))

                    return (
                      <g className="graph-edge__label-group" style={{ pointerEvents: 'auto' }}>
                        <rect x={labelX - labelBoxWidth / 2} y={labelY - edgeLabelHeight} width={labelBoxWidth} height={edgeLabelHeight} rx={edgeLabelRadius} ry={edgeLabelRadius} fill="rgba(255, 255, 255, 0.96)" stroke="rgba(77, 25, 204, 0.12)" style={{ pointerEvents: 'auto' }}>
                          <title>{labelText}</title>
                        </rect>
                        <text className="graph-edge__label" x={labelX} y={labelY - Math.round(edgeLabelHeight * 0.28)} textAnchor="middle" style={{ pointerEvents: 'none', fontSize: `${edgeLabelFontSize}px` }}>
                          {displayLabelText}
                        </text>
                      </g>
                    )
                  })() : null}
                </g>
              )
            })}
          </svg>

          <div className="graph-stage__nodes" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
            {layout.nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${projectX(node.x - node.width / 2)}px`,
                  top: `${projectY(node.y - node.height / 2)}px`,
                  width: `${projectX(node.width)}px`,
                  height: `${projectY(node.height)}px`,
                }}
              >
                {(() => {
                  const nodeBoxWidth = Math.max(1, projectX(node.width) - nodePaddingX * 2)
                  const displayNodeTitle = trimTextToWidth(node.title, nodeBoxWidth, nodeTitleFontSize, 3)

                  return (
                <button
                  type="button"
                  className={`graph-node graph-node--${node.kind} graph-node--${node.tone}${selectedNodeId === node.id ? ' graph-node--selected' : ''}`}
                  style={{ width: '100%', height: '100%', gap: `${nodeGap}px`, padding: `${nodePaddingY}px ${nodePaddingX}px`, fontSize: `${nodeTitleFontSize}px` }}
                  onClick={() => onSelectNode(node.id)}
                  title={node.title}
                >
                  {node.kind === 'goal' ? (
                    <span className="graph-node__kind" style={{ fontSize: `${nodeKindFontSize}px` }}>Цель</span>
                  ) : null}
                  <span className="graph-node__title" style={{ fontSize: `${nodeTitleFontSize}px` }}>{displayNodeTitle}</span>
                </button>
                  )
                })()}
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