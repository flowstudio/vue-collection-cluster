<template>
	<div class="app">
		<collection-cluster class="scroller"
			ref="list"
			:items="items"
			v-bind="collection"
			@scrollToTop="onScrollToTop"
			@scrollToBottom="onScrollToBottom"
		>
			<div slot="row" 
				slot-scope="{ cell, item }"
				:key="cell.index"
				class="item"
			>
				<div v-for="(line, i) in item.lines" :key="i">Row: {{ item.value }}</div>
			</div>
		</collection-cluster>

	</div>
</template>

<script>
import CollectionCluster from '../../src/vue-collection-cluster.vue';

export default {
	components: { CollectionCluster },
	data() {
		return {
			collection: {
				itemHeight: 40,
				heightType: 'automatic',
				inset: { 
					top: 20,
					bottom: 20,
				},
			},
			items: Array.from(Array(100), (item, i) => {
				const lines = Math.ceil(Math.random() * 12) + 1;

				return {type: 'row', value: i, lines: Array.from(Array(lines)).map(line => i)};
			}),
		};
	},
	mounted() {
		window.app = this;
	},
	methods: {
		onScrollToTop() {
			console.log('at top');
		},
		onScrollToBottom() {
			console.log('at bottom');
		},
	}
}
</script>