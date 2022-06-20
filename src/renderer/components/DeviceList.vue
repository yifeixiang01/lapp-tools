<template>
  <div>
    <el-form :inline="true" label-width="80px">
      <el-form-item label="设备连接:" label-width="200">
        <el-input placeholder="请输入设备IP" v-model="deviceIp"></el-input>
      </el-form-item>
      <el-form-item><el-button @click="handleConnect">连接</el-button></el-form-item>
    </el-form>
    <el-table ref="deviceTable" :data="localDeviceList" highlight-current-row style="width: 100%" @current-change="handleCurrentChange">
      <el-table-column  label="设备"  prop="serial"></el-table-column>
      <el-table-column  label="状态"  prop="status" width="100"></el-table-column>
      <el-table-column  label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="mini"  @click="handleDisconnect(scope.$index, scope.row)">断开</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

import { mapState } from 'vuex'
import adb from '../../main/adb'

export default {
  name: 'DeviceList',
  data () {
    return {
      deviceIp: ''
    }
  },
  computed: {
    ...mapState({
      localDeviceList: state => state.Device.localDeviceList,
      selectedDevice: state => state.Device.selectedDevice
    })
  },
  mounted () {
    console.log(this.localDeviceList)
    this.setCurrentDevice()
  },
  methods: {
    setCurrentDevice () {
      this.selectedDevice && this.$refs.deviceTable.setCurrentRow(this.selectedDevice)
    },
    // 设置选择的设备
    handleCurrentChange (row) {
      this.$store.commit('setSelectedDevice', {selectedDevice: row})
    },
    handleConnect () {
      console.log(this.deviceIp)
      this.deviceIp && adb._connectDevice({serial: this.deviceIp})
    },
    handleDisconnect (index, row) {
      console.log(index, row, row.serial)
      adb._disconnectDevice({serial: row.serial})
    }
  }
}
</script>
<style scoped>

</style>