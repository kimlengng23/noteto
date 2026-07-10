import axios from "axios";
let domain = process.env.VUE_APP_API_DOMAIN || "/api";
function getHeaders() {
  let headers = {};
  headers.authorization = `bearer ${localStorage.getItem("token")}`;
  return headers;
}
export default {
  getDatabaseStatus() {
    let url = domain + "/system/database/status";
    return axios.get(url);
  },
  testDatabaseConnection(config) {
    let url = domain + "/system/database/test";
    return axios.post(url, config);
  },
  saveDatabaseConnection(config) {
    let url = domain + "/system/database/save";
    return axios.post(url, config);
  },
  addAutomation(automation) {
    let url = domain + "/automation/add";
    let headers = getHeaders();
    return axios.post(url, automation, { headers: headers });
  },
  addChoices(choices) {
    let url = domain + "/choice/add";
    let headers = getHeaders();
    return axios.post(url, choices, { headers: headers });
  },
  addComment(comment) {
    let url = domain + "/comment/add";
    let headers = getHeaders();
    return axios.post(url, comment, { headers: headers });
  },
  addDatabaseRequest(request) {
    let url = domain + "/database/add/request";
    let headers = getHeaders();
    return axios.post(url, request, { headers: headers });
  },
  addEntry(entry) {
    let url = domain + "/entry/add";
    let headers = getHeaders();
    return axios.post(url, entry, { headers: headers });
  },
  addField(field) {
    let url = domain + "/field/add/";
    let headers = getHeaders();
    return axios.post(url, field, { headers: headers });
  },
  addFields(fields) {
    let url = domain + "/field/add/list";
    let headers = getHeaders();
    return axios.post(url, fields, { headers: headers });
  },
  addHeaderSet(headerSet) {
    let url = domain + `/header/set/add/`;
    let headers = getHeaders();
    return axios.post(url, headerSet, { headers: headers });
  },
  addFilterSet(filterSet) {
    let url = domain + `/filter/set/add/`;
    let headers = getHeaders();
    return axios.post(url, filterSet, { headers: headers });
  },
  addLayout(rows) {
    let url = domain + "/layout/add";
    let headers = getHeaders();
    return axios.post(url, rows, { headers: headers });
  },
  addDatabase(database) {
    let url = domain + "/database/add/";
    let headers = getHeaders();
    return axios.post(url, database, { headers: headers });
  },
  addDatabaseAccess(access) {
    let url = domain + "/add/database/access";
    return axios.post(url, access);
  },
  deleteEntryById(id) {
    let url = domain + `/entry/delete/by/id/${id}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  deleteDemoRequestById(id) {
    let url = domain + `/miscellaneous/delete/demo/request/by/id/${id}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  deleteField(field) {
    let url = domain + `/field/delete`;
    let headers = getHeaders();
    return axios.post(url, field, { headers: headers });
  },
  dropDatabase(database) {
    let url = domain + `/database/drop`;
    let headers = getHeaders();
    return axios.post(url, { database: database }, { headers: headers });
  },
  getAutomationsByDatabase(database) {
    let url = domain + `/automation/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getAssignedEntries() {
    let url = domain + `/entry/get/assigned`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getChoicesByDatabase(database) {
    let url = domain + `/choice/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getCommentsByEntryId(entryId) {
    let url = domain + `/comment/get/by/entry/id/${entryId}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDashboardData() {
    let url = domain + `/entry/get/dashboard/data`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getEntriesByDatabase(database, filter = {}) {
    let url = domain + `/entry/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.post(url, filter, { headers: headers });
  },
  getAllCustomButtonsByDatabase(database) {
    let url = domain + `/get/custom/buttons/by/database/${database}`;
    return axios.get(url).catch();
  },
  getAllUsers() {
    let url = domain + "/user/get/all";
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseToFields() {
    let url = domain + `/field/get/database/to/fields/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseToChoices() {
    let url = domain + `/choice/get/database/to/choices/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseToHeaderSets() {
    let url = domain + `/header/set/get/database/to/header/sets`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseToFilterSets() {
    let url = domain + `/filter/set/get/database/to/filter/sets`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseToLayoutMappings() {
    let url = domain + `/layout/get/database/to/layout/mappings/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDropdowns() {
    let url = domain + `/miscellaneous/get/dropdowns`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getFilterSetsByDatabase(database) {
    let url = domain + `/filter/set/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getHeaderSetsByDatabase(database) {
    let url = domain + `/header/set/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  removeHeaderSetsByDatabase(database) {
    let url = domain + `/header/set/remove/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getEmptyEntryByDatabase(database) {
    let url = domain + `/entry/get/empty/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getEntryById(id) {
    let url = domain + `/entry/get/by/id/${id}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getLayoutByDatabase(database) {
    let url = domain + `/layout/get/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getUsersByDatabase(database) {
    let url = domain + `/user/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getFieldsByDatabase(database) {
    let url = domain + `/field/get/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getAllDatabases() {
    let url = domain + `/database/get/all`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getNavigationOptions() {
    let url = domain + `/miscellaneous/get/navigation/options`;
    let headers = getHeaders();
    return axios.get(url, { headers });
  },
  getAvailableDatabases() {
    let url = domain + `/database/get/available/databases/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getHistoryByEntryId(entryId) {
    let url = domain + `/history/get/by/entry/id/${entryId}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDemoRequests() {
    let url = domain + `/miscellaneous/get/demo/requests/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  registerUser(account) {
    console.log(account)
    let url = domain + `/user/register`;
    return axios.post(url, account);
  },
  removeLayoutByDatabase(database) {
    let url = domain + `/layout/remove/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  removeDatabaseAccess(access) {
    let url = domain + `/remove/database/access`;
    return axios.post(url, access).catch();
  },
  searchForEntries(filter) {
    let url = domain + `/search/entries`;
    return axios.post(url, filter).catch();
  },
  updateEntryById(id, wrappedEntry) {
    let url = domain + `/entry/update/${id}`;
    let headers = getHeaders();
    return axios.post(url, wrappedEntry, { headers: headers });
  },
  updateField(field) {
    let url = domain + `/field/update`;
    let headers = getHeaders();
    return axios.post(url, field, { headers: headers });
  },
  updateChoices(choices) {
    let url = domain + `/choice/update`;
    let headers = getHeaders();
    return axios.post(url, choices, { headers: headers });
  },
  login(login) {
    let url = domain + `/user/login`;
    login.browser_id = crypto.randomUUID();
    return axios.post(url, login);
  },
  logout() {
    let url = domain + `/user/logout`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  verifyToken() {
    let url = domain + `/user/verify/token`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  addGroup(group) {
    let url = domain + `/group/add/`;
    let headers = getHeaders();
    return axios.post(url, group, { headers: headers });
  },
  getAllGroups() {
    let url = domain + `/group/get/all/`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  updateDatabaseAccess(wrappedAccess) {
    let url = domain + `/database/update/access`;
    let headers = getHeaders();
    return axios.post(url, wrappedAccess, { headers: headers });
  },
  updateGroupMembers(group) {
    let url = domain + `/group/update/members`;
    let headers = getHeaders();
    return axios.post(url, group, { headers: headers });
  },
  updateDatabaseGroups(database) {
    let url = domain + `/database/update/groups`;
    let headers = getHeaders();
    return axios.post(url, database, { headers: headers });
  },
  getDatabasesByUserId(userId) {
    let url = domain + `/database/get/by/userId/${userId}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getAccessesByDatabase(database) {
    let url = domain + `/database/get/accesses/by/database/${database}`;
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  getDatabaseRequests() {
    let url = domain + "/database/get/requests";
    let headers = getHeaders();
    return axios.get(url, { headers: headers });
  },
  setFavoriteHeaderSet(favorite) {
    let url = domain + `/header/set/set/favorite`;
    let headers = getHeaders();
    return axios.post(url, favorite, { headers: headers });
  },
  setFavoriteFilterSet(favorite) {
    let url = domain + `/filter/set/set/favorite`;
    let headers = getHeaders();
    return axios.post(url, favorite, { headers: headers });
  },
  updateHeaderSet(headerSet) {
    let url = domain + `/header/set/update`;
    let headers = getHeaders();
    return axios.post(url, headerSet, { headers: headers });
  },
  updateFilterSet(filterSet) {
    let url = domain + `/filter/set/update`;
    let headers = getHeaders();
    return axios.post(url, filterSet, { headers: headers });
  },
};
