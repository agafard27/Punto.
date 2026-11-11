import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../Components/Icon.jsx'
import TaskDialog from '../Components/TaskDialog.jsx'
import TaskItem from '../Components/TaskItem.jsx'
import './TasksPage.css'

function dateOffset(offset) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const categories = ['İş', 'Eğitim', 'Kişisel']
const priorities = ['Yüksek', 'Orta', 'Düşük']

const starterTasks = [
  {
    id: 'starter-1',
    title: 'Proje sunumunu hazırla',
    notes: 'Son düzenlemeleri yap ve ekiple paylaş.',
    category: 'İş',
    priority: 'Yüksek',
    date: dateOffset(0),
    completed: false,
  },
  {
    id: 'starter-2',
    title: 'React ders notlarını gözden geçir',
    notes: '',
    category: 'Eğitim',
    priority: 'Orta',
    date: dateOffset(1),
    completed: false,
  },
  {
    id: 'starter-3',
    title: 'Haftalık hedefleri planla',
    notes: '',
    category: 'Kişisel',
    priority: 'Düşük',
    date: dateOffset(2),
    completed: false,
  },
  {
    id: 'starter-4',
    title: 'JavaScript alıştırmalarını tamamla',
    notes: 'Dizi metotları ve localStorage konularına bak.',
    category: 'Eğitim',
    priority: 'Orta',
    date: dateOffset(-1),
    completed: true,
  },
]

