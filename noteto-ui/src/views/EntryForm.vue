<template>
  <v-container class="rounded-xl white mt-2">
    <div class="text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        v-if="setTimeoutLoading"
      ></v-progress-circular>
    </div>
    <v-card
      elevation="0"
      min-width="350"
      width="100%"
      v-if="!setTimeoutLoading"
    >
      <v-card-text class="d-flex">
        <v-container class="d-flex aligned-center">
          <h2 v-if="isNew" class="primary--text">New Entry</h2>
          <h2 v-else class="primary--text">
            Entry Number: {{ entry._data?.id }}
          </h2>
        </v-container>

        <v-container class="d-flex justify-space-between aligned-center">
          <v-container class="text-right py-0 my-0" v-if="isNew">
            <span class="font-weight-bold">Today Date:</span>

            {{ getTodayDate() }}
          </v-container>

          <v-container v-else class="d-flex justify-end py-0 my-0">
            <v-container class="py-0 my-0 d-flex justify-end">
              <v-autocomplete
                class="mr-3"
                dense
                rounded
                outlined
                label="Assigned to"
                :items="users"
                :item-text="getFullName"
                return-object
                v-model="entry['assignedTo']"
                :readonly="!isNew && !isEditing"
              ></v-autocomplete>
            </v-container>

            <div class="text-right">
              <div class="d-inline-block">
                <span class="font-weight-bold">Created Date:</span>
                {{ convertDateToReadable(entry._data?.dateCreated) }}
              </div>
              <div class="d-inline-block">
                <span class="font-weight-bold">Created By:</span>
                {{ getFullName(entry._data?.createdBy) }}
              </div>
            </div>
          </v-container>
        </v-container>
      </v-card-text>
      <v-card-text class="d-flex flex-wrap justify-space-between py-0">
        <v-container v-if="isNew">
          <v-slide-group>
            <v-slide-item>
              <v-btn
                v-show="isNew"
                rounded
                class="warning ml-2"
                depressed
                @click="clearEntry"
              >
                <i class="fas fa-eraser mr-2"></i>
                Clear
              </v-btn>
            </v-slide-item>
            <v-slide-item>
              <v-btn
                v-show="isNew"
                rounded
                class="primary ml-2"
                depressed
                @click="addEntry"
                :loading="isLoading"
                :disabled="!isLoggedIn || !isDirty"
              >
                <i class="fas fa-save mr-2"></i>
                Submit
              </v-btn>
            </v-slide-item>
          </v-slide-group>
        </v-container>
        <v-container v-else class="d-flex justify-space-between">
          <v-slide-group class="py-1">
            <v-slide-item>
              <div>
                <v-btn
                  v-if="!isEditing"
                  rounded
                  class="warning mr-2"
                  depressed
                  @click="isEditing = !isEditing"
                  :disabled="!isLoggedIn"
                >
                  <i class="fas fa-pencil-alt mr-2"></i>
                  <span v-if="!isEditing">Edit</span>
                  <span v-else>Stop Editing</span>
                </v-btn>
                <v-btn
                  v-else
                  rounded
                  class="primary mr-2"
                  depressed
                  @click="isEditing = !isEditing"
                  :disabled="!isLoggedIn"
                >
                  <i class="fas fa-pencil-alt mr-2"></i>
                  Stop Editing
                </v-btn>
                <v-btn
                  rounded
                  class="success mr-2"
                  depressed
                  @click="updateEntry"
                  :loading="isLoading"
                  :disabled="!isLoggedIn || !isDirty"
                >
                  <i class="fa fa-save mr-2"></i>
                  Update
                </v-btn>
              </div>
            </v-slide-item>
            <v-slide-item>
              <div>
                <v-btn
                  rounded
                  class="error"
                  depressed
                  @click="deleteEntry"
                  :loading="isDeleteLoading"
                  :disabled="
                    !isLoggedIn ||
                    entry._data?.createdBy._id != currentUser.userId
                  "
                >
                  <i class="fa fa-trash mr-2"></i>
                  Delete
                </v-btn>
              </div>
            </v-slide-item>
          </v-slide-group>
          <v-slide-group
            class="py-1"
            v-if="autoButtons.length + linkButtons.length > 0"
          >
            <v-slide-item
              v-for="(btn, idx) in autoButtons"
              :key="`auto-btn-${idx}`"
            >
              <v-btn
                class="primary mr-2"
                depressed
                rounded
                @click="setValue(btn.actField, btn.actValue)"
              >
                {{ getActValue(btn.actField, btn.actValue) }}
              </v-btn>
            </v-slide-item>
            <v-slide-item
              v-for="(btn, idx) in linkButtons"
              :key="`link-btn-${idx}`"
            >
              <v-btn
                class="primary mr-2"
                depressed
                rounded
                target="_blank"
                :href="processLink(btn.link)"
              >
                {{ btn.btnName }}
              </v-btn>
            </v-slide-item>
          </v-slide-group>
        </v-container>
      </v-card-text>
      <v-card-text>
        <form-component
          :p-rows="rows"
          :entry="entry"
          v-model="entry"
          :readonly="!isNew && !isEditing"
        ></form-component>
      </v-card-text>
    </v-card>
    <history-section
      v-if="!setTimeoutLoading && !isNew"
      :history-lst="historyLst"
      :fieldToField="fieldToField"
    ></history-section>

    <v-card elevation="0" v-if="!setTimeoutLoading && !isNew">
      <v-card-text>
        <v-textarea
          rounded
          outlined
          dense
          label="Comment"
          v-model="commentValue"
        ></v-textarea>
        <v-btn
          class="float-right"
          depressed
          rounded
          color="success"
          @click="addComment"
          :loading="isCommentLoading"
        >
          <i class="far fa-paper-plane mr-2"></i>
          Send
        </v-btn>
      </v-card-text>
    </v-card>
    <comment-section
      v-if="!setTimeoutLoading && !isNew"
      :comments="comments"
    ></comment-section>
  </v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import mixin from "../js/mixin.js";
