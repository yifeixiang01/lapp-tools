<template>
  <div>
    <el-table  :data="list" height="480" style="width: 100%">
      <el-table-column  label="图标" width="120" prop="icon">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.icon" :icon="defaultIcon" fit="fill" :shape="scope.row.shape"></el-avatar>
        </template>
      </el-table-column>
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
        <el-form-item label="图标：">
          <el-col :span="4">
            <el-avatar :src="newLapp.icon" :icon="defaultIcon" fit="fill" class="app-icon" :shape="newLapp.shape" @click.native="btnChange"></el-avatar>
            <input type="file" ref="file" id="file" hidden accept="image/png,image/gif,image/jpeg" @change="fileChange"/>
          </el-col>
          <el-col :span="10">
            <el-select v-model="newLapp.shape" placeholder="图标形状">
              <el-option label="圆形" value="circle"></el-option>
              <el-option label="方形" value="square"></el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="项目路径" prop="path">
          <input type="file" ref="filePath" id="filePath" hidden @change="filePathChange" webkitdirectory/>
          <el-input placeholder="截图、录屏、日志等文件输出目录" v-model="newLapp.path" class="input-with-select">
            <el-button slot="append" icon="el-icon-folder" type="success" @click="filePathselect"></el-button>
          </el-input>
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
import { mapState } from 'vuex'
const fs = require('fs')

export default {
  name: 'LappList',
  data () {
    return {
      defaultIcon: 'el-icon-burger',
      newLapp: {
        name: '',
        icon: '',
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
              console.log('校验path', fs.existsSync(`${value}/config.json`), fs.existsSync(`${value}/package.json`))
              if (value === '') {
                callback(new Error('请输入轻应用的项目路径'))
              } else if (!fs.existsSync(`${value}/package.json`)) {
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
  computed: {
    ...mapState({
      list: state => state.LappList.list
    })
  },
  created () {

  },
  methods: {
    fileChange (e) {
      console.log(this.$refs.file.files[0])
      var fr = new FileReader()
      // 资源的读取
      fr.readAsDataURL(this.$refs.file.files[0])
      // 绑定读取完毕事件
      fr.onload = () => {
        this.$set(this.newLapp, 'icon', fr.result)
      }
    },
    btnChange () {
      this.$refs.file.click()
    },
    filePathselect () {
      this.$refs.filePath.click()
    },
    filePathChange (e) {
      console.log('file path change', e)
      this.$set(this.newLapp, 'path', this.$refs.filePath.files[0].path)
    },
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
      this.list.splice(index, 1)
      this.$store.commit('setLappList', {list: this.list})
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
          if (this.editIndex === '') { // 添加应用
            let filter = this.list.filter(item => item.name === newLapp.name)
            if (filter.length > 0) {
              this.$message({
                message: '该应用已存在！',
                type: 'warning'
              })
              return
            } else {
              this.list.push(newLapp)
            }
          } else if (this.editIndex !== '') { // 修改应用
            console.log('修改')
            this.$set(this.list, this.editIndex, newLapp)
          }
          this.editIndex = ''
          this.dialogShow = false
          this.$refs[formName].resetFields()
          this.$store.commit('setLappList', {list: this.list})
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
  .app-icon{
    cursor: pointer;
  }
</style>