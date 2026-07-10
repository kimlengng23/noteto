<template>
	<div class="home-page montserrat">
		<section class="hero-section">
			<v-container class="hero-content">
				<v-row align="center">
					<v-col cols="12" lg="6">
						<div class="hero-copy fade-up">
							<div class="overline primary--text mb-3">
								Flexible entry tracking
							</div>
							<h1 class="hero-title">Noteto</h1>
							<p class="hero-subtitle">
								An open-source app for building simple internal
								databases, tracking records, assigning work, and
								keeping teams aligned without turning every
								process into a spreadsheet.
							</p>
							<div class="hero-actions">
								<v-btn
									color="primary"
									depressed
									large
									:to="{ name: 'UserRegister' }">
									<v-icon left>mdi-rocket-launch</v-icon>
									Get Started
								</v-btn>
								<v-btn
									color="primary"
									class="ml-sm-3 mt-3 mt-sm-0"
									outlined
									large
									:to="{ name: 'Login' }">
									<v-icon left>mdi-login</v-icon>
									Sign In
								</v-btn>
							</div>
						</div>
					</v-col>
					<v-col cols="12" lg="6">
						<div class="hero-preview fade-up delay-2">
							<div class="preview-toolbar">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="preview-grid">
								<div class="preview-sidebar">
									<div
										v-for="item in previewItems"
										:key="item"
										class="preview-nav-item"></div>
								</div>
								<div class="preview-table">
									<div
										class="preview-row preview-row-head"></div>
									<div
										v-for="row in 5"
										:key="row"
										class="preview-row">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>
							</div>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</section>

		<section class="section-band">
			<v-container>
				<v-row>
					<v-col
						v-for="(feature, index) in features"
						:key="feature.title"
						cols="12"
						md="4">
						<div
							class="feature-panel fade-up"
							:style="delayStyle(index)">
							<div class="feature-icon">
								<v-icon color="primary">
									{{ feature.icon }}
								</v-icon>
							</div>
							<h2>{{ feature.title }}</h2>
							<p>{{ feature.text }}</p>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</section>

		<section class="section-band white">
			<v-container>
				<v-row align="center">
					<v-col cols="12" lg="5">
						<div class="section-copy fade-up">
							<div class="overline primary--text mb-2">
								Organized work
							</div>
							<h2>Track the records that matter.</h2>
							<p>
								Noteto keeps custom fields, comments, history,
								assignments, filters, and layouts together so
								each team can shape the app around its workflow.
							</p>
						</div>
					</v-col>
					<v-col cols="12" lg="7">
						<div class="showcase-frame fade-up delay-2">
							<v-img
								src="@/assets/show-case-1.jpg"
								aspect-ratio="1.65"
								class="showcase-image"></v-img>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</section>

		<section class="section-band quickstart-section">
			<v-container>
				<div class="section-heading fade-up">
					<div class="overline primary--text mb-2">Open source</div>
					<h2>Run it locally, shape it for your workflow.</h2>
				</div>
				<v-row>
					<v-col
						v-for="(step, index) in quickstart"
						:key="step.title"
						cols="12"
						md="4">
						<v-card
							elevation="0"
							outlined
							class="quickstart-card fade-up"
							:style="delayStyle(index)">
							<v-card-title class="d-block">
								<div class="quickstart-number">
									{{ index + 1 }}
								</div>
								<div class="quickstart-title">
									{{ step.title }}
								</div>
							</v-card-title>
							<v-card-text>
								<p>{{ step.text }}</p>
								<pre
									v-if="
										step.command
									"><code>{{ step.command }}</code></pre>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-container>
		</section>

		<section class="section-band contribute-section">
			<v-container>
				<v-row align="center">
					<v-col cols="12" md="7">
						<div class="section-copy fade-up">
							<div class="overline primary--text mb-2">
								Contribute
							</div>
							<h2>Designed to be improved in the open.</h2>
							<p>
								Noteto is ready for contributors who want to
								improve setup, documentation, field types,
								automation, reporting, and the self-hosted
								experience.
							</p>
						</div>
					</v-col>
					<v-col cols="12" md="5">
						<div class="contribute-panel fade-up delay-2">
							<div
								v-for="item in contributionItems"
								:key="item"
								class="contribution-item">
								<v-icon color="primary">
									mdi-check-circle
								</v-icon>
								<span>{{ item }}</span>
							</div>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</section>
	</div>
