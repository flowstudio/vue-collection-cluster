<template>
	<div class="app">
		<collection-cluster class="scroller"
			ref="list"
			:items="items"
			v-bind="collection"
			@scrollToBottom="onScrollToBottom"
		>
			<div slot="row" 
				slot-scope="{ cell, item }"
				:key="cell.index"
				class="item"
			>Row: {{item.value}}
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
				inset: { 
					top: 20,
					bottom: 20,
				},
			},
			items: Array.from(Array(1000), (item, i) => ({type: 'row', value: i})),
		};
	},
	methods: {
		onScrollToBottom() {
			console.log('at bottom');
		}
	}
}
</script>