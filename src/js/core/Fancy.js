/**
 * @class Fancy utilities and functions.
 * @singleton
 */
var Fancy = {
  global: window,
  /**
   * The version of the framework
   * @type String
   */
  version: '1.7.67',
  site: 'fancygrid.com',
  COLORS: ["#9DB160", "#B26668", "#4091BA", "#8E658E", "#3B8D8B", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]
};

window.Fancy = Fancy;

/**
 * Copies all the properties of `from` to the specified `to`.
 * 
 * @param {Object} to The receiver of the properties.
 * @param {Object} from The primary source of the properties.
 */
Fancy.apply = function(to, from){
  if(from === undefined){
    return;
  }

  for(var p in from){
    to[p] = from[p];
  }
};

/**
 * Copies all the properties of `from` to the specified `to`.
 * 
 * @param {Object} to The receiver of the properties.
 * @param {Object} from The primary source of the properties.
 */
Fancy.applyIf = function(to, from){
  for(var p in from){
    if( to[p] === undefined ){
      to[p] = from[p];
    }
  }
};

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 * Specifying the last node of a namespace implicitly creates all other nodes.
 * @param {String} namespace1
 * @param {String} namespace2
 * @param {String} etc
 */
Fancy.namespace = function(){
  var i = 0,
    iL = arguments.length;
  
  for(;i<iL;i++){
    var value = arguments[i],
      parts = value.split("."),
      j = 1,
      jL = parts.length;
    
    Fancy.global[parts[0]] = Fancy.global[parts[0]] || {};
    var namespace = Fancy.global[parts[0]];
    
    for(;j<jL;j++){
      namespace[parts[j]] = namespace[parts[j]] || {};
      namespace = namespace[parts[j]];
    }
  }
};

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 * Specifying the last node of a namespace implicitly creates all other nodes. 
 * @param {String} namespace1
 * @param {String} namespace2
 * @param {String} etc
 */
Fancy.ns = Fancy.namespace;

/**
 * Returns the type of the given variable in string format. List of possible values are:
 *
 * - `undefined`: If the given value is `undefined`
 * - `string`: If the given value is a string
 * - `number`: If the given value is a number
 * - `boolean`: If the given value is a boolean value
 * - `date`: If the given value is a `Date` object
 * - `function`: If the given value is a function reference
 * - `object`: If the given value is an object
 * - `array`: If the given value is an array
 * - `regexp`: If the given value is a regular expression
 *
 * @param {*} value
 * @return {String}
 */
Fancy.typeOf = function(value){
  if(value === null) {
    return 'null';
  }

  var type = typeof value;
  if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
    return type;
  }

  var toString = Object.prototype.toString,
    typeToString = toString.call(value);

  if(value.length !== undefined && typeof value !== 'function'){
    return 'array';
  }

  switch(typeToString){
    case '[object Array]':
      return 'array';
    case '[object Date]':
      return 'date';
    case '[object Boolean]':
      return 'boolean';
    case '[object Number]':
      return 'number';
    case '[object RegExp]':
      return 'regexp';
  }

  if(type === 'function'){
    return 'function';
  }

  if(type === 'object'){
    return 'object';
  }
};

/**
 * Returns true if the passed value is a JavaScript array, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isArray = ('isArray' in Array) ? Array.isArray : function(value){
  var toString = Object.prototype.toString;
  
  return toString.call(value) === '[object Array]';
};

/**
 * Returns true if the passed value is a JavaScript Object, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isObject = function(value){
  var toString = Object.prototype.toString;
  
  return toString.call(value) === '[object Object]';
};

/**
 * Returns true if the passed value is a JavaScript Function, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isFunction = function(value){
  var toString = Object.prototype.toString;
  
  return toString.apply(value) === '[object Function]';
};

/**
 * Returns true if the passed value is a string.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isString = function(value){
  return typeof value === 'string';
};

/**
 * Returns true if the passed value is a number. Returns false for non-finite numbers.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isNumber = function(value){
  return typeof value === 'number' && isFinite(value);
};

/**
 * Returns true if the passed value is a dom element.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isDom = function(value){
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return value instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (typeof value === "object") &&
      (value.nodeType===1) && (typeof value.style === "object") &&
      (typeof value.ownerDocument ==="object");
  }
};

/**
 * Returns true if the passed value is a boolean.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isBoolean = function(value){
  return typeof value === 'boolean';
};

/**
 * Returns true if the passed value is a boolean.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isDate = function(value){
  return Fancy.typeOf(value) === 'date';
};

/**
 * Iterates an array calling the supplied function.
 * @param {Array} arrayObject The array to be iterated. If this
 * argument is not really an array, the supplied function is called once.
 * @param {Function} fn The function to be called with each item.
 * @return See description for the fn parameter.
 */
