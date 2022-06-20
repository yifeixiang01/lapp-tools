<template>
  <div>
    <el-table  :data="list" height="480" style="width: 100%">
      <el-table-column  label="图标" width="120" prop="icon"></el-table-column>
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
      <el-form ref="newApp" :model="newApp" :rules="rules" label-position="left">
        <el-form-item label="应用名" prop="name">
          <el-input v-model="newApp.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="appName">
          <el-input v-model="newApp.ion" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="包名" prop="path">
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
import Store from 'electron-store'
// const fs = require('fs')
const store = new Store()
const appList = [
  {name: '微信', icon: '', src: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3336519328,2903738409&fm=26&gp=0.jpg', shape: 'square', packageName: 'com.tencent.mm/com.tencent.mm.ui.LauncherUI'}
]
export default {
  name: 'AndroidAppList',
  data () {
    return {
      list: store.get('androidAppList') || appList,
      newApp: {
        name: '',
        appName: '',
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
      editIndex: ''
    }
  },
  created () {

  },
  methods: {
    // 添加应用
    addApp () {
      this.dialogTitle = '添加应用'
      this.dialogShow = true
      this.newApp = {name: '', appName: '', path: ''}
    },
    // 编辑应用
    handleEdit (index, row) {
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
            this.list.push(newApp)
          } else if (this.editIndex !== '') { // 修改应用
            console.log('修改', this.editIndex, newApp)
            let index = this.editIndex
            this.list[index].name = newApp.name
            this.list[index].icon = newApp.icon
            this.list[index].packageName = newApp.packageName
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
    }
  }
}
</script>
<style scoped>

</style>