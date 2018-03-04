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

const ScrollPositions = {
	default: 'default',
	top: 'top',
	bottom: 'bottom',
	topInset: 'topInset',
	bottomInset: 'bottomInset',
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
		threshold: { type: Number, default: 50, },
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
		this.heightInvalidAfter = 0;
		this.accumulatorProp = Symbol();

		this.height = this.$el.clientHeight;
		this.scrollHeight = 0;
		
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
		onScroll(event) {
			this.scrollTop = this.$el.scrollTop;
			this.$emit('scroll', event);

			this.updateVisibleCells();
		},
		onResize() {
			this.height = this.$el.clientHeight;

			this.updateVisibleCells();
		},
		invalidateHeightAfter(index) {
			index < 0 && (index = 0);
			
			if (index < this.heightInvalidAfter) {
				this.heightInvalidAfter = index;
			}
		},
		getStartEnd() {
			if (!this.length) {
				return {start: 0, end: 0};
			}

			let y = this.scrollTop - this.inset.top - this.buffer;
			y < 0 && (y = 0);

			let endY = this.scrollTop + this.inset.top + this.height + this.buffer;

			if (this.heightType === HeightTypes.static) {		
				let start = Math.floor(y / this.itemHeight) * this.columns;

				start < 0 && (start = 0);
				start > this.length && (start = this.length);

				let end = Math.ceil(endY / this.itemHeight) * this.columns;

				end > this.length && (end = this.length);
				
				return {start, end};
			}
			
			// dynamic/automatic height
			// calculate approx start
			let start = Math.floor(y / this.itemHeight);
			start > this.heightInvalidAfter && (start = this.heightInvalidAfter);

			while (start > 0 && (
				this.items[start][this.accumulatorProp] === undefined ||
				this.items[start][this.accumulatorProp] > y
			)) {
				start--;
			}

			let accumulator = start === 0 ? 0 : this.items[start][this.accumulatorProp] || 0;

			while (true) {
				let item = this.items[start];
				let height = item[this.heightField] || this.itemHeight;

				item[this.accumulatorProp] = accumulator;
				accumulator += height;

				if (accumulator > y || start >= this.length-1) {
					break;
				}

				start++;
			}

			let end = start;

			while (end < this.length-1 && accumulator < endY) {
				let item = this.items[++end];
				let height = item[this.heightField] || this.itemHeight;

				item[this.accumulatorProp] = accumulator;
				accumulator += height;
			}

			if (end > this.heightInvalidAfter) {
				this.heightInvalidAfter = end;
			}

			end++;

			return {start: start, end: end};
		},
		updateVisibleCells() {
			const {start, end} = this.getStartEnd();
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

			let changed = this.currentStart !== start || this.currentEnd !== end;
			
			this.currentStart = start;
			this.currentEnd = end;
			
			this.updateSizes();
			this.verifyScrollPosition();

			if (changed) {
				this.heightType === HeightTypes.automatic && this.$nextTick(() => {
					this.updateHeights();
				});
				this.$emit('cellsChange', this.visibleCells);
			}
		},
		verifyCells() {
			let decreaseIndexBy = 0;
			let changed = false;

			for (let i = 0; i < this.visibleCells.length; i++) {
				if (decreaseIndexBy) {
					this.visibleCells[i].index -= decreaseIndexBy;
				}

				if (this.items.indexOf(this.visibleCells[i].item) !== this.visibleCells[i].index) {
					if (i === 0) {
						this.invalidateHeightAfter(0);
					} else {
						this.invalidateHeightAfter(this.currentStart + i);
					}

					this.visibleCells.splice(i, 1);
					i--;

					decreaseIndexBy++;
					changed = true;
				}
			}

			this.currentEnd -= decreaseIndexBy;

			if (this.heightInvalidAfter >= this.length) {
				this.invalidateHeightAfter(this.length-1);
			}

			if (changed) {
				this.heightType === HeightTypes.automatic && this.$nextTick(() => {
					this.updateHeights();
				});

				this.$emit('cellsChange', this.visibleCells);
			}
		},
		isAtTop() {
			return this.scrollTop - this.inset.top < this.threshold;
		},
		isAtBottom() {
			return this.scrollHeight - this.height - this.scrollTop - this.inset.bottom < this.threshold;
		},
		verifyScrollPosition() {
			if (this.isAtTop()) {
				this.$emit('scrollToTop');
			}

			if (this.isAtBottom()) {
				this.$emit('scrollToBottom');
			}
		},
		updateSizes() {
			if (this.heightType === HeightTypes.static) {
				this.startHeight = this.inset.top +
				((this.currentStart / this.columns) * this.itemHeight);

				this.endHeight = this.inset.bottom + this.scrollPastEndSize +
				(Math.ceil((this.length - this.currentEnd) / this.columns) * this.itemHeight);

				this.scrollHeight = this.inset.top + this.inset.bottom + (Math.ceil(this.length / this.columns) * this.itemHeight) + this.scrollPastEndSize;
			} else {
				let startHeight = this.inset.top;
				let endHeight = this.inset.bottom + this.scrollPastEndSize;
				let scrollHeight = endHeight + startHeight;

				const startItem = this.items[this.currentStart];

				if (startItem) {
					startHeight += startItem[this.accumulatorProp];
				}

				const lastAccumulatedItem = this.items[this.heightInvalidAfter];

				if (lastAccumulatedItem) {
					let totalHeight = lastAccumulatedItem[this.accumulatorProp];
					totalHeight += lastAccumulatedItem[this.heightField] || this.itemHeight;

					totalHeight += (this.length - 1 - this.heightInvalidAfter) * this.itemHeight;

					let endItem = this.items[this.currentEnd-1];

					endHeight += totalHeight - endItem[this.accumulatorProp] - (endItem[this.heightField] || this.itemHeight);
					scrollHeight += totalHeight;
				}

				this.startHeight = startHeight;
				this.endHeight = endHeight;
				this.scrollHeight = scrollHeight;
			}
		},
		updateHeights() {
			let changed = false;

			for (let i = this.visibleCells.length-1; i >= 0; i--) {
				let cell = this.visibleCells[i];
				let el = this.$el.children[1 + i];
				let height = el.clientHeight;

				if (cell.item[this.heightField] === height) {
					continue;
				}

				cell.item[this.heightField] = height;
				changed = true;

				this.invalidateHeightAfter(this.currentStart + i);
			}

			if (changed) {
				this.updateVisibleCells();
			}
		},
		resizeItem(index) {
			if (index < 0 || index >= this.length) {
				throw new Error('Invalid index.');
			}

			if (this.heightType === HeightTypes.dynamic) {
				this.invalidateHeightAfter(index);
				this.updateVisibleCells();
			} else if (this.heightType === HeightTypes.automatic) {
				if (index >= this.currentStart && index < this.currentEnd) {
					this.updateHeights();
				}
			}
		},
		scrollToPosition(y) {
			this.$el.scrollTop = y;
			this.scrollTop = this.$el.scrollTop;
			this.updateVisibleCells();
		},
		scrollTo(index, position) {
			if (index < 0 || index >= this.length) {
				throw new Error('Invalid index.');
			}

			position = position || ScrollPositions.default;

			let lastCalculatedIndex = Math.min(index, this.heightInvalidAfter);
			let y = (this.items[lastCalculatedIndex][this.accumulatorProp] || 0) + ((index - lastCalculatedIndex) * this.itemHeight);
			let height = this.items[index][this.heightField] || this.itemHeight;
			let isOversize = height > this.height;
			let endY = y + height;

			let scrollToY;

			if (position !== ScrollPositions.topInset && position !== ScrollPositions.bottomInset) {
				y += this.inset.top;
				endY += this.inset.top;
			} else {
				endY += this.inset.top + this.inset.bottom;
			}

			switch (position) {
				case ScrollPositions.default:
					if (endY > this.scrollTop + this.height && !isOversize) {
						scrollToY = Math.max(0, endY - this.height);
						position = ScrollPositions.bottom;
					} else if (y < this.scrollTop || (isOversize && y > this.scrollTop)) {
						scrollToY = y;
						position = ScrollPositions.top;
					}
				break;

				case ScrollPositions.top:
				case ScrollPositions.topInset:
					scrollToY = Math.max(0, Math.min(y, this.scrollHeight - this.height));
				break;

				case ScrollPositions.bottom:
				case ScrollPositions.bottomInset:
					scrollToY = Math.max(0, Math.min(endY - this.height, this.scrollHeight - this.height));
				break;
			}

			if (typeof scrollToY === 'undefined' || scrollToY === this.scrollTop) {
				return;
			}

			this.scrollToPosition(scrollToY);

			this.$nextTick(() => {
				this.scrollTo(index, position);
			});
		},
		scrollToBottom() {
			const bottomPosition = this.scrollHeight - this.height;

			if (this.scrollTop === bottomPosition || this.scrollHeight < this.height) {
				return;
			}

			this.scrollToPosition(bottomPosition);

			this.$nextTick(() => {
				this.scrollToBottom();
			});
		}
	}
};
</script>
