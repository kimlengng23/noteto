<template>
  <v-snackbar :color="colorClass" :timeout="2000" v-model="snackbar">
    {{ msg }}
    <template v-slot:action="{}">
      <v-btn icon text @click="snackbar = false"
        ><i class="fas fa-times"></i
      ></v-btn>
    </template>
  </v-snackbar>
</template>
<script>
import eventBus from "../js/event-bus.js";
export default {
  name: "GeneralSnackBar",
  data() {
    return {
      snackbar: false,
      msg: "",
      colorClass: "",
    };
  },
  props: {
    message: String,
  },
  mounted: function () {
    eventBus.$on("setSnackbar", this.setSnackbar);
  },
  methods: {
    setSnackbar(msg, colorClass, isShown) {
      this.msg = msg;
      this.snackbar = isShown;
      this.colorClass = colorClass;
    },
  },
  beforeUnmount: function () {
    eventBus.$off("setSnackbar");
  },
};
</script>
