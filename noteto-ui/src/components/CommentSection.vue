<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Comment on Entry</h3>
        <v-spacer></v-spacer>
        <v-btn
          depressed
          rounded
          color="success"
          @click="addComment"
          :loading="isLoading"
          ><i class="far fa-paper-plane mr-2"></i>Send</v-btn
        >
      </v-card-title>
      <v-card-text>
        <v-textarea label="Comment" v-model="value"></v-textarea>
        <h3 v-if="comments.length == 0">There are no comments yet</h3>
        <v-list three-line>
          <v-list-item v-for="comment in comments" :key="comment._id">
            <v-list-item-avatar>
              <v-btn icon><i class="fas fa-user fa-lg"></i></v-btn>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                ><span>{{
                  `${comment.createdBy.first} ${comment.createdBy.last}`
                }}</span>
                -
                <span class="font-italic">{{
                  convertSecondsToDate(comment.dateCreated)
                }}</span></v-list-item-title
              >

              <v-list-item-subtitle
                v-text="comment.value"
              ></v-list-item-subtitle>
              <v-divider></v-divider>
            </v-list-item-content> </v-list-item
        ></v-list>
      </v-card-text>
    </v-card>

    <general-snackbar></general-snackbar>
  </div>
</template>
<script>
import formMixin from "@/js/form-mixin";
import backendService from "@/services/backend-service";
import GeneralSnackBar from "./GeneralSnackBar.vue";
import eventBus from "../js/event-bus.js";
export default {
  name: "CommentSection",
  mixins: [formMixin],
  components: { "general-snackbar": GeneralSnackBar },
  mounted: function () {
    eventBus.$on("getComments", this.getComments);
  },
  props: {
    entry: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      comments: [],
    };
  },
  methods: {
    addComment() {
      let comment = {};
      comment.value = this.value;
      comment.database = this.entry.database;
      comment.entryId = this.entry._id;
      this.isLoading = true;
      backendService.addComment(comment).then((response) => {
        setTimeout(() => {
          eventBus.$emit(
            "setSnackbar",
            "Successfully Added Comment",
            "success",
            true
          );
          this.comments.unshift(response.data);
          this.value = "";
          this.isLoading = false;
        }, 1000);
      });
    },
    convertSecondsToDate(seconds) {
      let castedDate = new Date(seconds);
      return castedDate.toLocaleString();
    },
    getComments(entry) {
      backendService.getCommentsByEntry(entry).then((response) => {
        this.comments = response.data;
      });
    },
  },
};
</script>
