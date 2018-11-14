<template>
    <v-container>
        <v-card>
            <v-card-title>
                {{ tableTitle }}
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
                :items="tableData"
                :pagination.sync="pagination"
                :loading="tableLoading"
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
export default {
    data() {
        return {
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
                  'text': 'Degree Type',
                  'value': 'degreeName',
                  'align': 'left',
                  'sortable': true,
                  'width': '40%'
                },
                {
                  'text': 'Chosen Degrees',
                  'value': 'numDegrees',
                  'align': 'right',
                  'sortable': true,
                  'width': '13%'
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
            pagination: {
                sortBy: 'tier'
            },
            search: "",
        }
    },
    props: {
        tableData: {
            type: Array,
            required: true
        },
        tableLoading: {
            type: Boolean,
            required: true
        },
        tableTitle: {
            type: String,
            required: false,
            default: 'Data'
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
        getNumTier: function(tier) {
            var rowsInTier = this.degreeQuals.filter((d) => {
                return d.tier === tier;
            })   
            return rowsInTier.length;
        },
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
