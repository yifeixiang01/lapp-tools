import tools from '../tools'
import {startScrcpy} from '../scrcpy'
import path from 'path'
const { exec, execSync } = require('child_process')
let cwd = path.join(process.cwd(), ((process.env.NODE_ENV === 'development') ? '/extraResources/scrcpy' : '/resources/extraResources/scrcpy'))

/**
 * 将移动设备截屏，并保存到电脑目录
 * @param {*} serial 设备序列号
 * @param {*} outputPath 保存目录
 * ToDo 截屏成功后，要删除设备上的截屏文件，文件日期格式化
 */
function _screenCap ({serial, outputPath}) {
  return new Promise(resolve => {
    let date = tools._formateDate()
    execSync(`adb -s ${serial} shell screencap -p /sdcard/screencap.png`, {cwd})
    execSync(`adb -s ${serial} pull /sdcard/screencap.png ${outputPath}/screen_${date}.png`, {cwd})
    resolve({prompt: '截屏成功！'})
  })
}

/**
 * 设备root
 * @param {*} serial 设备序列号
 */
function _rootDevice ({serial}) {
  return new Promise((resolve, reject) => {
    exec(`adb -s ${serial} root`, {cwd}, (error, stdout, stderr) => {
      console.log(error)
      console.log(stdout)
      if (stdout.indexOf('running as root') > -1) {
        reject(new Error('该设备已经root'))
      } else if (stdout.indexOf('cannot run as root') > -1) {
        reject(new Error('root失败！'))
      } else {
        _remountDevice({serial})
        resolve({pompt: 'root成功！'})
      }
      console.log(stderr)
    })
  })
}
/**
 * 车机remount
 */
function _remountDevice ({serial}) {
  return new Promise((resolve) => {
    execSync(`adb -s ${serial} remount`, {cwd})
  })
}

/**
 * 断开设备连接
 * @param {*} serial 设备序列号
 */
function _disconnectDevice ({serial}) {
  return new Promise(resolve => {
    console.log('---', serial, `adb disconnect ${serial}`)
    execSync(`adb disconnect ${serial}`, {cwd})
  })
}

/**
 * 连接设备
 * @param {*} serial 设备序列号
 */
function _connectDevice ({serial}) {
  return new Promise((resolve, reject) => {
    exec(`adb connect ${serial}`, {cwd}, (err, stdout) => {
      console.log(err)
      if (stdout.indexOf('10060') > -1) {
        reject(new Error(`${stdout}`))
      }
    })
  })
}

/**
 * 显示移动设备所有桌面应用
 * @param {*} serial 设备序列号
 */
function _showLaunch ({serial}) {
  return new Promise(resolve => {
    execSync(`adb -s ${serial} shell setprop sys.thirdapk.caninstall 1`, {cwd})
    execSync(`adb -s ${serial} shell am force-stop com.android.launcherWT`, {cwd})
  })
}

/**
 * 判断设备目录下是否存在某个文件
 * @param {*} serial 设备序列号
 * @param {*} filePath 文件路径
 */
function _isExistFileInDevice ({serial, filePath}) {
  return new Promise((resolve, reject) => {
    exec(`adb -s ${serial} shell find ${filePath}`, {cwd}, (error, stdout, stderr) => {
      if (error) {
        console.log('error', JSON.stringify(error), typeof JSON.stringify(error))
      }
      console.log(stdout)
      console.log(stderr)
      console.log('stdout', stdout)
      if (stdout.indexOf('no devices/emulators') > -1) {
        reject(new Error('设备连接中断'))
      }
      if (stdout.indexOf('No such file or directory') > -1 || stderr.indexOf('No such file or directory') > -1) {
        reject(new Error(`设备不存在此文件或文件夹：${filePath}`))
      } else {
        console.log('---存在此文件', filePath)
        resolve(true)
      }
    })
  })
}

/**
 * 获取设备上正在打开的包名和activity
 * @param {*} serial 设备序列号
 * 获取包名：
 * adb shell dumpsys package <package_name>  //获取全部信息
 * adb shell dumpsys package <package_name> | grep XXX //获取XXX信息
 */
function _getAppInfo ({serial}) {
  return new Promise((resolve, reject) => {
    exec(`adb -s ${serial} shell "dumpsys window | grep mCurrentFocus"`, {cwd}, (error, stdout, stderr) => {
      if (error) {
        console.log('error', error)
      }
      console.log('---stdout', stdout)
      console.log('stderr', stderr)
      if (stdout.indexOf('no devices/emulators') > -1) {
        reject(new Error('设备连接中断'))
      }
      let reg = /{.*}/
      stdout && resolve({ message: stdout.match(reg)[0] })
    })
  })
}

/**
 * 清除移动设备上的某个应用缓存
 * @param {*} serial 设备序列号
 * @param {*} appName 应用名
 */
