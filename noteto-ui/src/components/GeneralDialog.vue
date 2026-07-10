<template>
	<v-dialog v-model="dialog" transition="dialog-top-transition" width="600">
		<v-card>
			<v-card-title>System Message</v-card-title>
			<v-card-text>
				<h2>{{ message }}</h2>
			</v-card-text>
			<v-card-actions class="d-flex justify-end">
				<v-btn class="mr-1" color="error" depressed>
					<v-icon left>mdi-close</v-icon>
					Cancel
				</v-btn>
				<v-btn color="primary" depressed @click="emitEvent">
					<v-icon left>mdi-check</v-icon>
					Ok
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
import eventBus from "../js/event-bus.js";
export default {
	name: "GeneralDialog",
	data() {
		return {
			eventName: "",
			dialog: false,
			message: "",
		};
	},

	created: function () {
		eventBus.$on("setDialog", this.setDialog);
	},
	methods: {
		emitEvent() {
			this.dialog = false;
			eventBus.$emit(this.eventName);
		},
		setDialog(message, eventName) {
			this.message = message;
			this.eventName = eventName;
			this.dialog = true;
		},
	},
	beforeDestroy: function () {
		eventBus.$off("setDialog");
	},
};
</script>
