<template>
  <el-container>
    <el-header style="height: 20px; color: #303133; margin-bottom: 10px;">
      <div class="title">
        <span>{{title}}</span> 
        <el-button style="float: right; padding: 3px 0" type="text" @click="openConfig('device')">管理</el-button>
      </div>
    </el-header>

    <el-main>
      <!-- 编译轻应用 -->
      <el-card ref="lappCard" class="box-card lappCard" body-style="height: 100px;" v-loading="!loadingEvent.done" :element-loading-text="!loadingEvent.done? loadingEvent.message: ''"  element-loading-spinner="el-icon-loading"  element-loading-background="rgba(0, 0, 0, 0.8)">
        <div slot="header" class="card-header">
          <span>轻应用操作</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="openConfig('lapp')">设置</el-button>
        </div>
        <el-row>
          <el-col :span="18">
            <el-row>
              <el-col :span="11">
                <el-select v-model="selectedLappIndex" clearable placeholder="请选择编译的轻应用" style="margin-right: 30px;">
                  <el-option  v-for="(item, index) in lappCompileList"  :key="item.appName" :label="item.name"  :value="index"></el-option>
                </el-select>
              </el-col>
              <el-col :span="2">
                <i class="el-icon-right" style="margin-top: 10px; color: #409EFF;"></i>
              </el-col>
              <el-col :span="11">
                <el-select v-model="pushDirectionIndex" clearable :disabled="!selectedDevice" placeholder="请选择车机文件夹" style="margin-right: 30px;">
                  <el-option label="本地调试包" :value="0"></el-option>
                  <el-option  v-for="(item, index) in lappList"  :key="item.appName" :label="item.name"  :value="index+1"></el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-row>
              <div style="height: 50px; display: flex; align-items: flex-end;">
                  <el-link :underline="false" type="warning">{{lappTitle}}</el-link>
              </div>
            </el-row>
          </el-col>
          <el-col :span="6">
            <!-- 轻应用编译按钮 -->
            <lapp-compile-btn @lappLoading="lappCompileCallback"/>
          </el-col> 
        </el-row>
      </el-card>

      <!-- 应用管理 -->
      <el-card class="box-card" body-style="height: 75px;">
        <div slot="header">
          <span>应用管理</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="openConfig('appList')">设置</el-button>
        </div>
        <el-row>
          <el-col :span="4">
            <android-app :src="app.icon" :name="app.name" shape="circle" :package-name="app.packageName" v-for="app in androidAppList" :key="app.packageName"/>
          </el-col>
          
        </el-row>
      </el-card>

      <!-- 设备管理 -->
      <el-card class="box-card" body-style="height: 75px;">
        <div slot="header">
          <span>设备操作</span>
        </div>
        <el-row>
          <el-col>
            <adb-btn text="设备截屏" cmdFn="_screenCap" :params="{outputPath: AppConfig.outputPath}"/>
            <adb-btn text="获取包名" cmdFn="_getAppInfo" @adbcallback="showAppInfo"/>
            <adb-btn text="设备root" cmdFn="_rootDevice"/>
            <adb-btn text="所有应用" cmdFn="_showLaunch"/>
            <adb-btn text="投屏" cmdFn="_startScrcpy" :params="{windowSetting: Mirror, outputPath: AppConfig.outputPath}"/>
          </el-col>
        </el-row>
      </el-card>
    </el-main>

    <!-- 抽屉：设备设置和轻应用设置的内容 -->
    <el-drawer  :title="drawerTitle"  :visible.sync="showDrawer" size="90%"  direction="btt" >
      <div style="padding: 0 10px; height: 100%;">
        <device-list v-if="drawerTitle === '设备管理'"/>
        <lapp-list v-else-if="drawerTitle === '轻应用管理'"/>
        <device-operation v-else-if="drawerTitle === '设备操作'"/>
        <android-app-list v-else-if="drawerTitle === '应用管理'"/>
      </div>
      
    </el-drawer>


    <el-dialog  title="应用信息"  :visible.sync="showAppInfoDialog"  width="60%">
      <p>{{currentAppInfo}}</p>
    </el-dialog>
  </el-container>
  
