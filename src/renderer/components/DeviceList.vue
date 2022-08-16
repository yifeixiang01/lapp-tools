<template>
  <div>
    <el-form :inline="true" label-width="80px">
      <el-form-item label="设备连接:" label-width="200">
        <el-autocomplete
            class="inline-input"
            v-model="deviceIp"
            :fetch-suggestions="querySearch"
            placeholder="请输入设备IP"
          ></el-autocomplete>
      </el-form-item>
      <el-form-item><el-button @click="handleConnect">连接</el-button></el-form-item>
    </el-form>
    <el-table ref="deviceTable" :data="localDeviceList" highlight-current-row style="width: 100%" @current-change="handleCurrentChange">
      <el-table-column  label="设备"  prop="serial"></el-table-column>
      <el-table-column  label="状态"  prop="status"></el-table-column>
      <el-table-column  label="类型"  prop="linkType" width="100"></el-table-column>
      <el-table-column  label="操作" width="120">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini"  @click="handleRestart(scope.$index, scope.row)">重启</el-button> -->
          <el-button type="text" size="mini"  @click="handleDisconnect(scope.$index, scope.row)" v-if="scope.row.serial.indexOf(':') > 0">断开</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

import { mapState } from 'vuex'
import adb from '../../main/adb'
import Store from 'electron-store'
const store = new Store()

export default {
  name: 'DeviceList',
  data () {
    return {
      deviceIp: '',
      historyDevices: []
    }
  },
  computed: {
    ...mapState({
      localDeviceList: state => state.Device.localDeviceList,
      selectedDevice: state => state.Device.selectedDevice
    })
  },
  mounted () {
    this.setCurrentDevice()
    this.historyDevices = store.get('historyDevices') || []

    if (this.historyDevices.length === 0) {
      this.historyDevices = [{value: '10.53.132.69'}, {value: '10.53.135.60'}]
      store.set('historyDevices', this.historyDevices)
    }
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
      if (this.deviceIp) {
        adb._connectDevice({serial: this.deviceIp}).catch(err => {
          this.$message.error(err.toString())
        })
        let filterDevices = this.historyDevices.filter(item => item.value === this.deviceIp)
        if (filterDevices.length === 0) {
          this.historyDevices.unshift({value: this.deviceIp})
          // 历史记录最多只保存10条记录
          store.set('historyDevices', this.historyDevices.slice(0, 10))
        }
      }
    },
    handleDisconnect (index, row) {
      console.log(index, row, row.serial)
      adb._disconnectDevice({serial: row.serial})
    },
    querySearch (queryString, cb) {
      console.log('search', this.historyDevices, queryString)
      let query = queryString ? this.historyDevices.filter(item => item.value.indexOf(queryString) > -1) : this.historyDevices
      cb(query)
    },
    handleRestart (index, row) {
      console.log(row)
      adb._restart({serial: row.serial})
    }
  }
}
</script>
<style scoped>

</style>