Fancy.each = function(arrayObject, fn){
  var type = Fancy.typeOf(arrayObject);

  switch(type){
    case 'array':
    case 'string':
      var i = 0,
        iL = arrayObject.length;

      for(;i<iL;i++){
        if(fn(arrayObject[i], i, arrayObject) === true){
          break;
        }
      }
      break;
    case 'object':
      for(var p in arrayObject){
        if(fn(arrayObject[p], p, arrayObject) === true){
          break;
        }
      }
      break;
  }
};

/**
 * Helps in OOP for light mixins.
 *
 * @private
 * Iterates an array calling the supplied function.
 * @param {Array} proto The array to be iterated. If this
 * argument is not really an array, the supplied function is called once.
 * @param {Function} classes The function to be called with each item.
 * @return See description for the fn parameter.
 */
Fancy.mixin = function(proto, classes){
   var i = 0,
    iL = classes.length,
     item;

  if( Fancy.typeOf( classes[0] ) === 'object' ){
    for(;i<iL;i++){
      item = classes[i];

      var _class = item._class,
        methods = item.methods,
        j = 0,
        jL = methods.length;

      for(;j<jL;j++){
        var methodName = methods[j];
        proto[methodName] = _class['prototype'][methodName];
      }
    }
  }
  else{
    for(;i<iL;i++){
      item = classes[i];

      if(Fancy.isString(item)){
        var _item = Fancy.ClassManager.getMixin(item);

        if(_item){
          Fancy.apply(proto, _item['prototype']);
        }
        else{
          Fancy.ClassManager.waitMixin(item, proto);
        }
      }
      else {
        Fancy.apply(proto, item['prototype']);
      }
    }
  }
};

Fancy.Mixin = function(name, config){
  var parts = name.split("."),
    i = 1,
    iL = parts.length - 1;

  Fancy.ns(name);

  var ref = Fancy.global[parts[0]];

  for(;i<iL;i++){
    ref = ref[parts[i]];
  }

  if(parts.length > 1){
    ref[parts[parts.length - 1]] = function(){};
    ref[parts[parts.length - 1]].prototype = config;
  }
  else{
    Fancy.global[parts[0]] = function(){};
    Fancy.global[parts[0]].prototype = config;
  }

  var waiters = Fancy.ClassManager.waitMixins[name];

  if(waiters){
    waiters = waiters.waiters;

    i = 0;
    iL = waiters.length;

    for(;i<iL;i++){
      Fancy.apply(waiters[i], config);
    }
  }
};

/**
 * Help function for OOP
 * Help to avoid multiple applying in deep class inheritance
 * Copies all the properties of `config` to the specified `object`.
 * @param {Object} object The receiver of the properties.
 * @param {Object} config The primary source of the properties.
 * @return {Object}
 */
Fancy.applyConfig = function(object, config){
  var property;
  config = config || {};

  if(object.plugins && config.plugins){
    object.plugins = object.plugins.concat(config.plugins);
    delete config.plugins;
  }

  if(object._isConfigApplied === true){
    return object;
  }
  
  for(property in config){
    object[property] = config[property];
  }
  object._isConfigApplied = true;
  
  return object;
};

/**
 * @param {Object} o
 * @return {Object}
 */
Fancy.styleToString = function(o){
  var str = '';

  o = o || {};

  for(var p in o){
    str += p + ': ' + o[p] + ';';
  }

  return str;
};

Fancy.apply(Fancy, {
  prefix: 'fancy-gen-',
  idSeed: 0,
  zIndex: 1,
  id: function(el, prefix){
    if(!el){
      return (prefix || Fancy.prefix) + (++Fancy.idSeed);
    }
    el = el.dom || {};
    if(!el.id){
      el.id = (prefix || Fancy.prefix) + (++Fancy.idSeed);
    }
    return el.id;
  }
});

/**
 * Apply base classnames for fast fetching
 */
