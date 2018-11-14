<template>
    <v-stepper v-model="step">
        <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">Select AFSC</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Edit Degrees</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 3" step="3">Edit Target Accession Rates</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">Complete</v-stepper-step>
        </v-stepper-header> 
        <v-stepper-items>
            <v-stepper-content step="1">
                <v-layout row>
                    <v-flex xs3>
                        <v-autocomplete :v-model="chosenAfsc"
                                    :items="afscs"
                                    :loading="afscLoading"
                                    label="Select an AFSC to continue."
                                    @input="getDegreeQuals($event)">
                        </v-autocomplete> 
                    </v-flex>
                </v-layout>
                <v-layout row>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" 
                            :disabled="firstDisabled" 
                            @click="step=2">Continue</v-btn>
                </v-layout>
            </v-stepper-content>
            <v-stepper-content step="2">
                <nestedTable :tableData="degreeTree"
                             :tableLoading="degreeLoading"
                             :tableTitle="chosenAfsc + ' Degrees'">
                </nestedTable>
                <v-layout row>
                    <v-btn color="warning" @click="step=1">Back</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="step=3">Continue</v-btn>
                </v-layout>
            </v-stepper-content>
            <v-stepper-content step="3">
                <v-layout row>
                    <v-btn color="warning" @click="step=2">Back</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="success" @click="step=4">Submit</v-btn>
                </v-layout>
            </v-stepper-content>
            <v-stepper-content step="4">
                <thanks></thanks>
                <v-layout row>
                    <v-btn color="warning" @click="step=3">Back</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" to="/" router>Home</v-btn>
                </v-layout>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
    
</template>

<script>
import axios from 'axios'
import NestedTable from '@/components/nestedTable'
import Thanks from '@/components/thanks'
export default {
    data() {
        return {
            step: 0,
            afscs: [],
            afscLoading: true,
            chosenAfsc: "",
            degreeLoading: false,
            degreeQuals: [],
            degreeTree: [],
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
            cipCodes: [],
            cipCodesGrouped: [],
            cipCodeCounts: {},
            firstDisabled: true
        }
    },
    components: {
        'nestedTable': NestedTable,
        'thanks': Thanks, 
    },
    computed: {
        
    },
    methods: {
        submit: function() {
            this.step = 4;
        },
        getDegreeQuals: function(chosenAfsc) {
            console.log(chosenAfsc)
            this.chosenAfsc = chosenAfsc
            this.firstDisabled = false
            this.degreeLoading = true
            axios.get('http://localhost:5005/api/getDegreeQuals',{
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
        }
    },
    created() {
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
    }
}
</script>
