export default {
  data() {
    return {
      first: "",
      last: "",
      username: "",
      password: "",
      confPassword: "",
      email: "",
      isFormValid: false,
      isLoading: false,
      isSuccessful: false,
      isUpdatingLoading: false,
      displayName: "",
      value: "",
      fieldValue: "",
      fieldType: "",
      autoType: "",
      databaseValue: "",
      description: "",
      strRules: [(v) => !!v || "Required"],

      emailRules: [
        (v) => !!v || "Required",
        (v) =>
          /^[A-Za-z\d._-]+@[A-Za-z]+\.[A-Za-z]+$/.test(v) ||
          "Invalid email format",
      ],
      nameRules: [
        (v) => !!v || "Required",
        (v) => v.length >= 2 || "Length greater or equal to 2",
        (v) =>
          /^[A-Za-z]+$/.test(v) || "No special characters or numbers allowed",
      ],
      numberRules: [(v) => !!v || "Required"],
      pwRules: [
        (v) => !!v || "Required",
        (v) => v.length >= 6 || "Length greater or equal to 6",
      ],
      confRules: [
        (v) => !!v || "Required",
        (v) => v.length >= 6 || "Length greater or equal to 6",
        () =>
          this.confPassword == this.password ||
          "Password and confirm password do not match",
      ],
    };
  },
  methods: {
    clearVariables() {
      this.first = "";
      this.last = "";
      this.username = "";
      this.password = "";
      this.confPassword = "";
      this.email = "";
      this.isSuccessful = false;
    },
    validate() {
      return this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
