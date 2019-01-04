<template>
    <v-container>
            <v-card class="elevation-2">
                <v-card-title>
                    {{ afsc }} Target Accession Rates 
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="800px" v-if="edits">
                        <v-btn slot="activator" align="right" color="primary" dark class="mb-2">New Target</v-btn>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container grid-list-md>
                                    <v-layout wrap>
                                        <v-flex xs12 sm4>
                                            <v-autocomplete v-model="edited.tier"
                                                            :items="tierSelection"
                                                            no-data-text="All Tiers Used!"
                                                            label="Tier">
                                            </v-autocomplete>

                                        </v-flex>
                                        <v-flex xs12 sm4>
                                            <v-autocomplete v-model="edited.criteria"
                                                            :items="criteriaSelection"
                                                            label="Criteria">
                                            </v-autocomplete>
                                            
                                        </v-flex>
                                        <v-flex xs12 sm4>
                                            <v-autocomplete v-model="edited.percent"
                                                            :items="percentSelection"
                                                            label="Percentage">
                                            </v-autocomplete>
                                            
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                                <v-btn color="blue darken-1" 
                                       flat 
                                       :disabled="dialogFull"
                                       @click.native="save">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-title>
                <v-data-table 
                    :headers="headers"
                    :items="data"
                    :loading="dataLoading"
                    :must-sort="true"
                    item-key="key"
                    hide-actions>
                    <template slot="items" slot-scope="props">
                        <tr>
                            <td class="text-xs-left">{{ props.item.tier }}</td>
                            <td class="text-xs-left">{{ props.item.criteria }}</td>
                            <td class="text-xs-left">{{ props.item.percent }}</td>
                            <td v-if="edits"
                                class="text-xs-right">
                                <v-icon small
                                        @click="editItem(props.item)">
                                    edit
                                </v-icon>
                                <v-icon small
                                        @click="deleteItem(props.item)">
                                    delete
                                </v-icon>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card>
        
    </v-container>
    
</template>

<script>
    export default {
        data() {
            return {
                dialog: false,
                edited: {
                    tier: "",
                    criteria: "",
                    percent: ""
                },
                headers: [
                    {
                      'text': 'Tier',
                      'value': 'tierOrder',
                      'align': 'left',
                      'sortable': true
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
                      'sortable': true
                    },
                ],
                actionsHeader: {
                  'text': 'Actions',
                  'value': 'name',
                  'align': 'right',
                  'sortable': false
                },
                tiers: ['Mandatory','Desired','Permitted'],
                tierOrder: {
                    'Mandatory': 1,
                    'Desired': 2,
                    'Permitted': 3,
                },
                criteria: [
                    ">=",
                    "<=",
                    "=",
                    ">",
                    "<"
                ],
                editForm: false,
                prevItem: {}
            }
        },
        props: {
            data: {
                type: Array,
                required: true
            },
            dataLoading: {
                type: Boolean,
                required: true
            },
            afsc: {
                type: String,
                required: true
            },
            edits: {
                type: Boolean,
                required: false,
                default: false,
            }
        },
        computed: {
            newRow: function() {
                var row = {} 
                row.tier = this.edited.tier
                row.tierOrder = this.tierOrder[this.edited.tier]
                row.criteria = this.edited.criteria
                row.percent = this.edited.percent
                row.key = this.edited.tier + this.edited.criteria + this.edited.percent
                return row;
            },
            percentSelection: function() {
                var reducer = (accumulator,value) => {
                    return accumulator + +value.percent
                }
                var sumPercentages = this.data.reduce(reducer,0) 
                //prevent inputs that make sum of percentages above 100
                var extraPercentage = 100 - sumPercentages
                var maxAllowable = this.editForm === true ? +this.prevItem.percent + extraPercentage :  extraPercentage
                return [...Array(maxAllowable + 1).keys()] 
            },
            tierSelection: function() {
                var usedTiers = this.data.map(d => d.tier)   
                //only allow one of each tier 
                var allowedTiers = this.tiers.filter((d) => {
                    return usedTiers.indexOf(d) < 0;
                })
                return this.editForm === true ? [this.prevItem.tier] : allowedTiers;
            },
            criteriaSelection: function() {
                //TODO: html encode/decode
                var limitedCriteria = [">",">=","="]
                //return array of criteria used
                var usedCriteria = this.data.map(d => d.criteria)
                //find out if one of the limited criteria are being used
                var limitedUsed = usedCriteria.some((d) => {
                    return limitedCriteria.indexOf(d) >= 0;
                })
                //if one of the limited criteria are being used, prevent any of the 
                //limited criteria from being selected 
                var allowedCriteria = this.criteria.filter((d) => {
                    return limitedUsed ? limitedCriteria.indexOf(d) < 0 : true;
                })
                //if editing form and criteria of item being edited is not in array, push it to array
                if (this.editForm === true && allowedCriteria.indexOf(this.prevItem.criteria) === -1) {
                    allowedCriteria.push(this.prevItem.criteria) 
                } 
                return allowedCriteria;
            },
            formTitle: function() {
                return this.editForm === true ? 'Edit Item' : 'New Item';
            },
            dialogFull: function() {
                //returns true if both strings are populated
                return !this.edited.tier || !this.edited.criteria || !this.edited.percent;
            }
        },
        methods: {
            sendDataToParent: function() {
                this.$emit('update:data', this.data)
            },
            deleteItem: function(item) {
                let index = this.data.indexOf(item)
                confirm('Are you sure you want to delete this tier?') && this.data.splice(index,1)
                this.sendDataToParent()
            },
            editItem: function(item) {
                console.log('edit')
                console.log(item)
                this.editForm = true
                this.prevItem = item
                //prepopulate values
                this.edited.tier = item.tier
                this.edited.criteria = item.criteria
                this.edited.percent = item.percent
                this.dialog = true 
            },
            close: function() {
                //close dialog
                this.dialog = false
                setTimeout(() => {
                    //reset inputs
                    this.prevItem = {}
                    this.edited.tier = ""
                    this.edited.criteria = ""
                    this.edited.percent = ""
                    //reset dialog properties
                    this.editForm = false
                }, 500)
            },
            save: function() {
                //TODO: find cleaner way to do rules (maybe rules prop on input?)
                var newRow = this.newRow
                if (newRow.criteria == "=" && newRow.percent != 100) {
                    alert('Strict Equality (=) only allowed with 100%!')
                    return;
                }
                if (this.editForm === true) {
                   let index = this.data.indexOf(this.prevItem)
                   Object.assign(this.data[index], this.newRow)
                } else {
                   this.data.push(this.newRow) 
                }
                this.sendDataToParent()
                this.close()
            }
        },
        created() {
            console.log('created editTable')
            if (this.edits) {
                this.headers.push(this.actionsHeader)
            }
        }
    }
</script>
