import favicon from './../../../public/favicon.png'
interface AppHeaderProps {
  onExport: () => void
  onExportRules?: () => void
  onOpenProject: () => void
  onImport?: () => void
  onTesting?: () => void
  onNewProject?: () => void
  projectTitle?: string
}

function AppHeader({ onExport, onExportRules, onOpenProject, onImport, onTesting, onNewProject, projectTitle }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="#workspace" aria-label="Expert System Workbench">
          <img src={favicon} className="brand__mark" />
          <span className="brand__text">
            <span className="brand__title">Экспертная система</span>
            <span className="brand__subtitle">Рабочая панель для дерева решений</span>
          </span>
        </a>

        <div className="topbar__status">
          <span className="topbar__dot" />
          <span>{`Проект: ${projectTitle ?? 'Без названия'}`}</span>
        </div>

        <div className="topbar__actions">
          {onNewProject ? (
            <button className="button button--ghost" type="button" onClick={onNewProject}>
              + Создать
            </button>
          ) : null}
          <button className="button button--ghost" type="button" onClick={onOpenProject}>
            Проект
          </button>
          {onTesting ? (
            <button className="button button--primary" type="button" onClick={onTesting}>
              ▶ Старт
            </button>
          ) : null}
          {onImport ? (
            <button className="button button--ghost" type="button" onClick={onImport}>
              Импорт JSON
            </button>
          ) : null}
          <button className="button button--ghost" type="button">
            Сохранить
          </button>
          {onExportRules ? (
            <button className="button button--ghost" type="button" onClick={onExportRules}>
              Экспорт Правил
            </button>
          ) : null}
          <button className="button button--primary" type="button" onClick={onExport}>
            Экспорт JSON
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader