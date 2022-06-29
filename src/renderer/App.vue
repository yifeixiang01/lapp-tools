<template>
  <div id="app" element-loading-spinner="el-icon-loading"  element-loading-background="rgba(0, 0, 0, 0.8)">

    <router-view></router-view>
    
  </div>
</template>

<script>

import adbkit from '../main/adbkit'
import {ipcRenderer, shell} from 'electron'
import { mapState } from 'vuex'
// import fs from 'fs'
import path from 'path'
import Store from 'electron-store'

const helpDoc = 'https://alidocs.dingtalk.com/i/nodes/mdvQnONayjBJKL4p9jye8PY2MeXzp5o0?nav=share&navQuery=spaceId%3De3RmQZRryxP2GaP6&iframeQuery=utm_source%3Dportal%26utm_medium%3Dportal_myspace_file_tree'
const adbDoc = 'https://alidocs.dingtalk.com/i/team/e3RmQZRryxP2GaP6/docs/e3RmQY5lr01ZjmaP# 「adb 常用命令」'
// const {dialog} = require('electron').remote
// const path = require('path')
const store = new Store()
let cwd = path.join(process.cwd(), ((process.env.NODE_ENV === 'development') ? '/extraResources/scrcpy' : '/resources/extraResources/scrcpy'))
console.log('adb 路径', cwd)

export default {
  name: 'LAP-GUI',
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      hostIP: state => state.AppConfig.hostIP,
      userName: state => state.AppConfig.userName,
      localDeviceList: state => state.Device.localDeviceList,
      selectedDevice: state => state.Device.selectedDevice
    })
  },
  created () {
    this.onDevices()

    // 检测是否有新版本
    ipcRenderer.send('checkForUpdate')
    ipcRenderer.on('message', (event, text) => {
      console.log(event, text)
      this.tips = text
    })
    ipcRenderer.on('downloadProgress', (event, progressObj) => {
      console.log(progressObj)
      this.downloadPercent = progressObj.percent || 0
    })
    ipcRenderer.on('isUpdateNow', () => {
      ipcRenderer.send('isUpdateNow')
    })

    // 渲染进程控制创建菜单
    ipcRenderer.send('show-context-menu')
    ipcRenderer.on('context-menu-command', (event, text) => {
      switch (text) {
        case 'openDoc': shell.openExternal(helpDoc); break
        case 'setConfig': this.$route.name !== 'Config' && this.$router.replace('/Config'); break
        case 'lapp': this.$route.name !== 'Home' && this.$router.replace('/'); break
        case 'openAdbDoc': shell.openExternal(adbDoc)
      }
    })
  },
  mounted () {
    this.checkConfig()
  },
  methods: {
    // 打开应用时，先检测有没有配置，没有的话，会跳转配置页
    checkConfig () {
      let appConfig = store.get('AppConfig')
      console.log(appConfig)
      if (!appConfig) {
        this.$alert(`首次安装需要配置文件输出目录，点击确定去配置`, '提示', {
          confirmButtonText: '确定',
          showClose: false,
          callback: action => {
            if (action === 'confirm') {
              this.$router.push({path: '/Config'})
            }
          }
        })
      }
    },
    onDevices () {
      adbkit.onDevices({
        onadd: ({device}) => {
          console.log('有新设备连接', device)
          this.addLocalDevice(device)
        },
        onremove: ({device}) => {
          console.log('设备断开', device)
          let {id: deviceId} = device

          this.$store.commit('removeLocalDevice', {deviceId})
          this.$message({type: 'warning', message: `设备断开：${deviceId}`})
          console.log(this.localDeviceList)
        },
        onend: () => {
          console.log('监听设备失败')
        }
      })
    },
    // 添加本地设备
    addLocalDevice (device) {
      let {id: serial, type: status} = device
      let linkType = serial.indexOf(':') > -1 ? '无线' : 'USB'
      // 本地列表中已经有相同的设备，则不添加到本地列表里
      let index = this.localDeviceList.findIndex(item => item.deviceId === serial)

      if (serial.indexOf(this.hostIP) === -1 && index === -1) {
        let device = {deviceId: serial, serial, owner: this.userName, status: status, linkType}

        this.$store.commit('addLocalDevice', {device: device})
        this.$message({type: 'success', message: `连接到新设备:${device.serial}`})
      }
    }
  }
}
</script>

<style>
::-webkit-scrollbar {
  width: 0 !important;
}
  /* CSS */

  /* body{
    background: #EBEEF5;
  } */
</style>
