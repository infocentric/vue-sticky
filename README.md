# vue-sticky
A directive to sticky element for vue.js(2.x).
> for usage with Vue 1.x, see the [2.x branch](https://github.com/rguanghui/vue-sticky/tree/2.x)

# Install
`npm install vue-sticky --save`

# Dev
run `npm install` and `npm run dev`

# Import
```javascript
import VueSticky from 'vue-sticky' // Es6 module

const VueSticky = VueSticky.default // Global variable
```

# Use

``` javascript
directives: {
  'sticky': VueSticky,
},
```

``` html
<ELEMENT v-sticky="{ zIndex: NUMBER, stickyTop: NUMBER, disabled: [true|false], [stickySide: ['top'|'bottom'], stickyBottom: NUMBER]'}">
  <div> <!-- sticky wrapper, IMPORTANT -->
    CONTENT
  </div>
</ELEMENT>
```
**Binding parameter legend**
- zIndex: To set the `z-index` of element to stick (default: 1000)
- stickyTop: Set the `top` position (default: 0)
- stickyBottom: Set the `bottom` position (default: 0)
- stickySide: Decide which side should be sticky, you can set `top` or `bottom` (default: `top`)
- disabled: TRUE, to disabled the stickiness from the element
- forceFixed: TRUE, add force `fixed` as style.position
