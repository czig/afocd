import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/home'
import View from '@/components/view'
import Search from '@/components/search'
import Update from '@/components/update'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home 
    },
    {
      path: '/view',
      name: 'View',
      component: View
    },
    {
      path: '/search',
      name: 'Search',
      component: Search 
    },
    {
      path: '/update',
      name: 'Update',
      component: Update 
    }
  ]
})
