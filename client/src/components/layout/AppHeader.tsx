interface AppHeaderProps {
  onExport: () => void
}

function AppHeader({ onExport }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="#workspace" aria-label="Expert System Workbench">
          <span className="brand__mark">ЭС</span>
          <span className="brand__text">
            <span className="brand__title">Expert System</span>
            <span className="brand__subtitle">Workbench для дерева решений</span>
          </span>
        </a>

        <div className="topbar__status">
          <span className="topbar__dot" />
          <span>Проект: Диагностическая система</span>
        </div>

        <div className="topbar__actions">
          <button className="button button--ghost" type="button">
            Новый
          </button>
          <button className="button button--ghost" type="button">
            Сохранить
          </button>
          <button className="button button--primary" type="button" onClick={onExport}>
            Экспорт JSON
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader