import { Logger, User, Task } from '@secretary-agent/shared';
import { Database } from '@secretary-agent/database';
import { AIEngine } from '@secretary-agent/ai-engine';
import { EmailService, Email } from '@secretary-agent/email-service';
import { TaskService } from '@secretary-agent/task-service';

export interface CoreConfig {
  database: Database;
  aiEngine: AIEngine;
  emailService?: EmailService;
  enableEmailIntegration?: boolean;
}

export interface ProcessedEmail {
  email: Email;
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction?: string;
  createdTask?: Task;
}

export class Core {
  private logger: Logger;
  private database: Database;
  private aiEngine: AIEngine;
  private emailService?: EmailService;
  private taskService: TaskService;
  private isInitialized: boolean = false;

  constructor(config: CoreConfig) {
    this.logger = new Logger('Core');
    this.database = config.database;
    this.aiEngine = config.aiEngine;
    this.emailService = config.emailService;
    this.taskService = new TaskService({ database: this.database });
    
    this.logger.info('Core initialized');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing core services...');
    
    try {
      // Connect database
      await this.database.connect();
      
      // Connect email service if available
      if (this.emailService) {
        await this.emailService.connect();
      }
      
      this.isInitialized = true;
      this.logger.info('Core services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize core services', error as Error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down core services...');
    
    if (this.emailService) {
      await this.emailService.disconnect();
    }
    
    await this.database.disconnect();
    
    this.isInitialized = false;
    this.logger.info('Core services shut down successfully');
  }

  // User management
  async createUser(email: string, name: string): Promise<User> {
    this.ensureInitialized();
    this.logger.info('Creating user', { email, name });
    
    const existingUser = await this.database.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    return this.database.createUser(email, name);
  }

  async getUser(userId: string): Promise<User | null> {
    this.ensureInitialized();
    return this.database.getUser(userId);
  }

  // Task management with AI
  async createSmartTask(
    userId: string,
    description: string
  ): Promise<Task> {
    this.ensureInitialized();
    this.logger.info('Creating smart task', { userId });
    
    // Use AI to process the description
    const aiResponse = await this.aiEngine.processText(
      `Extract task title and details from: ${description}`
    );
    
    // For this mock, we'll just use the description as is
    // In a real implementation, we would parse aiResponse.text
    const title = description.split('\n')[0] || description;
    this.logger.debug('AI processing complete', { confidence: aiResponse.confidence });
    
    return this.taskService.createTask(userId, title, description);
  }

  // Email processing
  async processIncomingEmails(userId: string): Promise<ProcessedEmail[]> {
    this.ensureInitialized();
    
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }
    
    this.logger.info('Processing incoming emails', { userId });
    
    const emails = await this.emailService.fetchEmails();
    const processedEmails: ProcessedEmail[] = [];
    
    for (const email of emails) {
      // Use AI to classify email
      const classification = await this.aiEngine.classifyEmail(
        `${email.subject}\n${email.body}`
      );
      
      const processedEmail: ProcessedEmail = {
        email,
        category: classification.category,
        priority: classification.priority,
        suggestedAction: classification.suggestedAction
      };
      
      // Automatically create tasks for high-priority emails
      if (classification.priority === 'high' && classification.suggestedAction) {
        const task = await this.taskService.createTask(
          userId,
          `Email: ${email.subject}`,
          `From: ${email.from}\n\n${email.body}`
        );
        processedEmail.createdTask = task;
      }
      
      processedEmails.push(processedEmail);
    }
    
    this.logger.info('Emails processed', { count: processedEmails.length });
    return processedEmails;
  }

  // AI-powered insights
  async getDailyBriefing(userId: string): Promise<{
    summary: string;
    taskReport: any;
    suggestions: string[];
  }> {
    this.ensureInitialized();
    this.logger.info('Generating daily briefing', { userId });
    
    const taskReport = await this.taskService.generateTaskReport(userId);
    const upcomingTasks = await this.taskService.getUpcomingTasks(userId, 1);
    const overdueTasks = await this.taskService.getOverdueTasks(userId);
    
    // Generate AI suggestions
    const allTasks = await this.taskService.getUserTasks(userId);
    const suggestions = await this.aiEngine.generateTaskSuggestions(allTasks);
    
    // Create summary
    let summary = `Good morning! Here's your daily briefing:\n\n`;
    summary += `📊 Task Overview:\n`;
    summary += `- ${taskReport.pending} pending tasks\n`;
    summary += `- ${taskReport.completed} completed tasks\n`;
    
    if (overdueTasks.length > 0) {
      summary += `\n⚠️ You have ${overdueTasks.length} overdue task(s)\n`;
    }
    
    if (upcomingTasks.length > 0) {
      summary += `\n📅 Tasks due today:\n`;
      upcomingTasks.forEach(task => {
        summary += `- ${task.title}\n`;
      });
    }
    
    return {
      summary,
      taskReport,
      suggestions
    };
  }

  // Smart scheduling
  async suggestOptimalTaskTime(
    userId: string,
    _taskDescription: string
  ): Promise<Date> {
    this.ensureInitialized();
    this.logger.info('Suggesting optimal task time', { userId });
    
    // Get user's current tasks
    const tasks = await this.taskService.getUserTasks(userId, false);
    
    // Simple algorithm: find a free slot
    // In a real implementation, this would be much more sophisticated
    const now = new Date();
    const suggestedTime = new Date(now);
    suggestedTime.setHours(suggestedTime.getHours() + 2);
    
    // Check if there's a conflict
    const hasConflict = tasks.some(task => {
      if (!task.dueDate) return false;
      const diff = Math.abs(task.dueDate.getTime() - suggestedTime.getTime());
      return diff < 3600000; // Within 1 hour
    });
    
    if (hasConflict) {
      suggestedTime.setHours(suggestedTime.getHours() + 1);
    }
    
    return suggestedTime;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Core services not initialized. Call initialize() first.');
    }
  }
}

// Export factory function
export function createCore(config: CoreConfig): Core {
  return new Core(config);
}