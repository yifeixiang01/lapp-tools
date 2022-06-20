<template>
  <el-button type="primary" :disabled="!selectedLapp" @click="startCompile">开始编译</el-button>
</template>
<script>
// import adb from '../../main/adb/index'
import tools from '../../main/tools'
import adb from '../../main/adb'
import { mapState } from 'vuex'
export default {
  name: 'LappCompileBtn',
  props: {
    text: String,
    cmdFn: String,
    params: {}
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      selectedDevice: state => state.Device.selectedDevice,
      AppConfig: state => state.AppConfig,
      selectedLapp: state => state.LappList.selectedLapp,
      aimDirection: state => state.Lapp.aimDirection
    })
  },
  mounted () {

  },
  watch: {
    params (val) {
      console.log('btn', val)
    }
  },
  methods: {
    // 开始编译轻应用
    startCompile () {
      console.log('开始编译轻应用')
      this.$emit('lappLoading', {done: false, type: 'success', message: `正在编译${this.selectedLapp.name}轻应用...`})

      // 轻应用包保存路径
      let aimPath = `${this.AppConfig.outputPath}/${this.selectedLapp.appName}.wxapkg`

      tools._compileLapp2(this.selectedLapp.path, this.AppConfig.outputPath).then(() => {
        tools._renameFile(`${this.AppConfig.outputPath}/__APP__.wxapkg`, `${this.AppConfig.outputPath}/${this.selectedLapp.appName}.wxapkg`)

        this.$emit('lappLoading', {done: true, type: 'success', message: `轻应用编译完成`})

        // 当前有选择设备，并且已选择push的目录，则将轻应用包push到设备目录下
        if (this.aimDirection) {
          console.log('----正在将轻应用包push到车机...')
          this.$emit('lappLoading', {done: false, type: 'success', message: `正在将轻应用包push到车机...`})
          let aimPathInDevice = this.aimDirection.name === '本地调试包' ? '/sdcard/moss/lapp/debug.wxapkg' : `data/data/${this.selectedDevice.deviceId.indexOf('emulator') !== -1 ? 'com.tencent.wecar' : 'com.tencent.wecarmas'}/files/moss/${this.aimDirection.name}/pkg/${this.aimDirection.appName}.wxapkg`
          return adb._pushFileToDevice({serial: this.selectedDevice.deviceId, filePath: aimPath, aimPath: aimPathInDevice}).then(res => {
            this.$emit('lappLoading', {done: true, type: 'success', message: `轻应用已push到设备`})
          })
        }
      }).catch(err => {
        this.$emit('lappLoading', {done: true, type: 'danger', message: err.toString()})
      })
    }
  }
}
</script>
<style scoped>

</style>