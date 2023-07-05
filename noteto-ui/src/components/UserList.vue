<template>
	<div>
		<table class="table">
			<thead>
				<tr>
					<th v-for="header in headers" :key="header.value">
						{{ header.text }}
					</th>
				</tr>
				<tr>
					<th
						style="background: white"
						v-for="header in headers"
						:key="header.value">
						<v-text-field
							class="filter"
							v-model="search[header.value]"
							placeholder="filter"
							solo-inverted
							hide-details
							flat></v-text-field>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(user, idx) in filteredUsers"
					:class="[idx % 2 == 0 ? 'bg-grey entry' : 'entry']"
					:key="user._id"
					@click="highlightRow(item.id)"
					@dblclick="goToDetailForm(item._id)">
					<td>{{ user.first + " " + user.last }}</td>
					<td>{{ user.username }}</td>
					<!-- <td v-for="header in headers" :key="`${index}-${header.value}`">
                    <span v-if="header.value != 'id' ">{{getEntryText(header,item)}}</span>
                    <a v-else @click="goToDetailForm(item._id)">{{getEntryText(header,item)}}</a>
                </td> -->
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
export default {
	name: "UserList",

	data() {
		return {
			database: {},
			headers: [
				{ value: "fullname", text: "Name" },
				{ value: "username", text: "Username" },
			],
			search: {},
		};
	},
	computed: {
		isLoggedIn() {
			return this.$store.getters["isLoggedIn"];
		},
		allUsers() {
			return this.$store.getters["allUsers"];
		},
		filteredUsers() {
			let users = this.allUsers;
			for (let key in this.search) {
				let searchStr = this.search[key].trim().toLowerCase();
				if (searchStr && searchStr.length) {
					users = users.filter((u) => {
						let str = u[key];
						return str
							.toString()
							.trim()
							.toLowerCase()
							.includes(this.search[key]);
					});
				}
			}
			return users;
		},
	},
	methods: {},
};
</script>
<style>
.filter {
	border-radius: 15px !important;
	min-height: 10px;
}
</style>
