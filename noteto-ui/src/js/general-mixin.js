//import _ from "lodash";
import eventBus from "./event-bus.js";
export default {
    methods: {
        timer(time) {
            const promise = new Promise((resolve) => {
                setTimeout(() => {resolve()},time);
            })
            return promise
        },
        errorSnackbar(message) {
            eventBus.$emit(
                "setSnackbar",
                message,
                "error"
              );
        },
        successSnackbar(message) {
            eventBus.$emit(
                "setSnackbar",
                message,
                "success"
              );
        }
    }
}