const { app, BrowserWindow, session, globalShortcut } = require('electron');
const { updateActivity, pageToActivity } = require('./src/modules/discord-rpc');
const path = require('path');

const CONFIG = require('./src/config.json');
const ICON_PATH = path.join(__dirname, 'src/image/logo.ico');
const SPLASH_DURATION = CONFIG.splash ? 10250 : 0; // (in milliseconds)
// The splash screen will be faster in the future
// Disable splash in src/config.json if it gets annoying while testing

app.name = "AgarIO Hub"

let mainWindow = null;
let currentPage = null;

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

    // Rich presence currently updates on every navigation but I'll probably change it to update every 5 seconds
    // Could fix the idle detection issue and any rate limiting issues
    window.webContents.on('did-navigate', (event, url) => {
        currentPage = url;
        pageToActivity(url);
    });

    window.webContents.on('did-navigate-in-page', (event, url) => {
        currentPage = url;
        pageToActivity(url);
    });

    window.on('focus', () => {
        const currentUrl = window.webContents.getURL();
        if (currentUrl !== currentPage && currentUrl.includes('agariohub.xyz')) {
            pageToActivity(currentUrl, true);
        }
        currentPage = currentUrl;
    });

    window.on('blur', () => {
        currentPage = null; 
        // This idle detection SUCKS
        /*setTimeout(() => {
            if (!currentPage) {
                updateActivity({
                    details: 'Idle',
                    startTimestamp: new Date(),
                    largeImageKey: 'logo',
                    largeImageText: 'AgarIO Hub',
                    instance: false
                });
            }
        }, 5000);*/
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
