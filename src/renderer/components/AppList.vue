<template>
  <div>
    <el-radio-group v-model="appType" @change="changeAppType">
      <el-radio-button label="轻应用App"></el-radio-button>
      <el-radio-button label="AndroidApp"></el-radio-button>
    </el-radio-group>
    <android-app-list v-show="appType === 'AndroidApp'"></android-app-list>
    <lapp-list v-show="appType === '轻应用App'"></lapp-list>
  </div>
</template>
<script>
import AndroidAppList from '@/components/AndroidAppList.vue'
import LappList from '@/components/LappList.vue'

export default {
  name: 'AppList',
  components: {
    AndroidAppList,
    LappList
  },
  data () {
    return {
      appType: '轻应用App'
    }
  },
  methods: {
    changeAppType (type) {
      this.appType = type
    }
  }
}
</script>
<style scoped>
  .app-icon{
    cursor: pointer;
  }
</style>