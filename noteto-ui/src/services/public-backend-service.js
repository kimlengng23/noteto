import axios from "axios";
let host = window.location.hostname;
let domain = `https://localhost:3000/public`;
//let domain = `https://noteto.jaekjay.com/public`;
if (host.toLowerCase().includes("jaekjay")) {
	domain = `https://noteto2.jaekjay.com/public`;
}
function getHeaders() {
	let headers = {};
	headers.authorization = `${localStorage.getItem("sessionId")}`;
	return headers;
}
//domain = `https://noteto.jaekjay.com/public`;
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
