import { Logger, generateId } from '@secretary-agent/shared';

export interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'smtp';
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: Attachment[];
  sentAt?: Date;
  receivedAt?: Date;
}

export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export class EmailService {
  private logger: Logger;
  private _config: EmailConfig;
  private emails: Map<string, Email> = new Map();

  constructor(config: EmailConfig) {
    this.logger = new Logger('EmailService');
    this._config = config;
    this.logger.info('Email service initialized', { provider: config.provider });
  }

  async connect(): Promise<void> {
    this.logger.info('Connecting to email provider...', { provider: this._config.provider });
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 500));
    this.logger.info('Email service connected');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from email provider...');
    await new Promise(resolve => setTimeout(resolve, 200));
    this.logger.info('Email service disconnected');
  }

  async sendEmail(email: Omit<Email, 'id' | 'sentAt'>): Promise<Email> {
    this.logger.info('Sending email', { to: email.to, subject: email.subject });
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sentEmail: Email = {
      ...email,
      id: generateId(),
      sentAt: new Date()
    };
    
    this.emails.set(sentEmail.id, sentEmail);
    this.logger.info('Email sent successfully', { emailId: sentEmail.id });
    
    return sentEmail;
  }

  async fetchEmails(since?: Date): Promise<Email[]> {
    this.logger.info('Fetching emails', { since: since?.toISOString() });
    
    // Simulate fetching
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock some emails
    const mockEmails: Email[] = [
      {
        id: generateId(),
        from: 'boss@company.com',
        to: ['user@company.com'],
        subject: 'Urgent: Project Update Required',
        body: 'Please provide an update on the Q4 project by EOD.',
        receivedAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: generateId(),
        from: 'calendar@company.com',
        to: ['user@company.com'],
        subject: 'Meeting Reminder: Team Standup',
        body: 'You have a meeting scheduled for tomorrow at 10 AM.',
        receivedAt: new Date(Date.now() - 7200000) // 2 hours ago
      }
    ];
    
    // Store mock emails
    for (const email of mockEmails) {
      this.emails.set(email.id, email);
    }
    
    // Filter by date if provided
    let emails = Array.from(this.emails.values());
    if (since) {
      emails = emails.filter(e => 
        (e.receivedAt && e.receivedAt > since) || 
        (e.sentAt && e.sentAt > since)
      );
    }
    
    this.logger.info('Emails fetched', { count: emails.length });
    return emails;
  }

  async getEmail(emailId: string): Promise<Email | null> {
    return this.emails.get(emailId) || null;
  }

  async createDraft(email: Omit<Email, 'id' | 'sentAt' | 'receivedAt'>): Promise<Email> {
    this.logger.info('Creating draft', { subject: email.subject });
    
    const draft: Email = {
      ...email,
      id: generateId()
    };
    
    this.emails.set(draft.id, draft);
    this.logger.info('Draft created', { draftId: draft.id });
    
    return draft;
  }

  async searchEmails(query: string): Promise<Email[]> {
    this.logger.info('Searching emails', { query });
    
    const results = Array.from(this.emails.values()).filter(email => {
      const searchableText = `${email.subject} ${email.body} ${email.from}`.toLowerCase();
      return searchableText.includes(query.toLowerCase());
    });
    
    this.logger.info('Search completed', { resultCount: results.length });
    return results;
  }
}

// Export a default instance (requires configuration)
export function createEmailService(config: EmailConfig): EmailService {
  return new EmailService(config);
}