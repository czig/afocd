<template>
    <v-container>
        <v-card>
            <v-card-title>
                All Degrees 
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
                :items="cipTree"
                :pagination.sync="pagination"
                :loading="cipLoading"
                :search="search"
                item-key="CIP_Code">
                <template slot="headers" slot-scope="props">
                    <tr>
                        <th v-for="header in props.headers"
                            :key="header.value"
                            :class="[{ 'column sortable': header.sortable }, pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                            :align="header.align"
                            :width="header.width"
                            @click="changeSort(header.value)">
                            {{ header.text }}
                            <v-icon small v-if="header.text">arrow_upward</v-icon> 
                        </th>
                    </tr>
                </template>
                <template slot="items" slot-scope="props">
                    <tr>
                        <td style="cursor: pointer;" @click="props.expanded = !props.expanded">
                            <v-icon :class="{activeRow: props.expanded}">keyboard_arrow_down</v-icon>
                        </td>
                        <td class="text-xs-left">{{ props.item.CIP_Code }}</td>
                        <td class="text-xs-left">{{ props.item.degreeName }}</td>
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
                                    class="text-xs-left">{{ props.item.CIP_Code }}</td>
                                <td :width="subHeaders[2].width"
                                    class="text-xs-left">{{ props.item.degreeName }}</td>
                                <td :width="subHeaders[3].width"
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
            cipLoading: true,
            chosenAfsc: "",
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
                  'text': 'CIP Code',
                  'value': 'CIP_Code',
                  'align': 'left',
                  'sortable': true,
                  'width': '15%'
                },
                {
                  'text': 'Degree Type',
                  'value': 'degreeName',
                  'align': 'left',
                  'sortable': true,
                  'width': '67%'
                },
                {
                  'text': 'Total Degrees',
                  'value': 'total',
                  'align': 'right',
                  'sortable': true,
                  'width': '13%'
                }
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
                  'text': 'CIP Code',
                  'value': 'CIP_Code',
                  'align': 'left',
                  'width': '15%'
                },
                {
                  'text': 'Degree Name',
                  'value': 'degreeName',
                  'align': 'left',
                  'width': '67%'
                },
                {
                  'text': '',
                  'value': 'total',
                  'align': 'right',
                  'width': '13%'
                }
            ],
            pagination: {
                sortBy: 'CIP_Code'
            },
            cipCodes: [],
            cipTree: [],
            cipCodeCounts: {},
            search: "",
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
            this.cipCodes.forEach((d) => {
                d.degreeName = d.CIP_T;
                d.degreeType = d.CIP_Code.substring(0,2) + ".XXXX"
                return d;
            })
            //children property is an array of degrees
            //TODO: improve grouping code
            this.cipTree = _.chain(this.cipCodes)
                                .groupBy(function(item) {
                                    return item.degreeType 
                                })
                                .toPairs()
                                .map((d,i) => {
                                    return {
                                        'CIP_Code': d[0],
                                        'degreeName': d[1][0].CIP_T.split(',')[0],
                                        'children': d[1],
                                        'total': d[1].length,
                                    }
                                })
                                .value();
            console.log('cipCodes')
            console.log(this.cipCodes)
            console.log('cipTree')
            console.log(this.cipTree)
            this.cipLoading = false;
        })
        .catch(function(error) {
            console.log(error)
        })

        //get grouping of cip codes by first two digits to create a lookup for totals
        axios.get('http://localhost:5005/api/getCipTypes')
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
</style>