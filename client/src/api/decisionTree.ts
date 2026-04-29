export type DecisionNodeKind = 'question' | 'factor' | 'goal'

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
  title: 'Диагностическая экспертная система',
  nodes: [
    { id: 'root', kind: 'question', title: 'Есть ли у пациента стартовый симптом?', subtitle: 'Корневой вопрос дерева', tone: 'violet' },
    { id: 'q-1', kind: 'question', title: 'Нужно ли уточнить интенсивность симптома?', subtitle: 'Ветка диагностики', tone: 'blue' },
    { id: 'q-2', kind: 'question', title: 'Есть ли вторичный фактор риска?', subtitle: 'Проверка сопутствующих признаков', tone: 'teal' },
    { id: 'q-3', kind: 'question', title: 'Состояние развивается остро?', subtitle: 'Детализация сценария', tone: 'green' },
    { id: 'q-4', kind: 'question', title: 'Можно ли завершить опрос?', subtitle: 'Финальная проверка', tone: 'amber' },
    { id: 'q-5', kind: 'factor', title: 'Температура выше нормы', subtitle: 'Фактор для выбора ветки', tone: 'rose' },
    { id: 'q-6', kind: 'factor', title: 'Наличие дополнительных симптомов', subtitle: 'Сопутствующий фактор', tone: 'blue' },
    { id: 'q-7', kind: 'question', title: 'Есть ли болевой синдром?', subtitle: 'Дополнительный узел', tone: 'violet' },
    { id: 'q-8', kind: 'goal', title: 'Назначить итоговый вывод', subtitle: 'Цель системы', tone: 'green' },
    { id: 'q-9', kind: 'goal', title: 'Сформировать рекомендации', subtitle: 'Финальный ответ', tone: 'amber' },
    { id: 'q-10', kind: 'question', title: 'Есть ли подтверждение первичного признака?', subtitle: 'Промежуточный узел', tone: 'teal' },
    { id: 'q-11', kind: 'question', title: 'Требуется ли уточнение по истории?', subtitle: 'Ветка для контекста', tone: 'violet' },
    { id: 'q-12', kind: 'goal', title: 'Сохранить результат в JSON', subtitle: 'Экспорт проекта', tone: 'rose' },
    { id: 'q-13', kind: 'question', title: 'Нужно ли задать еще один вопрос?', subtitle: 'Продолжение опроса', tone: 'green' },
    { id: 'q-14', kind: 'factor', title: 'Сигнал от дополнительного признака', subtitle: 'Ограничивающий фактор', tone: 'amber' },
    { id: 'q-15', kind: 'goal', title: 'Завершить дерево решений', subtitle: 'Финальная цель', tone: 'teal' },
  ],
  edges: [
    { id: 'e-1', source: 'root', target: 'q-1', label: 'Да' },
    { id: 'e-2', source: 'root', target: 'q-2', label: 'Нет' },
    { id: 'e-3', source: 'q-1', target: 'q-5', label: 'Высокая' },
    { id: 'e-4', source: 'q-1', target: 'q-3', label: 'Средняя' },
    { id: 'e-5', source: 'q-2', target: 'q-6', label: 'Есть' },
    { id: 'e-6', source: 'q-2', target: 'q-7', label: 'Нет' },
    { id: 'e-7', source: 'q-3', target: 'q-10', label: 'Остро' },
    { id: 'e-8', source: 'q-3', target: 'q-11', label: 'Плавно' },
    { id: 'e-9', source: 'q-4', target: 'q-8', label: 'Завершить' },
    { id: 'e-10', source: 'q-5', target: 'q-8', label: 'Подтверждено' },
    { id: 'e-11', source: 'q-6', target: 'q-9', label: 'Сопоставить' },
    { id: 'e-12', source: 'q-7', target: 'q-13', label: 'Да' },
    { id: 'e-13', source: 'q-10', target: 'q-4', label: 'Да' },
    { id: 'e-14', source: 'q-11', target: 'q-14', label: 'Нет' },
    { id: 'e-15', source: 'q-13', target: 'q-12', label: 'Да' },
    { id: 'e-16', source: 'q-14', target: 'q-15', label: 'Да' },
    { id: 'e-17', source: 'q-15', target: 'q-9', label: 'Финал' },
  ],
}

export const getDecisionNode = (nodeId: string) =>
  decisionTree.nodes.find((node) => node.id === nodeId)