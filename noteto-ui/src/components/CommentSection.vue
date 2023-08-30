<template>
	<v-container>
		<h3>Comments on Entry</h3>
		<v-card elevation="0" min-width="350" width="100%">
			<v-card-text class="d-flex flex-column">
				<div>
					<h3 class="text-center" v-if="comments.length == 0">
						<i class="fas fa-comment-slash mr-2"></i>
						There are no comments yet
					</h3>
					<v-list three-line>
						<v-list-item
							v-for="comment in comments"
							:key="comment._id">
							<v-list-item-avatar>
								<v-btn icon>
									<i class="fas fa-user fa-lg"></i>
								</v-btn>
							</v-list-item-avatar>
							<v-list-item-content>
								<v-list-item-title>
									<span>
										{{
											`${comment.createdBy?.first} ${comment.createdBy?.last}`
										}}
									</span>
									-
									<span class="font-italic">
										{{
											convertDateToReadable(
												comment.dateCreated
											)
										}}
									</span>
								</v-list-item-title>

								<v-list-item-subtitle
									v-text="
										comment.value
									"></v-list-item-subtitle>
								<v-divider></v-divider>
							</v-list-item-content>
						</v-list-item>
					</v-list>
				</div>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import formMixin from "@/js/form-mixin";
export default {
	name: "CommentSection",
	mixins: [formMixin],
	mounted: function () {},
	props: {
		comments: {
			type: Array,
			default() {
				return [];
			},
		},
		entryId: {
			type: String,
			default() {
				return "";
			},
		},
		database: {
			type: String,
			default() {
				return "";
			},
		},
	},
	methods: {
		convertDateToReadable(date) {
			let castedDate = new Date(date);
			return castedDate.toLocaleDateString();
		},
	},
};
</script>