Fancy.apply(Fancy, {
  cls: 'fancy',
  TOUCH_CLS: 'fancy-touch',
  HIDDEN_CLS: 'fancy-display-none',
  CLEARFIX_CLS: 'fancy-clearfix',
  MODAL_CLS: 'fancy-modal',
  /*
   * Panel cls-s
   */
  PANEL_CLS: 'fancy-panel',
  PANEL_BODY_CLS: 'fancy-panel-body',
  PANEL_BODY_INNER_CLS: 'fancy-panel-body-inner',
  PANEL_GRID_INSIDE_CLS: 'fancy-panel-grid-inside',
  PANEL_SHADOW_CLS: 'fancy-panel-shadow',
  PANEL_SUB_HEADER_CLS: 'fancy-panel-sub-header',
  PANEL_SUB_HEADER_TEXT_CLS: 'fancy-panel-sub-header-text',
  PANEL_HEADER_CLS: 'fancy-panel-header',
  PANEL_HEADER_IMG_CLS: 'fancy-panel-header-img',
  PANEL_HEADER_TEXT_CLS: 'fancy-panel-header-text',
  PANEL_HEADER_TOOLS_CLS: 'fancy-panel-header-tools',
  PANEL_TBAR_CLS: 'fancy-panel-tbar',
  PANEL_BBAR_CLS: 'fancy-panel-bbar',
  PANEL_SUB_TBAR_CLS: 'fancy-panel-sub-tbar',
  PANEL_BUTTONS_CLS: 'fancy-panel-buttons',
  PANEL_NOFRAME_CLS: 'fancy-panel-noframe',
  PANEL_FOOTER_CLS: 'fancy-panel-footer',
  PANEL_TAB_CLS: 'fancy-panel-tab',
  PANEL_DRAGGABLE_CLS: 'fancy-panel-draggable',
  /*
   * Bar cls-s
   */
  BAR_CLS: 'fancy-bar',
  BAR_TEXT_CLS: 'fancy-bar-text',
  BAR_CONTAINER_CLS: 'fancy-bar-container',
  BAR_BUTTON_CLS: 'fancy-bar-button',
  BAR_SEG_BUTTON_CLS: 'fancy-bar-seg-button',
  BAR_LEFT_SCROLLER_CLS: 'fancy-bar-left-scroller',
  BAR_RIGHT_SCROLLER_CLS: 'fancy-bar-right-scroller',
  /*
   * Form cls-s
   */
  FORM_CLS: 'fancy-form',
  FORM_BODY_CLS: 'fancy-form-body',
  /*
   * Field cls-s
   */
  FIELD_CLS: 'fancy-field',
  FIELD_LABEL_CLS: 'fancy-field-label',
  FIELD_EMPTY_CLS: 'fancy-field-empty',
  FIELD_DISABLED_CLS: 'fancy-field-disabled',
  FIELD_BLANK_ERR_CLS: 'fancy-field-blank-err',
  FIELD_NOT_VALID_CLS: 'fancy-field-not-valid',
  FIELD_TEXT_CLS: 'fancy-field-text',
  FIELD_TEXT_INPUT_CLS: 'fancy-field-text-input',
  FIELD_ERROR_CLS: 'fancy-field-error',
  FIELD_SPIN_CLS: 'fancy-field-spin',
  FIELD_SPIN_UP_CLS: 'fancy-field-spin-up',
  FIELD_SPIN_DOWN_CLS: 'fancy-field-spin-down',
  FIELD_CHECKBOX_CLS: 'fancy-field-checkbox',
  FIELD_CHECKBOX_DISABLED_CLS: 'fancy-field-checkbox-disabled',
  FIELD_CHECKBOX_INPUT_CLS: 'fancy-field-checkbox-input',
  FIELD_CHECKBOX_ON_CLS: 'fancy-checkbox-on',
  FIELD_CHECKBOX_MIDDLE_CLS: 'fancy-checkbox-middle',
  FIELD_INPUT_LABEL_CLS:'fancy-field-input-label',
  FIELD_BUTTON_CLS: 'fancy-field-button',
  FIELD_TAB_CLS: 'fancy-field-tab',
  FIELD_COMBO_CLS: 'fancy-combo',
  FIELD_COMBO_SELECTED_ITEM_CLS: 'fancy-combo-item-selected',
  FIELD_COMBO_FOCUSED_ITEM_CLS: 'fancy-combo-item-focused',
  FIELD_COMBO_DROPDOWN_BUTTON_CLS: 'fancy-combo-dropdown-button',
  FIELD_COMBO_INPUT_CONTAINER_CLS: 'fancy-combo-input-container',
  FIELD_COMBO_LIST_VALUE_CLS: 'fancy-combo-list-value',
  FIELD_COMBO_LEFT_EL_CLS: 'fancy-combo-left-el',
  FIELD_COMBO_RESULT_LIST_CLS: 'fancy-combo-result-list',
  FIELD_SEARCH_CLS: 'fancy-field-search',
  FIELD_SEARCH_LIST_CLS: 'fancy-field-search-list',
  FIELD_SEARCH_PARAMS_LINK_CLS: 'fancy-field-search-params-link',
  FIELD_SEARCH_PARAMED_CLS: 'fancy-field-search-paramed',
  FIELD_SEARCH_PARAMED_EMPTY_CLS: 'fancy-field-search-paramed-empty',
  FIELD_PICKER_BUTTON_CLS: 'fancy-field-picker-button',
  FIELD_LABEL_ALIGN_TOP_CLS: 'fancy-field-label-align-top',
  FIELD_LABEL_ALIGN_RIGHT_CLS: 'fancy-field-label-align-right',
  FIELD_TEXTAREA_CLS: 'fancy-textarea',
  FIELD_TEXTAREA_TEXT_CLS: 'fancy-textarea-text',
  FIELD_TEXTAREA_TEXT_INPUT_CLS: 'fancy-textarea-text-input',
  FIELD_RADIO_CLS: 'fancy-field-radio',
  FIELD_RADIO_COLUMN_CLS: 'fancy-field-radio-column',
  FIELD_RADIO_ON_CLS: 'fancy-field-radio-on',
  FIELD_RADIO_INPUT_CLS: 'fancy-field-radio-input',
  FIELD_TAB_ACTIVE_CLS: 'fancy-field-tab-active',
  /*
   * Grid cls-s
   */
  GRID_CLS: 'fancy-grid',
  GRID_ANIMATION_CLS: 'fancy-grid-animation',
  GRID_UNSELECTABLE_CLS: 'fancy-grid-unselectable',
  GRID_EMPTY_CLS: 'fancy-grid-empty-text',
  GRID_LEFT_EMPTY_CLS: 'fancy-grid-left-empty',
  GRID_RIGHT_EMPTY_CLS: 'fancy-grid-right-empty',
  GRID_CENTER_CLS: 'fancy-grid-center',
  GRID_LEFT_CLS: 'fancy-grid-left',
  GRID_RIGHT_CLS: 'fancy-grid-right',
  GRID_RESIZER_LEFT_CLS: 'fancy-grid-resizer-left',
  GRID_RESIZER_RIGHT_CLS: 'fancy-grid-resizer-right',
  GRID_STATE_DRAG_COLUMN_CLS: 'fancy-grid-state-drag-column',
  GRID_STATE_RESIZE_COLUMN_CLS: 'fancy-grid-state-resize-column',
  GRID_COPY_TEXTAREA: 'fancy-grid-copy-textarea',
  //grid header
  GRID_HEADER_CLS: 'fancy-grid-header',
  GRID_HEADER_CELL_CLS: 'fancy-grid-header-cell',
  GRID_HEADER_CELL_CONTAINER_CLS: 'fancy-grid-header-cell-container',
  GRID_HEADER_CELL_TEXT_CLS: 'fancy-grid-header-cell-text',
  GRID_HEADER_CELL_DOUBLE_CLS: 'fancy-grid-header-cell-double',
  GRID_HEADER_CELL_TRIPLE_CLS: 'fancy-grid-header-cell-triple',
  GRID_HEADER_CELL_TRIGGER_CLS: 'fancy-grid-header-cell-trigger',
  GRID_HEADER_CELL_TRIGGER_IMAGE_CLS: 'fancy-grid-header-cell-trigger-image',
  GRID_HEADER_CELL_TRIGGER_DISABLED_CLS: 'fancy-grid-header-cell-trigger-disabled',
  GRID_HEADER_CELL_GROUP_LEVEL_1_CLS: 'fancy-grid-header-cell-group-level-1',
  GRID_HEADER_CELL_GROUP_LEVEL_2_CLS: 'fancy-grid-header-cell-group-level-2',
  GRID_HEADER_CELL_SELECT_CLS: 'fancy-grid-header-cell-select',
  GRID_HEADER_CELL_TRIGGER_UP_CLS: 'fancy-grid-header-cell-trigger-up',
  GRID_HEADER_CELL_TRIGGER_DOWN_CLS: 'fancy-grid-header-cell-trigger-down',
  GRID_HEADER_COLUMN_TRIGGERED_CLS: 'fancy-grid-header-column-triggered',
  GRID_HEADER_CELL_FILTER_CLS: 'fancy-grid-header-filter-cell',
  GRID_HEADER_CELL_FILTER_FULL_CLS: 'fancy-grid-header-filter-cell-full',
  GRID_HEADER_CELL_FILTER_SMALL_CLS: 'fancy-grid-header-filter-cell-small',
  GRID_HEADER_CELL_CHECKBOX_CLS: 'fancy-grid-header-cell-checkbox',
  //grid cell
  GRID_CELL_CLS: 'fancy-grid-cell',
  GRID_CELL_INNER_CLS: 'fancy-grid-cell-inner',
  GRID_CELL_OVER_CLS: 'fancy-grid-cell-over',
  GRID_CELL_SELECTED_CLS: 'fancy-grid-cell-selected',
  GRID_CELL_ACTIVE_CLS: 'fancy-grid-cell-active',
  GRID_CELL_EVEN_CLS: 'fancy-grid-cell-even',
  GRID_CELL_WRAPPER_CLS: 'fancy-grid-cell-wrapper',
  GRID_CELL_DIRTY_CLS: 'fancy-grid-cell-dirty',
  GRID_CELL_DIRTY_EL_CLS: 'fancy-grid-cell-dirty-el',
  GRID_PSEUDO_CELL_CLS: 'fancy-grid-pseudo-cell',
  //grid column
  GRID_COLUMN_CLS: 'fancy-grid-column',
  GRID_COLUMN_OVER_CLS: 'fancy-grid-column-over',
  GRID_COLUMN_SELECT_CLS: 'fancy-grid-column-select',
  GRID_COLUMN_SELECTED_CLS: 'fancy-grid-column-selected',
  GRID_COLUMN_ELLIPSIS_CLS: 'fancy-grid-column-ellipsis',
  GRID_COLUMN_ORDER_CLS: 'fancy-grid-column-order',
  GRID_COLUMN_TEXT_CLS: 'fancy-grid-column-text',
  GRID_COLUMN_SORT_ASC: 'fancy-grid-column-sort-ASC',
  GRID_COLUMN_SORT_DESC: 'fancy-grid-column-sort-DESC',
  GRID_COLUMN_COLOR_CLS: 'fancy-grid-column-color',
  GRID_COLUMN_RESIZER_CLS: 'fancy-grid-column-resizer',
  GRID_COLUMN_ROW_DRAG_CLS: 'fancy-grid-column-row-drag',
  GRID_ROW_DRAG_EL_CLS: 'fancy-grid-row-drag-el',
  //tree cls
  GRID_COLUMN_TREE_CLS: 'fancy-grid-column-tree',
  GRID_COLUMN_TREE_EXPANDER_CLS: 'fancy-grid-tree-expander',
  //grid spark column
  GRID_COLUMN_SPARKLINE_CLS: 'fancy-grid-column-sparkline',
  GRID_COLUMN_SPARKLINE_BULLET_CLS: 'fancy-grid-column-sparkline-bullet',
  GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS: 'fancy-grid-column-spark-progress-donut',
  GRID_COLUMN_CHART_CIRCLE_CLS: 'fancy-grid-column-chart-circle',
  GRID_COLUMN_GROSSLOSS_CLS: 'fancy-grid-column-grossloss',
  GRID_COLUMN_PROGRESS_CLS: 'fancy-grid-column-progress',
  GRID_COLUMN_PROGRESS_BAR_CLS: 'fancy-grid-column-progress-bar',
  GRID_COLUMN_H_BAR_CLS: 'fancy-grid-column-h-bar',
  GRID_COLUMN_ACTION_ITEM_CLS: 'fancy-grid-column-action-item',
  //grid row
  GRID_ROW_OVER_CLS: 'fancy-grid-cell-over',
  GRID_ROW_EDIT_CLS: 'fancy-grid-row-edit',
  GRID_ROW_EDIT_BUTTONS_CLS: 'fancy-grid-row-edit-buttons',
  GRID_ROW_EDIT_BUTTON_UPDATE_CLS: 'fancy-edit-row-button-update',
  GRID_ROW_EDIT_BUTTON_CANCEL_CLS: 'fancy-edit-row-button-cancel',
  GRID_ROW_GROUP_CLS: 'fancy-grid-group-row',
  GRID_ROW_GROUP_INNER_CLS: 'fancy-grid-group-row-inner',
  GRID_ROW_GROUP_COLLAPSED_CLS: 'fancy-grid-group-row-collapsed',
  GRID_ROW_SUMMARY_CLS: 'fancy-grid-summary-row',
  GRID_ROW_SUMMARY_CONTAINER_CLS: 'fancy-grid-summary-container',
  GRID_ROW_SUMMARY_BOTTOM_CLS: 'fancy-grid-summary-row-bottom',
  GRID_ROW_EXPAND_CLS: 'fancy-grid-expand-row',
  GRID_ROW_EXPAND_OVER_CLS: 'fancy-grid-expand-row-over',
  GRID_ROW_EXPAND_SELECTED_CLS: 'fancy-grid-expand-row-selected',
  //grid body
  GRID_BODY_CLS: 'fancy-grid-body',
  /*
   * Menu cls-s
   */
  MENU_CLS: 'fancy-menu',
  MENU_ITEM_CLS: 'fancy-menu-item',
  MENU_ITEM_IMAGE_CLS: 'fancy-menu-item-image',
  MENU_ITEM_TEXT_CLS: 'fancy-menu-item-text',
  MENU_ITEM_SIDE_TEXT_CLS: 'fancy-menu-item-side-text',
  MENU_ITEM_ACTIVE_CLS: 'fancy-menu-item-active',
  MENU_ITEM_RIGHT_IMAGE_CLS: 'fancy-menu-item-right-image',
  MENU_ITEM_EXPAND_CLS: 'fancy-menu-item-expand',
  MENU_ITEM_DISABLED_CLS: 'fancy-menu-item-disabled',
  MENU_ITEM_SEP_CLS: 'fancy-menu-item-sep',
  MENU_ITEM_NO_IMAGE_CLS: 'fancy-menu-item-no-image',
  /*
   * Context Menu cls-s
   */
  MENU_ITEM_IMG_COPY_CLS: 'fancy-menu-item-img-copy',
  MENU_ITEM_IMG_DELETE_CLS: 'fancy-menu-item-img-delete',
  MENU_ITEM_IMG_DUPLICATE_CLS: 'fancy-menu-item-img-duplicate',
  MENU_ITEM_IMG_EDIT_CLS: 'fancy-menu-item-img-edit',
  /*
   * Tab cls-s
   */
  TAB_WRAPPER_CLS: 'fancy-tab-wrapper',
  TAB_ACTIVE_WRAPPER_CLS: 'fancy-active-tab-wrapper',
  TAB_TBAR_CLS: 'fancy-toolbar-tab',
  TAB_TBAR_ACTIVE_CLS: 'fancy-toolbar-tab-active',
  /*
   * Button cls-s
   */
  BUTTON_CLS: 'fancy-button',
  BUTTON_DISABLED_CLS: 'fancy-button-disabled',
  BUTTON_PRESSED_CLS: 'fancy-button-pressed',
  BUTTON_IMAGE_CLS: 'fancy-button-image',
  BUTTON_IMAGE_COLOR_CLS: 'fancy-button-image-color',
  BUTTON_TEXT_CLS: 'fancy-button-text',
  BUTTON_DROP_CLS: 'fancy-button-drop',
  BUTTON_MENU_CLS: 'fancy-button-menu',
  SEG_BUTTON_CLS: 'fancy-seg-button',
  /*
   * Tooltip cls-s
   */
  TOOLTIP_CLS: 'fancy-tooltip',
  TOOLTIP_INNER_CLS: 'fancy-tooltip-inner',
  /*
   * Other cls-s
   */
  SEPARATOR_CLS: 'fancy-separator',
  FOOTER_STATUS_CLS: 'fancy-footer-status',
  STATUS_SOURCE_TEXT_CLS: 'fancy-status-source-text',
  STATUS_SOURCE_LINK_CLS: 'fancy-status-source-link',
  FOOTER_SOURCE_CLS: 'fancy-footer-source',
  /*
   * Picker cls-s
   */
  PICKER_MONTH_CELL_ACTIVE_CLS: 'fancy-month-picker-cell-active',
  PICKER_MONTH_CLS: 'fancy-month-picker',
  PICKER_BUTTON_BACK_CLS: 'fancy-picker-button-back',
  PICKER_BUTTON_NEXT_CLS: 'fancy-picker-button-next',
  PICKER_MONTH_ACTION_BUTTONS_CLS: 'fancy-month-picker-action-buttons',
  PICKER_DATE_CLS: 'fancy-date-picker',
  PICKER_DATE_CELL_TODAY_CLS: 'fancy-date-picker-cell-today',
  PICKER_DATE_CELL_ACTIVE_CLS: 'fancy-date-picker-cell-active',
  PICKER_DATE_CELL_OUT_RANGE_CLS: 'fancy-date-picker-cell-out-range',
  PICKER_BUTTON_DATE_CLS: 'fancy-picker-button-date',
  PICKER_BUTTON_DATE_WRAPPER_CLS: 'fancy-picker-button-date-wrapper',
  PICKER_BUTTON_TODAY_CLS: 'fancy-picker-button-today',
  PICKER_BUTTON_TODAY_WRAPPER_CLS: 'fancy-picker-button-today-wrapper'
});

