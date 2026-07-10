<template>
  <v-container class="text-center">
    <v-card elevation="0">
      <v-card-text>
        <div v-if="isLoading">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div v-else-if="isSuccessful">
          <img
            src="https://noteto.jaekjay.com/asset/party-popper.png"
            width="200"
            height="200"
          />
          <h3 class="mb-5 blue--text">Thank you for joining</h3>
          <h1>Your registration is complete. Go ahead and log in.</h1>
        </div>

        <div v-else>
          <v-icon class="mb-5" color="grey lighten-1" size="100">
            mdi-emoticon-sad-outline
          </v-icon>
          <h3 class="mb-5 red--text">Something is wrong</h3>
          <h1>Please try again later or contact Noteto admin team.</h1>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import publicBackendService from "@/services/public-backend-service";
export default {
  name: "EmailVerify",
  data() {
    return {
      isLoading: true,
      isSuccessful: false,
    };
  },
  mounted: function () {
    this.verifyEmail();
  },
  compute: {},
  methods: {
    verifyEmail() {
      this.isLoading = true;
      publicBackendService
        .verifyEmailBySessionId(this.$route.params.sessionId)
        .then(() => {
          this.isSuccessful = true;
          this.isLoading = false;
        })
        .catch(() => {
          this.isSuccessful = false;
          this.isLoading = false;
        });
    },
  },
};
</script>
<style></style>
