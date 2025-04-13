const { app, BrowserWindow, session, globalShortcut } = require('electron');
const { setPage } = require('./src/modules/discord-rpc');
const path = require('path');

const CONFIG = require('./src/config.json');
const ICON_PATH = path.join(__dirname, 'src/image/logo.ico');
const SPLASH_DURATION = CONFIG.splash ? 10250 : 0; // (in milliseconds)
// The splash screen will be faster in the future
// Disable splash in src/config.json if it gets annoying while testing

app.name = "AgarIO Hub"

let mainWindow = null;

function createSplashScreen() {
    const splash = new BrowserWindow({
        width: 800,
        height: 600,
        icon: ICON_PATH,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
        },
    });

    splash.loadFile(path.join(__dirname, 'src/image/splash.html'));
    splash.center();

    setTimeout(() => {
        splash.close();
        if (mainWindow) mainWindow.show();
    }, SPLASH_DURATION);
}

function createWindow() { // Main game window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: ICON_PATH,
        backgroundColor: '#080808',
        show: false,
        webPreferences: {
            contextIsolation: true,
            partition: 'persist:agariohub', // Token cookie is currently session only, I will fix this later on the back end
        },
    });

    mainWindow.removeMenu();
    mainWindow.loadURL('https://agariohub.xyz');

    mainWindow.webContents.on('did-navigate', (event, url) => { // Prevents accidentally going to userpage after logging in
        if (url.endsWith('/home')) {
            mainWindow.loadURL('https://agariohub.xyz');
        }
    });

    if (CONFIG.devtools) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    globalShortcut.register('F11', () => {
        if (mainWindow && mainWindow.isFocused()) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });
}

app.on('browser-window-created', (e, window) => {
    window.removeMenu();

    window.webContents.on('did-finish-load', () => { // Disables middle clicking links because it caused session issues
        window.webContents.executeJavaScript(`
            document.addEventListener('auxclick', (e) => {
                if (e.button === 1 && e.target.closest('a')) {
                    e.preventDefault();
                }
            }, true);
        `);
    });

    window.webContents.on('did-navigate', (event, url) => {
        setPage(url);
    });

    window.webContents.on('did-navigate-in-page', (event, url) => {
        setPage(url);
    });

    window.on('focus', () => {
        const url = window.webContents.getURL();
        setPage(url);
    });

    window.on('blur', () => {
        setPage(null);
    });
});

app.whenReady().then(() => {
    createWindow();
    createSplashScreen();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
