<template>
    <v-container grid-list-md>
        <v-layout row>
            <div class="headline">Frequently Asked Questions (FAQs)</div>
        </v-layout>
        <v-spacer></v-spacer>
        <v-layout row wrap class="mt-5">
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">Where is the data coming from?</div> 
                    <v-card>
                        <v-card-text>
                            The data only include 5 years of USAFA and ROTC graduates meeting the Non-Rated Line (NRL) Officer AFSC Classification. 
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">Why are some AFSCs excluded?</div> 
                    <v-card>
                        <v-card-text>
                            We only include AFSCs that are used in the Non-Rated Line (NRL) Officer Classification model. 
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">What does CIP Code mean?</div> 
                    <v-card>
                        <v-card-text>
                            CIP stands for Classification of Instructional Program. CIP Codes are provided by the National Center for Education Statistics (NCES), and they are used to identify degrees for the degree qualifications. For more information, view the NCES site <a href="https://nces.ed.gov/ipeds/cipcode/Default.aspx?y=55" target="_blank" rel="noopener noreferrer">here</a> 
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">What do the 4 X's after some CIP Codes mean?</div> 
                    <v-card>
                        <v-card-text>
                            The four X's are used to denote a degree type. Degrees are grouped by their first two digits (before the period), and the last four digits are only used to specific the specific degree within that degree type.
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">How is Avg Grads/Year calculated?</div> 
                    <v-card>
                        <v-card-text>
                            We use 5 years of data to make the average. For each degree and each degree type, we count the number of USAFA and ROTC graduates with that degree or degree type and divide by 5. Unfortunately, we do not account for double-majors; we only use the first degree listed on each individual's record. 
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-content>
                    <div slot="header" class="subheading">What is Avg Percentile?</div> 
                    <v-card>
                        <v-card-text>
                            Average percentile is derived from class rank. Average percentile is a way of "normalizing" the class rank to a number between 1 and 0, where 1 denotes the top performer and 0 denotes the bottom performer. To generate Avg Percentile for each degree and degree type, we average the percentile of all USAFA and ROTC graduates with that degree or degree type. 
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-layout>
    </v-container>
    
</template>

<script>
    export default {
        
    }
</script>


