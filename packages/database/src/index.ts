import { Logger, User, Task, generateId } from '@secretary-agent/shared';

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres';
  connectionString?: string;
  filePath?: string;
}

export class Database {
  private logger: Logger;
  private _config: DatabaseConfig;
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();

  constructor(config: DatabaseConfig) {
    this.logger = new Logger('Database');
    this._config = config;
    this.logger.info('Database initialized', { type: config.type });
  }

  async connect(): Promise<void> {
    this.logger.info('Connecting to database...', { config: this._config.type });
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.info('Database connected');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from database...');
    await new Promise(resolve => setTimeout(resolve, 50));
    this.logger.info('Database disconnected');
  }

  // User operations
  async createUser(email: string, name: string): Promise<User> {
    const user: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    this.logger.debug('User created', { userId: user.id });
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Task operations
  async createTask(userId: string, title: string, description: string): Promise<Task> {
    const task: Task = {
      id: generateId(),
      title,
      description,
      completed: false,
      userId
    };
    this.tasks.set(task.id, task);
    this.logger.debug('Task created', { taskId: task.id });
    return task;
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    const userTasks: Task[] = [];
    for (const task of this.tasks.values()) {
      if (task.userId === userId) {
        userTasks.push(task);
      }
    }
    return userTasks;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(taskId, updatedTask);
    this.logger.debug('Task updated', { taskId });
    return updatedTask;
  }
}

// Export a singleton instance for convenience
export const defaultDatabase = new Database({ type: 'sqlite', filePath: './secretary.db' });