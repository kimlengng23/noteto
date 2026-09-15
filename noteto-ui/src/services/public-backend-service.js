import axios from "axios";
let domain = process.env.VUE_APP_PUBLIC_DOMAIN || "/public";
function getHeaders() {
	let headers = {};
	headers.authorization = `${localStorage.getItem("sessionId")}`;
	return headers;
}
export default {
	getEntriesByDatabase(database) {
		let url = domain + `/api/get/entries/by/database/${database}`;
		return axios.get(url);
	},
	getReceiptById(id) {
		let url = domain + `/api/get/entry/${id}`;
		return axios.get(url);
	},
	getCustomerDashboard() {
		let url = domain + `/api/get/customer/dashboard`;
		let headers = getHeaders();
		return axios.get(url, { headers: headers });
	},
	verifyEmailBySessionId(sessionId) {
		let url = domain + `/api/verify/by/session/${sessionId}`;
		return axios.get(url);
	},
	addDemoRequest(demoRequest) {
		let url = domain + `/api/add/demo/request`;
		return axios.post(url, demoRequest);
	},
};