function loadTasks() {
  try {
    const savedTasks = window.localStorage.getItem('yapilacaklarim.tasks')
    if (savedTasks === null) return { tasks: starterTasks, error: '' }

    const parsedTasks = JSON.parse(savedTasks)
    const validTasks = Array.isArray(parsedTasks) && parsedTasks.every((task) => (
      task &&
      typeof task.id === 'string' &&
      task.id.length > 0 &&
      typeof task.title === 'string' &&
      task.title.trim().length > 0 &&
      task.title.length <= 100 &&
      typeof task.notes === 'string' &&
      task.notes.length <= 240 &&
      categories.includes(task.category) &&
      priorities.includes(task.priority) &&
      (task.date === '' || isValidDate(task.date)) &&
      typeof task.completed === 'boolean'
    ))
    if (!validTasks) throw new Error('Kayıtlı görev verisi beklenen biçimde değil.')
    if (new Set(parsedTasks.map((task) => task.id)).size !== parsedTasks.length) {
      throw new Error('Kayıtlı görevlerde yinelenen kimlikler bulundu.')
    }
    return { tasks: parsedTasks, error: '' }
  } catch (error) {
    console.error('Görevler tarayıcıdan okunamadı:', error)
    return { tasks: starterTasks, error: 'Kayıtlı görevler okunamadı. Değişiklikler bu oturumda saklanabilir.' }
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  const [year, month, day] = value.split('-').map(Number)
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day
}

function createTaskId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const filters = [
  { id: 'all', label: 'Tüm görevler', icon: 'inbox' },
  { id: 'today', label: 'Bugün', icon: 'calendar' },
  { id: 'upcoming', label: 'Yaklaşan', icon: 'chevron' },
  { id: 'completed', label: 'Tamamlanan', icon: 'check' },
]

function TasksPage() {
  const [initialState] = useState(loadTasks)
  const [tasks, setTasks] = useState(initialState.tasks)
  const [today] = useState(() => dateOffset(0))
  const [calendarLabel] = useState(() => (
    new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(new Date())
  ))
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeCategory, setActiveCategory] = useState(null)
  const [activePriority, setActivePriority] = useState('')
  const [activeDateFilter, setActiveDateFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dialogTask, setDialogTask] = useState(undefined)
  const [notice, setNotice] = useState(initialState.error)
  const [noticeIsError, setNoticeIsError] = useState(Boolean(initialState.error))
  const searchRef = useRef(null)
  const filterPanelRef = useRef(null)

  const completedCount = tasks.filter((task) => task.completed).length
  const todayCount = tasks.filter((task) => !task.completed && task.date === today).length
  const activeFilterCount = Number(Boolean(activeCategory)) + Number(Boolean(activePriority)) + Number(Boolean(activeDateFilter))
  const closeDialog = useCallback(() => setDialogTask(undefined), [])

  useEffect(() => {
    function handleShortcut(event) {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      } else if (event.key === 'Enter' && dialogTask === undefined) {
        event.preventDefault()
        setDialogTask(null)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [dialogTask])

  useEffect(() => {
    if (!filtersOpen) return undefined

    function handleOutsideClick(event) {
      if (!filterPanelRef.current?.contains(event.target)) setFiltersOpen(false)
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setFiltersOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [filtersOpen])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')
    return tasks
      .filter((task) => {
        if (activeFilter === 'today' && (task.completed || task.date !== today)) return false
        if (activeFilter === 'upcoming' && (task.completed || !task.date || task.date <= today)) return false
        if (activeFilter === 'completed' && !task.completed) return false
        if (activeFilter === 'all' && task.completed) return false
        if (activeCategory && task.category !== activeCategory) return false
        if (activePriority && task.priority !== activePriority) return false
        if (activeDateFilter === 'today' && task.date !== today) return false
        if (activeDateFilter === 'overdue' && (!task.date || task.date >= today)) return false
        if (activeDateFilter === 'upcoming' && (!task.date || task.date <= today)) return false
        if (activeDateFilter === 'no-date' && task.date) return false
        return !query || `${task.title} ${task.notes} ${task.category}`.toLocaleLowerCase('tr-TR').includes(query)
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed)
        if (sortBy === 'priority') {
          const priorityOrder = { Yüksek: 0, Orta: 1, Düşük: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'tr')
        if (!a.date) return 1
        if (!b.date) return -1
        return a.date.localeCompare(b.date)
      })
  }, [tasks, activeFilter, activeCategory, activePriority, activeDateFilter, sortBy, search, today])

  function saveTasks(nextTasks, message) {
    setTasks(nextTasks)
    try {
      window.localStorage.setItem('yapilacaklarim.tasks', JSON.stringify(nextTasks))
      setNotice(message)
      setNoticeIsError(false)
    } catch (error) {
      console.error('Görevler tarayıcıya kaydedilemedi:', error)
      setNotice('Görev güncellendi ancak tarayıcıya kaydedilemedi.')
      setNoticeIsError(true)
    }
  }

  function handleSave(taskData) {
    if (dialogTask) {
      const updatedTasks = tasks.map((task) => (task.id === dialogTask.id ? { ...task, ...taskData } : task))
      saveTasks(updatedTasks, 'Görev başarıyla güncellendi.')
    } else {
      saveTasks([{ ...taskData, id: createTaskId(), completed: false }, ...tasks], 'Yeni görev listenize eklendi.')
    }
    setDialogTask(undefined)
  }

  function handleToggle(taskId) {
    const updatedTasks = tasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
    saveTasks(updatedTasks, 'Görev durumu güncellendi.')
  }

  function handleDelete(taskId) {
    saveTasks(tasks.filter((task) => task.id !== taskId), 'Görev listenizden silindi.')
  }

  function selectFilter(filter) {
    setActiveFilter(filter)
    setActiveCategory(null)
  }

  function clearFilters() {
    setActiveCategory(null)
    setActivePriority('')
    setActiveDateFilter('')
    setSortBy('date')
    setSearch('')
    selectFilter('all')
    setFiltersOpen(false)
  }

  const pageTitle = activeCategory
    ? `${activeCategory} görevleri`
    : filters.find((filter) => filter.id === activeFilter)?.label

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Punto ana sayfa" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Icon name="check" size={21} /></span>
          <span>punto<span className="brand-period">.</span></span>
        </a>

        <div className="sidebar-label">MENÜ</div>
        <nav className="main-nav" aria-label="Ana menü">
          {filters.map((filter) => {
            const count = filter.id === 'today'
              ? todayCount
              : filter.id === 'completed'
                ? completedCount
                : filter.id === 'all'
                  ? tasks.filter((task) => !task.completed).length
                  : null
            const selected = !activeCategory && activeFilter === filter.id

            return (
              <button
                key={filter.id}
                type="button"
                className={`nav-item${selected ? ' active' : ''}`}
                onClick={() => selectFilter(filter.id)}
                aria-current={selected ? 'page' : undefined}
              >
                <Icon name={filter.icon} size={19} />
                <span>{filter.label}</span>
                {count !== null && <span className="nav-count">{count}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-label lists-label">LİSTELERİM</div>
        <nav className="category-nav" aria-label="Görev listeleri">
          {categories.map((category, index) => {
            const count = tasks.filter((task) => task.category === category && !task.completed).length
            const selected = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                className={`nav-item category-nav-item${selected ? ' active' : ''}`}
                onClick={() => {
                  setActiveCategory(category)
                  setActiveFilter('all')
                }}
                aria-current={selected ? 'page' : undefined}
              >
                <span className={`list-color list-color-${index}`} />
                <span>{category}</span>
                <span className="nav-count">{count}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✳</span>
            <p>Küçük adımlar,<br /><strong>büyük işler</strong> başarır.</p>
          </div>
          <div className="profile">
            <div className="avatar">M</div>
            <div><strong>Merhaba!</strong><span>Güzel bir gün olsun</span></div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Çalışma alanım <Icon name="chevron" size={14} /> <strong>{activeCategory || 'Görevler'}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Görevlerde ara..."
                aria-label="Görevlerde ara"
              />
              <kbd>Ctrl K</kbd>
            </label>
            <div className="topbar-date"><Icon name="calendar" size={17} />{calendarLabel}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <span className="eyebrow">GÜNÜNÜ PLANLA</span>
              <h1>Merhaba, bugün <span>neler yapacaksın?</span></h1>
              <p>Her şeyi bir yere not et. Gerisini birlikte hallederiz.</p>
            </div>
            <button type="button" className="button button-primary add-task-button" onClick={() => setDialogTask(null)}>
              <Icon name="plus" size={19} />
              Yeni görev
            </button>
          </section>

          <section className="summary-grid" aria-label="Görev özeti">
            <article className="summary-card">
              <div className="summary-icon summary-icon-violet"><Icon name="grid" size={19} /></div>
              <div><span>Toplam görev</span><strong>{tasks.length}</strong></div>
              <span className="summary-footnote">listenizde</span>
            </article>
            <article className="summary-card">
              <div className="summary-icon summary-icon-amber"><Icon name="calendar" size={19} /></div>
              <div><span>Bugün yapılacak</span><strong>{todayCount}</strong></div>
              <span className="summary-footnote">görev</span>
            </article>
            <article className="summary-card">
              <div className="summary-icon summary-icon-green"><Icon name="check" size={19} /></div>
              <div><span>Tamamlanan</span><strong>{completedCount}</strong></div>
              <span className="summary-footnote">görev</span>
            </article>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <div className="heading-title">
                  <h2>{pageTitle}</h2>
                  <span className="task-count">{visibleTasks.length}</span>
                </div>
                <p>{activeFilter === 'today' ? 'Bugünün önceliklerine odaklan.' : 'Yapılacaklarını takipte kal, her adım önemli.'}</p>
              </div>
              <button
                type="button"
                className="filter-button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="task-filter-panel"
              >
                <Icon name="tune" size={17} />
                Filtreler{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
              {filtersOpen && (
                <div className="filter-panel" id="task-filter-panel" ref={filterPanelRef} role="region" aria-label="Görev filtreleri">
                  <div className="filter-panel-heading">
                    <strong>Görevleri filtrele</strong>
                    <button type="button" className="text-button" onClick={clearFilters}>Temizle</button>
                  </div>
                  <label className="field-label" htmlFor="filter-category">Liste</label>
                  <select
                    id="filter-category"
                    className="text-input"
                    value={activeCategory || ''}
                    onChange={(event) => {
                      setActiveCategory(event.target.value || null)
                      setActiveFilter('all')
                    }}
                  >
                    <option value="">Tüm listeler</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <label className="field-label" htmlFor="filter-priority">Öncelik</label>
                  <select
                    id="filter-priority"
                    className="text-input"
                    value={activePriority}
                    onChange={(event) => setActivePriority(event.target.value)}
                  >
                    <option value="">Tüm öncelikler</option>
                    {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                  </select>
                  <label className="field-label" htmlFor="filter-date">Tarih</label>
                  <select
                    id="filter-date"
                    className="text-input"
                    value={activeDateFilter}
                    onChange={(event) => {
                      setActiveDateFilter(event.target.value)
                      if (event.target.value) setActiveFilter('all')
                    }}
                  >
                    <option value="">Tüm tarihler</option>
                    <option value="today">Bugün</option>
                    <option value="upcoming">Yaklaşan</option>
                    <option value="overdue">Geciken</option>
                    <option value="no-date">Tarih atanmamış</option>
                  </select>
                  <label className="field-label" htmlFor="sort-tasks">Sıralama</label>
                  <select
                    id="sort-tasks"
                    className="text-input"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <option value="date">Bitiş tarihine göre</option>
                    <option value="priority">Önceliğe göre</option>
                    <option value="title">Ada göre</option>
                  </select>
                </div>
              )}
            </div>

            {notice && (
              <div className={`notice${noticeIsError ? ' notice-error' : ''}`} role={noticeIsError ? 'alert' : 'status'}>
                {notice}
                <button type="button" onClick={() => setNotice('')} aria-label="Bildirimi kapat"><Icon name="close" size={15} /></button>
              </div>
            )}

            <div className="task-list">
              {visibleTasks.length > 0 ? visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={setDialogTask}
                  onDelete={handleDelete}
                />
              )) : (
                <div className="empty-state">
                  <span className="empty-icon"><Icon name="inbox" size={25} /></span>
                  <h3>{search ? 'Aramana uygun görev yok' : 'Burada şimdilik bir şey yok'}</h3>
                  <p>{search ? 'Farklı bir kelime deneyebilir veya aramayı temizleyebilirsin.' : 'Yeni bir görev ekleyerek ilk adımını at.'}</p>
                  {!search && (
                    <button type="button" className="button button-secondary" onClick={() => setDialogTask(null)}>
                      <Icon name="plus" size={17} /> Görev ekle
                    </button>
                  )}
                </div>
              )}
            </div>

            {visibleTasks.length > 0 && (
              <div className="list-footer">
                <span><span className="footer-check"><Icon name="check" size={13} /></span> Her görev, hedeflerine bir adım daha yakın.</span>
                <span>Ctrl + Enter ile yeni görev ekle</span>
              </div>
            )}
          </section>

          <footer className="app-footer"><span>punto<span className="brand-period">.</span></span> ile düzenli kal, kendine zaman ayır.</footer>
        </div>
      </main>

      {dialogTask !== undefined && (
        <TaskDialog
          task={dialogTask}
          onClose={closeDialog}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default TasksPage
