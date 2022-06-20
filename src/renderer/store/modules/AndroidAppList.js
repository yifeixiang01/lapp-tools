import Store from 'electron-store'
const store = new Store()

const defaultList = [
  {name: '微信', icon: '', src: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3336519328,2903738409&fm=26&gp=0.jpg', shape: 'square', packageName: 'com.tencent.mm/com.tencent.mm.ui.LauncherUI'}
]

const storeList = store.get('androidAppList') || []

const state = {
  list: defaultList.concat(storeList)
}

const mutations = {
  setAndroidAppList: (state, payload) => {
    console.log('setAndroidAppList', payload)
    state.list = payload.list
    store.set('list', payload.list)
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
