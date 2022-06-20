<template>
  <div>
    <el-table  :data="lappList" height="480" style="width: 100%">
      <el-table-column  label="中文名" width="100" prop="name"></el-table-column>
      <el-table-column  label="英文名" width="120" prop="appName"></el-table-column>
      <el-table-column  label="项目路径"  prop="path"></el-table-column>
      <el-table-column width="150" align="right">
        <template slot="header">
          <el-button type="primary" size="mini"  @click="addLapp()">添加</el-button>
        </template>
        <template slot-scope="scope">
          <el-button  size="mini"  @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button  size="mini"  type="danger"  @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 修改、添加对话框 -->
    <el-dialog :title="dialogTitle" width="70%" :modal="false" :visible.sync="dialogShow">
      <el-form ref="newLapp" :model="newLapp" :rules="rules" label-position="left">
        <el-form-item label="中文名" prop="name">
          <el-input v-model="newLapp.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="英文名" prop="appName">
          <el-input v-model="newLapp.appName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="项目路径" prop="path">
          <el-input v-model="newLapp.path" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel('newLapp')">取 消</el-button>
        <el-button type="primary" @click="dialogConfirm('newLapp')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Store from 'electron-store'
const fs = require('fs')
const store = new Store()

export default {
  name: 'LappList',
  data () {
    return {
      lappList: store.get('lappList') || [],
      newLapp: {
        name: '',
        appName: '',
        path: ''
      },
      rules: {
        name: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入轻应用的名称'))
              } else {
                callback()
              }
            }
          }
        ],
        appName: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入轻应用的英文名'))
              } else {
                callback()
              }
            }
          }
        ],
        path: [
          {trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请输入轻应用的项目路径'))
              } else if (!(fs.existsSync(`${value}/config.json`) || !(fs.existsSync(`${value}/package.json`)))) {
                callback(new Error('请输入正确的轻应用项目路径'))
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
    // 添加轻应用
    addLapp () {
      this.dialogTitle = '添加轻应用'
      this.dialogShow = true
      this.newLapp = {name: '', appName: '', path: ''}
    },
    // 编辑轻应用
    handleEdit (index, row) {
      this.dialogTitle = '修改轻应用'
      this.newLapp = JSON.parse(JSON.stringify(row))
      this.editIndex = index
      this.dialogShow = true
    },
    // 删除轻应用
    handleDelete (index, row) {
      this.lappList.splice(index, 1)
      this.$store.commit('setLappList', {list: this.lappList})
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
          let newLapp = JSON.parse(JSON.stringify(this.newLapp))
          if (this.editIndex === '') { // 添加轻应用
            this.lappList.push(newLapp)
          } else if (this.editIndex !== '') { // 修改轻应用
            console.log('修改', this.editIndex, newLapp)
            let index = this.editIndex
            this.lappList[index].name = newLapp.name
            this.lappList[index].appName = newLapp.appName
            this.lappList[index].path = newLapp.path
          }
          this.editIndex = ''
          this.dialogShow = false
          this.$refs[formName].resetFields()
          this.$store.commit('setLappList', {list: this.lappList})
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