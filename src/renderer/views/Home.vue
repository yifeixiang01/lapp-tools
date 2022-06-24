<template>
  <el-container>
    <el-header style="height: 20px; color: #303133; margin-bottom: 10px;">
      <div class="title">
        <span>{{title}}</span> 
        <el-button style="float: right; padding: 3px 0" type="text" @click="openConfig('device')">管理</el-button>
      </div>
    </el-header>

    <el-main>
      <!-- 设备操作 -->
      <el-card class="box-card" body-style="height: 75px;">
        <div slot="header">
          <span>设备操作</span>
        </div>
        <el-row type="flex">
          <el-col :span="4" v-for="operation in operationList" :key="operation.name">
            <adb-btn :text="operation.name" :cmdFn="operation.cmd" :params="{outputPath: AppConfig.outputPath}" @adbcallback="showMessage"/>
          </el-col>
          <el-button type="primary" size="mini" @click="startCmd">CMD</el-button>
          <el-button type="primary" size="mini" @click="newWindow">新窗口</el-button>
        </el-row>
      </el-card>

      <!-- 应用管理 -->
      <el-card class="box-card" body-style="height: 75px;">
        <div slot="header">
          <span>应用管理</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="openConfig('appList')">设置</el-button>
        </div>
        <el-row>
          <el-col :span="4"  v-for="app in androidAppList" :key="app.packageName">
            <android-app :src="app.icon" :name="app.name" :shape="app.shape" :package-name="app.packageName"/>
          </el-col>
          <el-col :span="4"  v-for="app in lappList" :key="app.name">
            <lapp :icon="app.icon" :name="app.name" :shape="app.shape" :path="app.path"/>
          </el-col>
        </el-row>
      </el-card>
    </el-main>

    <!-- 抽屉：设备设置和轻应用设置的内容 -->
    <el-drawer :title="drawerTitle" :visible.sync="showDrawer" size="90%"  direction="btt" >
      <div style="padding: 0 10px; height: 100%;">
        <device-list v-if="drawerTitle === '设备管理'"/>
        <device-operation v-else-if="drawerTitle === '设备操作'"/>
        <app-list v-else-if="drawerTitle === '应用管理'"/>
      </div>
    </el-drawer>

    <el-dialog  title="应用信息"  :visible.sync="showAppInfoDialog"  width="60%">
      <div v-html="currentAppInfo"></div>
    </el-dialog>
  </el-container>
</template>

<script>
import DeviceList from '../components/DeviceList.vue'
import lapp from '@/components/LApp.vue'
import AndroidApp from '../components/AndroidApp.vue'
import AdbBtn from '../components/adb-btn.vue'
import AppList from '@/components/AppList.vue'

import { mapState } from 'vuex'
import tools from '../../main/tools'

export default {
  name: 'landing-page',
  components: {
    DeviceList,
    AndroidApp,
    AdbBtn,
    lapp,
    AppList
  },
  data () {
    return {
      selectedLappIndex: '',
      pushDirectionIndex: '',
      drawerTitle: '设置',
      showDrawer: false,
      showAppInfoDialog: false,
      currentAppInfo: [],
      loadingEvent: {done: true, message: ''},
      operationList: [{name: '截屏', cmd: '_screenCap'},
        {name: '包名', cmd: '_getAppInfo'},
        {name: 'root', cmd: '_rootDevice'},
        {name: '投屏', cmd: '_startScrcpy'},
        {name: '设备IP', cmd: '_getDeviceIP'},
        {name: '系统设置', cmd: '_openSystemSetting'}
      ]
    }
  },
  computed: {
    ...mapState({
      AppConfig: state => state.AppConfig,
      localDeviceList: state => state.Device.localDeviceList,
      selectedDevice: state => state.Device.selectedDevice,
      lappList: state => state.LappList.list,
      androidAppList: state => state.AndroidAppList.list,
      Mirror: state => state.Mirror
    }),
    // 连接的设备提示信息
    title () {
      if (this.localDeviceList.length === 0) {
        return '当前没有连接任何设备'
      }
      if (this.localDeviceList.length > 0 && this.selectedDevice) {
        return `当前操作设备：${this.selectedDevice.serial}`
      }
      if (this.localDeviceList.length > 0 && !this.selectedDevice) {
        return `请选择要操作的设备`
      }
    }
  },
  mounted () {
    // process.execPath 应用安装路径
    // process.cwd()应用安装目录
    // console.log(process.execPath)
    // alert(process.cwd())
    console.log('lightApplist', this.lappList)
  },
  methods: {
    // 打开相关配置页
    openConfig (name) {
      switch (name) {
        case 'device': this.drawerTitle = '设备管理'; break
        case 'appList': this.drawerTitle = '应用管理'; break
      }
      this.showDrawer = true
    },
    // 跳转应用配置页
    toConfigPage () {
      this.$router.push('/Config')
    },
    // 显示当前app信息
    showMessage (e) {
      console.log('----', e)
      if (e.message) {
        this.currentAppInfo = e.message
        this.showAppInfoDialog = true
      }
      if (e.prompt) {
        this.$message.success(e.prompt)
      }
    },
    lappCompileCallback (event) {
      this.loadingEvent = event
      if (event.done) {
        if (event.type === 'success') {
          this.$message({type: 'success', message: event.message})
        } else {
          this.$message.error(event.message)
        }
      }
    },
    startCmd () {
      tools._startCMD()
    },
    newWindow () {

    }
  }
}
</script>

<style scoped>
  .container{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .title{
    width: 100%;
    height: 40px;
    padding: 0 16px;
    box-sizing: border-box;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f0f9eb;
    color: #67C23A;
  }
  .card{
    width: 100%;
    padding: 20px;
    border-radius: 8px;
    background: #eee;
  }
  .box-card{
    width: 100%;
    margin-bottom: 10px;
  }
  .card-header{
    height: 20px;
  }
  .area-draginto{
    width: 100%;
    height: 100px;
    border-radius: 6px;
    border: 1px dash #DCDFE6;
    background: #EBEEF5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #C0C4CC;
    font-size: 14px;
  }
  #el-drawer__header{
    margin-bottom: 0!important;
  }
</style>
