interface FactorGoalSidebarProps {
  onOpenFactorModal: () => void
  onOpenGoalModal: () => void
}

function FactorGoalSidebar({ onOpenFactorModal, onOpenGoalModal }: FactorGoalSidebarProps) {
  return (
    <aside className="sidebar sidebar--right" aria-label="Панель факторов и целей">
      <section className="sidebar__section">
        <div className="sidebar__header">
          <h2 className="sidebar__title">Факторы</h2>
          <button className="button button--ghost" type="button" onClick={onOpenFactorModal}>
            + Добавить
          </button>
        </div>

        <article className="factor-item">
          <div>
            <div className="factor-item__title">Температура выше нормы</div>
            <div className="factor-item__meta">active factor</div>
          </div>
          <button className="button button--ghost" type="button" onClick={onOpenFactorModal}>
            Ред.
          </button>
        </article>
        <article className="factor-item">
          <div>
            <div className="factor-item__title">Наличие симптомов</div>
            <div className="factor-item__meta">active factor</div>
          </div>
          <button className="button button--ghost" type="button" onClick={onOpenFactorModal}>
            Ред.
          </button>
        </article>

        <div className="sidebar__card">
          <strong>Экспорт</strong>
          <p className="sidebar__text">Файл JSON готовится из текущего дерева решений</p>
        </div>
      </section>

      <section className="sidebar__section">
        <div className="sidebar__header">
          <h2 className="sidebar__title">Цели</h2>
          <button className="button button--ghost" type="button" onClick={onOpenGoalModal}>
            + Добавить
          </button>
        </div>

        <article className="goal-item">
          <div>
            <div className="goal-item__title">Диагноз</div>
            <div className="goal-item__meta">final target</div>
          </div>
          <button className="button button--ghost" type="button" onClick={onOpenGoalModal}>
            Ред.
          </button>
        </article>
      </section>
    </aside>
  )
}

export default FactorGoalSidebar