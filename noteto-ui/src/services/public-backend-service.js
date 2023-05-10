import axios from "axios";
let host = window.location.hostname;
let domain = `https://localhost:3000/public`;
if (host.toLowerCase().includes("jaekjay")) {
  domain = `https://noteto.jaekjay.com/public`;
}
//domain = `https://noteto.jaekjay.com/public`;
export default {
  getReceiptById(id) {
    let url = domain + `/api/get/entry/${id}`;
    return axios.get(url);
  },
};
