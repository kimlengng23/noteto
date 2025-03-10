<template>
    <v-container>
        <v-card class="rounded-xl" elevation="0">
            <v-card-title class="d-flex justify-space-between">
                <h3>Database Access</h3>
                <v-btn
                    rounded
                    color="primary ml-2"
                    depressed
                    :disabled="!isLoggedIn || !selectedDatabase.value"
                    @click="updateDatabaseAccess"
                    :loading="isLoading">
                    <i class="fas fa-save mr-2"></i>
                    Update
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-autocomplete
                    rounded
                    outlined
                    dense
                    label="Database"
                    :items="allDatabases"
                    v-model="selectedDatabase"
                    @change="reselectedUsers"
                    :item-text="getDatabaseNameText"
                    return-object></v-autocomplete>
                <v-data-table
                    v-model="selectedUsers"
                    :headers="headers"
                    :items="allUsers"
                    show-select
                    item-key="_id"
                    :options="{ itemsPerPage: -1 }">
                    <template #[`item.dateCreated`]="{ item }"
                        ><td>
                            {{ convertToDate(item.dateCreated) }}
                        </td></template
                    >
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<script>
import eventBus from "@/js/event-bus";
import formMixin from "@/js/form-mixin";
import mixin from "@/js/mixin";
import backendService from "@/services/backend-service";
export default {
    name: "DatabaseAccess",

    data() {
        return {
            headers: [
                {
                    text: "Id",
                    value: "_id",
                    alight: "center",
                },
                {
                    text: "First",
                    value: "first",
                    alight: "center",
                },
                {
                    text: "Last",
                    value: "last",
                    alight: "center",
                },
                {
                    text: "Username",
                    value: "username",
                    alight: "center",
                },
                {
                    text: "Date Created",
                    value: "dateCreated",
                },
            ],
            selectedDatabase: {},
            selectedUsers: [],
        };
    },
    mixins: [mixin, formMixin],
    computed: {
        isLoggedIn() {
            return this.$store.getters["isLoggedIn"];
        },
    },
    methods: {
        getDatabaseNameText(database) {
            return `${database.displayName} - ${database.value}`;
        },
        reselectedUsers() {
            backendService
                .getAccessesByDatabase(this.selectedDatabase.value)
                .then((response) => {
                    let selectedUsers = [];
                    let accesses = response.data;
                    for (let i = 0; i < accesses.length; i++) {
                        selectedUsers.push(accesses[i].user);
                    }
                    this.selectedUsers = selectedUsers;
                });
        },
        updateDatabaseAccess() {
            let wrappedAccess = {};
            wrappedAccess.database = this.selectedDatabase;
            wrappedAccess.selectedUsers = this.selectedUsers;
            this.isLoading = true;
            backendService.updateDatabaseAccess(wrappedAccess).then(() => {
                setTimeout(() => {
                    this.isLoading = false;
                    eventBus.$emit(
                        "setSnackbar",
                        "Successfully updated database access",
                        "success"
                    );
                }, 1000);
            });
        },
    },
};
</script>
