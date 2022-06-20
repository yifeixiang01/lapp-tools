<template>
    <div class="area-draginto" @drop="onDrop($event)" @dragover="onDragover($event)"><span>将轻应用包</span><span>拖放到此处</span></div>
</template>
<script>
import adb from '../../main/adb'
import { mapState } from 'vuex'
export default {
  name: 'DragPushToDevice',
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      selectedDevice: state => state.Device.selectedDevice,
      AppConfig: state => state.AppConfig,
      selectedLapp: state => state.Lapp.selectedLapp,
      aimDirection: state => state.Lapp.aimDirection
    })
  },
  methods: {
    onDrop (e) {
      e.preventDefault()
      let resourcePath = e.dataTransfer.files[0].path
      this.$emit('lappLoading', {done: false, type: 'success', message: `正在将轻应用包push到车机...`})

      // 设备上的文件存储目录
      let aimPathInDevice = this.aimDirection.name === '本地调试包' ? '/sdcard/moss/lapp/debug.wxapkg' : `data/data/${this.selectedDevice.deviceId.indexOf('emulator') !== -1 ? 'com.tencent.wecar' : 'com.tencent.wecarmas'}/files/moss/${this.aimDirection.name}/pkg/${this.aimDirection.appName}.wxapkg`
      // 判断源文件是否是轻应用包
      if (resourcePath.indexOf('.wxapkg') > -1) {
        if (this.selectedDevice) {
          adb._pushFileToDevice({serial: this.selectedDevice.deviceId, filePath: resourcePath, aimPath: aimPathInDevice}).then(() => {
            this.$message({type: 'success', message: `轻应用成功push到设备!`})
            this.$emit('lappLoading', {done: true, type: 'success', message: `轻应用成功push到设备`})
          }).catch(err => {
            this.$emit('lappLoading', {done: true, type: 'error', message: err.toString()})
          })
        }
      } else {
        this.$emit('lappLoading', {done: true, type: 'error', message: `请放置正确的轻应用包`})
      }
    },
    onDragover (e) {
      e.preventDefault()
    }
  }
}
</script>
<style scoped>

</style>