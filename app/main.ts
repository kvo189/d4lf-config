import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as ini from 'ini';
import * as yaml from 'js-yaml'
import { buildMenu } from './menu/menu';
import { readProfileFiles, writeYamlFile } from './yaml';
import { openFile } from './openFile';

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;
  console.log('window size', size)
  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}
// params.ini path
const settingsPath = path.join(app.getPath('home'), '.d4lf', 'params.ini');

// profiles directory path
const profilesDir = path.join(app.getPath('home'), '.d4lf', 'profiles');

// Listen for file read request
ipcMain.handle('read-config', async () => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    const parsedData = ini.parse(data);
    return { path: settingsPath, data: parsedData };
  } catch (error) {
    console.error('Read Error:', error);
    throw error;
  }
});

// Listen for file write request
ipcMain.handle('write-config', async (_, data) => {
  try {
    fs.writeFileSync(settingsPath, data, 'utf8');
  } catch (error) {
    console.error('Write Error:', error);
    throw error;
  }
});

ipcMain.handle('list-profile-files', async () => {
  try {
    const files = fs.readdirSync(profilesDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml')); // Only YAML files
    return files;
  } catch (error) {
    console.error('Directory Read Error:', error);
    throw error;
  }
});

// IPC event handler
ipcMain.handle('read-profiles', async () => {
  return await readProfileFiles(profilesDir);
});

ipcMain.handle('write-profile', async (event, fileName, yamlString) => {
  try {
    await writeYamlFile(path.join(profilesDir, fileName), yamlString);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('save-profile-name', async (event, oldName: string | undefined, newName: string) => {
  const oldFilePath = path.join(profilesDir, `${oldName}.yaml`); // Adjust file extension/format if needed
  const newFilePath = path.join(profilesDir, `${newName}.yaml`);

  try {
    if (!oldName) {
      await fs.promises.writeFile(newFilePath, ''); // Create an empty file or with default content
      return;
    }

    // Check if the old file exists
    await fs.promises.access(oldFilePath);

    // Rename the file
    await fs.promises.rename(oldFilePath, newFilePath);
  } catch (error) {
    if ((error as any)?.code === 'ENOENT') {
      // File does not exist, create a new file
      await fs.promises.writeFile(newFilePath, ''); // Create an empty file or with default content
    } else {
      throw error; // Rethrow other errors to be handled in the renderer process
    }
  }
});

ipcMain.handle('delete-profile', async (event, profileName) => {
  const profilePath = path.join(profilesDir, `${profileName}.yaml`); // Assuming profiles are stored as JSON files
  return await fs.promises.unlink(profilePath); // Delete the profile file
});

ipcMain.handle('launch-d4lf', async (event) => {
  try {
    let d4lfPath = path.resolve('.', 'd4lf.exe');
    const portablePath = process.env.PORTABLE_EXECUTABLE_DIR;
    if (portablePath) {
      d4lfPath = path.join(portablePath, 'd4lf.exe');
    }
    // Check if the file exists
    await openFile(d4lfPath);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('open-saved-file', async (event, fileName) => {
  try {
    await openFile(path.join(profilesDir, fileName));
    return { success: true };
  } catch (error) {
    throw error;
  }
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(() => {
    createWindow();
    // console.log(Menu.getApplicationMenu())
    buildMenu();
  }, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
