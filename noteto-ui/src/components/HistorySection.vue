<template>
  <v-container>
    <v-card elevation="0">
      <v-card-title>History</v-card-title>
      <v-card-text>
        <div v-for="(history, idxI) in historyLst" :key="history._id">
          <div>
            {{ history.createdBy.first }} {{ history.createdBy.last }} -
            <span class="font-italic">
              {{ new Date(history.dateCreated).toLocaleString() }}
            </span>
          </div>

          <v-container style="border-left: 1px solid lightblue" class="ml-2">
            <div
              v-for="(value, name, idxJ) in history.changes"
              :key="`${history._id}-${idxJ}`"
            >
              <div v-if="fieldToField[name].type != 'list'">
                {{ fieldToField[name].displayName }} - from
                <span class="blue--text text--lighten-2">
                  {{ getEntryText(fieldToField[name], value.from) }}
                </span>
                to
                <span class="blue--text text--lighten-2">
                  {{ getEntryText(fieldToField[name], value.to) }}
                </span>
              </div>
              <div v-else>
                {{ fieldToField[name].displayName }} -
                <span class="blue--text text--lighten-2">'Updated'</span>
              </div>
            </div>
          </v-container>
          <v-divider
            v-if="idxI != historyLst.length - 1"
            class="my-2"
          ></v-divider></div
      ></v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import mixin from "@/js/mixin.js";
export default {
  name: "HistorySection",
  mixins: [mixin],
  mounted: function () {},
  props: {
    historyLst: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {},
};
</script>
