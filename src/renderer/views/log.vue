<template>
  <div class="page">
    <el-card class="box-card" body-style="height: 75px;">
        <div slot="header">
          <span>Log查看</span>
        </div>
        <el-row>
          <el-form :inline="true" :model="logForm">
            <el-form-item>
              <el-input v-model="logForm.user" placeholder="请输入关键词"></el-input>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="logForm.case">忽略大小写</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onOpenLog" :disabled="!selectedDevice">确定</el-button>
            </el-form-item>
          </el-form>
        </el-row>
      </el-card>
  </div>
</template>
<script>
import path from 'path'
import adb from '../../main/adb'
import { mapState } from 'vuex'

let cwd = path.join(process.cwd(), ((process.env.NODE_ENV === 'development') ? '/extraResources/scrcpy' : '/resources/extraResources/scrcpy'))

export default {
  name: 'Config',
  data () {
    return {
      cwd,
      logForm: {
        keywords: '',
        case: true
      }
    }
  },
  computed: {
    ...mapState({
      selectedDevice: state => state.Device.selectedDevice
    })
  },
  created () {

  },
  methods: {
    clearLog () {

    },
    closeLog () {
      this.logExe.kill(this.logExe.pid, 'closeLog')
      this.isStart = false
      console.log('kill')
    },
    onOpenLog () {
      adb._startLog({serial: this.selectedDevice.serial, params: {case: true, keywords: 'com.gwm'}})
    }
  }
}
</script>
<style scoped>
  .page{
    width: 100vwh;
    height: 100vh;
    background: #000;
    color: #fff;
    scroll-behavior: smooth;
  }
</style>