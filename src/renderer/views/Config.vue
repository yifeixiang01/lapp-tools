<template>
  <div>
    <el-form ref="AppConfig" label-position="left" label-width="120px" :rules="rules" :model="AppConfig">
      <el-form-item label="文件输出路径" prop="outputPath">
        <el-input v-model="AppConfig.outputPath" placeholder="截图、录屏、日志等文件输出目录"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('AppConfig')">保存</el-button>
      </el-form-item>
    </el-form>  
  </div>
</template>
<script>
// import { mapState } from 'vuex'
import Store from 'electron-store'
const store = new Store()
const fs = require('fs')
export default {
  name: 'Config',
  data () {
    return {
      AppConfig: store.get('AppConfig') || {},
      rules: {
        outputPath: [
          { trigger: 'blur',
            validator: function (rule, value, callback) {
              if (value === '') {
                return callback(new Error('请输入文件输出路径'))
              } else if (!fs.existsSync(`${value}`)) {
                return callback(new Error('请输入正确的输出路径'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  created () {
    console.log(this.$store)
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.commit('setConfig', this.AppConfig)
          this.$message({message: '已保存!', type: 'success'})
          setTimeout(() => {
            this.$router.push('/')
          }, 1000)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }

}
</script>
<style scoped>

</style>