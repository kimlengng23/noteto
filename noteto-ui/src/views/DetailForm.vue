<template>
  <v-container>
    <v-card elevation="0">
      <v-card-title class="d-flex justify-space-between">
        <div class="text-left">
          <p class="text-primary">
            <span class="text-muted">Entry Number:</span>
            {{ entry.id }}
            <v-progress-circular
              indeterminate
              color="primary"
              v-if="setTimeoutLoading"
            ></v-progress-circular>
          </p>
          <p class="text-primary">
            <span class="text-muted">Created Date:</span>
            {{ convertSecondsToDate(entry.dateCreated) }}
          </p>
          <p class="text-primary">
            <span class="text-muted">Owner:</span>
            {{ getFullName(entry.owner) }}
          </p>
        </div>
        <div class="mt-5">
          <v-btn
            v-if="!isEditing"
            rounded
            class="warning ml-2"
            depressed
            @click="isEditing = !isEditing"
            :disabled="!isLoggedIn"
            ><i class="fas fa-pencil-alt mr-2"></i
            ><span v-if="!isEditing">Edit</span
            ><span v-else>Stop Editing</span></v-btn
          >
          <v-btn
            v-else
            rounded
            class="primary ml-2"
            depressed
            @click="isEditing = !isEditing"
            :disabled="!isLoggedIn"
            ><i class="fas fa-pencil-alt mr-2"></i>Stop Editing</v-btn
          >
          <v-btn
            rounded
            class="success ml-2"
            depressed
            @click="updateEntry"
            :loading="isLoading"
            :disabled="!isLoggedIn || !isDirty"
            ><i class="fa fa-save mr-2"></i>Update</v-btn
          >
        </div>
      </v-card-title>
      <v-card-text
        ><v-row>
          <v-col cols="11">
            <div class="card bg-light">
              <div
                class="card-header d-flex flex-row justify-content-between"
              ></div>
              <div class="card-body text-primary bg-white">
                <v-row v-for="(row, idxI) in rows" :key="`row-${idxI}`">
                  <p
                    class="font-weight-bold headline black--text"
                    v-show="row.label != ''"
                  >
                    {{ row.label }}
                  </p>
                  <v-col v-for="(col, idxJ) in row.cols" :key="`col-${idxJ}`">
                    <p
                      class="font-weight-bold subtitle-1 black--text text-start"
                      v-if="col.label != ''"
                    >
                      {{ col.label }}
                    </p>
                    <v-text-field
                      v-else-if="fieldToField[col.field].type === 'singleLine'"
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      :readonly="!isEditing"
                    ></v-text-field>
                    <v-text-field
                      v-else-if="fieldToField[col.field].type === 'number'"
                      :label="fieldToField[col.field].displayName"
                      v-model.number="entry[col.field]"
                      :readonly="!isEditing"
                    ></v-text-field>
                    <vuetify-money
                      v-else-if="
                        fieldToField[col.field].type === 'currencyInDollar'
                      "
                      :label="fieldToField[col.field].displayName"
                      v-model.number="entry[col.field]"
                      :options="fieldToField[col.field].options"
                      :readonly="!isEditing"
                    ></vuetify-money>
                    <vuetify-money
                      v-else-if="fieldToField[col.field].type === 'weightInKg'"
                      :label="fieldToField[col.field].displayName"
                      v-model.number="entry[col.field]"
                      :options="fieldToField[col.field].options"
                      :readonly="!isEditing"
                    ></vuetify-money>
                    <vuetify-money
                      v-else-if="fieldToField[col.field].type === 'weightInLb'"
                      :label="fieldToField[col.field].displayName"
                      v-model.number="entry[col.field]"
                      :options="fieldToField[col.field].options"
                      :readonly="!isEditing"
                    ></vuetify-money>
                    <v-textarea
                      v-else-if="
                        fieldToField[col.field].type === 'multipleLines'
                      "
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      :readonly="!isEditing"
                    ></v-textarea>
                    <v-autocomplete
                      @change="automate(col.field)"
                      v-else-if="
                        fieldToField[col.field].type === 'singleSelect'
                      "
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      return-object
                      :items="fieldToChoices[col.field]"
                      item-text="displayName"
                      :readonly="!isEditing"
                    ></v-autocomplete>
                    <v-autocomplete
                      v-else-if="
                        fieldToField[col.field].type === 'multipleSelect'
                      "
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      return-object
                      :items="fieldToChoices[col.field]"
                      deletable-chipsoutlined
                      multiple
                      chips
                      deletable-chips
                      :readonly="!isEditing"
                    ></v-autocomplete>
                    <v-autocomplete
                      @change="automate(col.field)"
                      v-else-if="fieldToField[col.field].type === 'singleUser'"
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      return-object
                      :items="users"
                      :item-text="getFullName"
                      :readonly="!isEditing"
                    ></v-autocomplete>
                    <v-autocomplete
                      v-else-if="
                        fieldToField[col.field].type === 'multipleUsers'
                      "
                      :label="fieldToField[col.field].displayName"
                      v-model="entry[col.field]"
                      return-object
                      :items="users"
                      :item-text="getFullName"
                      deletable-chipsoutlined
                      multiple
                      chips
                      deletable-chips
                      :readonly="!isEditing"
                    ></v-autocomplete>
                    <v-menu
                      v-else-if="fieldToField[col.field].type === 'date'"
                      v-model="datePicker[col.field]"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="290px"
                      :readonly="!isEditing"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="formatDate(entry[col.field])"
                          :label="fieldToField[col.field].displayName"
                          persistent-hint
                          prepend-icon="mdi-calendar"
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="entry[col.field]"
                        no-title
                        @input="datePicker[col.field] = false"
                      ></v-date-picker>
                    </v-menu>
                    <div v-else-if="fieldToField[col.field].type === 'list'">
                      <v-row>
                        <v-col
                          ><p class="font-weight-bold subtitle-1 black--text">
                            {{ fieldToField[col.field].displayName }}
                          </p></v-col
                        >
                      </v-row>
                      <v-row
                        v-for="(lRow, lIdxI) in entry[col.field]"
                        :key="lIdxI"
                      >
                        <v-col
                          v-for="(field, lIdxJ) in fieldToField[col.field]
                            .listFields"
                          :key="lIdxJ"
                        >
                          <v-text-field
                            v-if="field.type === 'singleLine'"
                            :label="field.displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            :readonly="!isEditing"
                          ></v-text-field>
                          <v-text-field
                            v-else-if="field.type === 'number'"
                            :label="field.displayName"
                            v-model.number="
                              entry[col.field][lIdxI][field.value]
                            "
                            :readonly="!isEditing"
                          ></v-text-field>
                          <vuetify-money
                            v-else-if="field.type === 'currencyInDollar'"
                            :label="field.displayName"
                            v-model.number="
                              entry[col.field][lIdxI][field.value]
                            "
                            :options="field.options"
                            :readonly="!isEditing"
                          ></vuetify-money>
                          <vuetify-money
                            v-else-if="field.type === 'weightInKg'"
                            :label="field.displayName"
                            v-model.number="
                              entry[col.field][lIdxI][field.value]
                            "
                            :options="field.options"
                            :readonly="!isEditing"
                          ></vuetify-money>
                          <vuetify-money
                            v-else-if="field.type === 'weightInLb'"
                            :label="field.displayName"
                            v-model.number="
                              entry[col.field][lIdxI][field.value]
                            "
                            :options="field.options"
                            :readonly="!isEditing"
                          ></vuetify-money>
                          <v-textarea
                            v-else-if="field.type === 'multipleLines'"
                            :label="field.displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            :readonly="!isEditing"
                          ></v-textarea>
                          <v-autocomplete
                            @change="automate(col.field)"
                            v-else-if="field.type === 'singleSelect'"
                            :label="field.displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            return-object
                            :items="fieldToChoices[field.value]"
                            :readonly="!isEditing"
                          ></v-autocomplete>
                          <v-autocomplete
                            v-else-if="field.type === 'multipleSelect'"
                            :label="field.displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            return-object
                            :items="fieldToChoices[field.value]"
                            deletable-chipsoutlined
                            multiple
                            chips
                            deletable-chips
                            :readonly="!isEditing"
                          ></v-autocomplete>
                          <v-autocomplete
                            @change="automate(col.field)"
                            v-else-if="
                              fieldToField[col.field].type === 'singleUser'
                            "
                            :label="fieldToField[col.field].displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            return-object
                            :items="users"
                            :item-text="getFullName"
                            :readonly="!isEditing"
                          ></v-autocomplete>
                          <v-autocomplete
                            v-else-if="
                              fieldToField[col.field].type === 'multipleUsers'
                            "
                            :label="fieldToField[col.field].displayName"
                            v-model="entry[col.field][lIdxI][field.value]"
                            return-object
                            :items="users"
                            :item-text="getFullName"
                            deletable-chipsoutlined
                            multiple
                            chips
                            deletable-chips
                            :readonly="!isEditing"
                          ></v-autocomplete>
                          <v-menu
                            v-else-if="field.type === 'date'"
                            v-model="datePicker[`${field.value}-${lIdxI}`]"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                :value="
                                  formatDate(
                                    entry[col.field][lIdxI][field.value]
                                  )
                                "
                                :label="field.displayName"
                                persistent-hint
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"
                                autocomplete="off"
                                :readonly="!isEditing"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="entry[col.field][lIdxI][field.value]"
                              no-title
                              @input="
                                datePicker[`${field.value}-${lIdxI}`] = false
                              "
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col>
                          <v-btn
                            rounded
                            color="error mt-2"
                            depressed
                            @click="removeFromList(lIdxI, col.field)"
                            :disabled="!isEditing"
                            ><i class="fas fa-trash-alt"></i
                          ></v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                          ><v-btn
                            rounded
                            color="primary ml-2"
                            depressed
                            @click="addRowIntoList(col.field)"
                            :disabled="!isEditing"
                            ><i class="fas fa-plus mr-2"></i>Add</v-btn
                          ></v-col
                        >
                      </v-row>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>
          <v-col cols="1">
            <div>
              <v-btn
                class="primary mb-2"
                v-for="(btn, idx) in autoButtons"
                :key="`auto-btn-${idx}`"
                depressed
                rounded
                @click="setValue(btn.actField, btn.actValue)"
                >{{ getActValue(btn.actField, btn.actValue) }}</v-btn
              >
              <v-btn
                class="primary"
                v-for="(btn, idx) in linkButtons"
                :key="`link-btn-${idx}`"
                depressed
                rounded
                target="_blank"
                :href="processLink(btn.link)"
                >{{ btn.btnName }}</v-btn
              >
              <!-- <v-btn
                class="mb-2"
                depressed
                rounded
                :color="btn.color"
                v-for="(btn, btnIdx) in autoButtons"
                :key="btnIdx"
                :href="getLinkFromButton(btn)"
                v-show="btn.detailForm"
                target="_blank"
                ><i :class="btn.icon"></i>{{ btn.label }}</v-btn
              > -->
            </div>
          </v-col>
        </v-row></v-card-text
      >
    </v-card>
    <v-divider class="my-2"></v-divider>
    <comment-section :entry="entry"></comment-section>
    <general-snackbar></general-snackbar>
  </v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import GeneralSnackbar from "../components/GeneralSnackBar.vue";
