<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-xl font-bold mb-4">MongoDB Filter Builder</h2>

    <div
      v-for="(condition, index) in conditions"
      :key="index"
      class="mb-4 flex gap-2 items-center"
    >
      <input
        v-model="condition.field"
        placeholder="Field"
        class="border p-1 w-32"
      />
      <select v-model="condition.operator" class="border p-1 w-24">
        <option value="$eq">=</option>
        <option value="$ne">≠</option>
        <option value="$gt">&gt;</option>
        <option value="$gte">≥</option>
        <option value="$lt">&lt;</option>
        <option value="$lte">≤</option>
        <option value="$in">in</option>
        <option value="$nin">not in</option>
      </select>
      <input
        v-model="condition.value"
        placeholder="Value"
        class="border p-1 w-32"
      />
      <button @click="removeCondition(index)" class="text-red-500">✕</button>
    </div>

    <button
      @click="addCondition"
      class="bg-blue-500 text-white px-2 py-1 rounded"
    >
      Add Condition
    </button>

    <h3 class="mt-6 text-lg font-semibold">Generated MongoDB Filter:</h3>
    <pre class="bg-gray-100 p-2 mt-2 rounded text-sm">{{
      generatedFilter
    }}</pre>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const conditions = ref([{ field: "", operator: "$eq", value: "" }]);

function addCondition() {
  conditions.value.push({ field: "", operator: "$eq", value: "" });
}

function removeCondition(index) {
  conditions.value.splice(index, 1);
}

const generatedFilter = computed(() => {
  const filter = {};
  conditions.value.forEach(({ field, operator, value }) => {
    if (!field) return;

    let parsedValue = value;

    // Try to parse number or array
    try {
      if (operator === "$in" || operator === "$nin") {
        parsedValue = JSON.parse(value);
      } else if (!isNaN(Number(value))) {
        parsedValue = Number(value);
      }
    } catch {}

    if (!filter[field]) filter[field] = {};
    filter[field][operator] = parsedValue;
  });
  return JSON.stringify(filter, null, 2);
});
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
}
</style>
