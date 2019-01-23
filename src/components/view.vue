<template>
    <v-container>
        <v-layout row>
            <v-flex xs3>
                <v-autocomplete v-model="chosenAfsc"
                            :items="afscs"
                            :loading="afscLoading"
                            label="Select an AFSC to continue."
                            @input="getDegreeQuals($event)">
                </v-autocomplete> 
            </v-flex>
            <v-spacer></v-spacer>
            <span :class="{hide: !lastUpdate}" class="mt-3 mr-3">
                Last Update: {{ lastUpdate }}
            </span>
        </v-layout>
        <v-card>
            <v-card-title>
                {{ chosenAfsc }} Target Accession Rates 
            </v-card-title>
            <v-data-table 
                :headers="targetHeaders"
                :items="targetRates"
                :loading="degreeLoading"
                :must-sort="true"
                item-key="key"
                hide-actions>
                <template slot="items" slot-scope="props">
                    <tr>
                        <td class="text-xs-left">
                            {{ props.item.tier }}
                        </td>
                        <td class="text-xs-left">
                            {{ props.item.criteria }}
                        </td>
                        <td class="text-xs-left">
                            {{ props.item.percent }}
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-divider></v-divider>
        <v-card class="mt-3">
            <v-card-title>
                {{ chosenAfsc }} Degrees
                <v-spacer></v-spacer> 
                <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details>
                </v-text-field>
            </v-card-title>
            <v-data-table 
                :headers="headers"
                :items="degreeTree"
                :pagination.sync="pagination"
                :loading="degreeLoading"
                :must-sort="true"
                :search="search"
                item-key="name">
                <template slot="headers" slot-scope="props">
                    <tr>
                        <th v-for="header in props.headers"
                            :key="header.value"
                            :class="[{ 'column sortable': header.sortable }, pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                            :align="header.align"
                            :width="header.width"
                            @click="changeSort(header.value)">
                            <v-tooltip top :max-width="300">
                                <span slot="activator">
                                    {{ header.text }}
                                </span>
                                <span>
                                    {{ header.tooltip || header.text }} 
                                </span>
                            </v-tooltip>
                            <v-icon small v-if="header.text">arrow_upward</v-icon> 
                        </th>
                    </tr>
                </template>
                <template slot="items" slot-scope="props">
                    <tr>
                        <td style="cursor: pointer;" @click="props.expanded = !props.expanded">
                            <v-icon :class="{activeRow: props.expanded}">keyboard_arrow_down</v-icon>
                        </td>
                        <td class="text-xs-left">{{ props.item.tier }}</td>
                        <td class="text-xs-left">{{ props.item.CIP_Code }}</td>
                        <td class="text-xs-left">{{ props.item.degreeName }}</td>
                        <td class="text-xs-right">{{ props.item.numDegrees }}</td>
                        <td class="text-xs-right">{{ props.item.total }}</td>
                    </tr>
                </template>
                <template slot="expand" slot-scope="props">
                    <v-data-table
                        :headers="subHeaders"
                        :items="props.item.children"
                        :pagination.sync="paginationSub"
                        item-key="CIP_Code"
                        hide-actions
                        hide-headers
                        >
                        <template slot="items" slot-scope="props">
                            <tr>
                                <td :width="subHeaders[0].width"
                                    class="text-xs-left"></td>
                                <td :width="subHeaders[1].width"
                                    class="text-xs-left"></td>
                                <td :width="subHeaders[2].width" 
                                    class="text-xs-left">{{ props.item.CIP_Code }}</td>
                                <td :width="subHeaders[3].width"
                                    class="text-xs-left">{{ props.item.degreeName }}</td>
                                <td :width="subHeaders[4].width"
                                    class="text-xs-right"></td>
                                <td :width="subHeaders[5].width"
                                    class="text-xs-right"></td>
                            </tr>
                        </template>
                    </v-data-table>
                </template>
                
            </v-data-table>
        </v-card>
    </v-container>
    
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            afscs: [],
            afscLoading: true,
            degreeLoading: false,
            chosenAfsc: "",
            lastUpdate: "",
            //headers for degree Type (first two digits followed by ".XXXX")
            headers: [
                {
                  'text': '',
                  'value': 'expand',
                  'align': 'left',
                  'sortable': false,
                  'width': '5%'
                },
                {
                  'text': 'Tier',
                  'value': 'tierOrder',
                  'align': 'left',
                  'sortable': true,
                  'width': '14%'
                },
                {
                  'text': 'CIP Code',
                  'value': 'CIP_Code',
                  'align': 'left',
                  'sortable': true,
                  'width': '15%'
                },
                {
                  'text': 'Degree Name',
                  'value': 'degreeName',
                  'tooltip': 'Name of a degree type (grouping of degrees) or single degree.',
                  'align': 'left',
                  'sortable': true,
                  'width': '30%'
                },
                {
                  'text': 'Chosen Degrees',
                  'value': 'numDegrees',
                  'tooltip': 'Number of degrees from this degree type chosen to be in this entry.',
                  'align': 'right',
                  'sortable': true,
                  'width': '13%'
                },
                {
                  'text': 'Total Degrees',
                  'value': 'total',
                  'tooltip': 'Number of degrees within this degree type.',
                  'align': 'right',
                  'sortable': true,
                  'width': '13%'
                },
            ],
            //headers for actual degrees in expansion panel
            //TODO: this can be a computed property
            subHeaders: [
                {
                  'text': '',
                  'value': 'expand',
                  'align': 'left',
                  'width': '6%' 
                },
                {
                  'text': '',
                  'value': 'tierOrder',
                  'align': 'left',
                  'width': '14%' 
                },
                {
                  'text': 'CIP Code',
                  'value': 'CIP_Code',
                  'align': 'left',
                  'width': '15%'
                },
                {
                  'text': 'Degree Name',
                  'value': 'degreeName',
                  'align': 'left',
                  'width': '40%'
                },
                {
                  'text': '',
                  'value': 'numDegrees',
                  'align': 'right',
                  'width': '13%'
                },
                {
                  'text': '',
                  'value': 'total',
                  'align': 'right',
                  'width': '13%'
                }
            ],
            targetHeaders: [
                {
                  'text': 'Tier',
                  'value': 'tierOrder',
                  'align': 'left'
                },
                {
                  'text': 'Criteria',
                  'value': 'criteria',
                  'align': 'left',
                  'sortable': false
                },
                {
                  'text': 'Percentage (%)',
                  'value': 'percent',
                  'align': 'left',
                },
            ],
            pagination: {
                sortBy: 'tierOrder',
                descending: false

            },
            degreeQuals: [],
            degreeTree: [],
            degreeCounts: [],
            cipCodes: [],
            cipCodesGrouped: [],
            cipCodeCounts: {},
            search: "",
            tierDecode: {
                'M': 'Mandatory',
                'D': 'Desired',
                'P': 'Permitted',
            },
            tierOrder: {
                'Mandatory': 1,
                'Desired': 2,
                'Permitted': 3,
            },
            targetRates: [],
            countM: 0,
            countD: 0,
            countP: 0, 
        }
    },
    computed: {
        paginationSub: {
            get: function() {
                var pagDeepCopy = _.clone(this.pagination,true);
                pagDeepCopy.rowsPerPage = -1; 
                return pagDeepCopy;
            },
            set: function(input) {
                //noop
                return;
            }
        },
        numM: function() {
            var rowsM = this.degreeQuals.filter(function(d) {
                return d.tier === 'M'; 
            });
            return rowsM.length; 
        },
        numD: function() {
            var rowsD = this.degreeQuals.filter(function(d) {
                return d.tier === 'D'; 
            })
            return rowsD.length;
        },
        numP: function() {
            var rowsP = this.degreeQuals.filter(function(d) {
                return d.tier === 'P'; 
            })
            return rowsP.length;
        },
    },
    methods: {
        changeSort: function(column) {
            //if someone clicks on the header for the expansions, do nothing
            if (column === 'expand') {
                return;
            }
            if (this.pagination.sortBy === column) {
                this.pagination.descending = !this.pagination.descending
            } else {
                this.pagination.sortBy = column    
                this.pagination.descending = false
            }
        },
        getNumTier: function(tier) {
            var rowsInTier = this.degreeQuals.filter((d) => {
                return d.tier === tier;
            })   
            return rowsInTier.length;
        },
        getDegreeQuals: function(chosenAfsc) {
            console.log(chosenAfsc)
            this.degreeLoading = true
            axios.get(getDegreeQualsUrl,{
                params: {
                    afsc: chosenAfsc
                }
            }).then((res) => {
                //we have received all qualifiying degrees and which tier they are in for afsc
                console.log(res.data.data)
                this.degreeQuals = res.data.data
                this.degreeQuals.map((d) => {
                    d.degreeType = d.CIP_Code.substring(0,2) + ".XXXX"
                    d.name = d.CIP_Code + " - " + d.degreeName;
                    d.tier = this.tierDecode[d.tier];
                })
                //group by tier and degreeType for displaying in dataTable (array of objects)
                //children property is an array of degrees
                //TODO: improve grouping code
                this.degreeTree = _.chain(res.data.data)
                                    .groupBy(function(item) {
                                        return item.tier + ","+item.degreeType 
                                    })
                                    .toPairs()
                                    .map((d,i) => {
                                        var tier = d[0].split(',')[0]
                                        var cip = d[0].split(',')[1]
                                        return {
                                            'tier': tier,
                                            'CIP_Code': cip,
                                            'degreeName': this.cipCodesGrouped[cip][0].CIP_T.split(',')[0],
                                            'children': d[1],
                                            'numDegrees': d[1].length,
                                            'total': this.cipCodeCounts[cip],
                                            'tierOrder': this.tierOrder[tier],
                                            'name': d[0]
                                        }
                                    })
                                    .value();
        
                console.log('degreeTree')
                console.log(this.degreeTree)
                this.degreeLoading = false
            }).catch(function(error) {
                console.log(error)
            })
            //get tier target accesion rates 
            axios.get(getTargetRatesUrl, {
                params: {
                    afsc: chosenAfsc
                }
            })
            .then((res) => {
                var data = res.data.data
                data.map((d) => {
                    d.tier = this.tierDecode[d.tier]
                    d.tierOrder = this.tierOrder[d.tier]
                    d.key = d.tier + d.criteria + d.percent;
                    return d;
                })
                this.targetRates = data
            })
            .catch(function(error) {
                console.log(error)
            })

            //get date of most recent update
            axios.get(getLastUpdateDateUrl, {
                params: {
                    afsc: chosenAfsc
                }
            })
            .then((res) => {
                var data = res.data.data
                this.lastUpdate = new Date(data['lastUpdate']).toDateString()
            })
            .catch(function(error) {
                console.log(error)
            })
        }
    },
    created() {
        console.log('created')
        //get list of Afscs for input 
        axios.get(getAfscsUrl)
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
        axios.get(getCipsUrl)
        .then((res) => {
            console.log(res.data.data[1])
            this.cipCodes = res.data.data
            this.cipCodes.forEach((d) => {
                d.degreeType = d.CIP_Code.substring(0,2) + ".XXXX"
                return d;
            })
            //group Cip codes by degreeType (first two digits followed by ".XXXX")
            this.cipCodesGrouped = _.chain(this.cipCodes)
                                     .groupBy('degreeType')  
                                     .value();
            console.log('cipcodesGrouped')
            console.log(this.cipCodesGrouped)
            console.log('cipCodes')
            console.log(this.cipCodes)
        })
        .catch(function(error) {
            console.log(error)
        })

        //get grouping of cip codes by first two digits to create a lookup for totals
        axios.get(getCipTypesUrl)
        .then((res) => {
            var data = res.data.data
            console.log(data[1])
            //build lookup (degreeType is key and total is value)
            for (let i = 0; i < data.length; i++) {
                this.cipCodeCounts[data[i].degreeType] = data[i].total
            }
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

<style scoped>
.hideCell {
    display: none;
} 
.activeRow {
    transform: rotate(-180deg);
}
    .hide {
        visibility: hidden;
    }
</style>
