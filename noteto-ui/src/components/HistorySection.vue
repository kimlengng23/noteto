<template>
  <section class="history-section">
    <div class="activity-summary">
      <div>
        <div class="activity-eyebrow">History</div>
        <h3>{{ historyLst.length }} changes</h3>
      </div>
      <v-chip small outlined color="primary">
        {{ totalFieldChanges }} field updates
      </v-chip>
    </div>

    <div v-if="historyLst.length == 0" class="activity-empty">
      <v-icon color="grey">mdi-history</v-icon>
      <div>No history yet</div>
    </div>

    <div v-else class="history-timeline">
      <article
        v-for="(history, idxI) in historyLst"
        :key="history._id || idxI"
        class="history-item"
      >
        <div class="history-dot"></div>
        <div class="history-content">
          <div class="history-heading">
            <strong>{{ getFullName(history.createdBy) }}</strong>
            <span>{{ formatDateTime(history.dateCreated) }}</span>
          </div>
          <div class="history-count">
            {{ getChangeEntries(history).length }} field changes
          </div>

          <div class="history-changes">
            <div
              v-for="([name, value], idxJ) in getChangeEntries(history)"
              :key="`${history._id || idxI}-${idxJ}`"
              class="history-change"
            >
              <div class="history-field">
                {{ getFieldName(name) }}
              </div>
              <div v-if="getField(name).type != 'list'" class="history-values">
                <span>{{ getHistoryValue(name, value.from) }}</span>
                <v-icon small color="grey">mdi-arrow-right</v-icon>
                <span>{{ getHistoryValue(name, value.to) }}</span>
              </div>
              <div v-else class="history-values">
                <span>Updated list values</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
<script>
import mixin from "@/js/mixin.js";
export default {
  name: "HistorySection",
  mixins: [mixin],
  props: {
    historyLst: {
      type: Array,
      default() {
        return [];
      },
    },
    fieldToField: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    totalFieldChanges() {
      return this.historyLst.reduce((count, history) => {
        return count + this.getChangeEntries(history).length;
      }, 0);
    },
  },
  methods: {
    formatDateTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleString();
    },
    getChangeEntries(history) {
      return Object.entries(history.changes || {});
    },
    getField(fieldValue) {
      return this.fieldToField[fieldValue] || {
        displayName: fieldValue,
        type: "singleLine",
      };
    },
    getFieldName(fieldValue) {
      return this.getField(fieldValue).displayName || fieldValue;
    },
    getHistoryValue(fieldValue, value) {
      if (value === undefined || value === null || value === "") return "Empty";
      return this.getEntryText(this.getField(fieldValue), value);
    },
  },
};
</script>
<style scoped>
.history-section {
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

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-item {
  position: relative;
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px;
}

.history-item::before {
  position: absolute;
  top: 18px;
  bottom: -14px;
  left: 6px;
  width: 1px;
  content: "";
  background: rgba(21, 101, 192, 0.18);
}

.history-item:last-child::before {
  display: none;
}

.history-dot {
  width: 13px;
  height: 13px;
  margin-top: 3px;
  border: 2px solid #1565c0;
  border-radius: 50%;
  background: #ffffff;
}

.history-content {
  padding-bottom: 2px;
}

.history-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
}

.history-heading span,
.history-count {
  color: rgba(0, 0, 0, 0.52);
  font-size: 0.78rem;
}

.history-changes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.history-change {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #fafafa;
}

.history-field {
  margin-bottom: 6px;
  font-weight: 700;
}

.history-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.68);
  font-size: 0.9rem;
}
</style>
