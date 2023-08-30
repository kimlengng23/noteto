import axios from "axios";
let host = window.location.hostname;
let domain = `https://localhost:3000/public`;
if (host.toLowerCase().includes("jaekjay")) {
	domain = `https://noteto.jaekjay.com/public`;
}
domain = `https://noteto.jaekjay.com/public`;
export default {
	getEntriesByDatabase(database) {
		let url = domain + `/api/get/entries/by/database/${database}`;
		return axios.get(url);
	},
	getReceiptById(id) {
		let url = domain + `/api/get/entry/${id}`;
		return axios.get(url);
	},

	verifyEmailBySessionId(sessionId) {
		let url = domain + `/api/verify/by/session/${sessionId}`;
		return axios.get(url);
	},
};
