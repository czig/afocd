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
            <v-layout row>
                <v-spacer></v-spacer>
                <span :class="{hide: !lastUpdate}" class="mt-3 mr-3">
                    Last Update: {{ lastUpdate }}
                </span>
            </v-layout>
            <v-stepper-content step="1">
                <v-layout row>
                    <v-flex xs3>
                        <v-autocomplete v-model="chosenAfsc"
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
                            :disabled="!ready" 
                            :loading="degreeLoading"
                            @click="step=2">Continue</v-btn>
                </v-layout>
            </v-stepper-content>
            <v-stepper-content step="2">
                <nestedTable :tableData.sync="degreeTree"
                             :tableLoading="degreeLoading"
                             :tableTitle="chosenAfsc + ' Degrees'"
                             :afsc="chosenAfsc"
                             :groupedDegrees="cipCodesGrouped"
                             :degreeCounts="cipCodeCounts"
                             :degreeAutoComplete="cipList">
                </nestedTable>
                <v-layout row>
                    <v-btn color="warning" @click="step=1">Back</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="step=3">Continue</v-btn>
                </v-layout>
            </v-stepper-content>
            <v-stepper-content step="3">
                <editTable :data.sync="targetRates"
                               :dataLoading="degreeLoading"
                               :afsc="chosenAfsc">
                </editTable>
                <v-layout row>
                    <v-btn color="warning" @click="step=2">Back</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="success" :loading="submitLoading" @click="submit()">Submit</v-btn>
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
import EditTable from '@/components/editTable'
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
            cipCodesLookup: {},
            cipCodesGrouped: {},
            cipCodeCounts: {},
            cipList: [],
            submitLoading: false,
            gotDegrees: false,
            gotCips: false,
            lastUpdate: "",
            targetRates: [],
        }
    },
    components: {
        'nestedTable': NestedTable,
        'editTable': EditTable,
        'thanks': Thanks, 
    },
    computed: {
        ready: function() {
            return this.gotCips && this.gotDegrees;
        } 
    },
    methods: {
        submit: function() {
            var percentCheck =  this.targetRates.reduce((accum,val) => {
                return +val.percent + accum;
            },0)
            if (percentCheck !== 100) {
                alert('Not Submitted! Percentages must add to 100!')
                return;
            }
            var degreesSubmit = []
            this.submitLoading = true
            //flatten tree(make one array of all degrees)
            for(let i = 0; i < this.degreeTree.length; i++) {
                //remove properties/mutate from each child for submitting
                //to limit data sent in post
                var childrenSubmit = _.cloneDeep(this.degreeTree[i].children)
                childrenSubmit.forEach((d) => {
                    delete d.degreeType;
                    delete d.degreeName;
                    delete d.afsc;
                    delete d.key;
                    d.tier = d.tier.substring(0,1);
                })
                degreesSubmit = degreesSubmit.concat(childrenSubmit)
            }
            //send post for degree Quals
            var posts = []
            var degreeFormData = new FormData();
            degreeFormData.set('afsc',this.chosenAfsc)
            degreeFormData.set('person','1111111111A')
            //limit 100 objects per input to allow this to work with SAS
            //note: form properties will be degrees1, ..., degreesn to match
            //      what SAS wants to do implicity. Also have degrees0 and degrees_count
            //      to store number of chunks
            var numChunks = Math.ceil(degreesSubmit.length/100);
            var degreeChunks = []
            degreeFormData.set('degrees0',numChunks)
            degreeFormData.set('degrees_count',numChunks)
            for (let i = 0; i < numChunks; i++) {
                degreeChunks[i] = degreesSubmit.splice(0,100)
                degreeFormData.set('degrees'+(i+1),JSON.stringify(degreeChunks[i]))
            }
            posts.push(axios.post(submitDegreeQualsUrl, degreeFormData, {
                headers: {'Content-Type': 'multipart/form-data'}
            }).catch((err) => {
                alert('Something went wrong trying to send degree qualifications to the server. Please try again.') 
                console.log(err) 
                this.submitLoading = false 
            }))
            //drop properties before submitting target rates
            var targetRatesSubmit = this.targetRates.map((d) => {
                var outputObj = {}
                outputObj.tier = d.tier.substring(0,1);
                outputObj.criteria = d.criteria
                outputObj.percent = d.percent
                return outputObj;
            })
            console.log('targetRatesSubmit')
            console.log(targetRatesSubmit)
            //send post for target rates
            var targetFormData = new FormData();
            targetFormData.set('afsc',this.chosenAfsc)
            targetFormData.set('person','1111111111A')
            targetFormData.set('targetRates',JSON.stringify(targetRatesSubmit))
            for (var pair of targetFormData.entries()) {
                console.log(pair[0]+ ', '+pair[1])
            }
            posts.push(axios.post(submitTargetRatesUrl, targetFormData, {
                headers: {'Content-Type': 'multipart/form-data'}
            }).catch((err) => {
                alert('Something went wrong trying to send target rates to the server. Please try again.') 
                console.log(err) 
                this.submitLoading = false 
            }))

            //determine success after both post request complete
            axios.all(posts)
            .then((res) => {
                if (res) {
                    var success = res.every((d) => {
                        return (d.status === 200 && d.data.success === true);
                    })
                    if (success) {
                        this.step = 4 
                    } else {
                        alert('Something went wrong trying to communicate with the server. Please try again.') 
                    }
                } else {
                    alert('Something went wrong trying to communicate with the server. Please try again.') 
                }
                this.submitLoading = false 
            })
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
                    d.key = this.tierDecode[d.tier] + ',' + d.CIP_Code;
                    d.tier = this.tierDecode[d.tier];
                })
                //group by tier and degreeType for displaying in dataTable (array of objects)
                //children property is an array of degrees
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
                                            'key': d[0],
                                            'avgNumPerYear': d[1].reduce(function(accum,current) {
                                                return accum + +current.avgNumPerYear;
                                            },0),
                                            'avgPercentile': d[1].reduce(function(accum,current) {
                                                accum.denom += +current.avgNumPerYear;
                                                accum.numer += +current.avgNumPerYear*+current.avgPercentile;
                                                accum.avg = accum.numer/accum.denom;
                                                return accum;
                                            },
                                            {
                                                'denom': 0,
                                                'numer': 0,
                                                'avg' : 0
                                            }).avg || 0,
                                        }
                                    })
                                    .value();
        
                console.log('degreeTree')
                console.log(this.degreeTree)
                this.degreeLoading = false
                this.gotDegrees = true
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
                    d.percent = +d.percent
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

            //cip list for autocomplete
            var cipList = this.cipCodes.map((d) => {
                return d.CIP_Code + ' - ' + d.CIP_T; 
            })
            //cip Type list (gives ##.XXXX degrees)
            var cipTypeList = Object.keys(this.cipCodesGrouped).map((key) => {
                return key + ' - ' + this.cipCodesGrouped[key][0].CIP_T.split(',')[0];
            })
            //sort cipList for sending to component
            this.cipList = cipList.concat(cipTypeList).sort(function(a,b) {
                if (a > b) {
                    return 1;
                } else {
                    return -1;
                }
            });

            //get grouping of cip codes by first two digits to create a lookup for totals
            for (var degreeType in this.cipCodesGrouped) {
                if (this.cipCodesGrouped.hasOwnProperty(degreeType)) {
                    this.cipCodeCounts[degreeType] = this.cipCodesGrouped[degreeType].length
                }
            }
            this.gotCips = true;
        })
        .catch(function(error) {
            console.log(error)
        })


    }
}
</script>

<style scoped>
    .hide {
        visibility: hidden;
    }
</style>
