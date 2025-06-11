// Basic integration test to verify packages work together
const { Logger } = require('./packages/shared/dist/index.js');
const { Database } = require('./packages/database/dist/index.js');
const { AIEngine } = require('./packages/ai-engine/dist/index.js');
const { EmailService } = require('./packages/email-service/dist/index.js');
const { TaskService } = require('./packages/task-service/dist/index.js');
const { Core } = require('./packages/core/dist/index.js');

async function testIntegration() {
  const logger = new Logger('Test');
  logger.info('Starting integration test...');

  try {
    // Test Database
    const database = new Database({ type: 'sqlite', filePath: ':memory:' });
    await database.connect();
    const user = await database.createUser('test@example.com', 'Test User');
    logger.info('Database test passed', { userId: user.id });

    // Test AI Engine
    const aiEngine = new AIEngine();
    const analysis = await aiEngine.processText('This is a test email');
    logger.info('AI Engine test passed', { analysis });

    // Test Email Service
    const emailService = new EmailService({ type: 'imap', host: 'test' });
    await emailService.connect();
    logger.info('Email Service test passed');

    // Test Task Service
    const taskService = new TaskService({ database });
    const task = await taskService.createTask(user.id, 'Test Task', 'Test Description');
    logger.info('Task Service test passed', { taskId: task.id });

    // Test Core integration
    const core = new Core({
      database,
      aiEngine,
      emailService,
      taskService
    });
    await core.initialize();
    logger.info('Core integration test passed');

    // Cleanup
    await database.disconnect();
    await emailService.disconnect();

    logger.info('All integration tests passed! ✅');
    return true;
  } catch (error) {
    logger.error('Integration test failed', { error: error.message });
    return false;
  }
}

// Run the test
testIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });