function ActivityTimeline() {
  return (
    <aside className="timeline" aria-label="Быстрая лента действий">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Лента</h2>
        <span className="sidebar__text">последние действия</span>
      </div>

      <article className="timeline-item">
        <div>
          <div className="timeline-item__title">Добавлен фактор</div>
          <div className="timeline-item__meta">2 минуты назад</div>
        </div>
        <span className="timeline-item__state">ok</span>
      </article>
      <article className="timeline-item">
        <div>
          <div className="timeline-item__title">Создана цель</div>
          <div className="timeline-item__meta">5 минут назад</div>
        </div>
        <span className="timeline-item__state">sync</span>
      </article>
      <article className="timeline-item">
        <div>
          <div className="timeline-item__title">Экспортирован JSON</div>
          <div className="timeline-item__meta">10 минут назад</div>
        </div>
        <span className="timeline-item__state">done</span>
      </article>
    </aside>
  )
}

export default ActivityTimeline