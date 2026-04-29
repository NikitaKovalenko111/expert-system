import { useMemo, useState } from 'react'
import { decisionTree, getDecisionNode } from '../api/decisionTree'
import AppHeader from '../components/layout/AppHeader'
import ProjectSidebar from '../components/layout/ProjectSidebar'
import FactorGoalSidebar from '../components/panels/FactorGoalSidebar'
import WorkbenchWorkspace from '../components/panels/WorkbenchWorkspace'
import FactorModal from '../components/modals/FactorModal'
import GoalModal from '../components/modals/GoalModal'

type ActiveModal = 'factor' | 'goal' | null

function WorkbenchPage() {
  const [selectedNodeId, setSelectedNodeId] = useState(decisionTree.nodes[0].id)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)

  const selectedNode = useMemo(() => getDecisionNode(selectedNodeId) ?? decisionTree.nodes[0], [selectedNodeId])

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

      <AppHeader onExport={handleExport} />

      <main className="app-shell" id="workspace">
        <ProjectSidebar nodes={decisionTree.nodes} selectedNodeId={selectedNode.id} onSelectNode={setSelectedNodeId} />

        <WorkbenchWorkspace
          nodes={decisionTree.nodes}
          edges={decisionTree.edges}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNodeId}
        />

        <FactorGoalSidebar onOpenFactorModal={() => setActiveModal('factor')} onOpenGoalModal={() => setActiveModal('goal')} />
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">Desktop UI для expert system: дерево решений, модальные окна, экспорт JSON.</div>
      </footer>

      <FactorModal isOpen={activeModal === 'factor'} onClose={() => setActiveModal(null)} />
      <GoalModal isOpen={activeModal === 'goal'} onClose={() => setActiveModal(null)} />
    </div>
  )
}

export default WorkbenchPage