import FormComponent from "@/components/FormComponent.vue";
import HistorySection from "@/components/HistorySection.vue";
import CommentSection from "@/components/CommentSection.vue";
import { readonly } from "vue";

export default {
  name: "EntryForm",
  mixins: [mixin],
  components: {
    "form-component": FormComponent,
    "history-section": HistorySection,
    "comment-section": CommentSection,
  },
  data() {
    return {
      original: "{}",
      entry: {},
      datePicker: {},
      isNew: true,
      isEditing: false,
      isSubmitted: false,
      isLoading: false,
      isDeleteLoading: false,
      historyLst: [],
      commentValue: "",
      comments: [],
      isCommentLoading: false,
    };
  },
  mounted: function () {
    readonly;
    if (this.$route.params.id) {
      this.isNew = false;
      this.getEntryById(this.$route.params.id);
      eventBus.$on("confirm-delete", this.confirmDeleteEntry);
    } else {
      this.clearEntry();
    }
  },
  computed: {
    isDirty() {
      return this.original != JSON.stringify(this.entry);
    },
  },
  methods: {
    addComment() {
      let comment = {};
      comment.value = this.commentValue;
      comment.database = this.entry._data.database;
      comment.entryId = this.entry._id;
      this.isCommentLoading = true;
      backendService.addComment(comment).then((response) => {
        setTimeout(() => {
          eventBus.$emit(
            "setSnackbar",
            "Successfully added comment",
            "success"
          );
          this.comments.unshift(response.data);
          this.commentValue = "";
          this.isCommentLoading = false;
        }, 1000);
      });
    },
    addEntry() {
      let wrappedEntry = {};
      this.isLoading = true;
      wrappedEntry.newEntry = this.entry;
      wrappedEntry.oldEntry = this.emptyEntry;
      wrappedEntry.database = this.currentDatabase.value;
      backendService.addEntry(wrappedEntry).then((response) => {
        this.original = JSON.stringify(this.entry);
        this.$store.commit("addEntry", response.data);
        setTimeout(() => {
          this.isLoading = false;
          this.isSubmitted = true;
          eventBus.$emit(
            "setSnackbar",
            "Successfully added a new entry",
            "success"
          );
        }, 1000);
      });
    },
    confirmDeleteEntry() {
      this.isDeleteLoading = true;
      backendService.deleteEntryById(this.entry._id).then(() => {
        setTimeout(() => {
          this.isDeleteLoading = false;
          this.$store.commit("deleteEntry", this.entry._id);
          this.$router.push({ name: "ListView" });
        }, 1000);
      });
    },
    deleteEntry() {
      eventBus.$emit(
        "setDialog",
        "Are you sure you want to delete this entry?",
        "confirm-delete"
      );
    },
    getActField(actField) {
      return this.getConField(actField);
    },
    getActValue(actField, actValue) {
      return this.getConValue(actField, actValue);
    },
    getConValue(conField, conValue) {
      if (
        !conField ||
        !conField?.displayName ||
        !conValue ||
        (!conValue && !conValue.value && !conValue.username)
      )
        return "";
      if (
        conField?.type == "singleSelect" ||
        conField?.type == "multipleSelect"
      )
        return conValue?.displayName;
      else if (
        conField?.type == "singleUser" ||
        conField?.type == "multipleUsers"
      )
        return conValue.username;
      else return conValue;
    },
    getConField(conField) {
      if (!conField || !conField?.displayName) return "";
      else if (conField && conField?.displayName) {
        return conField?.displayName;
      } else {
        return "";
      }
    },
    processLink(link) {
      let newLink = link;
      let regex = /\/:[\s\S]+/;
      let matches = newLink.match(regex);
      for (let i = 0; i < matches.length; i++) {
        let field = matches[i].substring(2);
        newLink = newLink.replace(`:${field}`, this.entry[field]);
      }
      return newLink;
    },
    updateEntry() {
      let wrappedEntry = {};
      wrappedEntry.oldEntry = JSON.parse(this.original);
      wrappedEntry.newEntry = this.entry;
      this.isLoading = true;
      backendService
        .updateEntryById(this.entry._id, wrappedEntry)
        .then(() => {
          setTimeout(() => {
            this.isLoading = false;
            this.original = JSON.stringify(this.entry);
            this.$store.commit("setEntry", this.entry);
            eventBus.$emit(
              "setSnackbar",
              "Successfully updated the entry",
              "success"
            );
            this.isEditing = false;
          }, 1000);
        })
        .catch(() => {
          setTimeout(() => {
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Oops! Something is not right!",
              "error"
            );
          }, 1000);
        });
    },
  },
  watch: {
    "$route.name": function (newVal, oldVal) {
      oldVal;
      if (newVal == "NewEntry") {
        this.clearEntry();
      } else if (newVal == "DetailForm") {
        this.getEntryById(this.$route.params.id);
      }
    },
  },
  beforeDestroy: function () {
    eventBus.$off("confirm-delete");
  },
};
</script>