</template>

<script>
export default {
	name: "HomePage",
	data() {
		return {
			features: [
				{
					icon: "mdi-table",
					title: "Custom databases",
					text: "Create structured databases with fields, choices, layouts, and filters that fit daily operations.",
				},
				{
					icon: "mdi-account-check",
					title: "Team ownership",
					text: "Assign records, manage access, group users, and keep the right people focused on the right entries.",
				},
				{
					icon: "mdi-history",
					title: "Clear history",
					text: "Follow comments and changes over time so each record keeps its context as work moves forward.",
				},
			],
			previewItems: ["database", "fields", "filters", "users"],
			quickstart: [
				{
					title: "Clone",
					text: "Pull the repository and install dependencies for the API and UI.",
					command: "npm install",
				},
				{
					title: "Start MongoDB",
					text: "Use Docker Compose for the full local stack, including MongoDB.",
					command: "docker compose up --build",
				},
				{
					title: "Connect",
					text: "Use the MongoDB connection dialog if you want to connect to your own local database.",
					command: "mongodb://127.0.0.1:27017",
				},
			],
			contributionItems: [
				"Improve self-hosted setup",
				"Add tests around core API behavior",
				"Refine field types and layouts",
				"Document deployment paths",
			],
		};
	},
	methods: {
		delayStyle(index) {
			return {
				animationDelay: `${index * 90}ms`,
			};
		},
	},
};
</script>

<style scoped>
.home-page {
	background: #f7f9fc;
	color: #1f2933;
}

.montserrat {
	font-family: "Montserrat", sans-serif !important;
	line-height: 1.5;
}

.hero-section {
	min-height: 76vh;
	background: #ffffff;
	border-bottom: 1px solid rgba(31, 41, 51, 0.08);
}

.hero-content {
	min-height: 76vh;
	display: flex;
	align-items: center;
	padding-top: 72px;
	padding-bottom: 48px;
}

.hero-copy {
	width: min(760px, 100%);
}

.hero-title {
	font-size: clamp(3.2rem, 8vw, 7rem);
	line-height: 0.95;
	font-weight: 800;
	margin: 0 0 20px;
	color: #102a43;
}

.hero-subtitle {
	max-width: 680px;
	font-size: clamp(1.1rem, 2vw, 1.55rem);
	margin-bottom: 30px;
	color: #486581;
}

.hero-actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.hero-preview {
	overflow: hidden;
	border-radius: 18px;
	border: 1px solid rgba(31, 41, 51, 0.08);
	background: #f8fafc;
	box-shadow: 0 24px 70px rgba(31, 41, 51, 0.12);
}

.preview-toolbar {
	height: 48px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 18px;
	border-bottom: 1px solid rgba(31, 41, 51, 0.08);
	background: #ffffff;
}

.preview-toolbar span {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #bcccdc;
}

.preview-grid {
	display: grid;
	grid-template-columns: 140px 1fr;
	min-height: 320px;
}

.preview-sidebar {
	padding: 18px;
	border-right: 1px solid rgba(31, 41, 51, 0.08);
	background: #eff4f9;
}

.preview-nav-item {
	height: 24px;
	border-radius: 999px;
	background: #d9e2ec;
	margin-bottom: 14px;
}

.preview-nav-item:first-child {
	background: #90caf9;
}

.preview-table {
	padding: 22px;
}

.preview-row {
	display: grid;
	grid-template-columns: 1.2fr 0.8fr 0.7fr;
	gap: 14px;
	align-items: center;
	min-height: 42px;
	border-bottom: 1px solid rgba(31, 41, 51, 0.08);
}

