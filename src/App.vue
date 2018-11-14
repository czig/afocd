<template>
    <v-app id="app">
        <v-toolbar dark color="primary">
            <v-toolbar-title>AFOCD Degree Qualifications</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn flat to="/" router>Home</v-btn>
                <v-btn flat to="/update" router>Update</v-btn>
                <v-btn flat to="/view" router>View</v-btn>
                <v-btn flat to="/search" router>Search</v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <main>
            <router-view/>
        </main>
    </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
</style>