import CommentSection from "../components/CommentSection.vue";
import mixin from "../js/mixin.js";
export default {
  name: "DetailForm",
  components: {
    "general-snackbar": GeneralSnackbar,
    "comment-section": CommentSection,
  },
  mixins: [mixin],
  data() {
    return {
      count: 0,
      original: {},
      entry: {},
      lRows: {},
      dataPicker: {},
      datePicker: false,
      isNew: true,
      isEditing: false,
      isLoading: false,
    };
  },
  computed: {
    isDirty() {
      return this.original != JSON.stringify(this.entry);
    },
  },
  mounted: function () {
    //this.getLayout();
    //this.getDatabaseUsers();
    if (this.$route.params.id) {
      this.isNew = false;
      this.getEntryById(this.$route.params.id);
    }
  },
  methods: {
    getActField(actField) {
      return this.getConField(actField);
    },
    getActValue(actField, actValue) {
      return this.getConValue(actField, actValue);
    },
    getConValue(conField, conValue) {
      if (
        !conField ||
        !conField.displayName ||
        !conValue ||
        (!conValue && !conValue.value && !conValue.username)
      )
        return "";
      if (conField.type == "singleSelect" || conField.type == "multipleSelect")
        return conValue.displayName;
      else if (
        conField.type == "singleUser" ||
        conField.type == "multipleUsers"
      )
        return conValue.username;
      else return conValue;
    },
    getConField(conField) {
      if (!conField || !conField.displayName) return "";
      else if (conField && conField.displayName) {
        return conField.displayName;
      } else {
        return "";
      }
    },
    updateEntry() {
      this.isLoading = true;
      backendService.updateEntry(this.entry).then(() => {
        setTimeout(() => {
          this.isLoading = false;
          this.original = JSON.stringify(this.entry);
          this.$store.commit("setEntry", this.entry);
          eventBus.$emit(
            "setSnackbar",
            "Successfully Update the Entry",
            "success",
            true
          );
          this.isEditing = false;
        }, 1000);
      });
    },
    processLink(link) {
      let newLink = link;
      let regex = /(?<=\/:)[_a-zA-Z\d#]+/;
      let matches = newLink.match(regex);
      for (let i = 0; i < matches.length; i++) {
        newLink = newLink.replace(`:${matches[i]}`, this.entry[matches[i]]);
      }
      return newLink;
    },
  },
};
</script>
