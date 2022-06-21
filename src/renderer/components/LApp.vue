<template>
  <div :class="['app-wrapper', !selectedDevice? 'disable': '']" @click="startApp" @contextmenu="mouseRight">
    <el-avatar :src="icon" :icon="defaultIcon" fit="fill" :shape="shape"></el-avatar>
    <span class="app-name">{{name}}</span>

    <div :class="['operation', showOperation? 'operation-show': '']" @mouseleave="mouseOver">
      <div class="btn " @click.stop="pushToDevice">Push</div>
    </div>
  </div>
</template>
<script>
// import adb from '../../main/adb'
import { mapState } from 'vuex'
const fs = require('fs')
const { exec } = require('child_process')

export default {
  name: 'LightApp',
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
    pushToDevice () {
      let appConfig = JSON.parse(fs.readFileSync(`${this.path}/config.json`, 'UTF8'))
      console.log(fs.existsSync(`${this.path}/dist/pages`))
      if (fs.existsSync(`${this.path}/dist/pages`)) {
        let aimDevicePath = `/data/data/com.gwm.applet/files/applet/html/id_${appConfig.appId}/a`
        console.log(aimDevicePath)
        // 先清除设备上目录下的文件
        // adb._removeAllFileInDevice({serial: this.selectedDevice.serial, path: this.aimDevicePath})
        // adb._pushFileToDevice({serial: this.selectedDevice.serial, filePath: `${this.path}/dist/.`, aimPath: aimDevicePath}).then(res => {
        //   this.$message.success(`push成功`)
        // }).catch(err => {
        //   this.$message.error(err.toString())
        // })
      } else {
        exec(`yarn build:dev`, {cwd: this.path}, (err, stdout, stderr) => {
          console.log('err', err)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
        })
      }

      let config = JSON.parse(fs.readFileSync(`${this.path}/package.json`, 'UTF8'))
      console.log(config)
      console.log('appConfig', appConfig)
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