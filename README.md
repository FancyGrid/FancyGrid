# FancyGrid

Build v1.4.6

FancyGrid JavaScript grid library with charts integration and server communication.

## Install

#### *bower*
```
bower install fancygrid
```

#### *code.fancygrid.com*
```
http://code.fancygrid.com/fancy.min.js
http://code.fancygrid.com/fancy.min.css
```

## Quick Start
Include a reference to the FancyGrid library

```html
<link href="http://code.fancygrid.com/fancy.min.css" rel="stylesheet">
<script src="http://code.fancygrid.com/fancy.min.js"></script>
```
The `FancyGrid` object is now accessible. Happy griding!
```html
<div id="grid"></div>
<script>
window.onload = function() {

new FancyGrid({
  renderTo: 'grid',
  width: 300,
  height: 200,
  data: [
	{name: 'Nick', age: 30},
	{name: 'Fred', age: 25},
	{name: 'Mike', age: 35}
  ],  
  columns: [{
    index: 'name',
    title: 'Name',    
    type: 'string'
  },{
	type: 'number',
    index: 'age',
    title: 'Age'
  }]
});

};
</script>
```

## Package Directory
The package includes the following:
```
|   README.md
├── client
│   ├── fancy.min.js
│   ├── fancy.min.css
│   ├── modules
|   ...
```

## Support
If you need any assistance or would like to report any bugs found in FancyGrid, please contact us at support@fancygrid.com