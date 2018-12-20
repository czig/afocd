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
                :items="data"
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
            data: []
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
    watch: {
        tableLoading: function() {
            this.data = this.tableData
        },
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
            this.$emit('update:tableData',this.data)   
        },
        deleteGroup: function(item) {
            let index = this.data.indexOf(item)
            if (index >= 0) {
                //we found the index of the item
                confirm('Are you sure you want to delete this degree group?') && this.data.splice(index,1)
                this.sendDataToParent()
            }
        },
        deleteSingle: function(item) {
            console.log('deleteSingle')
            var parentIndex = this.data.findIndex((d) => {
                return d.CIP_Code === item.degreeType && d.tier === item.tier; 
            })
            if (parentIndex >= 0) {
                //we found the correct parent
                const itemIndex = this.data[parentIndex].children.indexOf(item)
                if (itemIndex >= 0) {
                    //we found the child degree
                    confirm('Are you sure you want to delete this degree?') && this.data[parentIndex].children.splice(itemIndex,1)
                    this.updateDegreeNumbers()
                    this.sendDataToParent()
                }
            }
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
            //update number of degrees in each row
            this.data.map((d) => {
                d.numDegrees = d.children.length;    
            }) 
            //find and remove any parents with no children
            var emptyParent = this.data.filter((d) => {
                return d.children.length === 0;
            })[0]
            if (emptyParent) {
                console.log('splicing parent with empty children')
                var index = this.data.indexOf(emptyParent)
                this.data.splice(index,1)
            }
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
                //save called after an edit 
                this.editDegree(newRow)
            } else {
                //save called after adding a new degree 
                this.addNewDegree(newRow)
            }
            this.updateDegreeNumbers()
            this.sendDataToParent()
            this.close()
        },
        addNewParent: function(newDegree) {
            console.log('add single degree')
            var newParent = {}
            newParent.key = newDegree.tier + ',' + newDegree.degreeType
            newParent.CIP_Code = newDegree.degreeType
            newParent.degreeName = this.groupedDegrees[newDegree.degreeType][0].CIP_T.split(',')[0]
            newParent.tier = newDegree.tier
            newParent.tierOrder = newDegree.tierOrder
            newParent.children = [newDegree]
            newParent.numDegrees = 1
            newParent.total = this.degreeCounts[newDegree.degreeType]
            //add parent
            this.data.push(newParent)
        },
        editDegree: function(newRow) {
            //check if we are editing group of degrees or single degree
            if (_.includes(newRow.CIP_Code,".XXXX")) {
                //group of degrees
                //prevItem is degree group before editing
                let groupIndex = this.data.findIndex((d) => {
                    return d.key === this.prevItem.key;
                })
                this.data[groupIndex].tier = newRow.tier
                this.data[groupIndex].key = newRow.key 
                this.data[groupIndex].tierOrder = newRow.tierOrder
                let children = this.data[groupIndex].children
                children.forEach((g,j) => {
                    //update children
                    children[j].tier = newRow.tier 
                    children[j].key = newRow.tier + ',' + children[j].CIP_Code
                    children[j].tierOrder = newRow.tierOrder
                })
                //combine parents if necessary
                let parents = []
                for (let i = 0; i < this.data.length; i++) {
                    if (_.includes(parents,this.data[i].key)) {
                       let spouseIndex = parents.indexOf(this.data[i].key)
                       this.data[i].children = this.data[i].children.concat(this.data[spouseIndex].children)
                       this.data.splice(spouseIndex,1)
                       break;
                    }
                    parents.push(this.data[i].key)
                }
            } else {
                //single degree
                //prevItem is degree before editing
                var childDegree = {}
                //find index of parent that child degree edited from
                let prevParentIndex = this.data.findIndex((d) => {
                    return d.key === this.prevItem.tier + ',' + this.prevItem.degreeType;
                })
                //find index of child that was edited
                var children = this.data[prevParentIndex].children
                let childIndex = children.findIndex((g) => {
                    return g.key === this.prevItem.key;
                })
                //only apply edits if the child degree to edit was found
                console.log('childIndex')
                console.log(childIndex)
                if (childIndex >= 0) {
                    //we found the correct child (splice returns array)
                    childDegree = this.data[prevParentIndex].children.splice(childIndex,1)[0]
                    console.log(childDegree)
                    childDegree.tier = newRow.tier
                    childDegree.key = newRow.key
                    childDegree.tierOrder = newRow.tierOrder
                    //find out where new parent is (if exists)
                    let newParentIndex = this.data.findIndex((d) => {
                        return d.key === childDegree.tier + ',' + childDegree.degreeType;
                    })
                    //create new parent or assign child to found parent
                    console.log('new parentIndex')
                    console.log(newParentIndex)
                    console.log(this.data[newParentIndex])
                    if (newParentIndex === -1) {
                        //have to create new parent and assign childDegree
                        this.addNewParent(childDegree)
                    } else {
                        //parent exists, just add childDegree to parent's children
                        this.data[newParentIndex].children.push(childDegree)
                    }
                }
            }
        },
        addNewDegree: function(newRow) {
            //test for adding a group of degrees
            if (_.includes(newRow.CIP_Code,".XXXX")) {
                //degree group
                //add all degrees (if row with cipCode already exists, delete all rows with that cip code - 
                //cannot have one degree in two tiers, so have to remove all rows when adding all degrees)
                var match = this.data.filter((d) => {
                    return d.CIP_Code === newRow.CIP_Code; 
                })
                if (match.length > 0) {
                   //we can have multiple matches, remove all of them if the user agrees
                   for (let i = 0; i < match.length; i++) {
                       let index = this.data.indexOf(match[i])
                       confirm(`Are you sure you want to overwrite ${match[i].tier}: ${match[i].CIP_Code} - ${match[i].degreeName} (${match[i].numDegrees}) with ${newRow.tier}: ${newRow.CIP_Code} - ${newRow.degreeName} (${newRow.numDegrees})?`) && this.data.splice(index,1)
                       console.log('index')
                       console.log(index)
                   }
                } 
                //finally add new row with all degrees for that grouping
                this.data.push(newRow)
                console.log('match')
                console.log(match)
            } else {
                //single degree
                //find any parents with degree's degreeType
                var parentMatch = this.data.filter((d) => {
                    return d.CIP_Code === newRow.degreeType;
                })
                //first, remove degree from other parents (same degreeType but different tier)
                if (parentMatch.length > 0) {
                    //we found at least one parent (degreeType) 
                    console.log('parent match')
                    console.log(parentMatch)
                    //iterate through parents 
                    for (let i = 0; i < parentMatch.length; i++) {
                        //can only have one specific child degree per parent 
                        var childIndex = parentMatch[i].children.findIndex((d) => {
                            return d.CIP_Code === newRow.CIP_Code;
                        })
                        //we have child under parent if index >= 0
                        if (childIndex >= 0) {
                            //we found a match for current degree in children (overwrite current degree with new one if user confirms)
                            var childDegree = parentMatch[i].children[childIndex]
                            console.log('child index')
                            console.log(childIndex)
                            //only splice if different tier
                            if (childDegree.tier !== newRow.tier) {
                               //degree is same but tier is different
                               console.log('different tier')
                               let response = confirm(`Are you sure you want to overwrite ${childDegree.tier}: ${childDegree.CIP_Code} - ${childDegree.degreeName} with ${newRow.tier}: ${newRow.CIP_Code} - ${newRow.degreeName}?`)
                               if (response) {
                                  parentMatch[i].children.splice(childIndex,1)
                               } else {
                                  //if user cancel's, do not remove degree and do not add new degree
                                  return;
                               }
                           } else {
                               //same degree and tier - do nothing here 
                                alert('Degree currently in table.')
                                return;
                           }
                        }
                    }
                    //second, add single degree to correct parent (parent is combination of tier and degreeType)
                    //use findIndex method here because we can only return one parent
                    var correctParentKey = newRow.tier + ',' + newRow.degreeType;
                    var correctParentIndex = this.data.findIndex((d) => {
                        return d.key === correctParentKey;
                    })
                    console.log('correctParentIndex')
                    console.log(correctParentIndex)
                    if (correctParentIndex >= 0) {
                        //the correct parent exists
                        //find out if degree we are trying to add is already a child of parent
                        var childIndex = this.data[correctParentIndex].children.findIndex((d) => {
                            return d.key === newRow.key;
                        })
                        console.log('child index')
                        console.log(childIndex)
                        //only add degree to parent if degree is not there already
                        if (childIndex == -1) {
                            console.log('add child to existing parent')
                            console.log(newRow)
                            this.data[correctParentIndex].children.push(newRow) 
                        } 
                    } else {
                        //we cannot match a parent, so we need to create a parent and assign degree as a child 
                        this.addNewParent(newRow)
                    }
                } else {
                    //we do not match any parents (degreeTypes), so no removals necessary
                    //have to add a new parent with degree as a child
                    this.addNewParent(newRow)
                }
            }
        },
    },
    mounted() {
        console.log('mounted nestedTable')
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
