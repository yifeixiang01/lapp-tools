import Store from 'electron-store'
const store = new Store()

const state = {
  list: store.get('lappList') || [],
  selectedLapp: null
}

const mutations = {
  setLappList: (state, payload) => {
    console.log('setLappList', payload)
    state.list = payload.list
    store.set('lappList', payload.list)
  },
  // 设置选择的轻应用
  setSelectedLapp: (state, payload) => {
    state.selectedLapp = payload.selectedLapp
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
