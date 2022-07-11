<template>
  <el-button type="primary" class="button" size="medium" :disabled="!selectedDevice" @click="adbCmd">{{text}}</el-button>
</template>
<script>
import adb from '../../main/adb/index'

import { mapState } from 'vuex'
export default {
  name: 'AppList',
  props: {
    text: String,
    cmdFn: String
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      selectedDevice: state => state.Device.selectedDevice,
      AppConfig: state => state.AppConfig
    })
  },
  methods: {
    adbCmd () {
      if (this.cmdFn === '_screenCap') {
        this.handleCmd(this.cmdFn, {serial: this.selectedDevice.serial, outputPath: this.AppConfig.outputPath})
        return
      }
      this.handleCmd(this.cmdFn, {serial: this.selectedDevice.serial})
    },
    handleCmd (cmdFn, params = {}) {
      adb[cmdFn](params).then(res => {
        this.$emit('adbcallback', {message: res.message, prompt: res.prompt})
      }).catch(err => {
        this.$message.error(err.toString())
      })
    }
  }
}
</script>
<style scoped>
  .button{
    margin: 10px 0;
  }
</style>