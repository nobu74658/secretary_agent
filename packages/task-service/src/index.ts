import { Logger, Task, delay } from '@secretary-agent/shared';
import { Database } from '@secretary-agent/database';

export interface TaskServiceConfig {
  database: Database;
  enableNotifications?: boolean;
}

export interface TaskNotification {
  taskId: string;
  userId: string;
  type: 'due_soon' | 'overdue' | 'reminder';
  message: string;
  timestamp: Date;
}

export class TaskService {
  private logger: Logger;
  private database: Database;
  private enableNotifications: boolean;
  private notifications: TaskNotification[] = [];

  constructor(config: TaskServiceConfig) {
    this.logger = new Logger('TaskService');
    this.database = config.database;
    this.enableNotifications = config.enableNotifications ?? true;
    this.logger.info('Task service initialized', { 
      enableNotifications: this.enableNotifications 
    });
  }

  async createTask(
    userId: string, 
    title: string, 
    description: string,
    dueDate?: Date
  ): Promise<Task> {
    this.logger.info('Creating task', { userId, title });
    
    const task = await this.database.createTask(userId, title, description);
    
    if (dueDate) {
      const updatedTask = await this.database.updateTask(task.id, { dueDate });
      if (updatedTask) {
        this.scheduleNotifications(updatedTask, userId);
        return updatedTask;
      }
    }
    
    return task;
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.database.getTask(taskId);
  }

  async getUserTasks(userId: string, includeCompleted: boolean = true): Promise<Task[]> {
    this.logger.debug('Getting user tasks', { userId, includeCompleted });
    
    const tasks = await this.database.getUserTasks(userId);
    
    if (!includeCompleted) {
      return tasks.filter(task => !task.completed);
    }
    
    return tasks;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    this.logger.info('Updating task', { taskId, updates });
    
    const updatedTask = await this.database.updateTask(taskId, updates);
    
    if (updatedTask && updates.dueDate) {
      this.scheduleNotifications(updatedTask, updatedTask.userId);
    }
    
    return updatedTask;
  }

  async completeTask(taskId: string): Promise<Task | null> {
    this.logger.info('Completing task', { taskId });
    
    return this.database.updateTask(taskId, { 
      completed: true
    });
  }

  async getUpcomingTasks(userId: string, days: number = 7): Promise<Task[]> {
    this.logger.debug('Getting upcoming tasks', { userId, days });
    
    const tasks = await this.getUserTasks(userId, false);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return tasks.filter(task => 
      task.dueDate && 
      task.dueDate <= cutoffDate &&
      task.dueDate >= new Date()
    ).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    this.logger.debug('Getting overdue tasks', { userId });
    
    const tasks = await this.getUserTasks(userId, false);
    const now = new Date();
    
    return tasks.filter(task => 
      task.dueDate && 
      task.dueDate < now
    );
  }

  private scheduleNotifications(task: Task, userId: string): void {
    if (!this.enableNotifications || !task.dueDate) return;
    
    this.logger.debug('Scheduling notifications for task', { taskId: task.id });
    
    // Create notifications (in a real app, these would be scheduled)
    const dueSoonNotification: TaskNotification = {
      taskId: task.id,
      userId,
      type: 'due_soon',
      message: `Task "${task.title}" is due soon`,
      timestamp: new Date(task.dueDate.getTime() - 86400000) // 1 day before
    };
    
    this.notifications.push(dueSoonNotification);
  }

  async getNotifications(userId: string): Promise<TaskNotification[]> {
    return this.notifications.filter(n => n.userId === userId);
  }

  async processRecurringTasks(): Promise<void> {
    this.logger.info('Processing recurring tasks');
    // This would handle recurring task creation
    await delay(100);
    this.logger.info('Recurring tasks processed');
  }

  async generateTaskReport(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    upcomingThisWeek: number;
  }> {
    this.logger.info('Generating task report', { userId });
    
    const allTasks = await this.getUserTasks(userId);
    const overdueTasks = await this.getOverdueTasks(userId);
    const upcomingTasks = await this.getUpcomingTasks(userId, 7);
    
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.completed).length,
      pending: allTasks.filter(t => !t.completed).length,
      overdue: overdueTasks.length,
      upcomingThisWeek: upcomingTasks.length
    };
  }
}

// Export factory function
export function createTaskService(database: Database): TaskService {
  return new TaskService({ database });
}