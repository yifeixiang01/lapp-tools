import Store from 'electron-store'
const store = new Store()


const state = {
  list: store.get('androidAppList') || []
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
