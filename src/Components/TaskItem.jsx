import Icon from './Icon.jsx'

const categoryClasses = {
  İş: 'work',
  Eğitim: 'learning',
  Kişisel: 'personal',
}

function getDateLabel(date) {
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(`${date}T00:00:00`)
  const difference = Math.round((dueDate - today) / 86400000)

  if (difference < 0) return { text: 'Gecikti', className: 'overdue' }
  if (difference === 0) return { text: 'Bugün', className: 'today' }
  if (difference === 1) return { text: 'Yarın', className: 'tomorrow' }

  return {
    text: new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(dueDate),
    className: '',
  }
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const dateLabel = getDateLabel(task.date)

  return (
    <article className={`task-row${task.completed ? ' is-completed' : ''}`}>
      <button
        className="task-checkbox"
        type="button"
        aria-label={task.completed ? 'Görevi tamamlanmadı olarak işaretle' : 'Görevi tamamlandı olarak işaretle'}
        aria-pressed={task.completed}
        onClick={() => onToggle(task.id)}
      >
        {task.completed && <Icon name="check" size={15} />}
      </button>
      <div className="task-copy">
        <h3>{task.title}</h3>
        {task.notes && <p>{task.notes}</p>}
      </div>
      <span className={`category-tag ${categoryClasses[task.category]}`}>
        <span className="category-dot" />
        {task.category}
      </span>
      {dateLabel ? (
        <span className={`task-date ${dateLabel.className}`}>
          <Icon name="calendar" size={15} />
          {dateLabel.text}
        </span>
      ) : (
        <span className="task-date no-date">Tarih yok</span>
      )}
      <span className={`priority-tag ${task.priority.toLowerCase()}`}>
        <span className="priority-dot" />
        {task.priority}
      </span>
      <div className="task-actions">
        <button
          type="button"
          className="icon-button"
          aria-label={`${task.title} görevini düzenle`}
          onClick={() => onEdit(task)}
        >
          <Icon name="edit" size={17} />
        </button>
        <button
          type="button"
          className="icon-button delete-button"
          aria-label={`${task.title} görevini sil`}
          onClick={() => onDelete(task.id)}
        >
          <Icon name="trash" size={17} />
        </button>
      </div>
    </article>
  )
}

export default TaskItem
