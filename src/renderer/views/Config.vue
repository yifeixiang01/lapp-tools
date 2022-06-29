<template>
  <div>
    <el-form ref="AppConfig" label-position="left" label-width="120px" :rules="rules" :model="AppConfig">

      <el-form-item label="文件输出路径" prop="outputPath">
        <input type="file" ref="file" id="file" hidden @change="fileChange" webkitdirectory>
        <el-input placeholder="截图、录屏、日志等文件输出目录" v-model="AppConfig.outputPath" class="input-with-select">
          <el-button slot="append" icon="el-icon-folder" type="success" @click="btnChange"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('AppConfig')">保存</el-button>
      </el-form-item>
    </el-form>  
    <div class="path">{{cwd}}</div>
  </div>
</template>
<script>
// import { mapState } from 'vuex'
import path from 'path'
import { mapState } from 'vuex'
let cwd = path.join(process.cwd(), ((process.env.NODE_ENV === 'development') ? '/extraResources/scrcpy' : '/resources/extraResources/scrcpy'))

const fs = require('fs')
export default {
  name: 'Config',
  data () {
    return {
      prompt: `首次使用，请将此路径添加到系统环境变量：${cwd}`,
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
      },
      cwd
    }
  },
  computed: {
    ...mapState({
      AppConfig: state => state.AppConfig
    })
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
    },
    fileChange (e) {
      console.log(this.$refs.file.files[0].path)
      this.AppConfig.outputPath = this.$refs.file.files[0].path
    },
    btnChange () {
      var file = document.getElementById('file')
      file.click()
    }
  }

}
</script>
<style scoped>
  .path{
    position: fixed;
    bottom: 20px;
    left: 20px;
  }
</style>