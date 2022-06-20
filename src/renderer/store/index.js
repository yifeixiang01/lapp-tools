import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  actions: {

  },
  getters: {
    selectedLapp: state => {
      return state.lappList.filter(item => item.selected)
    }
  },
  modules
})
