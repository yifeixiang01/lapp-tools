import Store from 'electron-store'
const store = new Store()

const state = {
  list: store.get('lappList') || [],
  selectedLapp: null,
  aimDirection: null
}

const mutations = {
  setLappList: (state, payload) => {
    console.log('setLappList', payload)
    state.list = payload.list
    store.set('list', payload.list)
  },
  // 设置选择的轻应用
  setSelectedLapp: (state, payload) => {
    state.selectedLapp = payload.selectedLapp
  },
  // 设置车机上要push的文件夹
  setAimDirection: (state, payload) => {
    state.aimDirection = payload.aimDirection
  }
}
const actions = {

}
const getters = {

}

export default {
  state,
  mutations,
  actions,
  getters
}
