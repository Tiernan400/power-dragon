const { app, BrowserWindow, Menu, ipcMain, nativeTheme } = require('electron')
const path = require('path')
const remoteMain = require('@electron/remote/main')
const { spawn } = require('node:child_process')
const fs = require('fs')
let settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json')))
let shells = []
remoteMain.initialize()
nativeTheme.themeSource = settings.personalisation.theme;
Menu.setApplicationMenu(null)
const createWindow = () => {
    const win = new BrowserWindow({
        frame: false,
        width: 896,
        height: 504,
        minWidth: 600,
        minHeight: 338,
        icon: path.join(__dirname, 'cydli.ico'),
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    if (settings.personalisation.startMaximised == true) win.maximize();
    win.once('ready-to-show', () => {
        win.show()
    })

    ipcMain.on('minimise', (event) => {
        win.minimize()
    })
    ipcMain.on('maximise', (event) => {
        win.isMaximized()?win.unmaximize():win.maximize()
    })
    ipcMain.on('close', (event) => {
        win.close()
    })
    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        win.setTitle(title)
    })
    ipcMain.on('set-theme', (event, theme) => {
        nativeTheme.themeSource = theme;
    })
    ipcMain.on('activate-engine', (event, from, params) => {
        shells.push(spawn(path.join(__dirname, "engine/run-engine/build/x86_64-pc-windows-msvc/debug/install/run-engine.exe"), params))
        var i = shells.length - 1;
        shells[i].on('error', (e) => console.log("Error:", e))
        shells[i].stdout.on('data', (output) => {
            output = output.toString().replace(/'/g, '"').replace(/Move.from_uci/g, '')
            .replace(/PovScore\(Cp\(/g, '')
            .replace(/\), WHITE\)/g, ', "to": "WHITE"').replace(/\), BLACK\)/g, ', "to": "BLACK"')
            .replace(/\("/g, '"').replace(/"\)/g, '"').replace(/"score": \+/g, '"score": ')
            .replace(/True/g, 'true')
            if (output.includes('} {')) {
                output = output.split('} {')
                for (let i = 0; i < output.length; i++) {
                    if (output[i].charAt(0) != '{') output[i] = '{'+output[i];
                    output[i] = output[i].replace(/} /g, '}')
                    if (output[i].charAt(output[i].length - 1) != '}') output[i] += '}';
                    if (output[i].includes('Mate')) {
                        var s = output[i].split(`Mate(${output[i].includes('Mate(+')?'+':'-'}`)
                        var w = output[i].includes('Mate(+')?'currentplayer':'opponent';
                        s = s[1].split(',')[0]
                        var e = '"M' + s + '", "winning": "' + w + '"';
                        output[i] = output[i].replace(`PovScore(Mate(${output[i].includes('Mate(+')?'+':'-'}${s}`, e)
                    }
                    if (!win.isDestroyed()) win.webContents.send('engine-output', from, output[i])
                }
            } else {
                if (output.includes('Mate')) {
                    var s = output.split(`Mate(${output.includes('Mate(+')?'+':'-'}`)
                    var w = output.includes('Mate(+')?'currentplayer':'opponent';
                    s = s[1].split(',')[0]
                    var e = '"M' + s + '", "winning": "' + w + '"';
                    output = output.replace(`PovScore(Mate(${output.includes('Mate(+')?'+':'-'}${s}`, e)
                }
                if (!win.isDestroyed()) win.webContents.send('engine-output', from, output)
            }
        })
        shells[i].on('close', (code) => {
            shells.splice(0, 1)
        })
    })
    ipcMain.on('deactivate-engine', (event) => {
        if (shells.length > 0 && shells[0].killed == false) {
            shells[0].kill()
        }
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