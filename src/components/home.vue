<template>
    <v-container grid-list-md>
        <v-layout row>
            <v-flex xs12>
                <v-card>
                    <v-card-title class="headline">Welcome!</v-card-title> 
                    <v-card-text>
                        This website is intented to aid in the process of creating AFSC degree qualifications. The data used on this website only includes USAFA and ROTC graduates meeting Non-Rated Line AFSC Classification.
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs4>
                <v-card>
                    <v-card-title class="title">Search</v-card-title>
                    <v-card-text>
                        Use the <router-link to="/search">SEARCH</router-link> tab to find individual degrees from the National Center for Education Statistics (NCES) list of degrees.
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs4>
                <v-card>
                    <v-card-title class="title">View</v-card-title>
                    <v-card-text>
                        Use the <router-link to="/view">VIEW</router-link> tab to view each AFSC's degree qualifications, as listed in the Air Force Officer Classification Directory (AFOCD).
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs4>
                <v-card>
                    <v-card-title class="title">Test Changes</v-card-title>
                    <v-card-text>
                        Use the <router-link to="/update">TEST CHANGES</router-link> table to adjust your AFSC's degree qualifications and obtain feedback. In future versions, this will submit your suggested changes to AFSC.
                    </v-card-text>
                </v-card>
            </v-flex>
            
        </v-layout>

    </v-container> 
</template>

<script>
    export default {
        
    }
</script>
