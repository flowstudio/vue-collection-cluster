<template>
	<div class="collection-cluster" @scroll.passive="onScroll">
		<div class="collection-space"
			ref="start"
			:style="{height: startHeight + 'px', width: '100%'}"
		></div>

		<slot v-for="cell in visibleCells"
			:name="cell.item[typeField]"
			:cell="cell"
			:item="cell.item"
		/>

		<div class="collection-space"
			ref="end"
			:style="{height: endHeight + 'px', width: '100%'}"
		></div>
	</div>
</template>

<script>
const HeightTypes = {
	static: 'static',
	dynamic: 'dynamic',
	automatic: 'automatic',
};

export default {
	props: {
		items: { type: Array, required: true, },
		columns: { type: Number, default: 1, },
		itemWidth: { type: Number, default: null, },
		itemHeight: { type: Number, default: 100, },
		typeField: { type: String, default: 'type', },
		heightField: { type: String, default: 'height', },
		heightType: {
			type: String,
			default: HeightTypes.static, // static, dynamic, automatic
		},
		inset: { type: Object, default: function() {
			return {top: 0, bottom: 0};
		}},
		scrollPastEnd: { type: Number, default: 0, },
		buffer: { type: Number, default: 200, },
		autoResize: { type: Boolean, default: true },
		prerender: { type: Number, default: 0, }
	},
	data () {
		return {
			visibleCells: [],
			totalHeight: 0,
			startHeight: 0,
			endHeight: 0,
		};
	},
	computed: {
		length() {
			return this.items.length;
		},
		scrollPastEndSize() {
			let size = this.scrollPastEnd * this.height;
			
			size -= this.inset.top + this.inset.bottom + this.itemHeight;
			
			return size < 0 ? 0 : size;
		}
	},
	watch: {
		items() {
			this.verifyCells();
			this.updateVisibleCells();
		},
		columns() {
			this.updateVisibleCells();
		},
		autoResize() {
			if (this.autoResize) {
				window.addEventListener('resize', this.onResize);
			} else {
				window.removeEventListener('resize', this.onResize);
			}
		}
	},
	mounted() {
		this.scrollTop = 0;
		this.currentStart = 0;
		this.currentEnd = 0;
		this.startHeight = 0;
		this.endHeight = 0;

		this.height = this.$el.clientHeight;
		
		this.updateVisibleCells();

		if (this.autoResize) {
			window.addEventListener('resize', this.onResize);
		}
	},
	beforeDestroy() {
		if (this.autoResize) {
			window.removeEventListener('resize', this.onResize);
		}
	},
	methods: {
		onScroll() {
			this.scrollTop = this.$el.scrollTop;

			this.updateVisibleCells();
		},
		onResize() {
			this.height = this.$el.clientHeight;

			this.updateVisibleCells();
		},
		getStart() {
			if (this.heightType === HeightTypes.static) {
				let y = this.scrollTop - this.buffer;
				y = y < 0 ? 0 : y;
				
				let index = Math.floor(y / this.itemHeight) * this.columns;
				
				if (index > this.length) {
					index = this.length;
				}
				
				return index;
			} else {
				// TODO: implement

				return 0;
			}
		},
		getEnd() {
			if (this.heightType === HeightTypes.static) {
				let index = Math.ceil((this.scrollTop + this.height + this.buffer) / this.itemHeight) * this.columns;
				
				if (index > this.length) {
					index = this.length;
				}
				
				return index;
			} else {
				// TODO: implement

				return 0;
			}
		},
		updateVisibleCells() {
			let start = this.getStart();
			let end = this.getEnd();
			let i;
			let cell;
			
			//delete cells at the benning
			let deleteEnd = start < this.currentEnd ? start : this.currentEnd;
			
			for (i = this.currentStart; i < deleteEnd; i++) {
				cell = this.visibleCells.shift();
				// cell.prepareForDelete()?
			}
			
			//detele cells at the end
			let deleteStart = end > this.currentStart ? end : this.currentStart;
			
			for (i = deleteStart; i < this.currentEnd; i++) {
				cell = this.visibleCells.pop();
				// cell.prepareForDelete()?
			}
			
			//insert from at the beginning
			let insertTo = end < this.currentStart ? end : this.currentStart;
			
			if (insertTo > start) {
				//temporary array for added cells
				let cells = [];
				
				for (i = start; i < insertTo; i++) {
					cell = {index: i, item: this.items[i]};
					//add cell to temporary array so it's sorted correctly, as we go backwards
					cells.push(cell);
				}
				
				if (this.visibleCells.length) {
					this.visibleCells.unshift(...cells);
				} else {
					this.visibleCells = cells;
				}
			}
			
			//insert from at the end
			let insertFrom = start > this.currentEnd ? start : this.currentEnd;
			
			if (insertFrom < end) {
				for (i = insertFrom; i < end; i++) {
					cell = {index: i, item: this.items[i]};
					this.visibleCells.push(cell);
				}
			}
			
			this.currentStart = start;
			this.currentEnd = end;
			
			this.startHeight = this.inset.top +
				((this.currentStart / this.columns) * this.itemHeight);

			this.endHeight = this.inset.bottom + this.scrollPastEndSize +
				(Math.ceil((this.length - this.currentEnd) / this.columns) * this.itemHeight);
		},
		verifyCells() {
			let decreaseIndexBy = 0;

			for (let i = 0; i < this.visibleCells.length; i++) {
				if (decreaseIndexBy) {
					this.visibleCells[i].index -= decreaseIndexBy;
				}

				if (this.items.indexOf(this.visibleCells[i].item) !== this.visibleCells[i].index) {
					this.visibleCells.splice(i, 1);
					i--;

					decreaseIndexBy++;
				}
			}

			this.currentEnd -= decreaseIndexBy;
		}
	}
};
</script>
