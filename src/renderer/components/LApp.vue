<template>
  <div :class="['app-wrapper', !selectedDevice? 'disable': '']" @click="startApp" @contextmenu="mouseRight">
    <el-avatar :src="icon" :icon="defaultIcon" fit="fill" :shape="shape"></el-avatar>
    <span class="app-name">{{name}}</span>

    <div :class="['operation', showOperation? 'operation-show': '']" @mouseleave="mouseOver">
      <div class="btn " @click.stop="pushToDevice">Push</div>
      <!-- <div class="btn danger" @click.stop="deleteFile">删除</div> -->
    </div>
  </div>
</template>
<script>
// import adb from '../../main/adb'
import { mapState } from 'vuex'
import adb from '../../main/adb'
const fs = require('fs')
const { exec } = require('child_process')

export default {
  name: 'LAP-GUI',
  props: {
    icon: String,
    name: String,
    shape: String,
    path: String
  },
  data () {
    return {
      defaultIcon: 'el-icon-burger',
      showOperation: false
    }
  },
  watch: {
    selectedDevice (val) {
      if (!val) {
        this.showOperation = false
      }
    }
  },
  computed: {
    ...mapState({
      selectedDevice: state => state.Device.selectedDevice
    })
  },
  methods: {
    // 打开应用
    startApp () {

    },
    // 关闭应用
    closeApp () {

    },
    // 清除应用缓存
    clearAppStorage () {

    },
    // 鼠标右击应用图标，打开删除和清缓存按钮
    mouseRight () {
      if (this.selectedDevice) {
        this.showOperation = true
      }
    },
    mouseOver () {
      this.showOperation = false
    },
    // push轻应用包到车机目录
    async pushToDevice () {
      // 因存在项目路径变更的情况，push前会再次检查项目路径是否正确
      if (!fs.existsSync(`${this.path}/package.json`)) {
        this.$message.success('轻应用项目路径有误，请检查后再试')
        return
      }

      let appConfig = JSON.parse(fs.readFileSync(`${this.path}/config.json`, 'UTF8'))
      let aimDevicePath1 = `/data/data/com.gwm.applet/files/applet/html/id_${appConfig.appId}/a`
      let aimDevicePath2 = `/data/data/com.gwm.applet/files/applet/html/id_${appConfig.appId}/b`
      // 项目目录dist下没有编译后的文件，会先执行编译
      if (!fs.existsSync(`${this.path}/dist/pages`) && !fs.existsSync(`${this.path}/dist/css`) && !fs.existsSync(`${this.path}/dist/js`)) {
        // await this.projectCompile()
        this.$message.error(`${appConfig.appName}项目未编译`)
        return
      }

      console.log('appConfig', appConfig)
      // console.log('车机端轻应用目录', aimDevicePath1)
      this.pushFile(appConfig, aimDevicePath1)
      this.pushFile(appConfig, aimDevicePath2)

      // await adb._closeApp({serial: this.selectedDevice.serial, appName: 'com.gwm.applet'})
      // await adb._startApp({serial: this.selectedDevice.serial, packageName: 'com.gwm.applet/.MainActivity'})
      this.$message.success(`push成功,请重新打“${appConfig.appName}”`)
    },
    async pushFile (appConfig, aimDevicePath) {
      // 判断车机是否存在轻应用目录
      await adb._isExistFileInDevice({serial: this.selectedDevice.serial, filePath: aimDevicePath}).catch((err) => {
        console.log('判断是否存在轻应用项目', err)
        // this.$message.success('车机端不存在此项目')
        // 车机端不存在轻应用目录，需要创建目录文件夹，1.创建id_***文件夹，2.创建 a 文件夹
        let projectDir = `/data/data/com.gwm.applet/files/applet/html/id_${appConfig.appId}`
        adb._createDirInDevice({serial: this.selectedDevice.serial, path: `${projectDir}`})
        adb._createDirInDevice({serial: this.selectedDevice.serial, path: `${aimDevicePath}`})
      })

      // 开始push前，先清除设备上目录下的文件
      await adb._isExistFileInDevice({serial: this.selectedDevice.serial, filePath: `${aimDevicePath}/pages`}).then(() => {
        adb._removeAllFileInDevice({serial: this.selectedDevice.serial, path: aimDevicePath})
      }).catch(err => {
        console.error(err)
      })

      await adb._pushFileToDevice({serial: this.selectedDevice.serial, filePath: `${this.path}/dist/.`, aimPath: aimDevicePath})
    },
    deleteFile () {
      let appConfig = JSON.parse(fs.readFileSync(`${this.path}/config.json`, 'UTF8'))
      let aimDevicePath = `/data/data/com.gwm.applet/files/applet/html/id_${appConfig.appId}/a`
      adb._removeAllFileInDevice({serial: this.selectedDevice.serial, path: aimDevicePath})
    },
    projectCompile () {
      return new Promise((resolve) => {
        exec(`yarn build:dev`, {cwd: this.path}, (err, stdout, stderr) => {
          console.log('err', err)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          if (stdout.indexOf('DONE  Build complete')) {
            resolve()
          }
        })
      })
    }
  }
}
</script>
<style scoped>
  .app-wrapper{
    width: 60px;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    position: relative;
    cursor: pointer;
  }
  .app-name{
    width: 100%;
    margin-top: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    color: #606266;
  }
  .operation{
    width: 100%;
    height: 0;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(228, 231, 237, .8);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    cursor: auto;
  }
  .operation .btn {
    width: 100%;
    height: 26px;
    box-sizing: border-box;
    font-size: 12px;
    border-radius: 3px;
    color: #fff;
    border: 1px solid #DCDFE6;
    text-align: center;
    line-height: 26px;
    cursor: pointer;
    background: #67C23A;
  }
  .btn.danger{
    background: #F56C6C
  }
  .btn.warning{
    background: #E6A23C
  }
  .operation-show{
    height: 100%;
  }
  .disable{
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>