<template>
  <section class="comment-section">
    <div class="activity-summary">
      <div>
        <div class="activity-eyebrow">Comments</div>
        <h3>{{ comments.length }} comments</h3>
      </div>
    </div>

    <div v-if="comments.length == 0" class="activity-empty">
      <v-icon color="grey">mdi-comment-off-outline</v-icon>
      <div>No comments yet</div>
    </div>

    <div v-else class="comment-list">
      <article
        v-for="comment in comments"
        :key="comment._id"
        class="comment-item"
      >
        <div class="comment-avatar">
          <v-icon small>mdi-account</v-icon>
        </div>
        <div class="comment-body">
          <div class="comment-heading">
            <strong>{{ getCommentAuthor(comment) }}</strong>
            <span>{{ formatDateTime(comment.dateCreated) }}</span>
          </div>
          <p>{{ comment.value }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
<script>
export default {
  name: "CommentSection",
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
    formatDateTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleString();
    },
    getCommentAuthor(comment) {
      const user = comment.createdBy || {};
      return `${user.first || ""} ${user.last || ""}`.trim() || "Unknown";
    },
  },
};
</script>
<style scoped>
.comment-section {
  color: #1f2933;
}

.activity-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.activity-eyebrow {
  color: rgba(0, 0, 0, 0.52);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.activity-summary h3 {
  margin: 2px 0 0;
  font-size: 1.1rem;
}

.activity-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 140px;
  color: rgba(0, 0, 0, 0.54);
  border: 1px dashed rgba(0, 0, 0, 0.18);
  border-radius: 6px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 10px;
}

.comment-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #1565c0;
  border-radius: 50%;
  background: rgba(21, 101, 192, 0.1);
}

.comment-body {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #fafafa;
}

.comment-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  margin-bottom: 6px;
}

.comment-heading span {
  color: rgba(0, 0, 0, 0.52);
  font-size: 0.78rem;
}

.comment-body p {
  margin: 0;
  color: rgba(0, 0, 0, 0.74);
  line-height: 1.45;
  white-space: pre-wrap;
}
</style>