</template>

<script>
import DeviceList from '../components/DeviceList.vue'
import LappList from '../components/LappList.vue'
import AndroidAppList from '../components/AndroidAppList.vue'
import AndroidApp from '../components/AndroidApp.vue'
import AdbBtn from '../components/adb-btn.vue'
import LappCompileBtn from '../components/LappCompileBtn.vue'
import DragPushToDevice from '../components/dragPushToDevice.vue'

import { mapState } from 'vuex'

export default {
  name: 'landing-page',
  components: {
    DeviceList,
    LappList,
    AndroidAppList,
    AndroidApp,
    AdbBtn,
    LappCompileBtn,
    DragPushToDevice
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
      androidAppList: [{name: '小场景', packageName: 'com.tencent.wecarmas/com.tencent.wecarmas.ui.activity.HomeActivity', icon: require('../assets/wecarmas.png')}]
    }
  },
  computed: {
    ...mapState({
      AppConfig: state => state.AppConfig,
      localDeviceList: state => state.Device.localDeviceList,
      selectedDevice: state => state.Device.selectedDevice,
      lappList: state => state.LappList.list,
      Mirror: state => state.Mirror,
      appList: state => state.DeviceAppList.appList,
      selectedLapp: state => state.Lapp.selectedLapp,
      aimDirection: state => state.Lapp.aimDirection
    }),
    // 连接的设备提示信息
    title () {
      if (this.localDeviceList.length === 0) {
        return '当前没有连接任何设备'
      }
      if (this.localDeviceList.length > 0 && this.selectedDevice) {
        return `当前操作设备：${this.selectedDevice.deviceId}`
      }
      if (this.localDeviceList.length > 0 && !this.selectedDevice) {
        return `请选择要操作的设备`
      }
    },
    // 选择的轻应用的提示信息
    lappTitle () {
      if (this.selectedLappIndex !== '') {
        this.$store.commit('setSelectedLapp', {selectedLapp: this.lappCompileList[this.selectedLappIndex]})
      } else {
        this.$store.commit('setSelectedLapp', {selectedLapp: null})
      }
      if (this.pushDirectionIndex !== '') {
        let aimDirection = this.pushDirectionIndex === 0 ? {name: '本地调试包', appName: 'debug'} : this.lappList[this.pushDirectionIndex - 1]
        this.$store.commit('setAimDirection', {aimDirection})
      } else {
        this.$store.commit('setAimDirection', {aimDirection: null})
      }

      switch (true) {
        case this.selectedLappIndex !== '' && this.pushDirectionIndex !== '':
          return `将编译“${this.selectedLapp.name}”,并push到车机“${this.aimDirection.name}”目录下`
        case this.selectedLappIndex === '' && this.pushDirectionIndex !== '':
          return `将使用自有轻应用包并push到车机“${this.aimDirection.name}”目录下`
        case this.selectedLappIndex !== '' && this.pushDirectionIndex === '':
          return `将只编译“${this.selectedLapp.name}”轻应用包`
        case this.selectedLappIndex === '' && this.pushDirectionIndex === '':
          return ''
      }
    },
    lappCompileList () {
      return this.lappList.filter(item => item.path !== '')
    }
  },
  mounted () {
    // process.execPath 应用安装路径
    // process.cwd()应用安装目录
    // console.log(process.execPath)
    // alert(process.cwd())
  },
  methods: {
    // 打开相关配置页
    openConfig (name) {
      switch (name) {
        case 'device': this.drawerTitle = '设备管理'; break
        case 'lapp': this.drawerTitle = '轻应用管理'; break
        case 'appList': this.drawerTitle = '应用管理'; break
      }
      this.showDrawer = true
    },
    // 跳转应用配置页
    toConfigPage () {
      this.$router.push('/Config')
    },
    // 显示当前app信息
    showAppInfo (e) {
      this.currentAppInfo = e.message
      this.showAppInfoDialog = true
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
