import { useState } from 'react'
import type { DecisionNode, DecisionEdge } from '../../api/decisionTree'
import Modal from '../ui/Modal'

interface TestingModalProps {
  isOpen: boolean
  onClose: () => void
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  startNodeId: string
}

function TestingModal({ isOpen, onClose, nodes, edges, startNodeId }: TestingModalProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [testingActive, setTestingActive] = useState(false)

  const handleStart = () => {
    setCurrentNodeId(startNodeId)
    setTestingActive(true)
  }

  const handleRestart = () => {
    setCurrentNodeId(startNodeId)
  }

  const handleClose = () => {
    setTestingActive(false)
    setCurrentNodeId(null)
    onClose()
  }

  const handleNavigate = (targetNodeId: string) => {
    setCurrentNodeId(targetNodeId)
  }

  if (!isOpen) {
    return null
  }

  if (!testingActive) {
    return (
      <Modal id="testing-start" title="Режим проверки" description="Запустить проверку дерева" isOpen={isOpen} onClose={onClose}>
        <div className="modal-window__body">
          <p>Нажмите кнопку ниже, чтобы начать проверку дерева решений.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="button button--primary" type="button" onClick={handleStart}>
              Начать проверку
            </button>
            <button className="button button--ghost" type="button" onClick={handleClose}>
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  const currentNode = nodes.find((n) => n.id === currentNodeId)
  if (!currentNode) {
    return null
  }

  const outgoingEdges = edges.filter((e) => e.source === currentNodeId)
  const isGoal = currentNode.kind === 'goal'

  return (
    <Modal id="testing-active" title="Проверка дерева" description="Текущий узел" isOpen={isOpen} onClose={handleClose}>
      <div className="modal-window__body" style={{ display: 'grid', gap: 16 }}>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(77, 25, 204, 0.08)', border: '1px solid rgba(77, 25, 204, 0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(77, 25, 204, 0.6)', textTransform: 'uppercase', marginBottom: '8px' }}>
            {currentNode.kind === 'goal' ? '🎯 Цель' : '❓ Вопрос'}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{currentNode.title}</h3>
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px' }}>{currentNode.subtitle}</p>
        </div>

        {isGoal ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)', margin: 0 }}>Вы достигли цели! 🎉</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="button button--primary" type="button" onClick={handleRestart}>
                Начать заново
              </button>
              <button className="button button--ghost" type="button" onClick={handleClose}>
                Закрыть
              </button>
            </div>
          </div>
        ) : outgoingEdges.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <p style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.6)', margin: 0, marginBottom: 4 }}>Выберите ответ:</p>
            {outgoingEdges.map((edge) => {
              const targetNode = nodes.find((n) => n.id === edge.target)
              return (
                <button
                  key={edge.id}
                  type="button"
                  style={{
                    padding: '12px 14px',
                    border: '1px solid rgba(77, 25, 204, 0.2)',
                    borderRadius: '8px',
                    background: '#ffffffdb',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'all 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget
                    target.style.background = '#f5f5ff'
                    target.style.borderColor = 'rgba(77, 25, 204, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget
                    target.style.background = '#ffffffdb'
                    target.style.borderColor = 'rgba(77, 25, 204, 0.2)'
                  }}
                  onClick={() => handleNavigate(edge.target)}
                >
                  <strong style={{ color: '#4d19cc' }}>{edge.label}</strong>
                  {targetNode && <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.5)', marginTop: 4 }}>→ {targetNode.title}</div>}
                </button>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)', margin: 0 }}>Конец ветки без выхода. Нажмите "Начать заново".</p>
            <button className="button button--primary" type="button" onClick={handleRestart}>
              Начать заново
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default TestingModal
