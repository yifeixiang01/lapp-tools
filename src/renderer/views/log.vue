<template>
  <div>
    <el-form :inline="true" :model="form" class="demo-form-inline">
      <el-form-item>
        <el-button type="primary" @click="clearLog">Clear</el-button>
      </el-form-item>
      <el-form-item label="搜索">
        <el-input v-model="form.keyword" placeholder="搜索的关键字"></el-input>
      </el-form-item>
      <!-- <el-form-item label="活动区域">
        <el-select v-model="formInline.region" placeholder="活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">开始</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
// import { mapState } from 'vuex'
// import Store from 'electron-store'
import path from 'path'
// import tools from '../../main/tools'

let cwd = path.join(process.cwd(), ((process.env.NODE_ENV === 'development') ? '/extraResources/scrcpy' : '/resources/extraResources/scrcpy'))

// const store = new Store()
// const fs = require('fs')
export default {
  name: 'Config',
  data () {
    return {
      cwd,
      form: {

      }
    }
  },
  created () {

  },
  methods: {
    clearLog () {

    },
    onSubmit () {

    }
  }
}
</script>
<style scoped>

</style>