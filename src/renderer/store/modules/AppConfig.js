import adb from '../../../main/tools/index.js'
import Store from 'electron-store'

const store = new Store()
let AppConfig = store.get('AppConfig') || { outputPath: '' }

const state = {
  hostIP: adb._getIPAddress(), // 电脑IP
  userId: '', // 车机共享功能用到，该用户在服务端的id
  outputPath: AppConfig.outputPath // 文件输出目录
}

const mutations = {
  setConfig: (state, payload) => {
    Object.assign(state, payload)
    store.set('AppConfig', state)
  }
}

const actions = {

}

export default {
  state,
  mutations,
  actions
}
