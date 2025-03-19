<template>
  <v-container>
    <v-container class="py-0">
      <div class="d-flex">
        <v-autocomplete
          rounded
          dense
          outlined
          label="Header Set"
          :items="headerSets"
          :item-text="getHeaderSetText"
          item-value="_id"
          v-model="headerSetId"
        ></v-autocomplete
        ><v-btn
          rounded
          class="warning ml-2 mr-2"
          @click="setFavoriteHeaderSet"
          depressed
          :loading="isUpdateLoading"
          :disabled="!headerSetId"
        >
          <i class="far fa-star mr-2"></i>
          Favorite
        </v-btn>
        <v-btn
          depressed
          rounded
          color="primary"
          @click="addingHeader = !addingHeader"
          >Add Header Set</v-btn
        >
      </div>
    </v-container>
    <v-expand-transition>
      <v-container v-if="addingHeader" class="py-0">
        <div class="d-flex">
          <v-text-field
            class="mr-2"
            dense
            rounded
            outlined
            label="Header Name"
            v-model="setName"
          >
          </v-text-field>
          <v-autocomplete
            rounded
            outlined
            dense
            :items="[
              { text: 'Yes', value: true },
              { text: 'No', value: false },
            ]"
            label="Public"
            v-model="isPublic"
          ></v-autocomplete>
        </div>

        <div class="d-flex align-center">
          <v-autocomplete
            rounded
            outlined
            v-model="selectedFields"
            label="Headers"
            :items="fields"
            return-object
            item-text="displayName"
            chips
            hide-details
            deletable-chips
            multiple
          ></v-autocomplete
          ><v-btn
            rounded
            class="warning ml-2"
            @click="addHeaderSet"
            depressed
            :loading="isAddLoading"
          >
            <i class="fas fa-heading mr-2"></i>
            Confirm Header
          </v-btn>
        </div>
      </v-container>
    </v-expand-transition>
  </v-container>
</template>
<script>
import generalMixin from "@/js/general-mixin";
import backendService from "@/services/backend-service";
export default {
  name: "HeaderSection",
  mixins: [generalMixin],
  props: {},
  data() {
    return {
      isUpdateLoading: false,
      isAddLoading: false,
      addingHeader: false,
      selectedFields: [],
      headerSetId: null,
      isPublic: false,
      setName: "",
    };
  },
  computed: {
    currentDatabase() {
      return this.$store.getters["currentDatabase"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    fields() {
      return this.databaseToFields[this.currentDatabase.value];
    },
    headerSets: {
      get() {
        return this.$store.getters["databaseToHeaderSets"][
          this.currentDatabase.value
        ];
      },
      set(val) {
        return this.$store.commit("setDatabaseToHeaderSets", val);
      },
    },
  },
  methods: {
    addHeaderSet() {
      let headerSet = {};
      for (let i = 0; i < this.selectedFields.length; i++) {
        let field = this.selectedFields[i];
        field.order = i + 1;
      }
      headerSet.fields = this.selectedFields;
      headerSet.setName = this.setName;
      headerSet.default = false;
      headerSet.isPublic = this.isPublic;
      headerSet.database = this.currentDatabase.value;
      this.isAddLoading = true;
      backendService.addHeaderSet(headerSet).then((response) => {
        this.timer(1000).then(() => {
          let headerSets = this.headerSets;
          headerSets.push(response.data);
          this.isAddLoading = false;
          this.selectedFields = [];
          this.setName = "";
          this.isPublic = false;
          this.successSnackbar("Successfully added new header set");
        });
      });
    },
    getHeaderSetText(headerSet) {
      let setName = headerSet.setName;
      if (headerSet.isFavorite) setName += " - Favorite";
      return setName;
    },
    setFavoriteHeaderSet() {
      this.isUpdateLoading = true;
      backendService
        .setFavoriteHeaderSetById(this.headerSetId)
        .then(() => {
          this.timer(1000).then(() => {
            this.headerSets.forEach((e) => (e.isFavorite = false));
            const headerSet = this.headerSets.find(
              (e) => e._id == this.headerSetId
            );
            headerSet.isFavorite = true;
            this.isUpdateLoading = false;
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
    updateHeaderSet() {},
  },
};
</script>
