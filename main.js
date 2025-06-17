const { app, BrowserWindow, Menu, ipcMain, nativeTheme, ipcRenderer, dialog } = require('electron')
const remoteMain = require('@electron/remote/main')
const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')
let pageLoaded = false;
let toExecuteError = false;
const PATH = {
    settings: path.join(app.getPath('userData'), 'settings.json'),
    weights: path.join(app.getPath('userData'), 'weights.json'),
    preload: path.join(__dirname, 'preload.js'),
    server: path.join(__dirname, 'server.js')
}
if (!fs.existsSync(PATH.settings)) {
    fs.writeFileSync(PATH.settings, JSON.stringify({
        personalisation: {
            theme: "system",
            startMaximised: false,
            server: false,
            enableHardwareAcceleration: true
        },
        boats: [],
        boat: -1
    }))
}
if (!fs.existsSync(PATH.weights)) fs.writeFileSync(PATH.weights, JSON.stringify([]))
let settings = JSON.parse(fs.readFileSync(PATH.settings))
if (typeof settings.boat == 'object') {
    settings.boats = new Array()
    settings.boat = -1
    fs.writeFileSync(PATH.settings, JSON.stringify(settings))
}
nativeTheme.themeSource = settings.personalisation.theme;
if (settings.personalisation.enableHardwareAcceleration == false) app.disableHardwareAcceleration()

remoteMain.initialize()
Menu.setApplicationMenu(null)
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        show: false,
        icon: 'logo.ico',
        webPreferences: {
            sandbox: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: PATH.preload
        }
    })
    if (settings.personalisation.server == true) {
        const ps = fork(PATH.server, [], { silent: true })
        let serverError = null;
        ps.stdout.on('data', (data) => {
            serverError = JSON.stringify({ error: data.toString().replace(/\r/g, '').replace(/\n/g, '') })
            if (pageLoaded == true) {
                win.webContents.executeJavaScript(`window.serverError = ${serverError};`)
            }
            else { toExecuteError = true; }
        })
    }
    if (settings.personalisation.startMaximised == true) win.maximize()
    win.once('ready-to-show', () => {
        win.show()
    })

    ipcMain.on('loaded', (event) => {
        pageLoaded = true;
        if (settings.personalisation.server == false) {
            win.webContents.executeJavaScript(`window.serverError = 'USRDBLD';`)
        } else if (toExecuteError == true) {
            win.webContents.executeJavaScript(`window.serverError = ${serverError};`)
        }
    })
    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        win.setTitle(title)
    })
    ipcMain.on('alert', (event, msg, type = 'none') => {
        dialog.showMessageBox(win, {
            title: 'App Alert',
            message: msg,
            type: type,
            minimizable: false
        })
    })
    ipcMain.on('confirm', (event, msg, callback = `console.log(\${c})`) => {
        var c = dialog.showMessageBoxSync(win, {
            title: 'Action Confirmation',
            message: msg,
            buttons: ['Cancel', 'Yes'],
            minimizable: false
        })
        win.webContents.executeJavaScript(callback.replace(/\${c}/g, c))
    })
    ipcMain.on('set-theme', (event, theme) => {
        nativeTheme.themeSource = theme;
    })

    win.loadFile('index.html')
    remoteMain.enable(win.webContents)
}
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})