
const { exec, spawn } = require('child_process')
const os = require('os')
const fs = require('fs')
// let cwd = process.cwd() + ((process.env.NODE_ENV === 'development') ? '/extraResources/lapp-compile' : '/resources/extraResources/lapp-compile')

function _renameFile (oldPath, newPath) {
  fs.renameSync(oldPath, newPath)
  return Promise.resolve()
}

/**
 * 在电脑上拷贝一个文件到另一个目录
 * @param {*} resourcePath 源文件路径
 * @param {*} aimPath 目标文件夹
 */
// 将_APP_.wxapkg copy到当前目录下，并修改文件名
function _copyFile (resourcePath, aimPath) {
  return new Promise((resolve, reject) => {
    console.log('------开始copy文件')
    console.log(`--源文件:${resourcePath}，目标:${aimPath}`)
    if (!fs.existsSync(resourcePath)) {
      console.log('不存在此文件', resourcePath)

      reject(new Error(`拷贝失败，不存在此文件:${resourcePath}`))
    } else {
      if (fs.existsSync(aimPath)) {
        fs.unlinkSync(aimPath)
      }
      fs.copyFile(resourcePath, aimPath, (data) => {
        console.log('--拷贝文件完成--', data)
        if (!fs.existsSync(aimPath)) {
          console.log('不存在此文件', resourcePath)

          reject(new Error(`拷贝失败，不存在此文件:${resourcePath}`))
        } else {
          resolve()
        }
      })
    }
  })
}

/**
 * 查看连接的设备信息
 */
function _getDevices () {
  return new Promise((resolve, reject) => {
    exec('adb devices -l', (error, stdout, stderr) => {
      if (error) {
        console.log('error', error)
      }
      console.log('getDevices stdout', stdout)
      if (stdout.match(/[0-9]/g)) {
        console.log('当前的设备', stdout)
        resolve(stdout)
      } else {
        reject(new Error('当前没有设备连接'))
      }
      console.log('getDevices stderr', stderr)
    })
  })
}

/**
 * 打开cmd
 */
function _startCMD () {
  var result = spawn('powershell', ['adb logcat'])
  result.on('close', function (code) {
    console.log('child process exited with code :' + code)
  })
  result.stdout.on('data', function (data) {
    console.log('stdout: ' + data)
  })
  result.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
  })
}

/**
 * 将当前时间格式化为年月日 20201206
 */
function _formateDate () {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  month = month > 9 ? month : '0' + month
  let day = date.getDate()
  day = day > 9 ? day : '0' + day
  let hour = date.getHours()
  hour = hour > 9 ? hour : '0' + hour
  let minutes = date.getMinutes()
  minutes = minutes > 9 ? minutes : '0' + minutes
  let seconds = date.getSeconds()
  seconds = seconds > 9 ? seconds : '0' + seconds
  return `${year}${month}${day}${hour}${minutes}${seconds}`
}

/**
 * 判断电脑某个程序是否在运行
 * @param {*} appName 程序名
 * @param {*} appNameZh 程序中文名
 */
function _isAppRunning (appName, appNameZh) {
  return new Promise((resolve, reject) => {
    exec(`tasklist`, (error, stdout, stderr) => {
      if (error) {
        console.log('stderr', error)
      }
      console.log('stdout', stdout)
      if (stdout.indexOf(`${appName}.exe`) !== -1) {
        console.log(`------${appName}正在运行-------`)
        resolve()
      } else {
        console.log(`------${appName}没有启动-------`)
        reject(new Error(`请先启动：${appNameZh}`))
      }
      console.log(stderr)
    })
  })
}

/**
 * 获取电脑IP地址
 */
// 获取电脑IP地址
function _getIPAddress () {
  var interfaces = os.networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}

/**
 * 读取文件内容
 */
function _readFile ({path}) {
  return new Promise(resolve => {
    resolve(fs.readFileSync(path))
  })
}

export default {
  _copyFile,
  _startCMD,
  _getDevices,
  _formateDate,
  _isAppRunning,
  _getIPAddress,
  _renameFile,
  _readFile
}
