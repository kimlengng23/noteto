<template>
	<v-snackbar
		:color="colorClass"
		:timeout="2000"
		v-model="snackbar"
		rounded="pill"
		elevation="0">
		{{ message }}
		<template v-slot:action="{}">
			<v-btn icon text @click="snackbar = false">
				<i class="fas fa-times"></i>
			</v-btn>
		</template>
	</v-snackbar>
</template>
<script>
import eventBus from "../js/event-bus.js";
export default {
	name: "GeneralSnackbar",
	data() {
		return {
			snackbar: false,
			message: "",
			colorClass: "",
		};
	},

	created: function () {
		eventBus.$on("setSnackbar", this.setSnackbar);
	},
	methods: {
		setSnackbar(message, colorClass) {
			this.message = message;
			this.snackbar = true;
			this.colorClass = colorClass;
		},
	},
	beforeDestroy: function () {
		eventBus.$off("setSnackbar");
	},
};
</script>
