<template>
  <v-text-field
    :label="label"
    rounded
    outlined
    dense
    :prefix="prefix"
    :suffix="suffix"
    v-model.number="input"
    :readonly="readonly"
  ></v-text-field>
</template>
<script>
import Decimal from "decimal.js";
export default {
  name: "DecimalField",
  props: {
    label: {
      type: String,
      default: () => {
        return "";
      },
    },
    suffix: {
      type: String,
      default: () => {
        return "";
      },
    },
    prefix: {
      type: String,
      default: () => {
        return "";
      },
    },
    value: {
      type: Number,
      default: () => {
        return 0;
      },
    },
    readonly: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  data() {
    return { valueStr: "0.00" };
  },
  mounted() {},
  computed: {
    input: {
      get() {
        return new Decimal(this.value);
      },
      set(val) {
        this.$emit("input", Number(val));
      },
    },
    valueStrHolder: {
      get() {
        return this.input.toFixed(2);
      },
      set(val) {
        this.valueStr = val;
      },
    },
  },
  methods: {
    updateValue(event) {
      if (this.readonly) return;
      let keyCode = event.keyCode;
      let castedValue = new Decimal(0);
      let noDecimal = true;
      if (this.valueStr.includes(".")) {
        noDecimal = false;
      }
      if (keyCode >= 96 && keyCode <= 105) {
        if (noDecimal) {
          castedValue = new Decimal(this.valueStr).dividedBy(100);
        } else {
          castedValue = new Decimal(this.valueStr).times(10);
        }

        this.input = castedValue;
        this.valueStr = castedValue.toFixed(2);
      } else if (keyCode == 8) {
        if (this.valueStr.length == 0) {
          castedValue = new Decimal(0);
        } else {
          castedValue = new Decimal(this.valueStr).dividedBy(10);
        }
        this.input = castedValue;
        this.valueStr = castedValue.toFixed(2);
      } else {
        castedValue = new Decimal(this.input);
        this.valueStr = castedValue.toFixed(2);
      }
      if (castedValue < 0.01) {
        castedValue = new Decimal(0);
        this.valueStr = castedValue.toFixed(2);
      }
    },
  },
};
</script>
