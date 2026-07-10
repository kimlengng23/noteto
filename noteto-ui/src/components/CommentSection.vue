<template>
  <v-container>
    <v-card elevation="0" min-width="350" width="100%">
      <v-card-title>Comments on Entry</v-card-title>
      <v-card-text class="d-flex flex-column">
        <div>
          <h3 class="text-center" v-if="comments.length == 0">
            <v-icon left>mdi-comment-off-outline</v-icon>
            There are no comments yet
          </h3>
          <v-list three-line>
            <div v-for="(comment, idx) in comments" :key="comment._id">
              <v-list-item>
                <v-list-item-avatar>
                  <v-btn icon>
                    <v-icon>mdi-account</v-icon>
                  </v-btn>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    <span>
                      {{
                        `${comment.createdBy?.first} ${comment.createdBy?.last}`
                      }}
                    </span>
                    -
                    <span class="font-italic">
                      {{ convertDateToReadable(comment.dateCreated) }}
                    </span>
                  </v-list-item-title>

                  <v-list-item-subtitle
                    v-text="comment.value"
                  ></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="idx != comments.length - 1"></v-divider>
            </div>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import formMixin from "@/js/form-mixin";
export default {
  name: "CommentSection",
  mixins: [formMixin],
  mounted: function () {},
  props: {
    comments: {
      type: Array,
      default() {
        return [];
      },
    },
    entryId: {
      type: String,
      default() {
        return "";
      },
    },
    database: {
      type: String,
      default() {
        return "";
      },
    },
  },
  methods: {
    convertDateToReadable(date) {
      let castedDate = new Date(date);
      return castedDate.toLocaleDateString();
    },
  },
};
</script>
