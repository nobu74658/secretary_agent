import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { Logger } from '@secretary-agent/shared';
import { Database } from '@secretary-agent/database';
import { AIEngine } from '@secretary-agent/ai-engine';
import { createEmailService } from '@secretary-agent/email-service';
import { Core } from '@secretary-agent/core';

// Initialize logger
const logger = new Logger('ElectronMain');

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let core: Core | null = null;

// App configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const APP_NAME = 'Secretary Agent';

// Initialize core services
async function initializeCore(): Promise<Core> {
  logger.info('Initializing core services...');
  
  const database = new Database({
    type: 'sqlite',
    filePath: path.join(app.getPath('userData'), 'secretary.db')
  });
  
  const aiEngine = new AIEngine({
    model: 'gpt-3.5-turbo'
  });
  
  // Email service is optional - only initialize if configured
  let emailService;
  if (process.env.EMAIL_PROVIDER) {
    emailService = createEmailService({
      provider: process.env.EMAIL_PROVIDER as 'gmail' | 'outlook',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    });
  }
  
  const coreInstance = new Core({
    database,
    aiEngine,
    emailService,
    enableEmailIntegration: !!emailService
  });
  
  await coreInstance.initialize();
  logger.info('Core services initialized successfully');
  
  return coreInstance;
}

// Create main window
function createMainWindow(): void {
  logger.info('Creating main window');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: APP_NAME,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow loading local files
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false // Don't show until ready
  });

  // Load the web UI
  const uiPath = path.join(__dirname, '../../web-ui/dist/index.html');
  logger.info('Loading UI from path', { uiPath });
  
  mainWindow.loadFile(uiPath).catch(err => {
    logger.error('Failed to load UI file: ' + err.message + ' at path: ' + uiPath);
  });
  
  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();
  
  // Log web contents events
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Web contents finished loading');
  });
  
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    logger.error('Web contents failed to load: ' + errorDescription + ' (code: ' + errorCode + ')');
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      logger.info('Main window shown');
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    logger.info('Main window closed');
  });
}

// Create system tray
function createTray(): void {
  logger.info('Creating system tray');
  
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  );
  
  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createMainWindow();
        }
      }
    },
    {
      label: 'Quick Task',
      click: () => {
        // Open quick task dialog
        logger.info('Quick task requested');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Click to show/hide window
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// IPC handlers
function setupIpcHandlers(): void {
  logger.info('Setting up IPC handlers');
  
  // Get user data
  ipcMain.handle('get-user', async (_event, userId: string) => {
    if (!core) return null;
    return core.getUser(userId);
  });
  
  // Create task
  ipcMain.handle('create-task', async (_event, data: {
    userId: string;
    description: string;
  }) => {
    if (!core) throw new Error('Core not initialized');
    return core.createSmartTask(data.userId, data.description);
  });
  
  // Get daily briefing
  ipcMain.handle('get-daily-briefing', async (_event, userId: string) => {
    if (!core) throw new Error('Core not initialized');
    return core.getDailyBriefing(userId);
  });
  
  // Process emails
  ipcMain.handle('process-emails', async (_event, userId: string) => {
    if (!core) throw new Error('Core not initialized');
    return core.processIncomingEmails(userId);
  });
}

// App event handlers
app.whenReady().then(async () => {
  logger.info('App ready');
  
  try {
    // Initialize core services
    core = await initializeCore();
    
    // Create UI elements
    createMainWindow();
    createTray();
    setupIpcHandlers();
    
    // Set app menu
    const menu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'New Task',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              mainWindow?.webContents.send('new-task');
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
          { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' }
        ]
      }
    ]);
    
    Menu.setApplicationMenu(menu);
    
  } catch (error) {
    logger.error('Failed to initialize app', error as Error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', async () => {
  logger.info('App quitting...');
  
  if (core) {
    try {
      await core.shutdown();
      logger.info('Core services shut down');
    } catch (error) {
      logger.error('Error shutting down core', error as Error);
    }
  }
});

// Handle certificate errors
app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
  if (isDevelopment) {
    // Ignore certificate errors in development
    event.preventDefault();
    callback(true);
  } else {
    // Use default behavior in production
    callback(false);
  }
});

// Export for testing
export { createMainWindow, initializeCore };