function _clearAppStorage ({serial, appName}) {
  console.log('清除应用缓存', `adb -s ${serial} shell pm clear ${appName}`)
  return new Promise(resolve => {
    exec(`adb -s ${serial} shell pm clear ${appName}`, {cwd})
  })
}

/**
 * 关闭移动设备上的某个应用
 * @param {*} serial 设备序列号
 * @param {*} appName 应用名
 */
function _closeApp ({serial, appName}) {
  return new Promise((resolve, reject) => {
    console.log('关闭应用：' + appName)
    exec(`adb -s ${serial} shell am force-stop ${appName}`, {cwd}, (error, stdout, stderr) => {
      if (error) {
        console.log('error', error)
      }
      console.log('stdout', stdout)
      if (stdout.indexOf('no devices/emulators') > -1) {
        reject(new Error('设备连接中断'))
      }
      console.log('stderr', stderr)
    })
  })
}

/**
 * 将文件拷贝到移动设备
 * @param {*} filePath 文件路径
 * @param {*} aimPath 设备上目标文件路径
 * @param {*} serial 设备序列号
 */
function _pushFileToDevice ({serial, filePath, aimPath}) {
  return new Promise((resolve, reject) => {
    console.log('-----开始将文件push到车机')

    // 先判断设备上将要push的目录是否存在
    _isExistFileInDevice({serial, filePath: aimPath}).then(() => {
      console.log(`adb -s ${serial} push ${filePath} ${aimPath}`)
      let workerProcess = exec(`adb -s ${serial} push ${filePath} ${aimPath}`, {cwd})

      workerProcess.stdout.on('data', data => {
        console.log('push stdout', data)
        if (data.indexOf('Permission denied') > -1) {
          console.log('Permission denied', data.indexOf('Permission denied'))
          reject(new Error('Permission denied: adb没有push权限'))
        }
        if (data.indexOf('no devices/emulators') > -1) {
          reject(new Error('设备连接中断，push失败'))
        }
      })
      workerProcess.stderr.on('data', data => {
        console.log('push stderr', data)
      })
      workerProcess.on('close', code => {
        console.log('push close', code)
        if (code === 0) {
          console.log('------完成push文件到车机')
          resolve(true)
        }
      })
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 打开移动设备上的某个应用
 * @param {*} serial 序列号
 * @param {*} packageName 应用名
 */
function _startApp ({serial, packageName}) {
  console.log(`adb -s ${serial} shell am start ${packageName}`)
  return new Promise((resolve, reject) => {
    exec(`adb -s ${serial} shell am start ${packageName}`, {cwd}, (error, stdout, stderr) => {
      if (error) {
        console.log('startApp error', JSON.stringify(error))
      }
      console.log('startApp stdout', stdout)
      if (stdout.indexOf('no devices/emulators') > -1) {
        reject(new Error('设备连接中断'))
      }
      if (stderr.toLowerCase().indexOf('permission denial') > -1) {
        console.log('startApp Permission denied')
        reject(new Error('Permission denied'))
      } else {
        resolve()
      }
    })
  })
}

/**
 * 重启车机
 * */
function _restart ({serial}) {
  return new Promise(resolve => {
    exec(`adb -s ${serial} reboot`, {cwd})
  })
}

/**
 * 删除车机上目录下的所有文件
 * */
function _removeAllFileInDevice ({serial, path}) {
  return new Promise((resolve, reject) => {
    _isExistFileInDevice({serial, filePath: path}).then(() => {
      execSync(`adb -s ${serial} shell rm -r ${path}/*`, {cwd})
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 在车机目录下创建文件夹
 */
function _createDirInDevice ({serial, path}) {
  execSync(`adb -s ${serial} shell mkdir ${path}`, {cwd})
}

/**
 * 打开系统设置
 */
function _openSystemSetting ({serial}) {
  execSync(`adb -s ${serial} shell am start com.android.settings/.Settings`, {cwd})
}

/**
 * 获取设备ip
 */
function _getDeviceIP ({serial}) {
  return new Promise(resolve => {
    exec(`adb -s ${serial} shell ifconfig wlan0`, {cwd}, (err, stdout, stderr) => {
      console.log('获取设备ip err', err)
      console.log('获取设备ip stdout', stdout)
      console.log('获取设备ip stderr', stderr)
      let reg = /addr:([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g

      resolve({message: stdout.match(reg)[0]})
    })
  })
}

export default {
  _screenCap,
  _rootDevice,
  _disconnectDevice,
  _connectDevice,
  _showLaunch,
  _isExistFileInDevice,
  _getAppInfo,
  _clearAppStorage,
  _startApp,
  _closeApp,
  _pushFileToDevice,
  _startScrcpy: startScrcpy,
  _restart,
  _removeAllFileInDevice,
  _createDirInDevice,
  _openSystemSetting,
  _getDeviceIP
}
