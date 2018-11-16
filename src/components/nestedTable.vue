<template>
    <v-container>
        <v-card class="elevation-2">
            <v-card-title>
                {{ tableTitle }}
                <v-spacer></v-spacer> 
                <!--<v-text-field-->
                    <!--v-model="search"-->
                    <!--append-icon="search"-->
                    <!--label="Search"-->
                    <!--single-line-->
                    <!--hide-details>-->
                <!--</v-text-field>-->
                <v-dialog v-model="dialog" max-width="800px">
                    <v-btn slot="activator" align="right" color="primary" dark class="mb-2">New Degree</v-btn>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout wrap>
                                    <v-flex xs12 sm4>
                                        <v-autocomplete v-model="edited.tier"
                                                        :items="tiers"
                                                        label="tier">
                                        </v-autocomplete>

                                    </v-flex>
                                    <v-flex xs12 sm8>
                                        <v-autocomplete v-model="edited.name"
                                                        :items="degreeAutoComplete"
                                                        :disabled="disableCipInputs"
                                                        label="CIP Code - Degree Name">
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
                :items="tableData"
                :pagination.sync="pagination"
                :loading="tableLoading"
                :search="search"
                item-key="key">
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
                        <td class="justify-center layout px-0">
                            <v-icon small
                                    class="mr-2 mt-3"
                                    @click="editGroup(props.item)">
                                edit
                            </v-icon>
                            <v-icon small
                                    class="mr-2 mt-3"
                                    @click="deleteGroup(props.item)">
                                delete
                            </v-icon>
                        </td>
                    </tr>
                </template>
                <template slot="expand" slot-scope="props" >
                    <v-data-table
                        :headers="subHeaders"
                        :items="props.item.children"
                        :pagination.sync="paginationSub"
                        item-key="key"
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
                                    class="text-xs-left">
                                    {{ props.item.CIP_Code }}
                                </td>
                                <td :width="subHeaders[3].width"
                                    class="text-xs-left">
                                    {{ props.item.degreeName }}
                                </td>
                                <td :width="subHeaders[4].width"
                                    class="text-xs-right"></td>
                                <td :width="subHeaders[5].width"
                                    class="text-xs-right"></td>
                                <td class="justify-center layout px-0">
                                    <v-icon small
                                            class="mr-2 mt-3"
                                            @click="editSingle(props.item)">
                                        edit
                                    </v-icon>
                                    <v-icon small
                                            class="mr-2 mt-3"
                                            @click="deleteSingle(props.item)">
                                        delete
                                    </v-icon>
                                </td>
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
                  'width': '30%'
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
                },
                {
                  'text': 'Actions',
                  'value': 'name',
                  'align': 'left',
                  'sortable': false,
                  'width': '10%'
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
                  'width': '30%'
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
                },
                {
                  'text': 'Actions',
                  'value': 'name',
                  'align': 'left',
                  'sortable': false,
                  'width': '10%'
                }
            ],
            pagination: {
                sortBy: 'tier'
            },
            search: "",
            edited: {
                name: "",
                tier: "",
            },
            editForm: false,
            prevItem: {},
            disableCipInputs: false,
            dialog: false,
            tiers: ['Mandatory','Desired','Permitted'],
            tierOrder: {
                'Mandatory': 1,
                'Desired': 2,
                'Permitted': 3,
            },
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
        },
        afsc: {
            type: String,
            required: true,
        },
        groupedDegrees: {
            type: Object,
            required: true
        },
        degreeCounts: {
            type: Object,
            required: true
        },
        degreeAutoComplete: {
            type: Array,
            required: false,
            default: []
        }
    },
    computed: {
        newRow: function() {
            var row = {}
            var cip = this.edited.name.split(' - ')[0]
            var degreeName = this.edited.name.split(' - ')[1]
            row.key = this.edited.tier + ',' + cip; 
            row.CIP_Code = cip  
            row.degreeName = degreeName 
            row.tier = this.edited.tier
            row.tierOrder = this.tierOrder[this.edited.tier]
            //add properties depending on adding group or single degree
            if (_.includes(cip, ".XXXX")) {
                //properties for group of degrees 
                console.log('childMap')
                row.children = this.groupedDegrees[cip].map((d) => {
                    var degree = {}
                    degree.key = this.edited.tier + ',' + d.CIP_Code; 
                    degree.CIP_Code = d.CIP_Code
                    degree.degreeName = d.CIP_T
                    degree.tier = this.edited.tier
                    degree.tierOrder = this.tierOrder[this.edited.tier]
                    degree.afsc = this.afsc
                    degree.degreeType = row.CIP_Code
                    return degree;
                }) 
                console.log(row.children)
                row.numDegrees = this.groupedDegrees[cip].length
                row.total = this.degreeCounts[cip]
            } else {
                //properties for single degree
                row.afsc = this.afsc
                row.degreeType = cip.substring(0,2) + ".XXXX"
            }
            return row;
        },
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
        formTitle: function() {
            return this.editForm === true ? 'Edit Item' : 'New Item';
        },
        dialogFull: function() {
            //returns true if both strings are populated
            return !this.edited.tier || !this.edited.name;
        }
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
        sendDataToParent: function() {
            this.$emit('update:tableData',this.tableData)   
        },
        deleteGroup: function(item) {
            let index = this.tableData.indexOf(item)
            confirm('Are you sure you want to delete this degree?') && this.tableData.splice(index,1)
            this.sendDataToParent()
        },
        deleteSingle: function(item) {
            console.log('deleteSingle')
            var parentDegree = this.tableData.filter((d) => {
                return d.CIP_Code === item.degreeType; 
            })[0]
            const parentIndex = this.tableData.indexOf(parentDegree)
            const itemIndex = this.tableData[parentIndex].children.indexOf(item)
            confirm('Are you sure you want to delete this degree?') && this.tableData[parentIndex].children.splice(itemIndex,1)
            this.updateDegreeNumbers()
            this.sendDataToParent()
        },
        editGroup: function(item) {
            this.editForm = true
            this.prevItem = item
            this.edited.tier = item.tier
            this.edited.name = item.CIP_Code + ' - ' + item.degreeName
            this.disableCipInputs = true
            this.dialog = true
        },
        editSingle: function(item) {
            this.editForm = true
            this.prevItem = item
            this.edited.tier = item.tier
            this.edited.name = item.CIP_Code + ' - ' + item.degreeName
            this.disableCipInputs = true
            this.dialog = true 
        },
        updateDegreeNumbers: function() {
            this.tableData.map((d) => {
                d.numDegrees = d.children.length;    
            }) 
        },
        close: function() {
            //close dialog
            this.dialog = false
            setTimeout(() => {
                //reset inputs
                this.prevItem = {}
                this.edited.tier = ""
                this.edited.name = ""
                //reset dialog properties
                this.editForm = false
                this.disableCipInputs = false
            }, 500)
        },
        save: function() {
            var newRow = this.newRow;
            if (this.editForm === true) {
                //save was called after an edit, must update tier 
                if (_.includes(newRow.CIP_Code,".XXXX")) {
                    //group of degrees
                    this.tableData.forEach((d,i) => {
                        //only one row will match on key
                        if (d.key === this.prevItem.key) {
                            //update parent
                            this.tableData[i].tier = newRow.tier
                            this.tableData[i].key = newRow.key 
                            this.tableData[i].tierOrder = newRow.tierOrder
                            let children = this.tableData[i].children
                            children.forEach((g,j) => {
                                //update children
                                children[j].tier = newRow.tier 
                                children[j].key = newRow.tier + ',' + children[j].CIP_Code
                                children[j].tierOrder = newRow.tierOrder
                            })
                        }
                    })
                    //combine parents if necessary
                    let parents = []
                    for (let i = 0; i < this.tableData.length; i++) {
                        if (_.includes(parents,this.tableData[i].key)) {
                           let spouseIndex = parents.indexOf(this.tableData[i].key)
                           this.tableData[i].children = this.tableData[i].children.concat(this.tableData[spouseIndex].children)
                           this.tableData.splice(spouseIndex,1)
                           break;
                        }
                        parents.push(this.tableData[i].key)
                    }
                } else {
                    //single degree
                    var childDegree = {}
                    //find child degree and strip from parent
                    this.tableData.forEach((d,i) => {
                        if (d.key === this.prevItem.tier + ',' + this.prevItem.degreeType) {
                            //we found the correct parent
                            let children = this.tableData[i].children
                            var childIndex = children.findIndex((g) => {
                                return g.key === this.prevItem.key;
                            })
                            console.log('childIndex')
                            console.log(childIndex)
                            if (childIndex >= 0) {
                                childDegree = this.tableData[i].children.splice(childIndex,1)[0]
                                console.log(childDegree)
                                childDegree.tier = newRow.tier
                                childDegree.key = newRow.key
                                childDegree.tierOrder = newRow.tierOrder
                            }
                        }
                    })
                    //find out where parent is (if exists)
                    let parentIndex = this.tableData.findIndex((d) => {
                        return d.key === childDegree.tier + ',' + childDegree.degreeType;
                    })
                    console.log('parentIndex')
                    console.log(parentIndex)
                    console.log(this.tableData[parentIndex])
                    if (parentIndex === -1) {
                        //have to create new parent and assign childDegree
                        let newParent = {}
                        newParent.key = childDegree.tier + ',' + childDegree.degreeType
                        newParent.CIP_Code = childDegree.degreeType
                        newParent.degreeName = this.groupedDegrees[childDegree.degreeType][0].CIP_T.split(',')[0]
                        newParent.tier = childDegree.tier
                        newParent.tierOrder = childDegree.tierOrder
                        newParent.children = [childDegree]
                        newParent.numDegrees = 1
                        newParent.total = this.degreeCounts[childDegree.degreeType]
                        //add parent
                        this.tableData.push(newParent)
                        
                    } else {
                        //parent exists, just add childDegree to parent's children
                        this.tableData[parentIndex].children.push(childDegree)
                    }
                }
            } else {
                //test for adding a group of degrees
                if (_.includes(newRow.CIP_Code,".XXXX")) {
                    //add all degrees (if row with cipCode already exists, delete all rows with that cip code - cannot have one degree in two tiers, so have to remove all rows when adding all degrees)
                    //match is an array
                    var match = this.tableData.filter((d) => {
                        return d.CIP_Code === newRow.CIP_Code; 
                    })
                    if (match.length > 0) {
                       //we can have multiple matches, remove all of them if the user agrees
                       for (let i = 0; i < match.length; i++) {
                           let index = this.tableData.indexOf(match[i])
                           confirm(`Are you sure you want to overwrite ${match[i].tier}: ${match[i].CIP_Code} - ${match[i].degreeName} (${match[i].numDegrees}) with ${newRow.tier}: ${newRow.CIP_Code} - ${newRow.degreeName} (${newRow.numDegrees})?`) && this.tableData.splice(index,1)
                           console.log('index')
                           console.log(index)
                       }
                    } 
                    //finally add new row with all degrees for that grouping
                    this.tableData.push(newRow) 
                    console.log('match')
                    console.log(match)
                } else {
                    //TODO: test this
                    //remove degree from other parents (same degreeType but different tier)
                    //find any parents with degree's degreeType
                    var parentMatch = this.tableData.filter((d) => {
                        return d.CIP_Code === newRow.degreeType;
                    })
                    if (parentMatch.length > 0) {
                        //we found a parent (degreeType) 
                        console.log('parent match')
                        console.log(parentMatch)
                        for (let i = 0; i < parentMatch.length; i++) {
                            //can only have one specific degree per parent 
                            var match = parentMatch[i].children.filter((d) => {
                                return d.CIP_Code === newRow.CIP_Code;
                            })[0]
                            if (match) {
                                //we found a match for current degree in children (overwrite current degree with new one if user confirms)
                                console.log('child match')
                                console.log(match)
                                //only splice if different tier
                                if (match.tier !== newRow.tier) {
                                   //degree is same but tier is different
                                    console.log('different tier')
                                   let index = parentMatch[i].children.indexOf(match)
                                   let response = confirm(`Are you sure you want to overwrite ${match.tier}: ${match.CIP_Code} - ${match.degreeName} with ${newRow.tier}: ${newRow.CIP_Code} - ${newRow.degreeName}?`)
                                   if (response) {
                                      parentMatch[i].children.splice(index,1)
                                   } else {
                                      //if user cancel's, do not remove degree and do not add new degree
                                      break;
                                   }
                               } else {
                                   //same degree and tier - do nothing here 
                                    alert('Degree currently in table.')
                               }
                            }
                        }
                        //TODO: test this (does filter return a new object or a pointer?)
                        //add singular degree to correct parent (parent is combination of tier and degreeType)
                        var correctParentKey = newRow.tier + ',' + newRow.degreeType;
                        var correctParentMatch = this.tableData.filter((d) => {
                            return d.key === correctParentKey;
                        })[0]
                        if (correctParentMatch) {
                            //find out if degree we are trying to add is already a child of parent
                            var childMatch = correctParentMatch.children.filter((d) => {
                                return d.key === newRow.key;
                            })[0]
                            //only add degree to parent if degree is not there already
                            if (!childMatch) {
                                correctParentMatch.children.push(newRow) 
                            } 
                        } else {
                            //we cannot match a parent, so we need to create a parent and assign degree as a child 
                            console.log('add single degree')
                            var newParent = {}
                            newParent.key = newRow.tier + ',' + newRow.degreeType
                            newParent.CIP_Code = newRow.degreeType
                            newParent.degreeName = this.groupedDegrees[newRow.degreeType][0].CIP_T.split(',')[0]
                            newParent.tier = newRow.tier
                            newParent.tierOrder = newRow.tierOrder
                            newParent.children = [newRow]
                            newParent.numDegrees = 1
                            newParent.total = this.degreeCounts[newRow.degreeType]
                            //add parent
                            this.tableData.push(newParent)
                        }
                    } else {
                        //we do not match any parents (degreeTypes)
                        //have to add a new parent with degree as a child
                        console.log('add single degree')
                        var newParent = {}
                        newParent.key = newRow.tier + ',' + newRow.degreeType
                        newParent.CIP_Code = newRow.degreeType
                        newParent.degreeName = this.groupedDegrees[newRow.degreeType][0].CIP_T.split(',')[0]
                        newParent.tier = newRow.tier
                        newParent.tierOrder = newRow.tierOrder
                        newParent.children = [newRow]
                        newParent.numDegrees = 1
                        newParent.total = this.degreeCounts[newRow.degreeType]
                        //add parent
                        this.tableData.push(newParent)
                    }
                }
            }
            this.updateDegreeNumbers()
            this.sendDataToParent()
            this.close()
        }
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