// Animation duration for all animations
//Fancy.ANIMATE_DURATION = 300;
Fancy.ANIMATE_DURATION = 400;

(function(){

var userAgent = navigator.userAgent.toLowerCase(),
  check = function(regex){
    return regex.test(userAgent);
  },
  isOpera = check(/opera/),
  isIE = !isOpera && check(/msie/),
  isChromium = window.chrome,
  winNav = window.navigator,
  vendorName = winNav.vendor,
  isIEedge = winNav.userAgent.indexOf("Edge") > -1,
  isIOSChrome = winNav.userAgent.match("CriOS"),
  isChrome = function() {
    var isOpera = winNav.userAgent.indexOf("OPR") > -1;

    if (isIOSChrome) {
      return true;
    } else if (
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else {
      return false;
    }
  }(),
  getInternetExplorerVersion = function(){
    var rv = -1,
      ua,
      re;

    if (navigator.appName == 'Microsoft Internet Explorer') {
      ua = navigator.userAgent;
      re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    else if (navigator.appName == 'Netscape') {
      ua = navigator.userAgent;
      re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");

      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    return rv;
  };

  if(getInternetExplorerVersion() === 11){
    isIE = true;
  }

  if(isIE === false && isIEedge){
    isIE = true;
  }

Fancy.apply(Fancy, {
  isOpera: isOpera,
  isIE: isIE,
  isChrome: isChrome
});

/**
 *
 * @return {Array}
 */
Fancy.getViewSize = function(){
  var xy = [];
  
  if(Fancy.isIE){
    xy[0] = document.documentElement.clientHeight;
    xy[1] = document.documentElement.clientWidth;
  }
  else{
    xy[0] = window.innerHeight;
    xy[1] = window.innerWidth;
  }
  
  return xy;
};

/**
 * @return {Object}
 */
Fancy.getScroll = function() {
  var dd = document.documentElement,
    db = document.body;

  if (dd && (dd.scrollTop || dd.scrollLeft)) {
    return [dd.scrollTop, dd.scrollLeft];
  } else if (db) {
    return [db.scrollTop, db.scrollLeft];
  } else {
    return [0, 0];
  }
};

/**
 * @return {String}
 */
Fancy.getMouseWheelEventName = function(){
  if('onmousewheel' in document.body){
    return 'mousewheel';
  }
  else{
    return 'DOMMouseScroll';
  }
};

/**
 * @param {Object} e
 * @return {Number}
 */
Fancy.getWheelDelta = function(e) {
  var delta = 0;

  if (e.wheelDelta) { // IE/Opera way
    delta = e.wheelDelta / 120;
  } else if (e.detail) { // Mozilla way
    delta = -e.detail / 3;
  }

  return delta;
};

Fancy.isTouch = (document.ontouchstart !== undefined);

Fancy.i18n = {};

Fancy.currencies = {
  map: { 
    EUR: '€',
    USD: '$',
    GBP: '£',
    RUB: '₽',
    CZK: 'Kč',
    AUD: '$',
    JPY: '¥',
    PLN: 'zł',
    TRY: '₺',
    DKK: 'kr',
    KRW: '₩',
    BRL: 'R$',
    CNY: '¥',
    SEK: 'kr',
    CAD: '$',
    NOK: 'kr',
    IDR: 'Rp'
  }
};

})();

Fancy.modules = {};
Fancy.getModulesList = function () {
  var list = [];

  Fancy.each(Fancy.modules, function (value, p) {
    list.push(p);
  });

  return list;
};

/*
var FancyGrid = function(config){
  var grid = config;

  Fancy.loadModule('grid', function(){
    new FancyGrid(config);
  });

  return config;
};

var FancyForm = function(){
  var grid = config;

  Fancy.loadModule('form', function(){
    new FancyForm(config);
  });
};
*/
(function() {
  var moduleNames = {};

  /**
   * @param {String} name
   * @param {Function} fn
   */
  Fancy.loadModule = function (name, fn) {
    var body = document.getElementsByTagName('body')[0],
      _script = document.createElement('script'),
      _name = name,
      endUrl = Fancy.DEBUG ? '.js' : '.min.js',
      _v = Fancy.version.replace(/\./g, ''),
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/@'+Fancy.version+'/modules/');

    fn = fn || function () {};

    if(Fancy.MODULELOAD === false || Fancy.MODULESLOAD === false){
      return;
    }

    name = name.replace(/ /g, '-');

    if(Fancy.DEBUG){
      endUrl += '?_dc='+(+new Date());
    }
    else{
      endUrl += '?_v=' + _v;
    }

    Fancy.Modules.on('loaded', function(modules, $name){
      if($name === name){
        Fancy.modules[_name] = true;
        fn(name);
      }
    });

    if(moduleNames[name]){
      return;
    }

    moduleNames[name] = true;

    _script.src = MODULESDIR + name + endUrl;

    _script.charset = 'utf-8';

    _script.onload = function () {
      Fancy.Modules.fire('loaded', name);
    };

    _script.onerror = function () {
      throw new Error('[FancyGrid error] - module ' + name + ' was not loaded');
    };

    body.appendChild(_script);
  };

  /**
   * @param {String} i18n
   * @param {Function} fn
   */
  Fancy.loadLang = function(i18n, fn){
    if(Fancy.i18n[i18n] !== undefined) {
      return true;
    }

    var  body = document.getElementsByTagName('body')[0],
      _script = document.createElement('script'),
      endUrl = '.js',
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/@'+Fancy.version+'/modules/');

    _script.src = MODULESDIR + 'i18n/' + i18n + endUrl;
    _script.charset = 'utf-8';
    _script.async = 'true';

    _script.onload = function(){
      fn({
        lang: Fancy.i18n[i18n]
      });
    };

    body.appendChild(_script);
  };

  Fancy.loadStyle = function () {
    var links = document.querySelectorAll('link');

    if(Fancy.stylesLoaded){
      return;
    }

    Fancy.each(links, function (link) {
      if(/fancy\./.test(link.href)){
        Fancy.stylesLoaded = true;
      }
    });

    links = document.querySelectorAll('link');

    if(Fancy.stylesLoaded){
      return;
    }

    Fancy.each(links, function (link) {
      if(/fancy\./.test(link.href)){
        Fancy.stylesLoaded = true;
      }
    });

    if(!Fancy.stylesLoaded){
      var head = document.getElementsByTagName('head')[0],
        _link = document.createElement('link'),
        name = 'fancy',
        endUrl = Fancy.DEBUG ? '.css' : '.min.css',
        _v = Fancy.version.replace(/\./g, ''),
        MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/@'+Fancy.version+'/modules/');

      MODULESDIR = MODULESDIR.replace('modules/', '');
      MODULESDIR = MODULESDIR.replace('modules', '');

      if(Fancy.DEBUG){
        endUrl += '?_dc='+(+new Date());
      }
      else{
        endUrl += '?_v=' + _v;
      }

      _link.href = MODULESDIR + name + endUrl;
      _link.rel = 'stylesheet';

      Fancy.loadingStyle = true;

      _link.onload = function(){
        Fancy.loadingStyle = false;
      };

      head.appendChild(_link);
    }
  }
})();