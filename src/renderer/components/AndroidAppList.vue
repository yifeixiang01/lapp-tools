<template>
  <div>
    <el-table  :data="list" height="480" style="width: 100%">
      <el-table-column  label="图标" width="120" prop="icon">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.icon" :icon="defaultIcon" fit="fill" :shape="scope.row.shape"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column  label="应用名" width="100" prop="name"></el-table-column>
      
      <el-table-column  label="包名"  prop="packageName"></el-table-column>
      <el-table-column width="150" align="right">
        <template slot="header">
          <el-button type="primary" size="mini"  @click="addApp()">添加</el-button>
        </template>
        <template slot-scope="scope">
          <el-button  size="mini"  @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button  size="mini"  type="danger"  @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 修改、添加对话框 -->
    <el-dialog :title="dialogTitle" width="70%" :modal="false" :visible.sync="dialogShow">
      <el-form ref="newApp" :model="newApp" :rules="rules" label-position="left" label-width="80px">
        <el-form-item label="应用名:" prop="name">
          <el-input v-model="newApp.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标：">
          <el-col :span="4">
            <el-avatar :src="newApp.icon" :icon="defaultIcon" fit="fill" class="app-icon" :shape="newApp.shape" @click.native="btnChange"></el-avatar>
            <input type="file" ref="file" id="file" hidden accept="image/png,image/gif,image/jpeg" @change="fileChange"/>
          </el-col>
          <el-col :span="10">
            <el-select v-model="newApp.shape" placeholder="图标形状">
              <el-option label="圆形" value="circle"></el-option>
              <el-option label="方形" value="square"></el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="包名：" prop="packageName">
          <el-input v-model="newApp.packageName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel('newApp')">取 消</el-button>
        <el-button type="primary" @click="dialogConfirm('newApp')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// const fs = require('fs')
import { mapState } from 'vuex'

export default {
  name: 'AndroidAppList',
  data () {
    return {
      defaultIcon: 'el-icon-burger',
      newApp: {
        name: '',
        icon: '',
        shape: 'square',
        path: ''
      },
      rules: {
        name: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入应用的名称'))
              } else {
                callback()
              }
            }
          }
        ],
        icon: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入上传应用图标'))
              } else if (value) {

              } else {
                callback()
              }
            }
          }
        ],
        packageName: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入包名'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      dialogShow: false,
      dialogTitle: '',
      editIndex: '',
      imgSavePath: '',
      appType: '轻应用App'
    }
  },
  computed: {
    ...mapState({
      list: state => state.AndroidAppList.list
    })
  },
  created () {
    console.log('applist', this.list)
  },
  methods: {
    fileChange (e) {
      // this.newApp.icon = this.$refs.file.files[0].path
      console.log(this.$refs.file.files[0])
      var fr = new FileReader()
      // 资源的读取
      fr.readAsDataURL(this.$refs.file.files[0])
      // 绑定读取完毕事件
      fr.onload = () => {
        // 将图片的src指向读取到的base64
        this.$set(this.newApp, 'icon', fr.result)
      }
    },
    btnChange () {
      this.$refs.file.click()
    },
    addApp () {
      this.dialogTitle = '添加应用'
      this.dialogShow = true
      this.newApp = {name: '', packageName: '', icon: '', shape: 'square'}
    },
    // 编辑应用
    handleEdit (index, row) {
      console.log(row)
      this.dialogTitle = '修改应用'
      this.newApp = JSON.parse(JSON.stringify(row))
      this.editIndex = index
      this.dialogShow = true
    },
    // 删除应用
    handleDelete (index, row) {
      this.list.splice(index, 1)
      this.$store.commit('setAndroidAppList', {list: this.list})
    },
    // 对话框 取消
    dialogCancel (formName) {
      this.$refs[formName].resetFields()
      this.dialogShow = false
    },
    // 对话框 确认
    dialogConfirm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let newApp = JSON.parse(JSON.stringify(this.newApp))
          if (this.editIndex === '') { // 添加应用
            let filter = this.list.filter(item => item.packageName === newApp.packageName)
            if (filter.length > 0) {
              this.$message({
                message: '该应用已存在！',
                type: 'warning'
              })
              return
            } else {
              this.list.push(newApp)
            }
          } else if (this.editIndex !== '') { // 修改应用
            let index = this.editIndex
            this.$set(this.list, index, newApp)
          }
          this.editIndex = ''
          this.dialogShow = false
          this.$refs[formName].resetFields()
          this.$store.commit('setAndroidAppList', {list: this.list})
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
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