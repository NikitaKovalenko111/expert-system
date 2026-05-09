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