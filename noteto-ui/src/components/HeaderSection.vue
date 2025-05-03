<template>
  <v-container class="white rounded-xl">
    <div class="d-flex flex-wrap flex-md-nowrap flex-lg-nowrap mb-2">
      <v-autocomplete
        rounded
        dense
        outlined
        label="Header Set"
        :items="headerSets"
        :item-text="getHeaderSetText"
        v-model="headerSet"
        return-object
        @change="handleChange"
      ></v-autocomplete>
      <v-btn
        rounded
        depressed
        color="success"
        class="ml-2 mr-1"
        @click="setFavoriteHeaderSet"
        :loading="isUpdateLoading"
        :disabled="!validHeaderSet"
      >
        <i class="far fa-star mr-1"></i>
        Favorite
      </v-btn>
      <v-btn
        rounded
        icon
        color="primary"
        class="mr-1"
        :disabled="!validHeaderSet"
        @click="openForm"
      >
        <i class="fas fa-cog"></i>
      </v-btn>
      <v-btn rounded icon color="primary" @click="openForm(false)">
        <i class="fas fa-plus"></i>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="isFormOpen">
        <div class="d-flex">
          <v-text-field
            class="mr-1"
            dense
            rounded
            outlined
            label="Header Name"
            v-model="headerSet.name"
          ></v-text-field>
          <v-autocomplete
            rounded
            outlined
            dense
            :items="[
              { text: 'Yes', value: true },
              { text: 'No', value: false },
            ]"
            label="Public"
            v-model="headerSet.isPublic"
          ></v-autocomplete>
        </div>

        <div class="d-flex align-center">
          <v-autocomplete
            rounded
            outlined
            v-model="headerSet.fields"
            label="Headers"
            :items="fields"
            return-object
            item-text="displayName"
            chips
            hide-details
            deletable-chips
            multiple
          ></v-autocomplete>
          <v-btn
            v-if="!isUpdating"
            rounded
            class="warning ml-2"
            @click="addHeaderSet"
            depressed
            :loading="isAddLoading"
          >
            <i class="fas fa-heading mr-1"></i>
            Add Header Set
          </v-btn>
          <v-btn
            v-else
            rounded
            class="warning ml-2"
            @click="updateHeaderSet"
            depressed
            :loading="isUpdateLoading"
          >
            <i class="fas fa-heading mr-1"></i>
            Update Header Set
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
  </v-container>
</template>
<script>
import generalMixin from "@/js/general-mixin";
import backendService from "@/services/backend-service";
export default {
  name: "HeaderSection",
  mixins: [generalMixin],
  props: {
    database: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  mounted: function () {
    this.headerSet = this.currentHeaderSet;
  },
  data() {
    return {
      addingHeader: false,
      selectedFields: [],
      headerSet: {},
      isPublic: false,
      setName: "",
      isFormOpen: false,
      isUpdating: false,
      isUpdateLoading: false,
      isAddLoading: false,
    };
  },
  computed: {
    currentDatabase() {
      if (this.database && this.database.value) {
        return this.database;
      } else {
        let database = this.$store.getters["currentDatabase"];
        if (database && database.value) return database;
      }
      return {};
    },
    currentHeaderSet() {
      return this.$store.getters["currentHeaderSet"];
    },
    currentUser() {
      return this.$store.getters["currentUser"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    databaseToHeaderSets() {
      return this.$store.getters["databaseToHeaderSets"];
    },
    fields() {
      return this.databaseToFields[this.currentDatabase.value].filter(
        (e) => e.type != "list"
      );
    },
    headerSets() {
      if (this.currentDatabase && this.currentDatabase.value) {
        const headerSets =
          this.databaseToHeaderSets[this.currentDatabase.value];
        if (headerSets && headerSets.length > 0)
          return headerSets.filter(
            (e) => e.createdBy._id == this.currentUser.userId
          );
      }
      return [];
    },
    validHeaderSet() {
      return this.headerSet && this.headerSet.name;
    },
  },
  methods: {
    addHeaderSet() {
      for (let i = 0; i < this.selectedFields.length; i++) {
        let field = this.selectedFields[i];
        field.order = i + 1;
      }
      this.headerSet.default = false;
      this.headerSet.database = this.currentDatabase.value;
      this.isAddLoading = true;
      backendService.addHeaderSet(this.headerSet).then((response) => {
        this.timer(1000).then(() => {
          this.$store.commit("addHeaderSet", response.data);
          this.isAddLoading = false;
          this.headerSet = {};
          this.successSnackbar("Successfully added new header set");
        });
      });
    },
    getHeaderSetText(headerSet) {
      let setName = headerSet.name;
      if (headerSet.isFavorite) setName += " - Favorite";
      return setName;
    },
    handleChange() {
      this.$store.commit("setCurrentHeaderSet", this.headerSet);
    },
    setFavoriteHeaderSet() {
      this.isUpdateLoading = true;
      let favorite = {
        id: this.headerSet._id,
        database: this.currentDatabase.value,
      };
      backendService
        .setFavoriteHeaderSet(favorite)
        .then(() => {
          this.timer(1000).then(() => {
            this.headerSets.forEach((e) => (e.isFavorite = false));
            this.headerSet.isFavorite = true;
            this.isUpdateLoading = false;
            this.$forceUpdate();
            this.successSnackbar("Successfully set favorite header set");
          });
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.isUpdateLoading = false;
            this.errorSnackbar("Ops! Something is not right");
          });
        });
    },
    openForm(isUpdating = false) {
      if (isUpdating) {
        this.isFormOpen = true;
        this.isUpdating = true;
      } else {
        this.isFormOpen = true;
        this.isUpdating = false;
        this.headerSet = { isPublic: false };
      }
    },
    updateHeaderSet() {
      this.isUpdateLoading = true;
      backendService
        .updateHeaderSet(this.headerSet)
        .then(() => {
          this.timer(1000).then(() => {
            this.isUpdating = false;
            this.isFormOpen = false;
            this.isUpdateLoading = false;
            this.successSnackbar("Successfully updated header set");
          });
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.isUpdateLoading = false;
            this.errorSnackbar("Ops! Something is not right");
          });
        });
    },
  },
};
</script>
