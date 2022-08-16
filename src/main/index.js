'use strict'

import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron'
import { autoUpdater } from 'electron-updater'

import Store from 'electron-store'
import path from 'path'

const store = new Store()
console.log(store)
console.log('轻应用配置', store.get('lappConfig'))
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 650,
    height: 652,
    maximizable: false,
    useContentSize: true,
    resizable: true,
    frame: true, // 无边框
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    },
    icon: path.join('extraResources/images/app-icon2.ico')
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  console.log('***---appPath', app.getAppPath())
}

app.on('ready', function () {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
  autoUpdater.checkForUpdates()

  ipcMain.on('show-context-menu', (event) => {
    createMenu(event)
  })

  globalShortcut.register('CommandOrControl+i', () => {
    console.log('you pressed ctrl+i')
    mainWindow.webContents.openDevTools()
  })
})

// 顶部菜单
function createMenu (event) {
  let template = [
    {
      label: '设置',
      submenu: [
        {
          label: '输出目录',
          click: function () {
            event.sender.send('context-menu-command', 'setConfig')
          }
        }
      ]
    },
    {
      label: '操作',
      submenu: [
        {
          label: '轻应用工具',
          click: function () {
            event.sender.send('context-menu-command', 'lapp')
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '使用说明',
          click: function () {
            event.sender.send('context-menu-command', 'openDoc')
          }
        },
        {
          label: 'ADB指令',
          click: function () {
            event.sender.send('context-menu-command', 'openAdbDoc')
          }
        }
      ]
    }
  ]

  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available.')
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  console.log(logMessage)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded')
})
