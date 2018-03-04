# vue-collection-cluster

A vue component for displaying large data sets easily with great performance.

[![npm](https://img.shields.io/npm/v/vue-collection-cluster.svg)
![npm](https://img.shields.io/npm/dm/vue-collection-cluster.svg)](https://www.npmjs.com/package/vue-collection-cluster)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

## Installation

```bash
npm install --save vue-collection-cluster
```

## Usage

```html
<template>
	<collection-cluster
		v-bind="collection"
		:items="items"
	></collection-cluster>
</template>
```

```javascript
import CollectionCluster from 'vue-collection-cluster';

export default {
	components: {CollectionCluster},
	data() {
		return {
			collection: {

			},
			items: [{
				type: 'header',
				title: 'List',
			}, {
				type: 'letter',
				value: 'A',
			}]
		}
	}
}
```


### Scoped slots

Each item in the list must have type, by the type a correct slot is rendered for item.

```html
<collection-cluster :items="items">
	<div slot="header" 
		slot-scope="{ cell, item }"
		:key="cell.index"
		class="item"
	>
		{{ item.title }}
	</div>

	<div slot="letter" 
		slot-scope="{ cell, item }"
		:key="cell.index"
		class="item"
	>
		{{ item.value }}
	</div>
</collection-cluster>
```

### Height Types

### static
Each slot must have size set in the css, which must be equal to size set in `itemHeight` option.

### dynamic
Each item in the list must have property (`heightField`) with the exact height of the slot for that item.

### automatic
Size of slot is automaticaly calculated when rendered and set to `heightField` property of the item.

For dynamic/automatic types, the `itemHeight` option is used as estimate. It's **strongly recommended** to use it.

## Options

### items
Type: `Array`, Required

List of items to display.

### columns
Type: `Number`, Default: `1`

Number of columns per row.

### itemHeight
Type: `Number`, Default: `100`

Height of the row.

### typeField
Type: `String`, Default: `type`

Item property's name for type.

### heightField
Type: `String`, Default: `height`

Item property's name for height.

### heightType
Type: `String`, Default: `static`, Options: `static`, `dynamic`, `automatic`

### inset
Type: `Object`, Default: `{top: 0, bottom: 0}`

Inset from top and bottom of the list.

### scrollPastEnd
Type: `Number`, Default: `0`

Renders space at the end of the list of size `height` * `scrollPastEnd`.

`0.5` = 50% of height

### buffer
Type: `Number`, Default: `200`

Pixels to pre-render around visible area.

### threshold
Type: `Number`, Default: `50`

Threshold for `scrollToTop` & `scrollToBottom` events.

### autoResize
Type: `Boolean`, Default: `true`

Sets whether the list should auto resize and render items when window resizes.


## Events

### cellsChange
Emitted when visible/rendered cells change. There is one argument with list of cells.

### scrollToTop

### scrollToBottom

## Methods

### isAtTop()
Return: `Boolean`

Is list at the top?

### isAtBottom()
Return: `Boolean`

Is list at the bottom?

### scrollTo(index, position)
index: `Int`, position: `default|top|bottom|topInset|bottomInset'`

Scrolls to specified index at position.

### scrollToBottom()
Scrolls to bottom of list.

### resizeItem(index)
index: `Int`

Should be called whenever item with dynamic height did change height.


---

## Example

```html
<template>
	<collection-cluster
		class="scroller"
		v-bind="collection"
		:items="items"
	>
		<Letter slot="letter" 
			slot-scope="{ cell, item }"
			:key="cell.index"
			:item="item"
		/>

		<Name slot="name" 
			slot-scope="{ cell, item }"
			:key="cell.index"
			:item="item"
		/>
	</collection-cluster>
</template>

<script>
import Letter from './Letter';
import Name from './Name';

export default {
	components: {Letter, Name},
	data() {
		return {
			collection: {
				heightType: 'automatic',
				itemHeight: 50,
			},
			items: [
				{ type: 'letter', value: 'J' },
				{ type: 'name', value: { name: 'Jack' } },
				{ type: 'name', value: { name: 'John' } },
			]
		};
	}
};
</script>
```

`Letter.vue` source:
```html
<template>
  <div class="letter">{{item.value}}</div>
</template>

<script>
export default {
  props: ['item'],
};
</script>
```

`Name.vue` source:
```html
<template>
  <div class="name">{{item.value.name}}</div>
</template>

<script>
export default {
  props: ['item'],
};
</script>
```

---

## License

[MIT](http://opensource.org/licenses/MIT)