export type DecisionNodeKind = 'question' | 'goal'

export interface DecisionNode {
  id: string
  kind: DecisionNodeKind
  title: string
  subtitle: string
  tone: 'violet' | 'blue' | 'teal' | 'green' | 'amber' | 'rose'
}

export interface DecisionEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface DecisionTreeModel {
  title: string
  nodes: DecisionNode[]
  edges: DecisionEdge[]
}

export const decisionTree: DecisionTreeModel = {
  title: '',
  nodes: [],
  edges: [],
}

export const getDecisionNode = (nodeId: string) =>
  decisionTree.nodes.find((node) => node.id === nodeId)

// Persistence functions
const STORAGE_KEY = 'expert-system-tree'

export const saveDecisionTree = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisionTree))
  } catch (error) {
    console.error('Failed to save decision tree:', error)
  }
}

export const loadDecisionTree = (): DecisionTreeModel | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load decision tree:', error)
  }
  return null
}

export const exportRulesToText = (): string => {
  const rootNode = decisionTree.nodes[0]
  if (!rootNode || decisionTree.edges.length === 0) return ''

  const rules: string[] = []
  const quoteText = (value: string) => `"${value}"`

  // DFS to find all paths from root to goal nodes
  const dfs = (nodeId: string, path: { question: string; answer: string }[]) => {
    const node = getDecisionNode(nodeId)
    if (!node) return

    // If we reached a goal node, create a rule
    if (node.kind === 'goal') {
      const ruleStr =
        path.length > 0
          ? `ЕСЛИ ${path.map((p) => `${quoteText(p.question)} = ${p.answer}`).join(' И ')} ТО ${quoteText(node.title)}`
          : `ТО ${quoteText(node.title)}`
      rules.push(ruleStr)
      return
    }

    // Find all outgoing edges from this node
    const outgoingEdges = decisionTree.edges.filter((e) => e.source === nodeId)

    for (const edge of outgoingEdges) {
      const childNode = getDecisionNode(edge.target)
      if (childNode) {
        const newPath = [...path, { question: node.title, answer: edge.label }]
        dfs(edge.target, newPath)
      }
    }
  }

  dfs(rootNode.id, [])

  return rules.join('\n\n')
}