<template>
  <v-data-table
    :items-per-page="itemsPerPage"
    :headers="headers"
    :items="filteredEntries"
    @update:items-per-page="setItemsPerPage"
  >
    <template v-slot:header>
      <tr>
        <th v-for="(header, idx) in headers" :key="`header-${idx}`">
          <v-text-field
            class="ma-2"
            v-model="search[header.value]"
            placeholder="filter"
            rounded
            solo-inverted
            hide-details
            flat
          ></v-text-field>
        </th>
      </tr>
    </template>
    <template v-slot:item="{ item, index }">
      <tr
        :class="[
          index % 2 == 0 ? 'bg-grey entry' : 'entry',
          selected == item._data.id ? 'selected-row' : '',
        ]"
        :key="`item-${index}`"
        @click="highlightRow(item._data.id)"
        @dblclick="goToDetailForm(item._id, item._data.database)"
      >
        <td v-for="(header, idx) in headers" :key="`header-${index}-${idx}`">
          <span v-if="header.isDefault && header.value == 'idx'">
            {{ index + 1 }}
          </span>
          <span v-if="header.isDefault && header.value == '_id'">
            <a @click="goToDetailForm(item._id, item._data.database)">
              {{ item._id }}
            </a>
          </span>
          <span v-else-if="header.isDefault">
            {{ getDataText(header, item) }}
          </span>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
<script>
import backendService from "@/services/backend-service";

export default {
  name: "AssignedListView",
  data() {
    return {
      entries: [],
      headers: [
        {
          value: "_id",
          text: "Long Id",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.database",
          text: "Entry Id",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.createdBy",
          text: "Created By",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.dateCreated",
          text: "Date Created",
          align: "start",
          isDefault: true,
        },
      ],
      search: {},
      selected: 0,
    };
  },
  mounted: function () {
    this.getAssignedEntries();
  },
  computed: {
    currentUser() {
      return this.$store.getters["currentUser"];
    },
    database() {
      return this.$store.getters["currentDatabase"];
    },
    filteredEntries() {
      let entries = this.entries;
      for (let key in this.search) {
        let searchStr = this.search[key].trim().toLowerCase();
        let header = this.headers.find((header) => header.value == key);
        if (searchStr && searchStr.length) {
          if (header && !header.isDefault) {
            entries = entries.filter((e) => {
              let str = this.getEntryText(header, e);
              return str.toString().trim().toLowerCase().includes(searchStr);
            });
          } else if (header && header.isDefault) {
            entries = entries.filter((e) => {
              let str = this.getDataText(header, e);
              return str.toString().trim().toLowerCase().includes(searchStr);
            });
          }
        }
      }
      return entries;
    },
    itemsPerPage() {
      return this.$store.getters["itemsPerPage"];
    },
  },
  methods: {
    formatDate(rawDate) {
      let date = new Date(rawDate);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
    getAssignedEntries() {
      backendService.getAssignedEntries().then((response) => {
        this.entries = response.data;
      });
    },
    getDataText(header, entry) {
      if (header.value == "_data.id") {
        return entry._data.id;
      } else if (header.value == "_data.dateCreated") {
        return this.formatDate(entry._data.dateCreated);
      } else if (header.value == "_data.createdBy") {
        return this.getFullName(entry._data.createdBy);
      } else if (header.value == "_data.database") {
        return `${entry._data.database}-${entry._data.id}`;
      } else {
        return entry[header.value];
      }
    },
    getFullName(user) {
      if (user) return `${user.first} ${user.last}`;
      else return "";
    },
    goToDetailForm(id, databaseValue) {
      this.$router
        .push({
          name: "DetailForm",
          params: { id: id },
          query: { database: databaseValue },
        })
        .catch(() => {});
    },
    highlightRow(idx) {
      this.selected = idx;
    },
    setItemsPerPage(val) {
      this.$store.commit("setItemsPerPage", val);
    },
  },
};
</script>
<style>
tbody tr.entry:hover {
  background-color: #ff8521 !important;
  color: white;
}
tbody tr.entry:hover a {
  background-color: #ff8521 !important;
  color: white;
}
.selected-row {
  background-color: #0275d8 !important;
  color: white;
}
.selected-row a {
  text-decoration: none;
  color: white;
}
.bg-grey {
  background-color: #e6e6e6;
}
</style>
