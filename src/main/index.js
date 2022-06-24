'use strict'

import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron'
import { autoUpdater } from 'electron-updater'

import Store from 'electron-store'

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

let mainWindow, newWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 662,
    width: 820,
    maximizable: false,
    useContentSize: true,
    resizable: true,
    // frame: false,   //无边框
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  console.log('***---appPath', app.getAppPath())
}

app.on('ready', createWindow)

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
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()

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
      label: 'log',
      click: function () {
        console.log('new window')
        createNewWindow()
      }
    },
    {
      label: '帮助文档',
      click: function () {
        // event.sender.send('context-menu-command', 'openDoc')
      }
    }
  ]

  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createNewWindow () {
  if (newWindow) {
    newWindow.focus()
    return
  }
  newWindow = new BrowserWindow({
    width: 900,
    height: 620,
    minWidth: 900,
    minHeight: 620,
    frame: true,
    fullscreen: false,
    title: 'log输出',
    autoHideMenuBar: true
  })
  newWindow.loadURL(winURL + '#/log')
  newWindow.on('close', () => {
    newWindow = null
  })
}
