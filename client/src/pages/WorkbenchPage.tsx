import { useMemo, useState, useRef, useEffect } from 'react'
import { decisionTree, getDecisionNode, saveDecisionTree, loadDecisionTree } from '../api/decisionTree'
import type { DecisionNode } from '../api/decisionTree'
import AppHeader from '../components/layout/AppHeader'
import ProjectSidebar from '../components/layout/ProjectSidebar'
import Modal from '../components/ui/Modal'
import InspectorPanel from '../components/panels/InspectorPanel'
import WorkbenchWorkspace from '../components/panels/WorkbenchWorkspace'
import GoalModal from '../components/modals/GoalModal'
import QuestionModal from '../components/modals/QuestionModal'
import TestingModal from '../components/modals/TestingModal'
import NewProjectModal from '../components/modals/NewProjectModal'

type ActiveModal = 'goal' | 'project' | 'inspector' | 'add-goal' | 'add-question' | 'add-choice' | 'testing' | 'new-project' | null

// Load from localStorage on app start
const saved = loadDecisionTree()
if (saved) {
  Object.assign(decisionTree, saved)
}

function WorkbenchPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(decisionTree.nodes[0]?.id ?? null)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [parentNodeForNewNode, setParentNodeForNewNode] = useState<string | null>(null)
  const [treeVersion, setTreeVersion] = useState(0)

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    return getDecisionNode(selectedNodeId) ?? decisionTree.nodes[0] ?? null
  }, [selectedNodeId, treeVersion])

  // If there's no saved tree on first run, open New Project modal
  useEffect(() => {
    if (!saved && decisionTree.nodes.length === 0) {
      setActiveModal('new-project')
    }
  }, [])

  const handleGraphNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setActiveModal('inspector')
  }

  const handleAddNodeConnected = (parentNodeId: string) => {
    console.log('🔴 handleAddNodeConnected called:', parentNodeId)
    const parentNode = decisionTree.nodes.find((n) => n.id === parentNodeId)
    console.log('🔴 parentNode:', parentNode)
    if (!parentNode) {
      console.log('🔴 parentNode not found')
      return
    }

    // regardless of whether parent was factor or question, open add-question modal
    if (parentNode.kind === 'goal') {
      console.log('🔴 Cannot add child to goal node')
      return
    }

    // Ask user which type to add (question / goal)
    setParentNodeForNewNode(parentNodeId)
    setActiveModal('add-choice')
  }

  const handleCreateFirstNode = () => {
    if (decisionTree.nodes.length === 0) {
      // Create root node - ask type
      setParentNodeForNewNode('__root_placeholder__')
      setActiveModal('add-choice')
    } else {
      // Create child node connected to root
      handleAddNodeConnected('root')
    }
  }

  const handleSaveNewGoal = (title: string, subtitle: string, edgeLabel?: string) => {
    if (!parentNodeForNewNode) return

    // Creating root goal
    if (parentNodeForNewNode === '__root_placeholder__') {
      const tones = ['violet', 'blue', 'teal', 'green', 'amber', 'rose'] as const
      const randomTone = tones[Math.floor(Math.random() * tones.length)]

      decisionTree.nodes = [
        {
          id: 'root',
          kind: 'goal',
          title,
          subtitle,
          tone: randomTone,
        },
      ]
      decisionTree.edges = []

      setSelectedNodeId('root')
      setActiveModal(null)
      setParentNodeForNewNode(null)
      setTreeVersion((v) => v + 1)
      saveDecisionTree()
      return
    }

    const parentNode = decisionTree.nodes.find((n) => n.id === parentNodeForNewNode)
    if (!parentNode) return

    const maxNumId = decisionTree.nodes.length ? Math.max(...decisionTree.nodes.map((n) => {
      const match = n.id.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    })) : 0
    const newNodeId = `q-${maxNumId + 1}`

    const tones = ['violet', 'blue', 'teal', 'green', 'amber', 'rose'] as const
    const randomTone = tones[Math.floor(Math.random() * tones.length)]

    decisionTree.nodes = [
      ...decisionTree.nodes,
      {
        id: newNodeId,
        kind: 'goal',
        title,
        subtitle,
        tone: randomTone,
      },
    ]

    const maxEdgeNum = decisionTree.edges.length ? Math.max(...decisionTree.edges.map((e) => {
      const match = e.id.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    })) : 0
    decisionTree.edges = [
      ...decisionTree.edges,
      {
        id: `e-${maxEdgeNum + 1}`,
        source: parentNodeForNewNode,
        target: newNodeId,
        label: edgeLabel && edgeLabel.length ? edgeLabel : 'Связь',
      },
    ]

    setSelectedNodeId(newNodeId)
    setActiveModal(null)
    setParentNodeForNewNode(null)
    setTreeVersion((v) => v + 1)
    saveDecisionTree()
  }

  const handleSaveNewNode = (title: string, subtitle: string, edgeLabel?: string) => {
    if (!parentNodeForNewNode) return

    // Handle creating root node
    if (parentNodeForNewNode === '__root_placeholder__') {
      const tones = ['violet', 'blue', 'teal', 'green', 'amber', 'rose'] as const
      const randomTone = tones[Math.floor(Math.random() * tones.length)]

      decisionTree.nodes = [
        {
          id: 'root',
          kind: 'question',
          title,
          subtitle,
          tone: randomTone,
        },
      ]
      decisionTree.edges = []

      setSelectedNodeId('root')
      setActiveModal(null)
      setParentNodeForNewNode(null)
      setTreeVersion((v) => v + 1)
      saveDecisionTree()
      return
    }

    const parentNode = decisionTree.nodes.find((n) => n.id === parentNodeForNewNode)
    if (!parentNode) return

    const maxNumId = Math.max(...decisionTree.nodes.map((n) => {
      const match = n.id.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    }))
    const newNodeId = `q-${maxNumId + 1}`

    // simplified model: all new nodes are questions
    const newKind = 'question'
    const tones = ['violet', 'blue', 'teal', 'green', 'amber', 'rose'] as const
    const randomTone = tones[Math.floor(Math.random() * tones.length)]

    // replace nodes array reference so React memo hooks detect the change
    decisionTree.nodes = [
      ...decisionTree.nodes,
      {
        id: newNodeId,
        kind: newKind,
        title,
        subtitle,
        tone: randomTone,
      },
    ]

    const maxEdgeNum = Math.max(...decisionTree.edges.map((e) => {
      const match = e.id.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    }))
    decisionTree.edges = [
      ...decisionTree.edges,
      {
        id: `e-${maxEdgeNum + 1}`,
        source: parentNodeForNewNode,
        target: newNodeId,
        label: edgeLabel && edgeLabel.length ? edgeLabel : 'Связь',
      },
    ]

    setSelectedNodeId(newNodeId)
    setActiveModal(null)
    setParentNodeForNewNode(null)
    setTreeVersion((v) => v + 1)
    saveDecisionTree()
  }

  const handleDeleteNodeCascade = (nodeId: string) => {
    // Find all descendants of the node to delete
    const descendantsToDelete = new Set<string>()
    const queue = [nodeId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      descendantsToDelete.add(currentId)

      // Find all edges where current node is the source
      const childEdges = decisionTree.edges.filter((e) => e.source === currentId)
      childEdges.forEach((edge) => {
        if (!descendantsToDelete.has(edge.target)) {
          queue.push(edge.target)
        }
      })
    }

    // Remove nodes
    decisionTree.nodes = decisionTree.nodes.filter((n) => !descendantsToDelete.has(n.id))

    // Remove edges involving deleted nodes
    decisionTree.edges = decisionTree.edges.filter((e) => !descendantsToDelete.has(e.source) && !descendantsToDelete.has(e.target))

    // Reset selection if deleted node was selected
    if (selectedNodeId && descendantsToDelete.has(selectedNodeId)) {
      setSelectedNodeId(decisionTree.nodes[0]?.id ?? null)
    }

    setActiveModal(null)
    setTreeVersion((v) => v + 1)
    saveDecisionTree()
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<DecisionNode>) => {
    const nodeIndex = decisionTree.nodes.findIndex((n) => n.id === nodeId)
    if (nodeIndex < 0) return

    decisionTree.nodes = [
      ...decisionTree.nodes.slice(0, nodeIndex),
      { ...decisionTree.nodes[nodeIndex], ...updates },
      ...decisionTree.nodes.slice(nodeIndex + 1),
    ]

    setTreeVersion((v) => v + 1)
    saveDecisionTree()
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        const parsed = JSON.parse(text)

        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          window.alert('Неверный формат JSON: ожидается объект с массивами nodes и edges')
          return
        }

        // Replace current tree
        Object.assign(decisionTree, parsed)
        saveDecisionTree()
        setTreeVersion((v) => v + 1)
        setSelectedNodeId(decisionTree.nodes[0]?.id ?? null)
      } catch (err) {
        console.error(err)
        window.alert('Не удалось загрузить JSON: ' + String(err))
      }
    }
    reader.readAsText(file)
    // clear value so selecting the same file again will trigger change
    e.currentTarget.value = ''
  }

  const handleCreateNewProject = async (projectName: string, shouldExport: boolean) => {
    if (shouldExport) {
      await handleExport()
    }

    // Completely reset decision tree
    decisionTree.title = projectName
    decisionTree.nodes = [
      {
        id: 'root',
        kind: 'question' as const,
        title: 'Главный вопрос',
        subtitle: 'Начало дерева решений',
        tone: 'violet' as const,
      },
    ]
    decisionTree.edges = []

    // Save and refresh UI
    localStorage.removeItem('expert-system-tree')
    saveDecisionTree()
    setSelectedNodeId('root')
    setActiveModal(null)
    setTreeVersion((v) => v + 1)
  }

  const handleExport = async () => {
    const payload = JSON.stringify(decisionTree, null, 2)

    if (window.electronAPI) {
      await window.electronAPI.saveJson({ fileName: 'expert-system.json', content: payload })
      return
    }

    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'expert-system.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <div className="app__noise" aria-hidden="true" />

      <AppHeader onExport={handleExport} onOpenProject={() => setActiveModal('project')} onImport={handleImportClick} projectTitle={decisionTree.title} onTesting={() => setActiveModal('testing')} onNewProject={() => setActiveModal('new-project')} />

      <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleFileSelected} />

      <main className="app-shell app-shell--fullscreen" id="workspace">
        <WorkbenchWorkspace
          nodes={decisionTree.nodes}
          edges={decisionTree.edges}
          selectedNode={selectedNode}
          onSelectNode={handleGraphNodeSelect}
          onAddNodeConnected={handleAddNodeConnected}
          onCreateFirstNode={handleCreateFirstNode}
        />
      </main>

      {/* footer removed for fullscreen experience */}

      <Modal id="project" title="Дерево проекта" description="Просмотр узлов и инструменты" isOpen={activeModal === 'project'} onClose={() => setActiveModal(null)}>
        <ProjectSidebar nodes={decisionTree.nodes} selectedNodeId={selectedNode?.id || ''} onSelectNode={(id) => { setSelectedNodeId(id); setActiveModal(null); }} />
      </Modal>

      <Modal id="inspector" title="Свойства узла" description="Инспектор выбранного узла" isOpen={activeModal === 'inspector' && !!selectedNode} onClose={() => setActiveModal(null)}>
        {selectedNode && (
          <InspectorPanel
            selectedNode={selectedNode}
            embedded
            onDeleteNode={handleDeleteNodeCascade}
            onUpdateNode={handleUpdateNode}
          />
        )}
      </Modal>

      <Modal id="add-choice" title="Тип узла" description="Выберите тип узла для добавления" isOpen={activeModal === 'add-choice'} onClose={() => { setActiveModal(null); setParentNodeForNewNode(null); }}>
        <div className="modal-window__body">
          <p>Какой тип узла вы хотите добавить?</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="button button--primary" type="button" onClick={() => { setActiveModal('add-question') }}>
              Вопрос
            </button>
            <button className="button button--ghost" type="button" onClick={() => { setActiveModal('add-goal') }}>
              Цель
            </button>
          </div>
        </div>
      </Modal>

      <GoalModal isOpen={activeModal === 'add-goal'} isAddingNode onClose={() => { setActiveModal(null); setParentNodeForNewNode(null); }} onSave={handleSaveNewGoal} />
      <QuestionModal isOpen={activeModal === 'add-question'} isAddingNode onClose={() => { setActiveModal(null); setParentNodeForNewNode(null); }} onSave={handleSaveNewNode} />

      <TestingModal
        isOpen={activeModal === 'testing'}
        onClose={() => setActiveModal(null)}
        nodes={decisionTree.nodes}
        edges={decisionTree.edges}
        startNodeId={decisionTree.nodes[0]?.id ?? 'root'}
      />

      <NewProjectModal isOpen={activeModal === 'new-project'} onClose={() => setActiveModal(null)} onCreate={handleCreateNewProject} />
    </div>
  )
}

export default WorkbenchPage