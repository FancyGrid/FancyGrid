# FancyGrid

Build v1.7.67

FancyGrid - JavaScript grid library with charts integration and server communication.
  
## Install

#### *bower*
```
bower install fancygrid
```

#### *npm*
```
npm install fancygrid
```

#### *CDN*
```
https://cdn.fancygrid.com/fancy.min.js
https://cdn.fancygrid.com/fancy.min.css
```

## Quick Start
Include a reference to the FancyGrid library

```html
<link href="https://cdn.fancygrid.com/fancy.min.css" rel="stylesheet">
<script src="https://cdn.fancygrid.com/fancy.min.js"></script>
```
The `FancyGrid` object is now accessible. Happy griding!
```html
<div id="grid"></div>
<script>
document.addEventListener("DOMContentLoaded", function() {

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

});
</script>
```

## Load FancyGrid as a CommonJS module
FancyGrid is using an UMD module pattern, as a result it has support for CommonJS.
*The following example presumes you are using npm to install FancyGrid over `npm/bower`.*
```js
// Load FancyGrid
var Fancy = require('fancygrid');

// Generate the grid
new Fancy.Grid({
  //config
});

// Generate the form
new Fancy.Form({
  //config
});

// Generate the tabs
new Fancy.Tab({
  //config
});
```

## Load FancyGrid as an ES6 module
Since FancyGrid supports CommonJS, it can be loaded as an ES6 module with the use of transpilers. Two common transpilers are [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/). These have different interpretations of a CommonJS module, which affects your syntax.
*The following examples presumes you are using npm to install FancyGrid.*
### Babel
```js
import Fancy from 'fancygrid';

// Generate the grid
Fancy.Grid({
  // config
});

// Generate the form
new Fancy.Form({
  //config
});

// Generate the tabs
new Fancy.Tab({
  //config
});
```
### TypeScript
```js
import * as Fancy from 'fancygrid';

// Generate the grid
Fancy.Grid({
  // config
});

// Generate the form
new Fancy.Form({
  //config
});

// Generate the tabs
new Fancy.Tab({
  //config
});
```

## Component version
Include a reference to the FancyGrid library
```html
<script>
Fancy.enableCompo();
</script>
<fancy-grid id="myGrid" data-title="New Grid" data-width="400" data-height="300">
  <fancy-columns>
   [{
     index: 'name',
     title: 'Name',    
     type: 'string'
   },{
     type: 'number',
     index: 'age',
     title: 'Age'
   }]
  </fancy-columns>
  <fancy-data>
    [
      {name: 'Nick', age: 30},
      {name: 'Fred', age: 25},
      {name: 'Mike', age: 35}
    ]
  </fancy-data>
</fancy-grid>
```

## Package Directory
The package includes the following:
```
|   README.md
├── client
│   ├── fancy.full.min.js
│   ├── fancy.min.js
│   ├── fancy.min.css
│   ├── modules
├── src
│   ├── js
│   ├── less
│   ...
```

## Debug
In case you want to debug FancyGrid there are several approaches.  

### Debug files
Include css file ```/client/fancy.css```  
Include js file ```/src/js/load-all.js```  
After that set
```
Fancy.MODULESLOAD = false;
```

### Debug full build
Include css file ```/client/fancy.css```  
Include js file ```/src/js/fancy.full.js```  

### Debug with auto-loading modules
Include css file ```/client/fancy.css```  
Include js file ```/src/js/fancy.js```  
Set modules path
```
Fancy.MODULESDIR = '/client/modules/';
Fancy.DEBUG = true;
```

## Custom build
### Debug build
```
grunt debug
```
### Release build
```
grunt release
```

## Support
If you need any assistance or would like to report any bugs found in FancyGrid, please contact us at support@fancygrid.com
