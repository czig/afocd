<template>
    <v-container>
        <v-layout row>
            <v-flex xs12>
                <v-combobox :v-model="chosenAfsc"
                            :items="afscs"
                            :loading="afscLoading"
                            label="Select an AFSC to continue."
                            @input="getDegreeQuals($event)">
                </v-combobox> 
            </v-flex>
            <v-flex>
            </v-flex>
        </v-layout>
        <v-layout row justify-space-around>
            <v-flex v-for="tier in degreeTree" 
                    :key="tier.id"
                    xs4
                    >
                    {{ tier.name }}
                        <v-expansion-panel v-for="row in tier.children" 
                                            :key="row.id">
                            <v-expansion-panel-content>
                                <div slot="header">
                                    {{ row.name }} 
                                </div>
                                <v-list dense>
                                    <v-list-tile v-for="child in row.children" :key="child.id">
                                        <v-list-tile-content>{{ child.CIP_Code }} - {{ child.degreeName }}</v-list-tile-content> 
                                    </v-list-tile>
                                </v-list>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
            </v-flex>
        </v-layout>
    </v-container>
    
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            afscs: [],
            afscLoading: true,
            chosenAfsc: "",
            degreeQuals: [],
            degreeTree: [],
            cipCodes: []    
        }
    },
    computed: {
        
    },
    methods: {
        getDegreeQuals: function(chosenAfsc) {
            console.log(chosenAfsc)
            axios.get('http://localhost:5005/api/getDegreeQuals',{
                params: {
                    afsc: chosenAfsc
                }
            }).then((res) => {
                console.log(res.data.data)
                this.degreeQuals = res.data.data
                this.degreeQuals.map((d) => {
                    d.degreeType = d.CIP_Code.substring(0,2)
                })
                //TODO: improve grouping code
                this.degreeTree = _.chain(res.data.data)
                                    .groupBy('tier')
                                    .toPairs()
                                    .map(function(d,i) {
                                        return {
                                            'id': i,
                                            'name': d[0],
                                            'children': d[1]
                                        }
                                    })
                                    .value();
                this.degreeTree.forEach((d) => {
                    var groupedDegrees = _.chain(d.children)
                                         .groupBy('degreeType')  
                                         .toPairs()
                                         .map(function(g,i) {
                                            return {
                                                'id': i,
                                                'name': g[0] + '.XXXX',
                                                'children': g[1]
                                            }
                                         }) 
                                         .value();
                    d.children = groupedDegrees;
                })
                console.log('degreeTree')
                console.log(this.degreeTree)
            }).catch(function(error) {
                console.log(error)
            })
        }
    },
    created() {
        console.log('created')
        //get list of Afscs for input 
        axios.get('http://localhost:5005/api/getAfscs')
        .then((res) => {
            var afscObjects = res.data.data
            for (let i = 0; i < afscObjects.length; i++) {
                this.afscs.push(afscObjects[i].afsc) 
            }
            console.log(this.afscs)
            this.afscLoading = false 
        })
        .catch(function(error) {
            console.log(error)
        })

        //get list of cip codes 
        axios.get('http://localhost:5005/api/getCips')
        .then((res) => {
            console.log(res.data.data[1])
            this.cipCodes = res.data.data
        })
        .catch(function(error) {
            console.log(error)
        })
    },
    mounted() {
        console.log('mounted')
    }
}

</script>

<style>
    
</style>