.preview-row span,
.preview-row-head {
	border-radius: 999px;
	background: #d9e2ec;
}

.preview-row span {
	height: 14px;
}

.preview-row span:nth-child(2) {
	background: #cfe8fc;
}

.preview-row-head {
	height: 18px;
	margin-bottom: 12px;
	border-bottom: 0;
}

.section-band {
	padding: 64px 0;
}

.section-copy h2,
.section-heading h2 {
	font-size: clamp(2rem, 4vw, 3rem);
	line-height: 1.12;
	font-weight: 800;
	margin-bottom: 18px;
}

.section-copy p {
	color: #52616f;
	font-size: 1.1rem;
}

.section-heading {
	max-width: 700px;
	margin-bottom: 32px;
}

.feature-panel,
.quickstart-card,
.contribute-panel,
.showcase-frame {
	border-radius: 18px;
}

.feature-panel {
	min-height: 250px;
	padding: 30px;
	background: #ffffff;
	border: 1px solid rgba(31, 41, 51, 0.08);
	box-shadow: 0 18px 48px rgba(31, 41, 51, 0.06);
	transition: transform 180ms ease, box-shadow 180ms ease;
}

.feature-panel:hover,
.quickstart-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 22px 60px rgba(31, 41, 51, 0.11);
}

.feature-icon {
	width: 48px;
	height: 48px;
	display: grid;
	place-items: center;
	border-radius: 14px;
	color: #1565c0;
	background: #e3f2fd;
	margin-bottom: 22px;
}

.feature-panel h2 {
	font-size: 1.25rem;
	font-weight: 800;
	margin-bottom: 12px;
}

.feature-panel p {
	color: #52616f;
	margin-bottom: 0;
}

.showcase-frame {
	overflow: hidden;
	border: 1px solid rgba(31, 41, 51, 0.08);
	box-shadow: 0 24px 70px rgba(31, 41, 51, 0.14);
}

.showcase-image {
	transition: transform 420ms ease;
}

.showcase-frame:hover .showcase-image {
	transform: scale(1.015);
}

.quickstart-section {
	background: #eef3f8;
}

.quickstart-card {
	height: 100%;
	padding: 10px;
	transition: transform 180ms ease, box-shadow 180ms ease;
}

.quickstart-number {
	width: 38px;
	height: 38px;
	display: grid;
	place-items: center;
	border-radius: 50%;
	color: #ffffff;
	background: #1565c0;
	font-weight: 800;
	margin-bottom: 18px;
}

.quickstart-title {
	font-size: 1.25rem;
	font-weight: 800;
}

.quickstart-card p {
	color: #52616f;
}

.quickstart-card pre {
	overflow-x: auto;
	padding: 14px;
	border-radius: 10px;
	color: #d8e2ec;
	background: #1f2933;
	font-size: 0.88rem;
}

.contribute-section {
	background: #ffffff;
}

.contribute-panel {
	padding: 28px;
	border: 1px solid rgba(31, 41, 51, 0.08);
	background: #f8fafc;
}

.contribution-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 0;
	color: #334e68;
	font-weight: 600;
}

.contribution-item + .contribution-item {
	border-top: 1px solid rgba(31, 41, 51, 0.08);
}

.fade-up {
	animation: fade-up 520ms ease both;
}

.delay-2 {
	animation-delay: 160ms;
}

@keyframes fade-up {
	from {
		opacity: 0;
		transform: translateY(14px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.fade-up,
	.feature-panel,
	.quickstart-card,
	.showcase-image {
		animation: none;
		transition: none;
	}
}

@media only screen and (max-width: 600px) {
	.hero-section,
	.hero-content {
		min-height: auto;
	}

	.hero-content {
		padding-top: 96px;
	}

	.preview-grid {
		grid-template-columns: 1fr;
	}

	.preview-sidebar {
		display: none;
	}

	.section-band {
		padding: 48px 0;
	}
}
</style>
