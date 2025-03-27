<template>
  <v-container class="rounded-xl white mt-2 pa-0 pa-lg-2">
    <v-card elevation="0">
      <v-card-text>
        <v-row>
          <v-col class="text-lg-h4 text-md-h4 text-h6">
            <span style="font-family: 'Dangrek', cursive"> ចែកចាយ </span>
            -
            <span style="font-family: 'Sora', sans-serif"> Jaek Jay </span>
          </v-col>
          <v-col>
            <div class="text-lg-h4 text-md-h4 text-h6">Shipping Invoice</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row>
              <v-col cols="8">
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
                  Invoice Number
                </div>
              </v-col>
              <v-col>
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
                  {{ entry._data.id }}
                </div>
              </v-col>
            </v-row>
            <v-row
              class="red white--text rounded-xl"
              v-if="entry.customerPaymentStatus == 'Pending'"
            >
              <v-col cols="8">
                <div class="text-lg-h6 text-md-h6 text-subtitle-2">
                  Payment Status
                </div>
              </v-col>
              <v-col>
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
                  {{ entry.customerPaymentStatus }}
                </div>
              </v-col>
            </v-row>
            <v-row
              class="green white--text"
              v-else-if="entry.customerPaymentStatus == 'Paid'"
            >
              <v-col cols="8">
                <div class="text-lg-h6 text-md-h6 text-subtitle-2">
                  Payment Status
                </div>
              </v-col>
              <v-col>
                <div class="text-h5 float-right">
                  {{ entry.customerPaymentStatus }}
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-row>
              <v-col cols="8">
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
                  Tracking Number
                </div>
              </v-col>
              <v-col>
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
                  {{ entry["mtlTracking#"] }}
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="8">
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
                  Date Shipped
                </div>
              </v-col>
              <v-col>
                <div class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
                  {{ entry["dateShipped"] }}
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
              Sender
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              <span>
                {{ entry["customer"] }} -
                {{ entry["customerNumber"] }}
              </span>
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              {{ entry["customerAddress"] }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
              Receiver
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              <span>
                {{ entry["receiver"] }} -
                {{ entry["receiverNumber"] }}
              </span>
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              {{ entry["receiverAddress"] }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
              Number of Box
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              {{ entry["numBoxes"] }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
              Total Weight
            </div>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2">
              {{ entry["totalWeight"] }} {{ "lbs" }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-lg-h6 text-md-h6 text-subtitle-2 label">Notes</div>
            {{ entry["notes"] }}
          </v-col>
        </v-row>
        <v-row>
          <v-col
            ><div class="text-lg-h6 text-md-h6 text-subtitle-2 label">
              Charge List
            </div></v-col
          >
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-simple-table class="rounded-xl border">
              <thead>
                <tr>
                  <th class="text-left">Item</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in chargeList" :key="idx">
                  <td
                    class="text-caption text-md-body-2 text-lg-subtitle-2"
                    style="max-width: 800px"
                  >
                    <div>{{ item.itemDescription }}</div>
                  </td>
                  <td
                    class="text-caption text-md-body-2 text-lg-subtitle-2 text-right"
                  >
                    {{ item.quantity }}
                  </td>
                  <td
                    class="text-caption text-md-body-2 text-lg-subtitle-2 text-right"
                  >
                    {{ "$" }}
                    {{ item.unitPrice.toFixed(2) }}
                  </td>
                  <td
                    class="text-caption text-md-body-2 text-lg-subtitle-2 text-right"
                  >
                    {{ "$" }}
                    {{ (item.quantity * item.unitPrice + 0.00001).toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <td class="text-caption text-md-body-2 text-lg-subtitle-2">
                    <div>Total</div>
                  </td>
                  <td></td>
                  <td></td>
                  <td
                    class="text-caption text-md-body-2 text-lg-subtitle-2 text-right"
                  >
                    $ {{ totalDue.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
  name: "JaekJayCargoReceipt",
  data() {
    return {
      entry: {},
    };
  },
  mounted: function () {
    publicService.getReceiptById(this.$route.params.id).then((response) => {
      this.entry = response.data;
      document.title = `${this.entry._data.id}|${this.entry["mtlTracking#"]}|Shipping|នូតតូក - Noteto`;
    });
  },
  computed: {
    chargeList() {
      if (!this.entry.chargeList) return [];
      return this.entry.chargeList;
    },
    totalDue() {
      let total = 0;
      if (!this.entry.chargeList) return total;
      for (let i = 0; i < this.entry.chargeList.length; i++) {
        let item = this.entry.chargeList[i];
        total += item.unitPrice * item.quantity;
      }
      return total;
    },
  },
};
</script>
<style scoped>
.label {
  color: #0091ea;
}

p,
div {
  white-space: pre-wrap;
}
</style>
