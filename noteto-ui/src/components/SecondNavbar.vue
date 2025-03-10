<template>
    <div>
        <v-app-bar color="blue darken-1" elevation="0" dark>
            <v-autocomplete
                filled
                rounded
                outlined
                dense
                class="mt-6"
                :items="databases"
                item-text="displayName"
                item-value="value"
                v-model="database"
                return-object
                @change="changeDatabase"></v-autocomplete>
        </v-app-bar>
    </div>
</template>
<script>
import mixin from "@/js/mixin";
export default {
    name: "SecondNavbar",
    mounted: function () {},
    data() {
        return {
            drawer: false,
            database: null,
        };
    },
    mixins: [mixin],
    computed: {
        databases() {
            return this.$store.getters["availableDatabases"];
        },

        currentDatabase() {
            return this.$store.getters["currentDatabase"];
        },
    },
    methods: {
        changeDatabase() {
            let routeData = this.$router.resolve({
                name: "ListView",
                query: { database: this.database.value },
            });
            window.open(routeData.href, "_blank");
        },
    },
};
</script>
<style></style>
