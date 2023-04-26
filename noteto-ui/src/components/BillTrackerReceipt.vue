<template>
	<table>
		<tbody>
			<tr>
				<td>
					<p style="margin:0;">Sender</p>
					<p style="margin:0;">Shipper's Full Name</p>
					<p style="margin:0;">Address In The USA</p>
					<p style="margin:0;">Company</p>
					<p style="margin:0;">(760) 548-8493</p>
				</td>
				<td>
					<p style="margin:0;">Receiver</p>
					<p style="margin:0;">Receiver's Full Name</p>
					<p style="margin:0;">Address In The USA</p>
					<p style="margin:0;">Company</p>
					<p style="margin:0;">(760) 548-8493</p>
				</td>
			</tr>
			<tr>
				<td>
					{{expression}}
				</td>
			</tr>
		</tbody>	
	</table>
</template>
<script>
export default {
	name: 'BillTrackerReceipt',
	components: {
		
	},
	data() {
		return {
			value:1,
			expression:'value*2'
		}
	},
	computed: {

	},
	methods: {

	}

}
</script>
