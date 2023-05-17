<template>
  <v-container>
    <v-card elevation="0">
      <v-card-text>
        <v-row>
          <v-col
            ><v-row
              ><v-col><div class="text-h4">Order Invoice</div></v-col></v-row
            >
            <v-row
              ><v-col
                ><div class="text-h5">
                  {{ entry.paymentStatus }}
                </div></v-col
              ></v-row
            >
          </v-col>
          <v-col>
            <v-row
              ><v-col><div class="text-h6">Invoice Number</div></v-col
              ><v-col>
                <div class="text-subtitle-1 float-right">
                  {{ entry.id }}
                </div></v-col
              ></v-row
            >
            <v-row
              ><v-col><div class="text-h6">Date Created</div></v-col
              ><v-col
                ><div class="text-subtitle-1 float-right">
                  {{ entry.dateCreated }}
                </div></v-col
              ></v-row
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-h6">Customer</div>
            <div class="text-subtitle-1">
              <span>{{ entry.customer }}</span>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-h6">Collecting Fee</div>
            <div class="text-subtitle-1">
              <span>{{ entry.collectingFee }} %</span>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-h6">Notes</div>
            <p>{{ entry["notes"] }}</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col> <div class="text-h6">Item List</div></v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">Item</th>
                  <th class="text-left">Qty</th>
                  <th class="text-left">Unit Price</th>
                  <th class="text-left">Tax</th>
                  <th class="text-left">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in itemList" :key="idx">
                  <td class="text-subtitle-1">{{ item.itemTitle }}</td>
                  <td class="text-subtitle-1">{{ item.itemQty }}</td>
                  <td class="text-subtitle-1">{{ item.itemUnitPrice }}</td>
                  <td class="text-subtitle-1">
                    $
                    {{
                      (
                        (item.itemUnitPrice * item.itemTax) / 100 +
                        0.00001
                      ).toFixed(2)
                    }}
                  </td>
                  <td class="text-subtitle-1">
                    $
                    {{
                      (item.itemQty * item.itemUnitPrice + 0.00001).toFixed(2)
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-subtitle-1">
                    Fee {{ entry.collectingFee }} %
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-subtitle-1">
                    $ {{ collectingFee.toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <td class="text-subtitle-1">Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-subtitle-1">$ {{ totalDue.toFixed(2) }}</td>
                </tr>
              </tbody></v-simple-table
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
  name: "JaekJayCustomOrderReceipt",
  data() {
    return {
      entry: {},
    };
  },
  mounted: function () {
    publicService.getReceiptById(this.$route.params.id).then((response) => {
      //document.title = `${this.entry["id"] - this.entry["mtlTracking#"]}`;
      this.entry = response.data;
    });
  },
  computed: {
    itemList() {
      if (!this.entry.itemList) return [];
      return this.entry.itemList;
    },
    collectingFee() {
      if (!this.entry.collectingFee) return 0;
      return (this.entry.collectingFee / 100) * this.subtotal;
    },
    subtotal() {
      let total = 0;
      if (!this.entry.itemList) return total;
      for (let i = 0; i < this.entry.itemList.length; i++) {
        let item = this.entry.itemList[i];
        total += item.itemUnitPrice * item.itemQty * (1 + item.itemTax / 100);
      }
      return total;
    },
    totalDue() {
      return this.subtotal + this.collectingFee;
    },
  },
};
</script>
<style scoped>
div.text-h6 {
  color: #0091ea;
}

p,
div {
  white-space: pre-wrap;
}
.row {
  border: 1px solid;
}
</style>
