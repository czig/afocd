<template>
    <v-app id="app">
        <v-toolbar dark color="primary">
            <v-toolbar-title>AFSC Degree Qualifications Helper</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn flat to="/" router>Home</v-btn>
                <v-btn flat to="/update" router>Test Changes</v-btn>
                <v-btn flat to="/view" router>View</v-btn>
                <v-btn flat to="/search" router>Search</v-btn>
                <v-btn flat to="/faq" router>FAQs</v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <main>
            <loader v-if="!login" key="loader"></loader>
            <router-view v-if="login" key="content"></router-view>
        </main>
        
    </v-app>
</template>

<script>
import axios from 'axios'
import loader from '@/components/loader'
export default {
  name: 'App',
  data() {
    return {
        login: false
    }
  },
  components: {
    'loader': loader 
  },
  created() {
    console.log('created app')
    axios.get(getAfscsUrl)
    .then((res) => {
        console.log(res)
        this.login = true
        console.log('login success!')
    })
    .catch((err) => {
        console.log(err)
    })
  }
}
</script>

<style scoped>
.fade-enter-active {
    transition: all 0.5s; }
.fade-leave-active {
    transition: all 0.2s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
.fade-enter-to, .fade-leave {
    opacity: 1;
}
</style>
