import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Define types
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
}

interface AppState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  user: {
    name: string;
    email: string;
  } | null;
}

// Main App component
class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tasks: [],
      loading: true,
      error: null,
      user: null
    };
  }

  componentDidMount() {
    // Simulate loading data
    setTimeout(() => {
      this.setState({
        loading: false,
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        tasks: [
          {
            id: '1',
            title: 'Review project proposal',
            description: 'Review and provide feedback on Q4 project proposal',
            completed: false,
            dueDate: new Date(Date.now() + 86400000)
          },
          {
            id: '2',
            title: 'Team meeting',
            description: 'Weekly team sync meeting',
            completed: false,
            dueDate: new Date(Date.now() + 3600000)
          }
        ]
      });
    }, 1000);
  }

  toggleTask = (taskId: string) => {
    this.setState(prevState => ({
      tasks: prevState.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  render() {
    const { tasks, loading, error, user } = this.state;

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Secretary Agent...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      );
    }

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
      <div className="app">
        <header className="app-header">
          <h1>Secretary Agent</h1>
          {user && (
            <div className="user-info">
              <span>{user.name}</span>
            </div>
          )}
        </header>

        <main className="app-main">
          <div className="dashboard">
            <section className="stats-section">
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <p className="stat-number">{tasks.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number">{pendingTasks.length}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-number">{completedTasks.length}</p>
              </div>
            </section>

            <section className="tasks-section">
              <h2>Your Tasks</h2>
              
              <div className="task-group">
                <h3>Pending Tasks</h3>
                {pendingTasks.length === 0 ? (
                  <p className="no-tasks">No pending tasks</p>
                ) : (
                  <ul className="task-list">
                    {pendingTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={this.toggleTask}
                      />
                    ))}
                  </ul>
                )}
              </div>

              <div className="task-group">
                <h3>Completed Tasks</h3>
                {completedTasks.length === 0 ? (
                  <p className="no-tasks">No completed tasks</p>
                ) : (
                  <ul className="task-list">
                    {completedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={this.toggleTask}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="actions-section">
              <button className="primary-button">
                Add New Task
              </button>
              <button className="secondary-button">
                Check Emails
              </button>
              <button className="secondary-button">
                Generate Report
              </button>
            </section>
          </div>
        </main>
      </div>
    );
  }
}

// TaskItem component
interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const formatDueDate = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 0) return 'Overdue';
    if (hours < 24) return `Due in ${hours} hours`;
    return `Due in ${Math.floor(hours / 24)} days`;
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="task-checkbox"
      />
      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        <p className="task-description">{task.description}</p>
        {task.dueDate && (
          <span className="task-due-date">{formatDueDate(task.dueDate)}</span>
        )}
      </div>
    </li>
  );
};

// Create root and render app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);