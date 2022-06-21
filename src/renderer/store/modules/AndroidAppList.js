import Store from 'electron-store'
const store = new Store()

const defaultList = [
  {name: '微信', packageName: 'com.tencent.mm/com.tencent.mm.ui.LauncherUI', icon: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3336519328,2903738409&fm=26&gp=0.jpg', shape: 'square'},
  {name: '小场景', packageName: 'com.tencent.wecarmas/com.tencent.wecarmas.ui.activity.HomeActivity', icon: require('@/assets/wecarmas.png'), shape: 'circle'}
]

const state = {
  list: store.get('androidAppList') || defaultList
}

const mutations = {
  setAndroidAppList: (state, payload) => {
    console.log('setAndroidAppList', payload)
    state.list = payload.list
    store.set('androidAppList', payload.list)
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
