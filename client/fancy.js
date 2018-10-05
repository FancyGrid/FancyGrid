(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = root.document ?
      factory(root) :
      factory;
  }
  else {
    root.Fancy = factory(root);
  }
}(typeof window !== 'undefined' ? window : this, function(win){
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
  version: '1.7.47',
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
    iL = classes.length;

  if( Fancy.typeOf( classes[0] ) === 'object' ){
    for(;i<iL;i++){
      var item = classes[i],
        _class = item._class,
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
      var item = classes[i];

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

    var i = 0,
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
  var property,
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
  GRID_ROW_DRAG_EL_CLS: 'fancy-grid-row-drag-el',
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
Fancy.ANIMATE_DURATION = 300;

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
    var rv = -1;
    if (navigator.appName == 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent,
        re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    else if (navigator.appName == 'Netscape') {
      var ua = navigator.userAgent,
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
      fn = fn || function () {},
      _v = Fancy.version.replace(/\./g, ''),
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/modules/');

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
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/modules/');

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

    var links = document.querySelectorAll('link');

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
        MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || ('https://cdn.fancygrid.com/');

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

      head.appendChild(_link);
    }
  }
})();
Fancy.themes = {};

/**
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineTheme = function(name, o){
  var themeConfig = {};

  if(o.extend){
    Fancy.apply(themeConfig, Fancy.getTheme(o.extend).config);
  }
  else if(name !== 'default'){
    Fancy.apply(themeConfig, Fancy.getTheme('default').config);
  }

  Fancy.apply(themeConfig, o.config);
  o.config = themeConfig;

  Fancy.themes[name] = o;
};

/**
 * @param {Object|String} name
 * @return {Object} o
 */
Fancy.getTheme = function(name){
  var theme = {
    config: {}
  };

  if(Fancy.isObject(name)){
    Fancy.applyIf(theme, Fancy.themes[name.name || 'default']);
    Fancy.apply(theme.config, Fancy.themes[name.name || 'default'].config);
    Fancy.apply(theme.config, name.config);

    return theme;
  }

  return Fancy.themes[name];
};

Fancy.defineTheme('default', {
  config: {
    cellHeaderHeight: 30,
    cellWidth: 70,
    minCellWidth: 40,
    cellHeight: 32,
    titleHeight: 42,
    subTitleHeight: 42,
    barHeight: 38,
    bottomScrollHeight: 12,
    minCenterWidth: 100,
    panelBorderWidth: 2,
    groupRowHeight: 31,

    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,2,2,2],

    knobOffSet: 2,
    fieldHeight: 37,

    charWidth: 7
  }
});

Fancy.defineTheme('blue', {
  config: {
    panelBorderWidth: 1,
    //borders: [1,1,0,1],
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7
  }
});

Fancy.defineTheme('gray', {
  config: {
    panelBorderWidth: 0,
    //borders: [0,0,1,0],
    gridBorders: [0,0,1,0],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7
  }
});

Fancy.defineTheme('dark', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [0,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7
  }
});

Fancy.defineTheme('sand', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [0,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7
  }
});

Fancy.defineTheme('bootstrap', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],
    charWidth: 7
  }
});

Fancy.defineTheme('bootstrap-no-borders', {
  config: {
    panelBorderWidth: 0,
    gridBorders: [0, 0, 0, 0],
    gridWithoutPanelBorders: [0, 0, 0, 0],
    panelBodyBorders: [0,0,0,0],
    columnLines: false,
    charWidth: 8
  }
});
/**
 * @class Fancy.String
 * @singleton
 */
Fancy.String = {
  /**
   * @param {String} tpl
   * @return {String}
   */
  format: function(tpl){
    var arr,
      i,
      iL;

    if(Fancy.typeOf(arguments[1]) === 'array'){
      arr = arguments[1];
    }
    else{
      iL = arguments.length;
      arr = [];
      i = 1;

      for(;i<iL;i++){
        arr[i - 1] = arguments[i];
      }
    }

    return tpl.replace(/\[(\d+)]/g, function(m, i) {
      return arr[i];
    });
  },
  /**
   * @param {String} str
   * @return {String}
   */
  upFirstChar: function(str) {
    return str[0].toLocaleUpperCase() + str.substr(1, str.length);
  },
  /**
   * @param {String} str
   * @return {String}
   */
  trim: function(str) {
    return str.replace(/\s/g, '');
  }
};


Fancy.Array = {
  copy: function(a, deep){
    if(!deep) {
      return a.slice();
    }

    var newArray = [],
      i = 0,
      iL = a.length;

    for(;i<iL;i++){

      switch(Fancy.typeOf(a[i])){
        case 'object':
          newArray[i] = Fancy.Object.copy(a[i]);
          break;
        case 'array':
          newArray[i] = Fancy.Array.copy(a[i]);
          break;
        default:
          newArray = a[i];
      }
    }

    return newArray;
  },
  each: function(arr, fn){
    var i = 0,
      iL = arr.length;

    for(;i<iL;i++){
      fn(arr[i], i);
    }
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  count: function(values){
    return values.length;
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  sum: function(values){
    var i = 0,
      iL = values.length,
      value = 0;

    if(Fancy.isArray(values[0])){
      value = [];
      for (;i<iL;i++){
        var j = 0,
          jL = values[i].length;

        for(;j<jL;j++){
          if(value[j] === undefined){
            value[j] = 0;
          }

          value[j] += values[i][j];
        }
      }
    }
    else {
      for (; i < iL; i++) {
        value += values[i];
      }
    }

    return value;
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  min: function(values){
    return Math.min.apply(this, values);
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  max: function(values){
    return Math.max.apply(this, values);
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  average: function (values) {
    var sum = 0,
      i = 0,
      iL = values.length;

    for(;i<iL;i++){
      sum += values[i];
    }

    return sum/values.length;
  },
  /*
   * @param {Array} arr
   * @param {Number} index
   * @param {Array} insert
   * @return {Array}
   */
  insert: function (arr, index, insert) {
    var arr2 = arr.splice(index, arr.length - index);

    arr = arr.concat(insert).concat(arr2);

    return arr;
  }
};
/**
 * @class Fancy.Object
 * @singleton
 */
Fancy.Object = {
  /**
   * @param {Object} o
   * @return {Object}
   * TODO: deep copy
   */
  copy: function(o){
    var _o = {};

    for(var p in o){
      _o[p] = o[p];
    }

    return _o;
  },
  /**
   * @param {Object} o
   * @return {Boolean}
   */
  isEmpty: function (o) {
    var empty = true;

    for(var p in o){
      empty = false;
      continue;
    }

    return empty;
  }
};
/**
 * @class Fancy.Number
 * @singleton
 */
Fancy.Number = {
  /**
   * @param {Number} value
   * @return {Boolean}
   */
  isFloat: function(value){
    return Number(value) === value && value % 1 !== 0;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  getPrecision: function(value){
    return (value + "").split(".")[1].length + 1;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  correctFloat: function(value){
    return parseFloat(value.toPrecision(14));
  }
};
/*
 * @class Fancy.Collection
 * @constructor
 */
Fancy.Collection = function(arr){
  var me = this;

  me.items = [];
  me.keys = [];
  me.map = {};
  me.indexMap = {};
  me.length = 0;

  if( arr ){
    if(arr.length > 0){
      var i = 0,
        iL = arr.length;

      for(;i<iL;i++){
        me.add(i, arr[i]);
      }
    }
    else{
      for(var p in arr){
        me.add(p, arr[p]);
      }
    }
  }
};

Fancy.Collection.prototype = {
  /*
   *
   * @param {String|Number} key
   * @param {*} value
   */
  add: function(key, value){
    var me = this;

    me.items.push(value);
    me.keys.push(key);
    me.map[key] = value;
    me.indexMap[key] = me.length;
    me.length++;
  },
  /*
   * @param {String|Number} key
   */
  remove: function(key){
    var me = this,
      index = me.indexMap[key];

    me.items.splice(index, 1);
    me.keys.splice(index, 1);
    delete me.indexMap[index];
    delete me.map[key];
    me.length--;

    me.updateIndexMap();
  },
  updateIndexMap: function () {
    var me = this,
      i = 0,
      iL = me.keys.length;

    me.indexMap = {};

    for(;i<iL;i++){
      me.indexMap[me.keys[i]] = i;
    }
  },
  /*
   *
   */
  removeAll: function(){
    var me = this;

    me.items = [];
    me.keys = [];
    me.indexMap = {};
    me.map = {};
    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @return {*}
   */
  get: function(key){
    return this.map[key];
  },
  /*
   *
   * @param {Function} fn
   */
  each: function(fn){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      fn(me.keys[i], me.items[i], i, me.length);
    }
  }
};
/**
 * @class Fancy.Template
 * @constructor
 * @param {Array} html
 */
Fancy.Template = function(html){
  var me = this;

  if(Fancy.isArray(html)){
    me.tpl = html.join('');
  }
  else{
    me.tpl = html;
  }

  me.compile();
};

Fancy.Template.prototype = {
  re: /\{([\w\-]+)\}/g,
  /*
   * @param {Array} values
   */
  getHTML: function(values){
    return this.compiled(values || {});
  },
  /*
   * @return {Fancy.Template}
   */
  compile: function(){
    var me = this;

      function fn(m, name){
        name = "values['" + name + "']";
        return "'+(" + name + " === undefined ? '' : " + name + ")+'";
      }

    eval("me.compiled = function(values){ return '" + me.tpl.replace(me.re, fn) + "';};");

    return me;
  }
};
Fancy.key = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  RETURN: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_DOT: 110,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  DOT: 190,
  PAGE_UP: 33,
  PAGE_DOWN: 34
};

Fancy.Key = {
  /*
   * @param {number} c
   * @return {Boolean}
   */
  isNum: function(c){
    var key = Fancy.key;

    switch(c){
      case key.ZERO:
      case key.ONE:
      case key.TWO:
      case key.THREE:
      case key.FOUR:
      case key.FIVE:
      case key.SIX:
      case key.SEVEN:
      case key.EIGHT:
      case key.NINE:
      case key.NUM_ZERO:
      case key.NUM_ONE:
      case key.NUM_TWO:
      case key.NUM_THREE:
      case key.NUM_FOUR:
      case key.NUM_FIVE:
      case key.NUM_SIX:
      case key.NUM_SEVEN:
      case key.NUM_EIGHT:
      case key.NUM_NINE:
        return true;
      default:
        return false;
    }
  },
  /*
   * @param {Number} c
   * @param {Object} w
   * @return {Boolean}
   */
  isNumControl: function(c, e){
    var key = Fancy.key;

    if( Fancy.Key.isNum(c) ){
      return true;
    }

    if( e.shiftKey && c === 187){
      return true;
    }

    switch(c){
      case key.NUM_PLUS:
      case 189:
      case key.NUM_MINUS:
      case key.NUM_DOT:
      case key.BACKSPACE:
      case key.DELETE:
      case key.TAB:
      case key.ENTER:
      case key.RETURN:
      case key.SHIFT:
      case key.CTRL:
      case key.ALT:
      case key.ESC:
      case key.END:
      case key.HOME:
      case key.LEFT:
      case key.UP:
      case key.RIGHT:
      case key.DOWN:
      case key.INSERT:
      case key.DOT:
        return true;
        break;
      default:
        return false;
    }
  }
};
(function(){

var $classes = {},
  $types = {};

/**
 * Apply method and properties of Parent prototype to Child prototype
 * @private
 * @param {Object} Child
 * @param {Object} Parent
 */
var applyIf = function(Child, Parent){
  for(var p in Parent.prototype){
    if(Child.prototype[p] === undefined){
      Child.prototype[p] = Parent.prototype[p];
    }
  }
};

/**
 * @class ClassManager manage all classes, helps to manipulate
 * @private
 * @constructor
 */
var ClassManager = function(){

  this.waitMixins = {};
};
ClassManager.prototype = {
  items: new Fancy.Collection(),
  /*
   * Define class in global scope with it namespace
   * @param {String} key
   */
  add: function(key, value){
    var parts = key.split("."),
      i = 1,
      iL = parts.length - 1;
    
    Fancy.ns(key);
    
    var ref = Fancy.global[parts[0]];
    
    for(;i<iL;i++){
      ref = ref[parts[i]];
    }
    
    if(parts.length > 1){
      ref[parts[parts.length - 1]] = value;
    }
    else{
      Fancy.global[parts[0]] = value;
    }
    
    this.items.add(key, value);
  },
  /*
   * Returns class by key
   * @param {String} key
   * @return {Object}
   */
  get: function(key){
    return this.items.get(key);
  },
  /*
   * @param {String} whatWait
   * @param {String} whoWait
   */
  waitMixin: function(whatWait, whoWait){
    var me = this;

    me.waitMixins[whatWait] = me.waitMixins[whatWait] || {
        waiters: []
      };

    me.waitMixins[whatWait].waiters.push(whoWait);
  },
  /*
   * @param {String} name
   * @return {Object}
   */
  getMixin: function(name){
    var parts = name.split("."),
      j = 1,
      jL = parts.length;

    var namespace = Fancy.global[parts[0]];

    if(namespace === undefined){
      return false;
    }

    for(;j<jL;j++){
      namespace = namespace[parts[j]];

      if(namespace === undefined){
        return false;
      }
    }

    return namespace;
  }
};

/**
 * @class Fancy.ClassManager manages all classes, helps to manipulate
 * @private
 * @singleton
 */
Fancy.ClassManager = new ClassManager();

/*
 * Define class
 * @method
 * @param {String|Array} name
 * @param {Object} config
 */
Fancy.define = function(name, config){
  var config = config || {},
    names = [];
  
  if( Fancy.isArray(name) ){
    names = name;
    name = names[0];
  }
  
  if(config.constructor === Object){
    if(config.extend === undefined){
      config.constructor = function(){
        
      };
    }
    else{
      config.constructor = function(){
        this.Super('constructor', arguments);
      };
    }
  }
  
  if(config.extend === undefined){
    $classes[name] = config.constructor;
  }
  else{
    $classes[name] = config.constructor;
    
    var extendClass;
    switch(typeof config.extend){
      case 'string':
        extendClass = Fancy.ClassManager.get(config.extend);
        $classes[name].prototype.$Super = Fancy.ClassManager.get(config.extend);
        break;
      case 'function':
        extendClass = config.extend;
        $classes[name].prototype.$Super = config.extend;
        break;
    }
    delete config.extend;
    
    $classes[name].prototype.Super = function(method, args){
      var me = this;
      if( me.$Iam ){
        me.$Iam = Fancy.ClassManager.get( me.$Iam.prototype.$Super.prototype.$name );
      }
      else{
        me.$Iam = Fancy.ClassManager.get( me.$Super.prototype.$name );
      }

      switch(method){
        case 'const':
        case 'constructor':
          me.$Iam.apply(me, args);
        break;
        default:
          me.$Iam.prototype[method].apply(me, args);
      }
      
      delete me.$Iam;
    };
    applyIf($classes[name], extendClass);
  }
  
  $classes[name].prototype.$name = name;
  
  if(config.mixins){
    Fancy.mixin( $classes[name].prototype, config.mixins );
    delete $classes[name].prototype.mixins;
  }

  if(config.plugins !== undefined){
    if( $classes[name].prototype.$plugins === undefined ){
      $classes[name].prototype.$plugins = [];
    }

    $classes[name].prototype.$plugins = $classes[name].prototype.$plugins.concat( config.plugins );
    delete $classes[name].prototype.plugins;
  }

  for(var p in config){
    $classes[name].prototype[p] = config[p];
  }
  
  var _classRef = $classes[name];
  
  if( config.singleton === true ){
    delete $classes[name];
    _classRef = new _classRef(config);
    $classes[name] = _classRef;
    
  }
  
  if( names.length > 1 ){
    Fancy.each(names, function(name){
      Fancy.ClassManager.add(name, _classRef);
    });
  }
  else{
    Fancy.ClassManager.add(name, _classRef);
  }
  
  if(config.type){
    $types[config.type] = _classRef;
    Fancy.addWidgetType(config.type, _classRef);
  }
  else if(config.ptype){
    $types[config.type] = _classRef;
    Fancy.addPluginByType(config.ptype, _classRef);
  }
};

/*
 * Returns class by it's type
 * @param {String} type
 * @return {Object}
 */
Fancy.getClassByType = function(type){
  return $types[type];
};

})();
/**
 * @class Fancy.MixinClass
 * @constructor
 */
Fancy.MixinClass = function(){};

Fancy.MixinClass.prototype = {
  /**
   * generate unique id for class
   */
  initId: function(){
    var me = this,
      prefix = me.prefix || Fancy.prefix;

    me.id = me.id || Fancy.id(null, prefix);

    Fancy.addWidget(me.id, me);
  },
  /*
   * Initialize plugins if they are presented in class
   */
  initPlugins: function(){
    var me = this,
      widget = me,
      plugin,
      objectPlugin,
      pluginConfig;

    me.plugins = me.plugins || [];

    if(me._plugins){
      me.plugins = me.plugins.concat(me._plugins);
    }

    if(me.plugins !== undefined){
      me.$plugins = me.plugins;
      delete me.plugins;
    }

    if(me.$plugins === undefined){
      return;
    }

    var i = 0,
      plugins = me.$plugins,
      iL = plugins.length,
      inWidgetName,
      types = {};

    for(;i<iL;i++){
      pluginConfig = plugins[i];
      pluginConfig.widget = widget;

      var type = pluginConfig.type || pluginConfig.ptype;

      if(types[type] === true){
        continue;
      }

      types[type] = true;
      plugin = Fancy.getPluginByType( type );
      if(plugin === undefined){
        throw new Error('[FancyGrid Error] - some of module was not loaded. Grid plugin does not exist - ' + type);
      }
      objectPlugin = new plugin(pluginConfig);
      inWidgetName = pluginConfig.inWidgetName || objectPlugin.inWidgetName;

      if(inWidgetName !== undefined){
        widget[ inWidgetName ] = objectPlugin;
      }
    }
  }
};
/*
 * @class Fancy.Data
 */
Fancy.define('Fancy.Data', {
  /*
   * @constructor
   * @param {Array} data
   */
  constructor: function(data){
    var me = this;

    me.map = {};

    if(data){
      var i = 0,
        iL = data.length,
        map = me.map;

      for(;i<iL;i++){
        map[i] = data[i];
      }
    }

    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   */
  add: function(key, value){
    this.map[key] = value;
    this.length++;
  },
  /*
   * @param {String|Number} key
   * @return {*}
   */
  get: function(key){
    return this.map[key];
  }
});
/*
 * @class Fancy.Model
 */
Fancy.define('Fancy.Model', {
  /*
   * @constructor
   * @param {Object|Array} data
   */
  constructor: function(data){
    var me = this,
      row = {},
      fields = me.fields || [],
      j = 0,
      jL = fields.length;

    if( Fancy.isArray(data) ){
      for(;j<jL;j++){
        var p = fields[j];
        row[p] = data[j];
      }

      if(row.id === undefined){
        Fancy.idSeed++;
        row.id = Fancy.idSeed + 1000;
      }

      me.data = row;
      me.id = me.data.id;
      //TODO - id
    }
    else{
      if(data.id){
        me.id = data.id;
      }
      else{
        Fancy.idSeed++;
        me.id = Fancy.idSeed + 1000;
        data.id = me.id;
      }

      if( me.fields === undefined ){
        fields = [];
        for(var p in data){
          fields.push(p);
        }
        me.fields = fields;
      }

      jL = fields.length;

      for(;j<jL;j++){
        var p = fields[j];

        if(data[p] === undefined){
          row[p] = '';
        }
        else{
          row[p] = data[p];
        }
      }

      if(!row.id){
        me.fields.push('id');
        if(!data.id){
          data.id = me.id;
        }

        row.id = data.id;
      }

      me.data = row;
    }
  },
  /*
   * @param {String} key
   * @return {Object}
   */
  get: function(key){
    var me = this;

    if(key === undefined){
      return me.data;
    }

    return me.data[key];
  },
  /*
   * @param {String} key
   * @param {*} value
   */
  set: function(key, value){
    var me = this;

    if(value === undefined && Fancy.isObject(key)){
      for(var p in key){
        me.set(p, key[p]);
      }
      return;
    }

    me.data[key] = value;
  }
});
/*
 * @class Fancy.PluginManager
 * @singleton
 */
Fancy.define('Fancy.PluginManager', {
  singleton: true,
  /*
   * @constructor
   */
  constructor: function(){
    this.ptypes = new Fancy.Data();
  },
  /*
   * @param {String} ptype
   * @param {Object} plugin
   */
  addPlugin: function(ptype, plugin){
    this.ptypes.add(ptype, plugin);
  },
  /*
   * @param {String} ptype
   * @return {Object}
   */
  getPlugin: function(ptype){
    return this.ptypes.get(ptype);
  }
});

/*
 * @param {String} ptype
 * @param {Object} plugin
 */
Fancy.addPluginByType = function(ptype, plugin){
  Fancy.PluginManager.addPlugin(ptype, plugin);
};

/*
 * @param {String} ptype
 * @return {Object}
 */
Fancy.getPluginByType = function(ptype){
  return Fancy.PluginManager.getPlugin(ptype);
};
/*
 * @class Fancy.WidgetManager
 * @singleton
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.WidgetManager', {
    singleton: true,
    /*
     * @constructor
     */
    constructor: function () {
      this.wtypes = new F.Data();
      this.widgets = new F.Data();
    },
    /*
     * @param {String} wtype
     * @param {Object} widget
     */
    addWidgetType: function (wtype, widget) {
      widget.prototype.wtype = wtype;
      this.wtypes.add(wtype, widget);
    },
    /*
     * @param {String} wtype
     * @return {Object}
     */
    getWidgetClassByType: function (wtype) {
      return this.wtypes.get(wtype);
    },
    /*
     * @param {String} id
     * @param {Object} widget
     */
    addWidget: function (id, widget) {
      this.widgets.add(id, widget);
    },
    /*
     * @param {String} id
     * @return {Object}
     */
    getWidget: function (id) {
      return this.widgets.get(id);
    }
  });

  var W = F.WidgetManager;

  /*
   * @param {String} wtype
   * @param {Object} widget
   */
  F.addWidgetType = function (wtype, widget) {
    W.addWidgetType(wtype, widget);
  };

  /*
   * @param {String} wtype
   * @return {Object}
   */
  F.getWidgetClassByType = function (wtype) {
    return W.getWidgetClassByType(wtype);
  };

  /*
   * @param {String} id
   * @param {Object} widget
   */
  F.addWidget = function (id, widget) {
    W.addWidget(id, widget);
  };

  /*
   * @param {String} id
   * @return {Object} widget
   */
  F.getWidget = function (id) {
    return W.getWidget(id);
  };

})();
(function(){
var seedFn = 0,
  fns = {};

/*
 * @class Fancy.Event
 */
Fancy.define(['Fancy.Event', 'Fancy.Observable'], {
  mixins: [
    Fancy.MixinClass
  ],
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

    me.$events = {};
    if(me.listeners || me.events){
      var listeners = me.listeners || me.events,
        i = 0,
        iL = listeners.length;

      for(;i<iL;i++){
        var lis = listeners[i],
          eventName = null,
          handler = null,
          scope = null,
          delay = 0,
          params = [];

        for(var p in lis){
          switch(p){
            case 'scope':
              scope = lis[p];
              break;
            case 'params':
              params = lis[p];
              break;
            case 'delay':
              delay = lis[p];
              break;
            default:
              eventName = p;
              handler = lis[p];
          }
        }

        if(eventName === null){
          throw new Error('Event was not set');
        }
        else{
          switch(Fancy.typeOf(handler)){
            case 'string':
              handler = me[handler];
              lis.handler = handler;
              if(lis.scope === undefined){
                scope = me;
              }
              lis.scope = scope;
              break;
            case 'function':
              break;
            default:
              throw new Error('Handler has wrong type or not defined');
          }
        }

        if(Fancy.isArray(params) === false){
          throw new Error('params must be array');
        }

        me.addEvent(eventName);
        me.on(eventName, handler, scope, params, delay);
      }
    }
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {Object} params
   */
  on: function(eventName, fn, scope, params, delay){
    if( this.$events[eventName] === undefined ){
      throw new Error('Event name is not set: ' + eventName);
    }

    if(fn === undefined){
      throw new Error('Handler is undefined. Name of event is ' + eventName + '.');
    }

    fn.$fancyFnSeed = seedFn;
    fns[seedFn] = fn;
    seedFn++;

    this.$events[eventName].push({
      fn:fn,
      scope: scope,
      params: params || [],
      delay: delay
    });
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   */
  un: function(eventName, fn){
    var me = this,
      $events = me.$events[eventName];

    if(!$events){
      return false;
    }

    var i = 0,
      iL = $events.length;

    for(;i<iL;i++){
      var lis = $events[i];
      if(lis.fn.$fancyFnSeed === fn.$fancyFnSeed){
        lis.toRemove = true;
        return true;
      }
    }
    return false;
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   */
  once: function(eventName, fn, scope){
    var me = this,
      fnWrapper = function(){
        fn.apply(this, arguments);
        me.un(eventName, fnWrapper);
      };

    me.on(eventName, fnWrapper, scope);
  },
  /*
   *
   */
  unAll: function(){
    this.$events = {};
  },
  /*
   * @param {String} eventName
   */
  unAllByType: function(eventName){
    this.$events[eventName] = [];
  },
  /*
   * @param {String} eventName
   */
  fire: function(eventName){
    var me = this,
      $events = me.$events[eventName];

    if(!$events){
      return false;
    }

    var i = 1,
      iL = arguments.length,
      args = [me];

    for(;i<iL;i++){
      args.push(arguments[i]);
    }

    var i = 0,
      iL = $events.length;

    for(;i<iL;i++){
      var lis = $events[i],
        _args = [];

      if( lis.toRemove === true ){
        $events.splice(i, 1);
        i--;
        iL = $events.length;
        continue;
      }

      _args = _args.concat(args);
      if( lis.params ){
        _args = _args.concat(lis.params);
      }

      if(lis.delay){
        setTimeout(function () {
          lis.fn.apply(lis.scope || me, _args);
        }, lis.delay);
      }
      else{
        lis.fn.apply(lis.scope || me, _args);
      }
    }
  },
  /*
   * @param {String} eventName
   * @return {Array}
   */
  addEvent: function(eventName){
    return this.addEvents(eventName);
  },
  /*
   * @param {String...} eventName
   * @return {Array}
   */
  addEvents: function(eventName){
    var me = this;

    if(arguments.length > 1){
      var tempEventName = [],
        i = 0,
        iL = arguments.length;

      for(;i<iL;i++){
        tempEventName[i] = arguments[i];
      }
      eventName = tempEventName;
    }
    if(Fancy.typeOf(eventName) === 'string'){
      me.$events[eventName] = me.$events[eventName] || [];
    }
    else if(Fancy.typeOf(eventName) === 'array'){
      var i = 0,
        iL = eventName.length;

      for(;i<iL; i++){
        me.$events[eventName[i]] = me.$events[eventName[i]] || [];
      }
    }
  },
  /*
   * @param {String} eventName
   * @return {Boolean}
   */
  has: function(eventName){
    var lis = this.$events[eventName];
    if(!lis){
      return false;
    }

    return lis.length !== 0;
  }
});

  /*
   * @class Fancy.Modules
   * @singleton
   */
  Fancy.define('Fancy.Modules', {
    extend: Fancy.Event,
    singleton: true,
    /*
     * @constructor
     */
    constructor: function(){
      this.Super('const', arguments);
      this.init();
    },
    /*
     *
     */
    init: function(){
      this.addEvents('loaded');
    }
  });

})();
/*
 * @mixin Fancy.store.mixin.Edit
 */
Fancy.Mixin('Fancy.store.mixin.Edit', {
  //TODO: too slow for big data, needs redo. Add some map.
  //idSeed: 0,
  /*
   * @param {Object} o
   */
  remove: function(o) {
    var me = this,
      id = o.id,
      index,
      orderIndex,
      itemData;

    switch (Fancy.typeOf(o)) {
      case 'string':
      case 'number':
        id = o;
        break;
      default:
        id = o.id || o.data.id;
    }

    if (me.isTree && me.treeCollapsing !== true) {
      var item = me.getById(id),
        parentItem = me.getById(item.get('parentId'));

      if (item.get('leaf') === false && item.get('expanded')) {
        var _i = item.data.child.length - 1;

        Fancy.each(item.data.child, function (child, i, children) {
          me.remove(children[_i]);
          _i--;
        });
      }

      if (parentItem) {
        Fancy.each(parentItem.data.child, function (child, i) {
          if (child.id === id) {
            parentItem.data.child.splice(i, 1);
            return true;
          }
        });
      }
    }

    if (me.proxyType === 'server' && me.autoSave && me.proxy.api.destroy) {
      me.proxyCRUD('DESTROY', id);
      return;
    }

    if (o.rowIndex) {
      index = me.dataViewIndexes[o.rowIndex];
      orderIndex = o.rowIndex;
    }
    else {
      index = me.getDataIndex(id);
      orderIndex = me.getRow(id);
      //TODO: absent orderIndex, need to learn where to take it.
      if(index === undefined && orderIndex === undefined){
        return;
      }
    }

    if (me.isTree && me.treeCollapsing && me.filteredData) {
      //TODO:
      var _index;
      Fancy.each(me.data, function (item, i) {
        if(item.data.id === id){
          _index = i;
          return true;
        }
      });

      itemData = me.data.splice(_index, 1)[0];
    }
    else {
      itemData = me.data.splice(index, 1)[0];
    }


    if (me.paging) {
      orderIndex += me.showPage * me.pageSize;
    }

    if (me.order) {
      me.order.splice(orderIndex, 1);
    }

    //SLOW, needs all redo to another approach
    //Almost the same as resorting
    if (me.changeOrderIndexes) {
      me.changeOrderIndexes(index);
    }

    if (me.paging) {
      if (me.showPage !== 0 && me.showPage * me.pageSize === me.getTotal()) {
        me.showPage--;
      }
      me.calcPages();
    }

    delete me.map[id];

    if (!me.treeCollapsing) {
      me.fire('remove', id, itemData, index);
    }

    me.changeDataView();
  },
  /*
   * @param {Number} index
   */
  removeAt: function(index){
    //NOT FINISHED!!!
    var me = this;

    me.remove({
      rowIndex: index,
      id: me.getId(index)
    });
  },
  /*
   *
   */
  removeAll: function () {
    var me = this;

    me.data = [];
    me.dataView = [];
    delete me.order;

    if(me.paging){
      me.showPage = 0;
      me.calcPages();
    }

    if(me.filters){
      delete me.filters;
      delete me.filteredData;
      delete me.filterOrder;
    }
  },
  /*
   * @param {Object} o
   * @return {Fancy.Model}
   */
  add: function(o){
    var me = this;

    return me.insert(me.getTotal(), o);
  },
  /*
   * @param {Number} index
   * @param {Object} o
   * @return {Fancy.Model}
   */
  insert: function(index, o){
    var me = this;

    //Bug fix for empty data on start with grouping
    if(me.grouping && !me.bugFixGrouping){
      me.defineModel(o, true);
      me.bugFixGrouping = true;
    }

    me.addIndex = index;

    if(o.id === undefined){
      Fancy.idSeed++;
      var id = Fancy.idSeed + 1000;
      if(me.proxyType === 'server'){
        o.id = 'Temp-' + id;
      }
      else {
        o.id = id;
      }
    }

    if(me.getById(o.id)){
      me.remove(o.id);
    }

    if(me.proxyType === 'server' && me.autoSave && me.proxy.api.create){
      me.once('create', me.onCreate, me);
      me.proxyCRUD('CREATE', o);
    }
    else{
      return me.insertItem(o, index);
    }
  },
  /*
   * @param {Object} o
   * @return {Fancy.Model}
   */
  insertItem: function(o){
    var me = this,
      model = me.model,
      item = new model(o),
      index = me.addIndex;

    if(!me.treeExpanding) {
      me.fire('beforeinsert');
    }

    delete me.addIndex;
    me.data.splice(index, 0, item);

    if(me.order){
      me.order.splice(index, 0, index);
      me.changeOrderIndexes(index, '+');
      me.order[index]--;
    }

    me.changeDataView();
    me.map[o.id] = item;
    if(!me.treeExpanding) {
      me.fire('insert', item);
    }
    return item;
  },
  /*
   * @param {Object} store
   * @param {Object} o
   */
  onCreate: function(store, o){
    return this.insertItem(o);
  }
});
/*
 * @mixin Fancy.store.mixin.Dirty
 */
Fancy.Mixin('Fancy.store.mixin.Dirty', {
  /*
   *
   */
  initTrackDirty: function(){
    var me = this;

    me.changed = {
      length: 0
    };

    me.removed = {
      length: 0
    };

    me.inserted = {
      length: 0
    };

    me.undoActions = [];
    me.redoActions = [];

    me.on('remove', me.onDirtyRemove, me);
    me.on('set', me.onDirtySet, me);
    me.on('insert', me.onDirtyInsert, me);
  },
  /*
   *
   */
  onDirtySet: function(store, o){
    var me = this,
      id = o.id;

    if(o.key === '$selected'){
      return;
    }

    if(me.changed[id] === undefined){
      me.changed[id] = {
        length: 1
      };
      me.changed.length++;
    }
    else{
      me.changed[id].length++;
    }

    if(me.changed[id][o.key] === undefined){
      me.changed[id][o.key] = {
        originValue: o.oldValue
      };
    }

    me.changed[id][o.key].value = o.value;

    if(me.changed[id][o.key].value === me.changed[id][o.key].originValue){
      delete me.changed[id][o.key];
      me.changed[id].length--;

      var i = 0,
        iL = me.undoActions.length - 1;

      for(;i<=iL;i++){
        var _i = iL - i,
          action = me.undoActions[_i];

        if(action.id === id && o.key === action.key){
          var redoAction = me.undoActions.splice(_i, 1);
          me.redoActions.push(redoAction);
        }
      }
    }
    else{
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: id,
        type: 'edit',
        key: o.key,
        value: o.value,
        oldValue: o.oldValue
      });
    }

    if(me.changed[id].length === 0){
      delete me.changed[id];
      me.changed.length--;
    }
  },
  /*
   *
   */
  onDirtyRemove: function(store, id, record, rowIndex){
    var me = this;

    me.removed[id] = record.data;
    me.removed.length++;

    if(me.undoStoppped !== true){
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: id,
        type: 'remove',
        data: record.data,
        rowIndex: rowIndex
      });
    }
  },
  /*
   *
   */
  onDirtyInsert: function(store, o){
    var me = this;

    if(me.treeExpanding){
      return;
    }

    me.inserted[o.id] = o;
    me.inserted.length++;

    if(me.undoStoppped !== true) {
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: o.id,
        type: 'insert',
        data: o.data
      });
    }
  },
  clearDirty: function () {
    var me = this;

    me.changed = {
      length: 0
    };

    me.removed = {
      length: 0
    };

    me.inserted = {
      length: 0
    };

    me.undoActions = [];
    me.redoActions = [];
  }
});
/*
 * @class Fancy.Store
 */
Fancy.define('Fancy.Store', {
  extend: Fancy.Event,
  mixins: [
    'Fancy.store.mixin.Paging',
    'Fancy.store.mixin.Proxy',
    'Fancy.store.mixin.Rest',
    'Fancy.store.mixin.Reader',
    'Fancy.store.mixin.Writer',
    'Fancy.store.mixin.Sort',
    'Fancy.store.mixin.Edit',
    'Fancy.store.mixin.Grouping',
    'Fancy.store.mixin.Filter',
    'Fancy.store.mixin.Search',
    'Fancy.store.mixin.Dirty',
    'Fancy.store.mixin.Tree'
  ],
  pageSize: 10,
  showPage: 0,
  pages: 0,
  dirty: false,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
    me.init();

    me.data = me.data || [];
    me.dataView = me.dataView || [];
    me.dataViewMap = me.dataViewMap  || {};
    me.map = {};

    me.setModel();

    if(me.data) {
      if (me.data.proxy) {
        me.initProxy();
      }
      else if(!me.widget.isTreeData){
        me.setData(me.data);
      }
    }

    me.readSmartIndexes();

    if(me.widget.grouping){
      me.orderDataByGroupOnStart();
    }

    if(me.widget.isTreeData){
      me.initTreeData();
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'add', 'change', 'changepages', 'set',
      //Proxy(server) CRUD-s events, maybe will be used not only for it, but now only for server CRUD-s
      'beforeupdate', 'update',
      'beforeremove',
      'remove',
      'beforedestroy', 'destroy',
      'beforecreate', 'create',
      'beforesort', 'sort',
      'beforeload', 'load',
      'filter',
      'beforeinsert', 'insert',
      'servererror', 'serversuccess'
    );
    me.initId();
    me.initPlugins();

    if(me.paging){
      me.initPaging();
    }

    if( me.initTrackDirty ) {
      me.initTrackDirty()
    }
  },
  /*
   *
   */
  setModel: function(){
    var me = this,
      model = me.model;

    if(model === undefined){
      model = Fancy.Model;
    }
    else{
      model = Fancy.ClassManager.get(me.model);
    }

    me.model = model;
    me.fields = model.prototype.fields;
    if( me.fields === undefined){
      throw new Error('needed to set fields in Model of Store');
    }
  },
  /*
   * @param {Array} data
   */
  setData: function(data){
    var me = this,
      i = 0,
      iL = data.length,
      model = me.model,
      item;

    me.data = [];
    me.dataView = [];
    me.dataViewMap = {};
    me.dataViewIndexes = {};

    if(me.collapsed) {
      for (; i < iL; i++) {
        item = new model(data[i]);

        me.data[i] = item;
        me.map[item.id] = item;
      }
    }
    else {
      if(me.expanded){
        //??? It looks like never reaches
        for (; i < iL; i++) {
          item = new model(data[i]);

          me.data[i] = item;
          me.map[item.id] = item;
        }
      }
      else {
        if(me.paging ){
          for (; i < iL; i++) {
            item = new model(data[i]);

            me.data[i] = item;
            if(i < me.pageSize){
              me.dataView[i] = item;
              me.dataViewMap[item.id] = i;
              me.dataViewIndexes[i] = i;
            }
            me.map[item.id] = item;
          }
        }
        else {
          for (; i < iL; i++) {
            item = new model(data[i]);

            me.data[i] = item;
            me.dataView[i] = item;
            me.dataViewMap[item.id] = i;
            me.dataViewIndexes[i] = i;
            me.map[item.id] = item;
          }
        }
      }
    }

    if(me.isTree){
      Fancy.each(me.data, function (item, i) {
        if(item.get('expanded')){
          Fancy.each(item.data.child, function (_child,_i) {
            var childItem = me.getById(_child.id);

            item.data.child[_i] = childItem;
          });
        }
      });
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {Fancy.Model}
   */
  getItem: function(rowIndex){
    var me = this;

    return me.dataView[rowIndex];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {Boolean} origin
   */
  get: function(rowIndex, key, origin){
    var me = this,
      data;

    if(rowIndex === undefined){
      return me.data;
    }

    var item = me.dataView[rowIndex];

    if(!item){
      if(me.order){
        item = me.data[me.order[rowIndex]]
      }
      else {
        item = me.data[rowIndex];
      }

      if(item){
        if(key === 'id'){
          return item.data[key] || item.id;
        }

        return item.data[key];
      }

      return item;
    }

    if(key === undefined){
      data = item.data;

      if(data.id === undefined){
        data.id = me.dataView[rowIndex].id;
      }

      return me.dataView[rowIndex].data;
    }
    else if(key === 'none'){
      return '';
    }

    if(origin){
      item = me.data[rowIndex];

      if(key === 'id'){
        return item.data[key] || item.id;
      }

      return item.data[key];
    }
    else {
      item = me.dataView[rowIndex];

      if(key === 'id'){
        return item.data[key] || item.id;
      }

      return item.data[key];
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {String|Number}
   */
  getId: function(rowIndex){
    return this.dataView[rowIndex].id;
  },
  /*
   * @param {Number} id
   * @return {Fancy.Model}
   */
  getRow: function(id){
    return this.dataViewMap[id];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {String|Number} value
   * @param {String|Number} [id]
   */
  set: function(rowIndex, key, value, id){
    var me = this,
      item,
      oldValue;

    if(rowIndex === -1){
      item = me.getById(id);
    }
    else{
      item = me.dataView[rowIndex];
      id = item.data.id || item.id;
    }

    if(value === undefined){
      var data = key;

      for(var p in data){
        if(p === 'id'){
          continue;
        }

        var _data;

        if(rowIndex === -1){
          oldValue = item.get(p);
          item.set(p, data[p]);

          _data = item.data;
        }
        else {
          oldValue = me.get(rowIndex, p);
          me.dataView[rowIndex].data[p] = data[p];

          _data = me.dataView[rowIndex].data;
        }

        me.fire('set', {
          id: id,
          data: _data,
          rowIndex: rowIndex,
          key: p,
          value: data[p],
          oldValue: oldValue,
          item: item
        });
      }

      if(me.proxyType === 'server' && me.autoSave) {
        me.proxyCRUD('UPDATE', id, data);
      }

      return;
    }
    else{
      if(rowIndex === -1){
        oldValue = item.get(key);
      }
      else {
        oldValue = me.get(rowIndex, key);
      }

      if(oldValue == value){
        return;
      }
    }

    if(rowIndex === -1){
      item.set(key, value);
    }
    else {
      var _item = me.dataView[rowIndex];
      if(_item.data.parentId){
        //TODO: it is bad about perfomance, it needs to redo.
        var parentItem = me.getById(_item.data.parentId);

        Fancy.each(parentItem.data.child, function (child, i) {
          if(child.id === _item.id){
            child[key] = value;
          }
        });
      }

      _item.data[key] = value;
    }

    if(me.proxyType === 'server' && me.autoSave){
      me.proxyCRUD('UPDATE', id, key, value);
    }

    var _data;

    if(rowIndex === -1){
      _data = item.data;
    }
    else{
      _data = me.dataView[rowIndex].data;
    }

    me.fire('set', {
      id: id,
      data: _data,
      rowIndex: rowIndex,
      key: key,
      value: value,
      oldValue: oldValue,
      item: item
    });
  },
  /*
   * @param {Number} rowIndex
   * @param {Object} data
   */
  setItemData: function(rowIndex, data){
    var me = this,
      pastData = me.get(rowIndex);

    if(me.writeAllFields && me.proxyType === 'server'){
      me.set(rowIndex, data);
    }
    else {
      for (var p in data) {
        if (pastData[p] == data[p]) {
          continue;
        }

        me.set(rowIndex, p, data[p]);
      }
    }
  },
  /*
   * @return {Number}
   */
  getLength: function(){
    return this.dataView.length;
  },
  /*
   * @return {Number}
   */
  getTotal: function(){
    var me = this;

    if(me.pageType === 'server'){
      return me.totalCount;
    }

    if(me.filteredData){
      return me.filteredData.length;
    }

    if(me.data === undefined){
      return 0;
    }
    else if(Fancy.isObject(me.data)){
      return 0;
    }

    return me.data.length;
  },
  /*
   * @param {Object} data
   * @param {Boolean} force
   */
  defineModel: function(data, force){
    var me = this,
      s = me.store;

    if(me.model && me.fields && me.fields.length !== 0 && !force){
      return;
    }

    var data = data || me.data || s.data,
      fields = me.getFieldsFromData(data),
      modelName = 'Fancy.model.'+Fancy.id();

    Fancy.define(modelName, {
      extend: Fancy.Model,
      fields: fields
    });

    me.model = modelName;
    me.fields = fields;

    me.setModel();
  },
  /*
   * @param {Object} data
   * @return {Array}
   */
  getFieldsFromData: function(data){
    var items = data.items || data;

    if( data.fields){
      return data.fields;
    }

    if( !items ){
      throw new Error('not set fields of data');
    }

    var itemZero = items[0],
      fields = [];

    if(items.length === undefined){
      itemZero = items;
    }

    for(var p in itemZero){
      fields.push(p);
    }

    return fields;
  },
  /*
   * @param {String|Number} key
   * @param {Object} options
   * @return {Array}
   */
  getColumnOriginalValues: function(key, options){
    var me = this,
      i = 0,
      values = [],
      options = options || {},
      dataProperty = options.dataProperty || 'data',
      data = me[dataProperty],
      iL = data.length;

    if(options.smartIndexFn){
      for(;i<iL;i++){
        values.push(options.smartIndexFn(data[i].data));
      }
    }
    else{
      if(options.format){
        if(options.type === 'date'){
          for (; i < iL; i++) {
            var value = data[i].data[key];

            if(value === null){
              values.push(Math.NEGATIVE_INFINITY);
            }
            else {
              values.push(Fancy.Date.parse(value, options.format, options.mode));
            }
          }
        }
        else{
          for (; i < iL; i++) {
            values.push(data[i].data[key]);
          }
        }
      }
      else {
        if(options.groupMap){
          me.groupMap = {};

          for (; i < iL; i++) {
            var item = data[i],
              value = item.data[key];

            values.push(value);
            me.groupMap[item.id] = value;
          }
        }
        else {
          for (; i < iL; i++) {
            var itemData = data[i].data || data[i];
            values.push(itemData[key]);
          }
        }
      }
    }

    return values;
  },
  /*
   * @param {Object} [o]
   */
  changeDataView: function(o){
    var me = this,
      o = o || {},
      groupBy,
      dataView = [],
      dataViewMap = {},
      i = 0,
      iL = me.data.length,
      isFiltered = !!me.filters,
      isSearched = !!me.searches,
      data = me.data;

    if(isFiltered) {
      if (!o.stoppedFilter && !o.doNotFired) {
        me.filterData();
      }
      else if (me.paging && me.pageType === 'server') {
        return;
      }

      if (!me.remoteFilter) {
        data = me.filteredData;

        if(data === undefined){
          data = me.data;
        }

        iL = data.length;
      }
    }

    if(isSearched) {
      me.searchData();
      data = me.searchedData;
      iL = data.length;
    }

    me.dataViewIndexes = {};
    me.dataViewMap = {};

    if(me.paging){
      if( me.pageType === 'server' ){
        i = 0;
      }
      else {
        i = me.showPage * me.pageSize;
      }

      iL = i + me.pageSize;
    }

    var totalCount = me.getTotal();

    if(iL > me.data.length){
      iL = me.data.length;
    }

    if(isFiltered && iL > totalCount){
      iL = totalCount;
    }

    if(Fancy.isObject(me.data)){
      iL = 0;
    }

    var item;

    if(me.order){
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[me.order[i]].data[groupBy] ] ){
            if(isFiltered === true){
              me.dataViewIndexes[dataView.length] = me.filterOrder[i];
              item = data[ i ];
            }
            else {
              me.dataViewIndexes[dataView.length] = me.order[i];
              item = data[me.order[i]];
            }

            dataView.push( item );

            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          if(isFiltered === true){
            me.dataViewIndexes[dataView.length] = me.filterOrder[i];
            item = data[ i ]
          }
          else {
            me.dataViewIndexes[dataView.length] = me.order[i];
            item = data[me.order[i]];
          }

          dataView.push( item );
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }
    else{
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[i].data[groupBy] ] ){
            me.dataViewIndexes[dataView.length] = i;
            item = data[i];
            dataView.push(item);
            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          me.dataViewIndexes[dataView.length] = i;
          item = data[i];
          dataView.push(data[i]);
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;

    if(!o.doNotFired){
      me.fire('change');
    }
  },
  /*
   * @param {String|Number} key
   * @param {Function} fn
   * @return {Array}
   */
  getColumnData: function(key, fn){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    if(fn){
      for (; i < iL; i++) {
        _data.push(fn(me.data[i].data));
      }
    }
    else {
      for (; i < iL; i++) {
        _data.push(me.data[i].data[key]);
      }
    }

    return _data;
  },
  /*
   * @return {Array}
   */
  getData: function(){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.data[i].data);
    }

    return _data;
  },
  /*
   * @return {Array}
   */
  getDataView: function(){
    var me = this,
      i = 0,
      iL = me.dataView.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.dataView[i].data);
    }

    return _data;
  },
  /*
   * @param {String} id
   * @return {Fancy.Model}
   */
  getById: function(id){
    var me = this;

    return me.map[id];
  },
  /*
   * @param {String} id
   * @param {String} newId
   */
  changeItemId: function(id, newId){
    var me = this,
      item = me.getById(id);

    if(!item){
      return false;
    }

    item.id = newId;
    if(item.data.id !== undefined){
      item.data.id = newId;
    }

    delete  me.map[id];
    me.map[newId] = item;
    me.fire('changeitemid', id, newId);
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   * @param {Boolean} [complex]
   * @return {Array}
   */
  find: function(key, value, complex){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length,
      item,
      founded = [];

    if(complex){
      iL = me.data.length;
      for (; i < iL; i++) {
        if(me.order){
          item = me.data[me.order[i]];
        }
        else {
          item = me.data[i];
        }

        if (item.data[key] === value) {
          founded.push(i);
        }
      }
    }
    else {
      for (; i < iL; i++) {
        item = dataView[i];

        if (item.data[key] === value) {
          founded.push(i);
        }
      }
    }

    return founded;
  },
  /*
   * @param {String} key
   * @param {*} value
   * @return {Array}
   */
  findItem: function(key, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded = [];

    for(;i<iL;i++){
      item = data[i];

      if(item.data[key] === value){
        founded.push(item);
      }
    }

    return founded;
  },
  /*
   * @param {String} id
   * @return {Array}
   */
  getDataIndex: function(id){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded;

    for(;i<iL;i++){
      item = data[i];

      if(item.data['id'] === id){
        founded = i;
      }
    }

    return founded;
  },
  /*
   * @param {Function} fn
   * @param {Object} scope
   */
  each: function(fn, scope){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length;

    if(scope){
      for(;i<iL;i++){
        fn.apply(this, [dataView[i]]);
      }
    }
    else{
      for(;i<iL;i++){
        fn(dataView[i]);
      }
    }
  },
  /*
   *
   */
  readSmartIndexes: function(){
    var me = this,
      w = me.widget,
      numOfSmartIndexes = 0,
      smartIndexes = {};

    Fancy.each(w.columns, function(column){
      if(column.smartIndexFn){
        smartIndexes[column.index] = column.smartIndexFn;
        numOfSmartIndexes++;
      }
    });

    if(numOfSmartIndexes){
      me.smartIndexes = smartIndexes;
    }
  },
  destroy: function () {
    var me = this;

    Fancy.each(me.data, function (item) {
      delete item.data;
      delete item.id;
    });

    me.data = [];
    me.map = {};
    me.dataView = [];
    me.dataViewIndexes = {};
    me.dataViewMap = {};
  }
});
Fancy.$ = window.$ || window.jQuery;
Fancy.nojQuery = Fancy.$ === undefined;

/*
 * @param {String|Number} id
 * @return {Fancy.Element}
 */
Fancy.get = function(id){
  var type = Fancy.typeOf(id);

  switch(type){
    case 'string':
      return new Fancy.Element(Fancy.$('#'+id)[0]);
      break;
    case 'array':
      return new Fancy.Elements(id);
      break;
    default:
      return new Fancy.Element(id);
      break;
  }
};

/*
 * @class Fancy.Element
 */
Fancy.Element = function(dom){
  var me = this;

  me.dom = dom;
  me.$dom = Fancy.$(dom);
  me.length = 1;
};

Fancy.Element.prototype = {
  /*
   * @return {Fancy.Element}
   */
  last: function () {
    return Fancy.get(this.$dom);
  },
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  closest: function(selector){
    return Fancy.get(this.$dom.closest(selector)[0]);
  },
  /*
   *
   */
  destroy: function(){
    this.$dom.remove();
  },
  /*
   *
   */
  remove: function(){
    this.$dom.remove();
  },
  /*
   *
   */
  finish: function(){
    this.$dom.finish();
  },
  //Not Used
  /*
   *
   */
  prev: function(){
    return Fancy.get(this.$dom.prev()[0]);
  },
  /*
   * @return {Fancy.Element}
   */
  lastChild: function(){
    var childs = this.$dom.children();

    return Fancy.get(childs[childs.length - 1]);
  },
  /*
   * @return {Fancy.Element}
   */
  firstChild: function(){
    return Fancy.get(this.$dom.children()[0]);
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  on: function(eventName, fn, scope, delegate) {
    var me = this;

    if(scope){
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.on(eventName, delegate, fn);
    }
    else{
      me.$dom.on(eventName, fn);
    }

    //bad bug fixes
    switch(eventName){
      case 'mouseenter':
        if(me.onTouchEnterEvent){
          me.onTouchEnterEvent(eventName, fn, scope, delegate);
        }
        break;
      case 'mouseleave':
        if(me.onTouchLeaveEvent){
          me.onTouchLeaveEvent(eventName, fn, scope, delegate);
        }
        break;
      case 'mousemove':
        if(me.onTouchMove){
          me.onTouchMove('touchmove', fn);
        }
        break;
    }
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  once: function(eventName, fn, scope, delegate) {
    var me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.one(eventName, delegate, fn);
    }
    else{
      me.$dom.one(eventName, fn);
    }
  },
  /*
   * @param {String} name
   * @return {String}
   */
  prop: function(name){
    return this.$dom.prop(name);
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  un: function(eventName, fn, scope, delegate) {
    var me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.off(eventName, delegate, fn);
    }
    else{
      me.$dom.off(eventName, fn);
    }
  },
  /*
   *
   */
  show: function(){
    this.$dom.show();
  },
  /*
   *
   */
  hide: function(){
    this.$dom.hide();
  },
  /*
   * @param {String} oldCls
   * @param {String} newCls
   */
  replaceClass: function(oldCls, newCls){
    this.$dom.removeClass(oldCls);
    this.$dom.addClass(newCls);
  },
  /*
   * @param {String} tag
   * @return {Fancy.Element}
   */
  getByTag: function(tag){
    return Fancy.get(this.$dom.find(tag)[0]);
  },
  getByClass: function(cls){
    return this.$dom.find('.'+cls)[0];
  },
  /*
   * @param {String} cls
   */
  addClass: function(cls){
    this.addCls.apply(this, arguments);
  },
  /*
   * @param {String} cls
   */
  addCls: function(cls){
    this.$dom.addClass(cls);

    if(arguments.length > 1){
      var i = 1,
        iL = arguments.length;

      for (;i<iL;i++){
        this.addClass(arguments[i]);
      }
    }
  },
  /*
   * @param {String} cls
   */
  removeClass: function(cls){
    this.$dom.removeClass(cls);
  },
  /*
   * @param {String} cls
   */
  removeCls: function(cls){
    this.$dom.removeClass(cls);
  },
  /*
   * @param {String} cls
   * @return {Boolean}
   */
  hasClass: function(cls){
    return this.$dom.hasClass(cls);
  },
  /*
   * @param {String} cls
   * @return {Boolean}
   */
  hasCls: function(cls){
    return this.$dom.hasClass(cls);
  },
  /*
   * @param {String} cls
   */
  toggleClass: function(cls){
    this.$dom.toggleClass(cls);
  },
  /*
   * @param {String} cls
   */
  toggleCls: function(cls){
    this.$dom.toggleClass(cls);
  },
  /*
   * @param {String} selector
   * @return {Array}
   */
  select: function(selector){
    var me = this,
      founded = me.$dom.find(selector);

    if(founded.length === 1){
      return Fancy.get(founded[0]);
    }
    else if(founded.length > 1){
      return Fancy.get(founded);
    }
    else if(founded.length === 0){
      return {
        length: 0,
        dom: undefined,
        addClass: function(){},
        addCls: function(){},
        removeClass: function(){},
        removeCls: function(){},
        destroy: function(){},
        remove: function(){},
        css: function(){},
        each: function(){},
        last: function(){},
        attr: function () {}
      };
    }

    return founded;
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css: function(o1, o2){
    if( o2 === undefined ){
      return this.$dom.css(o1);
    }
    return this.$dom.css(o1, o2);
  },
  /*
   * @param {*} attr
   * @param {String|Number} o2
   * @return {String|Number}
   */
  attr: function(o1, o2){
    if( o2 === undefined ){
      return this.$dom.attr(o1);
    }
    return this.$dom.attr(o1, o2);
  },
  /*
   * @param {String} html
   * @return {Fancy.Element}
   */
  append: function(html){
    return Fancy.get(this.$dom.append(html)[0]);
  },
  after: function(html){
    return Fancy.get(this.$dom.after(html)[0]);
  },
  next: function(){
    return Fancy.get(this.$dom.next()[0]);
  },
  /*
   *
   */
  insertAfter: function(html){
    return Fancy.get(this.$dom.insertAfter(html)[0]);
  },
  /*
   * @param {String} html
   .* @return {Fancy.Element}
   */
  before: function(html){
    return Fancy.get(this.$dom.before(html)[0]);
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  height: function(value){
    if(value){
      this.$dom.height(value);
      return this;
    }

    return this.$dom.height();
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  width: function(value){
    if(value){
      this.$dom.width(value);
      return this;
    }

    return this.$dom.width();
  },
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  parent: function(selector){
    return Fancy.get(this.$dom.parent(selector)[0]);
  },
  /*
   * @param {String} html
   */
  update: function(html){
    this.dom.innerHTML = html;
  },
  /*
   * @param {Function} overFn
   * @param {Function} outFn
   */
  hover: function(overFn, outFn){
    if(overFn){
      this.$dom.on('mouseenter', overFn);
    }

    if(overFn){
      this.$dom.on('mouseleave', outFn);
    }
  },
  /*
   * @return {Object}
   */
  position: function(){
    return this.$dom.position();
  },
  /*
   * @return {Object}
   */
  offset: function(){
    return this.$dom.offset();
  },
  /*
   *
   */
  focus: function(){
    this.$dom.focus();
  },
  /*
   *
   */
  blur: function(){
    this.$dom.blur();
  },
  /*
   * @param {HTMLElement} child
   * @return {Boolean}
   */
  within: function(child){
    var me = this,
      childId,
      isWithin = true,
      removeId = false;

    child = Fancy.get(child);
    childId = child.attr('id');

    if(childId === undefined || childId === ''){
      childId = Fancy.id();
      removeId = true;
    }

    child.attr('id', childId);

    if( me.select('#' + childId).length === 0 ){
      isWithin = false;
    }

    if(me.dom.id === child.dom.id){
      isWithin = true;
    }

    if(removeId){
      me.removeAttr(childId);
    }

    return isWithin;
  },
  /*
   * @param {String} attr
   */
  removeAttr: function(attr){
    this.$dom.removeAttr(attr);
  },
  /*
   * @return {Fancy.Element}
   */
  item: function(){
    return this;
  },
  /*
   * @param {String} style
   * @param {Number} speed
   * @param {String} easing
   * @param {Function} callback
   */
  animate: function(style,speed,easing,callback){
    var _style = {},
      doAnimating = false;

    for(var p in style){
      var newValue = style[p];

      if(Fancy.isString(newValue)){
        newValue = Number(newValue.replace('px', ''));
      }

      var oldValue = this.css(p);

      if(Fancy.isString(oldValue)){
        oldValue = Number(oldValue.replace('px', ''));
      }

      if(newValue !== oldValue){
        _style[p] = style[p];
        doAnimating = true;
      }
    }

    if(doAnimating === false){
      return;
    }

    this.$dom.animate(_style,speed,easing,callback);
  },
  /*
   *
   */
  stop: function(){
    if(this.$dom.stop){
      this.$dom.stop();
    }
  },
  /*
   * @return {Number}
   */
  index: function(){
    return this.$dom.index();
  },
  onTouchEnterEvent: function(eventName, fn, scope, delegate){
    var me = this,
      docEl = Fancy.get(document.body);

    if(!Fancy.isTouch){
      return;
    }

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) ),
        isWithin = false,
        maxDepth = 10,
        parentEl = targetEl;

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.attr(tempAttr) === tempId ){
          isWithin = true;
          break;
        }
        parentEl = parentEl.parent();
        maxDepth--;
      }

      if( isWithin && !me.touchIn && !delegate){
        e.pageX = touchXY.pageX;
        e.pageY = touchXY.pageY;
        fn(e, target);
        me.touchIn = true;
      }

      if(isWithin && delegate){
        maxDepth = 10;
        parentEl = targetEl;
        var found = false,
          before = targetEl,
          arr = [],
          i = 0;

        while(maxDepth > 0){
          if(!parentEl.dom){
            break;
          }

          var delegates = parentEl.select(delegate);
          if(delegates.length !== 0){
            found = true;
            //var delegateTarget = arr[i - delegate.match(/\./g).length];
            var delegateTarget = me.getDelegateTarget(delegate, delegates, arr, i);

            if(delegateTarget){
              e.currentTarget = delegateTarget;
              e.delegateTarget = delegateTarget;
              e.pageX = touchXY.pageX;
              e.pageY = touchXY.pageY;
              me.touchIn = true;
              me.touchInDelegate = me.touchInDelegate || {};
              if(me.touchInDelegate[delegate] === undefined){
                me.touchInDelegate[delegate] = delegateTarget;
              }
              else if(me.touchInDelegate[delegate] !== delegateTarget){
                me.touchInDelegate[delegate] = [me.touchInDelegate[delegate], delegateTarget];
              }


              fn.apply(scope, [e, delegateTarget]);
            }
            break;
          }

          if(parentEl.attr(tempAttr) === tempId){
            break;
          }

          arr.push(parentEl.dom);
          before = parentEl;
          parentEl = parentEl.parent();
          maxDepth--;
          i++;
        }
      }

      me.removeAttr(tempAttr);
    };

    docEl.on('touchmove', wrappedFn);
  },
  onTouchLeaveEvent: function(eventName, fn, scope, delegate){
    var me = this,
      docEl = Fancy.get(document.body),
      arr = [];

    if(!Fancy.isTouch){
      return;
    }

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      if(me.touchIn !== true){
        me.removeAttr(tempAttr);
        return;
      }

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) );

      if(!delegate){
        var isWithin = false,
          maxDepth = 10,
          parentEl = targetEl;

        while(maxDepth > 0){
          if( !parentEl.dom ){
            break;
          }

          if( parentEl.attr(tempAttr) === tempId ){
            isWithin = true;
            break;
          }
          parentEl = parentEl.parent();
          maxDepth--;
        }

        if(isWithin === false){
          e.pageX = touchXY.pageX;
          e.pageY = touchXY.pageY;

          me.touchIn = false;
          fn(e, target);
          me.removeAttr(tempAttr);
          return;
        }
      }

      if(arr.length > 30){
        arr = arr.slice(arr.length - 5, arr.length - 1);
      }

      arr.push(targetEl.dom);

      if(delegate && me.touchInDelegate[delegate]){
        var delegateTarget,
          delegateTempId = Fancy.id();

        if(Fancy.isArray(me.touchInDelegate[delegate])){
          delegateTarget = Fancy.get(me.touchInDelegate[delegate][0]);
        }
        else{
          delegateTarget = Fancy.get(me.touchInDelegate[delegate]);
        }

        delegateTarget.attr(tempAttr, delegateTempId);

        maxDepth = 10;
        var found = false;
        parentEl = targetEl;

        while(maxDepth > 0){
          if( !parentEl.dom ){
            break;
          }

          if( parentEl.attr(tempAttr) === delegateTempId ){
            found = true;
            break;
          }

          parentEl = parentEl.parent();
          maxDepth--;
        }

        delegateTarget.removeAttr(tempAttr);

        if(!found){
          delete me.touchInDelegate[delegate];
          me.touchIn = false;

          e.currentTarget = delegateTarget.dom;
          e.delegateTarget = delegateTarget.dom;
          e.pageX = touchXY.pageX;
          e.pageY = touchXY.pageY;

          fn(e, delegateTarget.dom);
        }
      }

      me.removeAttr(tempAttr);
    };

    docEl.on('touchmove', wrappedFn);
  },
  getDelegateTarget: function(delegate, delegates, arr, _i){
    var fastGetDelegate = arr[_i - delegate.match(/\./g).length],
      i = 0,
      iL = delegates.length;

    for(;i<iL;i++){
      if(delegates.item(i).dom === fastGetDelegate){
        return fastGetDelegate;
      }
    }

    return false;
  },
  onTouchMove: function(eventName, fn, scope){
    var me = this,
      docEl = Fancy.get(document.body);

    if(!Fancy.isTouch){
      return;
    }

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        isWithin = false,
        maxDepth = 10,
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) ),
        parentEl = targetEl;

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.attr(tempAttr) === tempId ){
          isWithin = true;
          break;
        }
        parentEl = parentEl.parent();
        maxDepth--;
      }

      me.removeAttr(tempAttr);

      if(!isWithin){
        return;
      }

      e.pageX = touchXY.pageX;
      e.pageY = touchXY.pageY;

      fn(e, target);
    };

    docEl.on('touchmove', wrappedFn);
  },
  each: function (fn) {
    fn(this, 0);
  }
};

/*
 * @class Fancy.Elements
 * @constructor
 * @param {HTMLElement|HTMLElements} dom
 */
Fancy.Elements = function(dom){
  var me = this;

  me.dom = dom;
  me.$dom = dom;
  me.length = dom.length;
};

Fancy.Elements.prototype = {
  attr: function(o1, o2){
    var me = this,
      dom = me.$dom;

    if(me.length > 1){
      dom = me.$dom[0]
    }

    if( o2 === undefined ){
      return dom.attr(o1);
    }

    return dom.attr(o1, o2);
  },
  /*
   * @param {String} cls
   */
  addClass: function(cls){
    this.addCls.apply(this, arguments);
  },
  /*
   *
   */
  finish: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).finish();
    }
  },
  /*
   * @param {String} cls
   */
  addCls: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).addClass(cls);
    }

    if(arguments.length > 1){
      i = 1;
      iL = arguments.length;

      for(;i<iL;i++){
        me.addClass(arguments[i]);
      }
    }
  },
  /*
   * @param {String} cls
   */
  removeClass: function(cls){
    this.removeCls.apply(this, arguments);
  },
  /*
   * @param {String} cls
   */
  removeCls: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).removeCls(cls);
    }
  },
  /*
   * @param {Function} fn
   */
  hover: function(fn){
    this.$dom.on('mouseenter', fn);
  },
  /*
   *
   */
  on: Fancy.Element.prototype.on,
  /*
   *
   */
  once: Fancy.Element.prototype.once,
  /*
   * @param {Number} index
   * @return {Fancy.Element}
   */
  item: function(index){
    return Fancy.get(this.$dom[index]);
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css: function(o1, o2){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).css(o1, o2);
    }
  },
  /*
   * @param {String} cls
   */
  toggleClass: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).toggleClass(cls);
    }
  },
  /*
   * @param {String} cls
   */
  toggleCls: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).toggleClass(cls);
    }
  },
  /*
   *
   */
  destroy: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).destroy();
    }
  },
  /*
   *
   */
  remove: function(){
    this.destroy();
  },
  /*
   *
   */
  hide: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).hide();
    }
  },
  /*
   *
   */
  show: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).show();
    }
  },
  /*
   * @return {Number}
   */
  index: function(){
    return this.$dom[0].index();
  },
  /*
   * @param {Function} fn
   */
  each: function(fn){
    var me = this,
      i = 0,
      iL = me.length,
      el;

    for(;i<iL;i++){
      el = new Fancy.Element(me.$dom[i]);

      fn(el, i);
    }
  },
  last: function(){
    var me = this;

    return new Fancy.Element(me.$dom[me.length - 1]);
  }
};

/*
 * @param {String} selector
 */
Fancy.select = function(selector){
  return Fancy.get(document.body).select(selector);
};

/*
  Fancy.onReady
*/

/*
 * @param {Function} fn
 */
Fancy.onReady = function(fn){
  Fancy.$(document).ready(fn);
};

/**
 * @example:
 * Fancy.Ajax({
 *   url: 'users.json',
 *   success: function(){
 *     console.log(arguments);
 *   }
 * });
 */

/*
 * @param {Object} o
 */
Fancy.Ajax = function(o){
  var _o = {};

  if( o.url ){
    _o.url = o.url;
  }

  if( o.success ){
    _o.success = o.success;
  }

  if( o.error ){
    _o.error = o.error;
  }

  if( o.method ){
    //_o.type = o.type;
    _o.type = o.method;
  }

  if( o.params ){
    _o.data = o.params;
  }

  if(o.dataType){
    _o.dataType = o.dataType;
  }

  if(o.sendJSON){
    _o.dataType = 'json';
    _o.contentType = "application/json; charset=utf-8";
    _o.data = JSON.stringify(_o.data);
  }

  if(o.getJSON){
    _o.dataType = 'json';
    _o.contentType = "application/json; charset=utf-8";
  }

  if(o.headers){
    _o.headers = o.headers;
  }

  Fancy.$.ajax(_o);
};
/**
 * English Translations
 */

Fancy.i18n.en = {
  paging: {
    first: 'First Page',
    last: 'Last Page',
    prev: 'Previous Page',
    next: 'Next Page',
    info: 'Rows [0] - [1] of [2]',
    page: 'Page',
    of: 'of [0]'
  },
  loadingText: 'Loading...',
  thousandSeparator: ',',
  decimalSeparator: '.',
  currencySign: '$',
  sourceText: 'Source',
  date: {
    read: 'm/d/Y',
    write: 'm/d/Y',
    edit: 'm/d/Y',
    today: 'Today',
    startDay: 0,
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    am: 'am',
    pm: 'pm',
    AM: 'AM',
    PM: 'PM',
    ok: 'OK',
    cancel: 'Cancel'
  },
  yes: 'Yes',
  no: 'No',
  dragText: '[0] selected row[1]',
  update: 'Update',
  cancel: 'Cancel',
  columns: 'Columns',
  sortAsc: 'Sort ASC',
  sortDesc: 'Sort DESC',
  lock: 'Lock',
  unlock: 'Unlock',
  rightLock: 'Right Lock'
};

Fancy.i18n['en-US'] = Fancy.i18n.en;
Fancy.controllers = {

};

/*
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineController = function(name, o){
  Fancy.controllers[name] = o;
};

Fancy.defineControl = Fancy.defineController;

/*
 * @param {String} name
 * @return {Object}
 */
Fancy.getController = function(name){
  return Fancy.controllers[name];
};

Fancy.getControl = Fancy.getController;
/**
 * @class Fancy.DD
 * @singleton
 * @extends Fancy.Event
 */
Fancy.define('Fancy.DD', {
  extend: Fancy.Event,
  singleton: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);
    this.init();
  },
  /*
   *
   */
  init: function(){
    this.addEvents();
    this.els = {};
  },
  /*
   * @param {Object} o
   */
  add: function(o){
    var me = this,
      id = Fancy.id(o.overEl);

    /*
      {
        dragEl: El,
        overEl: El
      }
    */

    me.els[id] = o;
    //o.dragEl.on('mousedown', me.onMouseDown, me);
    o.overEl.on('mousedown', me.onMouseDown, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDown: function(e){
    var me = this,
      doc = Fancy.get(document),
      overEl = Fancy.get(e.currentTarget),
      dragEl = me.els[overEl.attr('id')].dragEl;

    e.preventDefault();

    me.clientX = e.clientX;
    me.clientY = e.clientY;

    me.startX = parseInt(dragEl.css('left'));
    me.startY = parseInt(dragEl.css('top'));

    me.activeId = overEl.attr('id');

    doc.once('mouseup', me.onMouseUp, me);
    doc.on('mousemove', me.onMouseMove, me);
  },
  /*
   *
   */
  onMouseUp: function(){
    var doc = Fancy.get(document);

    doc.un('mousemove', this.onMouseMove, this);
  },
  /*
   * @param {Object} e
   */
  onMouseMove: function(e){
    var me = this,
      activeO = me.els[me.activeId],
      dragEl = activeO.dragEl,
      clientX = e.clientX,
      clientY = e.clientY,
      deltaX = me.clientX - clientX,
      deltaY = me.clientY - clientY,
      left = me.startX - deltaX,
      top = me.startY - deltaY;

    if(top < 0){
      top = 0;
    }

    dragEl.css({
      left: left,
      top: top
    });
  }
});
/**
 * @class Fancy.Widget
 * @extends Fancy.Event
 */
Fancy.define('Fancy.Widget', {
  extend: Fancy.Event,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config);

    me.preInitControls();
    me.Super('const', arguments);

    me.init();
    me.initControls();
  },
  /*
   *
   */
  init: function(){
    //not runned in grid
    //maybe to redo that run
    var me = this;

    me.initId();
    me.addEvents(
      'beforerender', 'afterrender', 'render', 'show', 'beforehide', 'hide', 'destroy'
    );
    me.initPlugins();
  },
  /*
   * @param {String|HTMLElement}
   */
  renderItems: function(renderTo){
    var me = this;

    Fancy.each(me.items, function(item, i){
      var w = Fancy.getClassByType(item.type);

      item.renderTo = renderTo;
      me.items[i] = new w(item);
    });
  },
  /*
   *
   */
  preInitControls: function(){
    var me = this,
      controller = me.controller || me.controllers;

    if(controller){
      switch(Fancy.typeOf(controller)){
        case 'string':
          controller = Fancy.getController(controller);

          for(var p in controller){
            if(me[p] === undefined ) {
              me[p] = controller[p];
            }
          }
          break;
        case 'array':
          var controls = [],
            i = 0,
            iL = controller.length;

          for(;i<iL;i++){
            var _controller = Fancy.getController(controller[i]);

            for(var p in _controller){
              if(p === 'controls'){
                controls = controls.concat(_controller.controls);
                continue;
              }

              if(me[p] === undefined ) {
                me[p] = _controller[p];
              }
            }
          }

          me.controls = controls;

          break;
      }
    }
  },
  /*
   *
   */
  initControls: function(){
    var me = this;

    if(me.controls === undefined){
      return;
    }

    var controls = me.controls,
      i = 0,
      iL = controls.length;

    for(;i<iL;i++){
      var control = controls[i];

      if(control.event === undefined){
        throw new Error('[FancyGrid Error]: - not set event name for control');
      }

      if(control.handler === undefined){
        throw new Error('[FancyGrid Error]: - not set handler for control');
      }

      var event = control.event,
        handler = control.handler,
        scope = control.scope || me,
        selector = control.selector;

      if(Fancy.isString(handler)){
        handler = me[handler];
      }

      if(selector) {
        (function (event, handler, scope, selector) {
          if(me.$events[event]){
            me.on(event, function(grid, o){
              var target = o.e.target,
                el = Fancy.get(target),
                parentEl = el.parent(),
                selectored = parentEl.select(selector);

              if(selectored.length === 1 && selectored.within(target)){
                handler.apply(scope, arguments);
              }
              else if(selectored.length > 1){
                var j = 0,
                  jL = selectored.length;

                for(;j<jL;j++){
                  if( selectored.item(j).within(target) ){
                    handler.apply(scope, arguments);
                  }
                }
              }
            }, scope);
          }
          else {
            me.on('render', function () {
              me.el.on(event, handler, scope, selector);
            });
          }
        })(event, handler, scope, selector);
      }
      else if(selector === undefined && control.widget === undefined){
        me.on(event, handler, scope);
      }
    }
  },
  /*
   * @param {String|Object} o1
   * @param {Number|String} [o2]
   */
  css: function(o1, o2){
    return this.el.css(o1, o2);
  },
  /*
   * @param {String} value
   */
  addClass: function(value){
    this.el.addCls(value);
  },
  /*
   * @param {String} value
   */
  addCls: function(value){
    this.el.addCls(value);
  },
  /*
   * @param {String} value
   */
  removeClass: function(value){
    this.el.removeCls(value);
  },
  /*
 * @param {String} value
 */
  removeCls: function(value){
    this.el.removeCls(value);
  },
  /*
   * @param {String} value
   */
  hasClass: function(value){
    return this.el.hasCls(value);
  },
  /*
   * @param {String} value
   */
  hasCls: function(value){
    return this.el.hasCls(value);
  },
  /*
   * @param {String} value
   */
  toggleClass: function(value){
    this.el.toggleCls(value);
  },
  /*
   * @param {String} value
   */
  toggleCls: function(value){
    this.el.toggleCls(value);
  },
  /*
   *
   */
  destroy: function(){
    if(this.el){
      this.el.destroy();
    }
  },
  /*
   *
   */
  show: function() {
    this.el.show();
  },
  /*
   *
   */
  hide: function() {
    this.el.hide();
  },
  /*
   *
   */
  initTpl: function(){
    var me = this;

    if(!me.tpl){
      return;
    }

    me.tpl = new Fancy.Template(me.tpl);
  }
});
/*
 * @class Fancy.Plugin
 */
Fancy.define('Fancy.Plugin', {
  extend: Fancy.Event,
  /*
   * @constructor {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);
    this.init();
  },
  /*
   *
   */
  init: function(){
    this.initId();
    this.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
  },
  /*
   *
   */
  initTpl: function(){
    var tpl = this.tpl;

    if(!tpl){
      return;
    }

    this.tpl = new Fancy.Template(tpl);
  }
});

(function() {
  var toggleGroups = {};

  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CLS = F.GRID_CLS;
  var PANEL_BODY_CLS = F.PANEL_BODY_CLS;
  var BUTTON_CLS = F.BUTTON_CLS;
  var BUTTON_DISABLED_CLS = F.BUTTON_DISABLED_CLS;
  var BUTTON_PRESSED_CLS = F.BUTTON_PRESSED_CLS;
  var BUTTON_IMAGE_CLS = F.BUTTON_IMAGE_CLS;
  var BUTTON_IMAGE_COLOR_CLS = F.BUTTON_IMAGE_COLOR_CLS;
  var BUTTON_TEXT_CLS = F.BUTTON_TEXT_CLS;
  var BUTTON_DROP_CLS = F.BUTTON_DROP_CLS;
  var BUTTON_MENU_CLS = F.BUTTON_MENU_CLS;

  /**
   * @class Fancy.Button
   * @extends Fancy.Widget
   */
  F.define('Fancy.Button', {
    extend: F.Widget,
    minWidth: 30,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function(config, scope){
      var me = this;

      if (config.toggleGroup) {
        toggleGroups[config.toggleGroup] = toggleGroups[config.toggleGroup] || {
            active: false,
            items: []
          };

        toggleGroups[config.toggleGroup].items.push(me);
      }

      me.scope = scope || config.scope || me.scope || me;

      me.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'pressedchange');
      me.Super('init', arguments);

      me.style = me.style || {};

      me.initTpl();
      me.render();
      me.setOns();
    },
    /*
     *
     */
    setOns: function () {
      var me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
      el.on('mouseup', me.onMouseUp, me);
      el.on('mouseover', me.onMouseOver, me);
      el.on('mouseout', me.onMouseOut, me);

      if(me.tip){
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    widgetCls: BUTTON_CLS,
    cls: '',
    extraCls: '',
    disabledCls: BUTTON_DISABLED_CLS,
    pressedCls: BUTTON_PRESSED_CLS,
    buttonImageCls: BUTTON_IMAGE_CLS,
    buttonImageColorCls: BUTTON_IMAGE_COLOR_CLS,
    textCls: BUTTON_TEXT_CLS,
    dropCls: BUTTON_DROP_CLS,
    text: '',
    height: 28,
    paddingTextWidth: 5,
    imageWidth: 20,
    rightImageWidth: 20,
    pressed: false,
    theme: 'default',
    tpl: [
      '<div class="' + BUTTON_IMAGE_CLS + '"></div>',
      '<a class="' + BUTTON_TEXT_CLS + '">{text}</a>',
      '<div class="' + BUTTON_DROP_CLS + '" style="{dropDisplay}"></div>'
    ],
    /*
     *
     */
    render: function(){
      var me = this,
        renderTo,
        el = F.get(document.createElement('div')),
        width = 0,
        charWidth = 7;

      if(me.theme && Fancy.themes[me.theme]){
        charWidth = Fancy.themes[me.theme].config.charWidth;
      }

      me.fire('beforerender');

      if( me.wrapper ){
        me.renderWrapper();
      }

      renderTo = F.get(me.renderTo || document.body).dom;

      if(me.width){
        width = me.width;
      }
      else{
        if(me.text !== false && me.text !== undefined){
          width += me.text.length * charWidth + charWidth*2;
        }
      }

      if(me.imageColor){
        me.imageCls = BUTTON_IMAGE_COLOR_CLS;
      }

      if(width < me.minWidth){
        if(me.text && me.text.length > 0){
          width = me.minWidth;
        }
        else{
          width = me.minWidth;
        }
      }

      if(me.imageCls && me.text){
        width += me.imageWidth;
      }

      if(me.menu){
        width += me.rightImageWidth;
      }

      el.addCls(
        F.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
      );

      if (me.disabled) {
        el.addCls(BUTTON_DISABLED_CLS);
      }

      if(me.menu){
        el.addCls(BUTTON_MENU_CLS);
      }

      el.css({
        width: width + 'px',
        height: me.height + 'px'
      });

      if(me.hidden){
        el.css('display', 'none');
      }

      el.css(me.style || {});

      el.update(me.tpl.getHTML({
        text: me.text || ''
      }));

      if(me.imageCls){
        var imageEl = el.select('.' + BUTTON_IMAGE_CLS);
        if(me.imageColor){
          imageEl.css('background-color', me.imageColor);
        }
        imageEl.css('display', 'block');
        if(F.isString(me.imageCls)){
          imageEl.addCls(me.imageCls);
        }
      }

      if(me.id){
        el.attr('id', me.id);
      }

      me.el = F.get(renderTo.appendChild(el.dom));

      if (me.disabled) {
        me.disable();
      }

      if(me.pressed){
        me.setPressed(me.pressed);
      }

      me.initToggle();

      me.width = width;

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderWrapper: function(){
      var me = this,
        wrapper = me.wrapper,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.get(document.createElement('div'));

      el.css(wrapper.style || {});
      el.addCls(wrapper.cls || '');

      me.wrapper = F.get(renderTo.appendChild(el.dom));

      me.renderTo = me.wrapper.dom;
    },
    /*
     *
     */
    initToggle: function(){
      if (!this.enableToggle) {
        return false;
      }
    },
    /*
     * @param {Boolean} value
     */
    setPressed: function(value, fire){
      var me = this;

      if (value) {
        me.addCls(BUTTON_PRESSED_CLS);
        me.pressed = true;

        if(me.toggleGroup){
          var active = toggleGroups[me.toggleGroup].active;
          if(active){
            active.setPressed(false);
          }

          toggleGroups[me.toggleGroup].active = me;
        }
      }
      else {
        me.removeCls(BUTTON_PRESSED_CLS);
        me.pressed = false;
      }

      if(fire !== false){
        me.fire('pressedchange', me.pressed);
      }
    },
    /*
     *
     */
    toggle: function(){
      var me = this,
        value = !me.pressed;

      me.setPressed(value);
      me.pressed = value;
    },
    /*
     *
     */
    onClick: function(e){
      var me = this,
        handler = me.handler;

      me.fire('click');

      if(me.disabled !== true){
        if(handler){
          if(F.isString(handler)) {
            handler = me.getHandler(handler);
          }

          if (me.scope) {
            handler.apply(me.scope, [me]);
          }
          else {
            handler(me);
          }
        }

        if(me.enableToggle){
          if(me.toggleGroup){
            me.setPressed(true);
          }
          else {
            me.toggle();
          }
        }

        if(me.menu){
          me.toggle();
          me.toggleMenuShow(e);
        }
      }
    },
    /*
     * @param {String} name
     */
    getHandler: function(name){
      var me = this,
        grid = F.getWidget(me.el.closest('.' + PANEL_BODY_CLS).select('.' + GRID_CLS).attr('id'));

      return grid[name] || function(){
          throw new Error('[FancyGrid Error] - handler does not exist');
        };
    },
    /*
     *
     */
    onMouseDown: function(){
      this.fire('mousedown');
    },
    /*
     *
     */
    onMouseUp: function(){
      this.fire('mouseup');
    },
    /*
     * @param {Object} e
     */
    onMouseOver: function(e){
      var me = this;

      me.fire('mouseover');

      if(me.tip){
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip: function(e){
      var me = this;

      if(me.tooltip){
        me.tooltip.destroy();
      }

      me.tooltip = new F.ToolTip({
        text: me.tip
      });

      me.tooltip.css('display', 'block');
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     *
     */
    onMouseOut: function(){
      var me = this;

      me.fire('mouseout');

      if(me.tooltip){
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {String} text
     */
    setText: function(text, width){
      var me = this,
        el = me.el,
        charWidth = 7;

      if(!width){
        width = 0;
      }

      if(!width) {
        if (me.theme && Fancy.themes[me.theme]) {
          charWidth = Fancy.themes[me.theme].config.charWidth;
        }

        width += text.length * charWidth + charWidth * 2;

        if (me.imageColor) {
          me.imageCls = BUTTON_IMAGE_COLOR_CLS;
        }

        if (width < me.minWidth) {
          if (me.text && me.text.length > 0) {
            width = me.minWidth;
          }
          else {
            width = me.minWidth;
          }
        }

        if (me.imageCls && me.text) {
          width += me.imageWidth;
        }

        if (me.menu) {
          width += me.rightImageWidth;
        }

        //me.css('width', ((parseInt(el.css('font-size')) + 2 ) * text.length) + parseInt(me.css('padding-right')) * 2 + 2  );
      }

      me.css('width', width);

      el.select('.' + BUTTON_TEXT_CLS).update(text);
    },
    /*
     *
     */
    disable: function(){
      this.disabled = true;
      this.addCls(BUTTON_DISABLED_CLS);
    },
    /*
     *
     */
    enable: function(){
      this.disabled = false;
      this.removeCls(BUTTON_DISABLED_CLS);
    },
    /*
     *
     */
    onMouseMove: function(e){
      var me = this;

      if(me.tip && me.tooltip){
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    toggleMenuShow: function (e) {
      var me = this,
        p = me.el.$dom.offset(),
        xy = [p.left, p.top + me.el.$dom.height()];

      if(F.isArray(me.menu)){
        me.initMenu();
      }
      else if(!me.menu.type){
        me.initMenu();
      }

      setTimeout(function () {
        me.menu.showAt(xy[0], xy[1]);
      }, 100);
    },
    initMenu: function () {
      var me = this,
        config = {
          theme: me.theme,
          events: [{
            hide: me.onMenuHide,
            scope: me
          }]
        };

      if(F.isObject(me.menu)){
        F.apply(config, me.menu);
      }
      else{
        config.items = me.menu;
      }

      me.menu = new F.Menu(config);
    },
    onMenuHide: function(){
      this.setPressed(false);
    }
  });
})();
/**
 * @class Fancy.SegButton
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.SegButton', {
  extend: Fancy.Widget,
  /*
   * @param {Object} config
   * @param {Object} scope
   */
  constructor: function(config, scope){
    this.scope = scope;
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('toggle');
    me.Super('init', arguments);

    me.style = me.style || {};

    me.render();
  },
  /*
   *
   */
  widgetCls: Fancy.SEG_BUTTON_CLS,
  cls: '',
  extraCls: '',
  text: '',
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo,
      el = Fancy.get(document.createElement('div'));

    me.fire('beforerender');

    renderTo = Fancy.get(me.renderTo || document.body).dom;

    el.addCls(
      Fancy.cls,
      me.widgetCls,
      me.cls,
      me.extraCls
    );

    if(me.hidden){
      el.css('display', 'none');
    }

    me.el = Fancy.get(renderTo.appendChild(el.dom));

    Fancy.each(me.style, function (value, p) {
      me.el.css(p, value);
    });

    me.renderButtons();

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  renderButtons: function(){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length,
      toggleGroup = Fancy.id(null, 'fancy-toggle-group-');

    for(;i<iL;i++){
      var item = items[i];
      item.renderTo = me.el.dom;

      if(me.allowToggle !== false) {
        item.enableToggle = true;
        if(me.multiToggle !== true){
          item.toggleGroup = toggleGroup;
        }
      }

      if(i === 0){
        item.style = {
          'border-right-width': 0,
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0
        };

        if(iL === 1){
          delete item.style['border-right-width'];
        }
      }
      else if(i > 1){
        item.style = {
          'border-left-width': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }
      else{
        item.style = {
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }

      if(items.length > 2 && i !== 0 && i !== iL - 1){
        Fancy.apply(item.style, {
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        });
      }

      me.items[i] = new Fancy.Button(item);
      me.items[i].on('pressedchange', function(button, value){
        me.fire('toggle', button, value, me.getValues());
      });
    }
  },
  getValues: function(){
    var me = this,
      values = [],
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      values.push(items[i].pressed);
    }

    return values;
  },
  /*
   *
   */
  clear: function(fire){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      items[i].setPressed(false, fire);
    }
  },
  /*
   *
   */
  setItems: function (values) {
    var me = this;

    me.el.update('');

    me.items = values;
    me.renderButtons();
  },
  /*
   *
   */
  setActiveItem: function (index, fire) {
    var me = this,
      items = me.items;

    items[index].setPressed(true, fire);
  }
});
/**
 * @class Fancy.toolbar.Tab
 * @extends Fancy.Button
 */
Fancy.define('Fancy.toolbar.Tab', {
  extend: Fancy.Button,
  /*
   * @constructor
   * @param config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);

    Fancy.loadStyle();
  },
  cls: Fancy.BUTTON_CLS + ' ' + Fancy.TAB_TBAR_CLS,
  /*
   *
   */
  render: function(){
    this.Super('render', arguments);
  }
});
/*
 * @mixin Fancy.panel.mixin.PrepareConfig
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FOOTER_STATUS_CLS = F.FOOTER_STATUS_CLS;
  var STATUS_SOURCE_TEXT_CLS = F.STATUS_SOURCE_TEXT_CLS;
  var STATUS_SOURCE_LINK_CLS = F.STATUS_SOURCE_LINK_CLS;
  var FOOTER_SOURCE_CLS = F.FOOTER_SOURCE_CLS;

  Fancy.Mixin('Fancy.panel.mixin.PrepareConfig', {
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigTheme: function (config, originalConfig) {
      var themeName = config.theme || originalConfig.theme,
        themeConfig = Fancy.getTheme(themeName).config;

      if (Fancy.isObject(themeName)) {
        config.theme = themeName.name;
      }

      Fancy.applyIf(config, themeConfig);

      return config;
    },
    //The same in grid
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigFooter: function (config) {
      var footer = config.footer,
        lang = config.lang;

      if (footer) {
        var bar = [];

        if (Fancy.isString(footer.status)) {
          bar.push({
            type: 'text',
            text: footer.status,
            cls: FOOTER_STATUS_CLS
          });
        }

        if (footer.status && footer.source) {
          bar.push('side');
        }

        if (Fancy.isString(footer.source)) {
          bar.push({
            type: 'text',
            text: footer.source,
            cls: FOOTER_SOURCE_CLS
          });
        }
        else if (Fancy.isObject(footer.source)) {
          var text = footer.source.text,
            sourceText = footer.source.sourceText || lang.sourceText;

          if (footer.source.link) {
            var link = footer.source.link;

            link = link.replace('http://', '');
            link = 'http://' + link;

            text = '<span class="' + STATUS_SOURCE_TEXT_CLS + '">' + sourceText + '</span>: <a class="' + STATUS_SOURCE_LINK_CLS + '" href="' + link + '">' + text + '</a>';
          }
          else {
            text = '<span>' + sourceText + ':</span> ' + text;
          }

          bar.push({
            type: 'text',
            text: text,
            cls: FOOTER_SOURCE_CLS
          });
        }

        config.footer = bar;
      }

      return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigLang: function (config, originalConfig) {
      var i18n = originalConfig.i18n || config.i18n,
        lang = Fancy.Object.copy(Fancy.i18n[i18n]);

      if (config.lang) {
        for (var p in config.lang) {
          if (Fancy.isObject(config.lang[p]) === false) {
            lang[p] = config.lang[p];
          }
        }

        lang.paging = {};
        if (config.lang.paging) {
          Fancy.apply(lang.paging, config.lang.paging);
        }

        for (var p in config.lang.paging) {
          if (p === 'paging') {
            continue;
          }

          if (Fancy.isObject(p)) {
            continue;
          }

          lang[p] = config.lang.paging[p];
        }

        lang.date = {};
        if (config.lang.date) {
          Fancy.apply(lang.date, config.lang.date);
        }
      }

      config.lang = lang;

      return config;
    }
  });

})();
/*
 * @mixin Fancy.panel.mixin.methods
 */
Fancy.Mixin('Fancy.panel.mixin.methods', {
  /*
   * @param {String} value
   */
  setTitle: function(value){
    if(this.panel){
      this.panel.setTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getTitle: function(){
    if(this.panel){
      return this.panel.getTitle();
    }
  },
  /*
   * @param {String} value
   */
  setSubTitle: function(value){
    if(this.panel){
      this.panel.setSubTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getSubTitle: function(){
    if(this.panel){
      return this.panel.getSubTitle();
    }
  }
});
/*
 * @mixin Fancy.panel.mixin.DD
 */
Fancy.Mixin('Fancy.panel.mixin.DD', {
  ddCls: Fancy.PANEL_DRAGGABLE_CLS,
  /*
   *
   */
  initDD: function(){
    this.addDDCls();
    this.addDD();
  },
  /*
   *
   */
  addDDCls: function(){
    this.el.addCls(this.ddCls);
  },
  /*
   *
   */
  addDD: function(){
    Fancy.DD.add({
      dragEl: this.el,
      overEl: this.el.select('.' + Fancy.PANEL_HEADER_CLS).item(0)
    });
  }
});
/*
 * @mixin Fancy.panel.mixin.Resize
 */
Fancy.Mixin('Fancy.panel.mixin.Resize', {
  cornerResizeCls: 'fancy-panel-resize-corner',
  resizeMaskCls: 'fancy-panel-resize-mask',
  /*
   *
   */
  initResize: function(){
    var me = this;

    me.activeResizeEl = undefined;

    me.renderResizeEls();
    me.onsResizeEls();
  },
  /*
   *
   */
  renderResizeEls: function(){
    var me = this,
      el = me.el,
      cornerEl = Fancy.get(document.createElement('div'));

    cornerEl.addCls(me.cornerResizeCls);

    me.cornerResizeEl = Fancy.get(el.dom.appendChild(cornerEl.dom));
  },
  /*
   *
   */
  onResize: function(){
    var me = this;

    if(me.tbar){
      me._tbar.applyScrollChanges();
    }

    if(me.subTBar){
      me._subTBar.applyScrollChanges();
    }

    if(me.bbar){
      me._bbar.applyScrollChanges();
    }

    if(me.footer){
      me._footer.applyScrollChanges();
    }

    if(me.buttons){
      me._buttons.applyScrollChanges();
    }
  },
  /*
   * @param {Boolean} initRun
   */
  onsResizeEls: function(initRun){
    var me = this;

    if(Fancy.isTouch){
      me.cornerResizeEl.on('touchstart', me.onMouseDownResizeEl, me);
    }
    else {
      me.cornerResizeEl.on('mousedown', me.onMouseDownResizeEl, me);
    }

    me.on('resize', me.onResize, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownResizeEl: function(e){
    var me = this,
      docEl = Fancy.get(document);

    e.preventDefault();

    if(Fancy.isTouch){
      var _e = e.originalEvent.changedTouches[0];

      docEl.once('touchend', me.onMouseUpResize, me);
      docEl.on('touchmove', me.onMouseMoveResize, me);

      me.renderResizeMask();

      me.startClientX = _e.clientX;
      me.startClientY = _e.clientY;
    }
    else{
      docEl.once('mouseup', me.onMouseUpResize, me);
      docEl.on('mousemove', me.onMouseMoveResize, me);

      me.renderResizeMask();

      me.startClientX = e.clientX;
      me.startClientY = e.clientY;
    }
  },
  /*
   *
   */
  onMouseUpResize: function(){
    var me = this,
      docEl = Fancy.get(document);

    delete me.activeResizeEl;
    me.resizeMaskEl.destroy();

    delete me.startClientX;
    delete me.startClientY;

    docEl.un('mousemove', me.onMouseMoveResize, me);

    me.setWidth(me.newResizeWidth);
    me.setHeight(me.newResizeHeight);

    me.fire('resize', {
      width: me.newResizeWidth,
      height: me.newResizeHeight
    });
  },
  /*
   * @param {Object} e
   */
  onMouseMoveResize: function(e){
    var me = this,
      clientX = e.clientX,
      clientY = e.clientY;

    if(Fancy.isTouch){
      var _e = e.originalEvent.changedTouches[0];

      clientX = _e.clientX;
      clientY = _e.clientY;
    }

    var deltaX = me.startClientX - clientX,
      deltaY = me.startClientY - clientY,
      newWidth = me.startResizeWidth - deltaX,
      newHeight = me.startResizeHeight - deltaY;

    e.preventDefault();
    e.stopPropagation();

    if(newWidth < me.minWidth){
      newWidth = me.minWidth;
    }

    if(newHeight < me.minHeight){
      newHeight = me.minHeight;
    }

    me.newResizeWidth = newWidth;
    me.newResizeHeight = newHeight;

    me.resizeMaskEl.css({
      width: newWidth,
      height: newHeight
    })
  },
  /*
   *
   */
  renderResizeMask: function(){
    var me = this,
      el = me.el,
      maskWidth = 2;

    var maskEl = Fancy.get(document.createElement('div')),
      panelTop = parseInt(el.css('top')),
      panelLeft = parseInt(el.css('left')),
      panelWidth = parseInt(el.css('width')) - maskWidth * 2,
      panelHeight = parseInt(el.css('height')) - maskWidth * 2,
      panelZIndex = parseInt(el.css('z-index'));

    me.startResizeWidth = panelWidth;
    me.startResizeHeight = panelHeight;

    if(!me.window && el.css('position') !== 'absolute'){
      var offset = el.offset();

      panelTop = offset.top;
      panelLeft = offset.left;
    }

    maskEl.addCls(me.resizeMaskCls);

    maskEl.css({
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
      'z-index': panelZIndex
    });

    me.resizeMaskEl = Fancy.get(document.body.appendChild(maskEl.dom));
  }
});
/*
 * @class Fancy.Panel
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var MODAL_CLS = F.MODAL_CLS;
  var PANEL_CLS = F.PANEL_CLS;
  var PANEL_HEADER_CLS = F.PANEL_HEADER_CLS;
  var PANEL_SUB_HEADER_TEXT_CLS = F.PANEL_SUB_HEADER_TEXT_CLS;
  var PANEL_HEADER_TEXT_CLS = F.PANEL_HEADER_TEXT_CLS;
  var PANEL_HEADER_TOOLS_CLS = F.PANEL_HEADER_TOOLS_CLS;
  var PANEL_SUB_HEADER_CLS = F.PANEL_SUB_HEADER_CLS;
  var PANEL_BODY_CLS = F.PANEL_BODY_CLS;
  var PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  var PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_HEADER_IMG_CLS = F.PANEL_HEADER_IMG_CLS;
  var PANEL_NOFRAME_CLS = F.PANEL_NOFRAME_CLS;
  var PANEL_SHADOW_CLS = F.PANEL_SHADOW_CLS;
  var PANEL_FOOTER_CLS = F.PANEL_FOOTER_CLS;
  var FIELD_PICKER_BUTTON_CLS = F.FIELD_PICKER_BUTTON_CLS;

  F.define('Fancy.Panel', {
    extend: F.Widget,
    barScrollEnabled: true,
    tabScrollStep: 50,
    mixins: [
      'Fancy.panel.mixin.DD',
      'Fancy.panel.mixin.Resize'
    ],
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('constructor', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.Super('init', arguments);
      me.addEvents('resize');

      me.initTpl();
      me.render();

      if (me.draggable) {
        me.initDD();
      }

      if (me.resizable) {
        me.initResize();
      }

      if (me.window) {
        me.setActiveWindowWatcher();
      }
    },
    cls: '',
    fieldCls: PANEL_CLS,
    value: '',
    width: 300,
    height: 200,
    titleHeight: 30,
    subTitleHeight: 30,
    barHeight: 37,
    title: undefined,
    frame: true,
    shadow: true,
    draggable: false,
    minWidth: 200,
    minHeight: 200,
    barContainer: true,
    theme: 'default',
    tpl: [
      '<div style="height:{titleHeight}px;" class="'+PANEL_HEADER_CLS+' '+HIDDEN_CLS+'">',
        '{titleImg}',
        '<div class="' + PANEL_HEADER_TEXT_CLS + '">{title}</div>',
        '<div class="' + PANEL_HEADER_TOOLS_CLS + '"></div>',
      '</div>',
      '<div style="height:{subTitleHeight}px;" class="' + PANEL_SUB_HEADER_CLS + ' '+HIDDEN_CLS+'">',
        '<div class="' + PANEL_SUB_HEADER_TEXT_CLS + '">{subTitle}</div>',
      '</div>',
      '<div class="' + PANEL_BODY_CLS + '">',
        '<div class="' + PANEL_TBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
        '<div class="' + PANEL_SUB_TBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
        '<div class="' + PANEL_BODY_INNER_CLS + '"></div>',
        '<div class="' + PANEL_BBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
        '<div class="' + PANEL_BUTTONS_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
        '<div class="' + PANEL_FOOTER_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
      '</div>'
    ],
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body),
        el = F.get(document.createElement('div')),
        minusHeight = 0,
        titleHeight = me.titleHeight,
        subTitleHeight = me.subTitleHeight;

      if(me.renderOuter){
        el = renderTo;
      }

      if(!renderTo.dom){
        throw new Error('[FancyGrid Error 1] - Could not find renderTo element: ' + me.renderTo);
      }

      if (me.window === true) {
        el.css({
          display: 'none',
          position: 'absolute'
        });
      }

      if (me.frame === false) {
        el.addCls(PANEL_NOFRAME_CLS);
      }

      el.addCls(F.cls, me.cls, me.fieldCls);
      if (me.theme !== 'default') {
        el.addCls('fancy-theme-' + me.theme);
      }

      if (me.shadow) {
        el.addCls(PANEL_SHADOW_CLS);
      }

      el.css({
        width: me.width + 'px',
        height: (me.height - minusHeight) + 'px'
      });

      if (me.style) {
        el.css(me.style);
      }

      var titleText = '',
        subTitleText = '';

      if (F.isObject(me.title)) {
        titleText = me.title.text
      }
      else if (F.isString(me.title)) {
        titleText = me.title
      }

      if (F.isObject(me.subTitle)) {
        subTitleText = me.subTitle.text
      }
      else if (F.isString(me.subTitle)) {
        subTitleText = me.subTitle
      }

      var imgCls = '';

      if (F.isObject(me.title) && me.title.imgCls) {
        imgCls = '<div class="' + PANEL_HEADER_IMG_CLS + ' ' + me.title.imgCls + '"></div>';
      }

      el.update(me.tpl.getHTML({
        titleImg: imgCls,
        barHeight: me.barHeight,
        titleHeight: titleHeight,
        subTitleHeight: subTitleHeight,
        title: titleText,
        subTitle: subTitleText
      }));

      if (F.isObject(me.title)) {
        if (me.title.style) {
          el.select('.' + PANEL_HEADER_CLS).css(me.title.style);
        }

        if (me.title.cls) {
          el.select('.' + PANEL_HEADER_CLS).addCls(me.title.cls);
        }

        if (me.title.tools) {
          me.tools = me.title.tools;
        }
      }

      if (F.isObject(me.subTitle)) {
        if (me.subTitle.style) {
          el.select('.' + PANEL_SUB_HEADER_CLS).css(me.subTitle.style);
        }

        if (me.subTitle.cls) {
          el.select('.' + PANEL_SUB_HEADER_CLS).addCls(me.subTitle.cls);
        }
      }

      if (me.title) {
        el.select('.' + PANEL_HEADER_CLS).removeCls(HIDDEN_CLS);
      }
      else {
        el.select('.' + PANEL_BODY_CLS).css('border-top-width', '0px');
      }

      if (me.subTitle) {
        el.select('.' + PANEL_BODY_CLS).css('border-top-width', '0px');
        el.select('.' + PANEL_SUB_HEADER_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.tbar) {
        el.select('.' + PANEL_TBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.subTBar) {
        el.select('.' + PANEL_SUB_TBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.bbar) {
        el.select('.' + PANEL_BBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.buttons) {
        el.select('.' + PANEL_BUTTONS_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.footer) {
        el.select('.' + PANEL_FOOTER_CLS).removeCls(HIDDEN_CLS);
      }

      if(me.renderOuter){
        me.el = el;
      }
      else {
        me.el = renderTo.dom.appendChild(el.dom);
        me.el = F.get(me.el);
      }

      if (me.modal) {
        if (F.select(MODAL_CLS).length === 0) {
          F.get(document.body).append('<div class="'+MODAL_CLS+'" style="display: none;"></div>');
        }
      }

      if (me.id && !me.el.attr('id')) {
        me.el.attr('id', me.id);
      }

      me.renderTools();
      me.renderBars();

      me.setHardBordersWidth();
    },
    /*
     *
     */
    setHardBordersWidth: function () {
      var panelBodyBorders = this.panelBodyBorders;

      this.el.select('.' + PANEL_BODY_CLS).css({
        'border-top-width': panelBodyBorders[0],
        'border-right-width': panelBodyBorders[1],
        'border-bottom-width': panelBodyBorders[2],
        'border-left-width': panelBodyBorders[3]
      })
    },
    /*
     *
     */
    renderTools: function () {
      var me = this,
        tools = me.tools;

      if (tools === undefined) {
        return;
      }

      F.each(tools, function (tool, i) {
        tool.renderTo = me.el.select('.' + PANEL_HEADER_TOOLS_CLS).dom;
        me.tools[i] = new F.Tool(tool, me.scope || me);
      });
    },
    /*
     *
     */
    renderBars: function () {
      var me = this,
        containsGrid = false,
        theme = me.theme,
        scope = this;

      if (me.items && me.items[0]) {
        if (me.items[0].type === 'grid') {
          containsGrid = true;
        }

        scope = me.items[0];
      }

      if (me.bbar) {
        me._bbar = new F.Bar({
          el: me.el.select('.' + PANEL_BBAR_CLS),
          items: me.bbar,
          height: me.barHeight,
          barContainer: me.barContainer,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.bbar = me._bbar.items;
      }

      if (me.buttons) {
        me._buttons = new F.Bar({
          el: me.el.select('.' + PANEL_BUTTONS_CLS),
          items: me.buttons,
          height: me.barHeight,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.buttons = me._buttons.items;
      }

      if (me.tbar) {
        me._tbar = new F.Bar({
          el: me.el.select('.' + PANEL_TBAR_CLS),
          items: me.tbar,
          height: me.barHeight,
          tabEdit: !me.subTBar && containsGrid,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.tbar = me._tbar.items;
      }

      if (me.subTBar) {
        me._subTBar = new F.Bar({
          el: me.el.select('.' + PANEL_SUB_TBAR_CLS),
          items: me.subTBar,
          height: me.barHeight,
          tabEdit: containsGrid,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.subTBar = me._subTBar.items;
      }

      if (me.footer) {
        me._footer = new F.Bar({
          disableScroll: true,
          el: me.el.select('.' + PANEL_FOOTER_CLS),
          items: me.footer,
          height: me.barHeight,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.footer = me._footer.items;
      }
    },
    /*
     * @param {Number} x
     * @param {Number} y
     */
    showAt: function (x, y) {
      this.css({
        left: x + 'px',
        display: '',
        'z-index': 1000 + F.zIndex++
      });

      if (y !== undefined) {
        this.css({
          top: y + 'px'
        });
      }
    },
    /*
     *
     */
    show: function () {
      var me = this;

      me.el.show();

      if (me.window !== true) {
        return;
      }

      if (me.buttons) {
        me._buttons.checkScroll();
      }

      if (me.tbar) {
        me._tbar.checkScroll();
      }

      if (me.bbar) {
        me._bbar.checkScroll();
      }

      if (me.subTBar) {
        me._subTBar.checkScroll();
      }

      var viewSize = F.getViewSize(),
        height = me.el.height(),
        width = me.el.width(),
        xy = [],
        scroll = F.getScroll(),
        scrollTop = scroll[0],
        scrollLeft = scroll[1];

      xy[0] = (viewSize[1] - width) / 2;
      xy[1] = (viewSize[0] - height) / 2;

      if (xy[0] < 10) {
        xy[0] = 10;
      }

      if (xy[1] < 10) {
        xy[1] = 10;
      }

      me.css({
        left: (xy[0] + scrollLeft) + 'px',
        top: (xy[1] + scrollTop) + 'px',
        display: '',
        'z-index': 1000 + F.zIndex++
      });

      if(me.modal){
        F.select('.' + MODAL_CLS).css({
          'display': '',
          'z-index': 1000 + F.zIndex - 2
        });
      }
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.css({
        display: 'none'
      });

      if(me.modal){
        F.select('.' + MODAL_CLS).css('display', 'none');
      }

      F.each(this.items || [], function (item) {
        if (item.type === 'combo') {
          item.hideList();
        }
      });
    },
    /*
     * @param {String} value
     */
    setTitle: function (value) {
      this.el.select('.' + PANEL_HEADER_TEXT_CLS).update(value);
    },
    /*
     * @return {String}
     */
    getTitle: function () {
      return this.el.select('.' + PANEL_HEADER_TEXT_CLS).dom.innerHTML;
    },
    /*
     * @param {String} value
     */
    setSubTitle: function (value) {
      this.el.select('.' + PANEL_SUB_HEADER_TEXT_CLS).update(value);
    },
    /*
     * @return {String}
     */
    getSubTitle: function () {
      return this.el.select('.' + PANEL_SUB_HEADER_TEXT_CLS).dom.innerHTML;
    },
    /*
     * @return {Number}
     */
    getHeight: function () {
      return parseInt(this.css('height'));
    },
    /*
     * @param {String} value
     */
    setWidth: function (value) {
      //TODO: Redo
      this.items[0].setWidth(value);
    },
    /*
     * @param {Number} value
     */
    setHeight: function (value) {
      this.css('height', value);
      this.items[0].setHeight(value, false);
    },
    /*
     *
     */
    setActiveWindowWatcher: function () {
      var me = this;

      me.el.on('mousedown', function (e) {
        var targetEl = F.get(e.target);

        if (targetEl.hasCls(FIELD_PICKER_BUTTON_CLS)) {
          return;
        }

        if (1000 + F.zIndex - 1 > parseInt(me.css('z-index'))) {
          me.css('z-index', 1000 + F.zIndex++);
        }

        F.get(document.body).select('.fancy-active-panel').removeCls('fancy-active-panel');
        me.el.addCls('fancy-active-panel');
      });
    }
  });

})();
/**
 * @class Fancy.Tool
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var BUTTON_CLS = F.BUTTON_CLS;

  F.define('Fancy.Tool', {
    extend: F.Widget,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function (config, scope) {
      this.scope = scope;
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout');
      me.Super('init', arguments);

      me.style = me.style || {};

      me.render();
      me.ons();
    },
    /*
     *
     */
    ons: function () {
      this.el.on('click', this.onClick, this);
    },
    cls: BUTTON_CLS,
    text: '',
    height: 28,
    paddingTextWidth: 5,
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = document.createElement('div');

      me.fire('beforerender');

      el.className = 'fancy-tool-button';
      el.innerHTML = me.text;
      me.el = F.get(renderTo.appendChild(el));

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    onClick: function () {
      var me = this;

      me.fire('click');
      if (me.handler) {
        if (me.scope) {
          me.handler.apply(me.scope, [me]);
        }
        else {
          me.handler(me);
        }
      }
    },
    /*
     * @param {String} value
     */
    setText: function (value) {
      this.el.update(value)
    }
  });

})();
/**
 * @class Fancy.panel.Tab
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  var PANEL_GRID_INSIDE_CLS = F.PANEL_GRID_INSIDE_CLS;
  var TAB_WRAPPER_CLS = F.TAB_WRAPPER_CLS;
  var TAB_ACTIVE_WRAPPER_CLS = F.TAB_ACTIVE_WRAPPER_CLS;
  var TAB_TBAR_ACTIVE_CLS = F.TAB_TBAR_ACTIVE_CLS;
  var PANEL_TAB_CLS = F.PANEL_TAB_CLS;
  var PANEL_CLS = F.PANEL_CLS;
  var GRID_CLS = F.GRID_CLS;

  F.define(['Fancy.panel.Tab', 'Fancy.Tab', 'FancyTab'], {
    extend: F.Panel,
    /*
     * @constructor
     * @param config
     * @param scope
     */
    constructor: function (config, scope) {
      var me = this;

      me.prepareConfigTheme(config);
      me.prepareConfigSize(config);
      me.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.prepareTabs();
      me.Super('init', arguments);

      me.setActiveTab(me.activeTab);
      me.ons();
    },
    activeTab: 0,
    theme: 'default',
    /*
     *
     */
    render: function () {
      var me = this;

      me.Super('render', arguments);

      me.panelBodyEl = me.el.select('.' + PANEL_BODY_INNER_CLS).item(0);

      me.setPanelBodySize();

      me.renderTabWrappers();

      if (!me.wrapped) {
        me.el.addCls(PANEL_GRID_INSIDE_CLS);
      }
      me.el.addCls(PANEL_TAB_CLS);

      me.rendered = true;
    },
    ons: function () {
      var me = this;

      if (me.responsive) {
        F.$(window).bind('resize', function () {
          me.onWindowResize();

          if(me.intWindowResize){
            clearInterval(me.intWindowResize);
          }

          me.intWindowResize = setTimeout(function(){
            me.onWindowResize();
            delete me.intWindowResize;

            //Bug fix for Mac
            setTimeout(function () {
              me.onWindowResize();
            }, 300);
          }, 30);
        });
      }
    },
    onWindowResize: function () {
      var me = this,
        renderTo = me.renderTo,
        el;

      if (me.panel) {
        renderTo = me.panel.renderTo;
      }

      if(me.responsive) {
        el = F.get(renderTo);
      }
      else if(me.panel){
        el = me.panel.el;
      }
      else{
        el = F.get(renderTo);
      }

      if(el.hasClass(PANEL_CLS) || el.hasClass(GRID_CLS)){
        el = el.parent();
      }

      var newWidth = el.width();

      if(el.dom === undefined){
        return;
      }

      if(newWidth === 0){
        newWidth = el.parent().width();
      }

      if(me.responsive) {
        me.setWidth(newWidth);
      }
      else if(me.fitWidth){
        //me.setWidthFit();
      }

      if(me.responsiveHeight){
        var height = parseInt(el.height());

        if(height === 0){
          height = parseInt(el.parent().height());
        }

        me.setHeight(height);
      }
    },
    setPanelBodySize: function () {
      var me = this,
        height = me.height,
        panelBodyBorders = me.panelBodyBorders;

      if (me.title) {
        height -= me.titleHeight;
      }

      if (me.subTitle) {
        height -= me.subTitleHeight;
        height += panelBodyBorders[2];
      }

      if (me.bbar) {
        height -= me.barHeight;
      }

      if (me.tbar) {
        height -= me.barHeight;
      }

      if (me.subTBar) {
        height -= me.barHeight;
      }

      if (me.buttons) {
        height -= me.barHeight;
      }

      if (me.footer) {
        height -= me.barHeight;
      }

      height -= panelBodyBorders[0] + panelBodyBorders[2];

      me.panelBodyEl.css({
        height: height
      });

      me.panelBodyHeight = height;
      me.panelBodyWidth = me.width - panelBodyBorders[1] - panelBodyBorders[3];
      //me.panelBodyWidth = me.width;
    },
    /*
     * @param {Object} config
     */
    prepareConfigTheme: function (config) {
      var me = this,
        themeName = config.theme || me.theme,
        themeConfig = F.getTheme(themeName).config,
        wrapped = me.wrapped || config.wrapped;

      if (wrapped) {
        config.panelBodyBorders = [0, 0, 0, 0];
        me.panelBodyBorders = [0, 0, 0, 0];
      }

      F.applyIf(config, themeConfig);
      F.apply(me, config);
    },
    /*
     * @param {Object} config
     */
    prepareConfigSize: function (config) {
      var me = this,
        renderTo = config.renderTo,
        el;

      if (config.width === undefined) {
        if (renderTo) {
          config.responsive = true;
          el = Fancy.get(renderTo);
          config.width = parseInt(el.width());
        }
      }
    },
    /*
     *
     */
    prepareTabs: function () {
      var me = this,
        tabs = [],
        i = 0,
        iL = me.items.length;

      for (; i < iL; i++) {
        var item = me.items[i],
          tabConfig = {
            type: 'tab'
          };

        if (item.tabTitle) {
          tabConfig.text = item.tabTitle;
        }
        else if (item.title) {
          tabConfig.text = item.title;
          delete item.title;
        }

        tabConfig.handler = (function (i) {
          return function () {
            me.setActiveTab(i);
          }
        })(i);

        tabs.push(tabConfig);
      }

      me.tbar = tabs;
      me.tabs = tabs;
    },
    renderTabWrappers: function () {
      var me = this;

      F.each(me.items, function (item) {
        var el = F.get(document.createElement('div'));

        el.addCls(TAB_WRAPPER_CLS);

        item.renderTo = me.panelBodyEl.dom.appendChild(el.dom);
      });
    },
    setActiveTab: function (newActiveTab) {
      var me = this,
        tabs = me.el.select('.' + TAB_WRAPPER_CLS),
        oldActiveTab = me.activeTab;

      if (me.items.length === 0) {
        return;
      }

      tabs.item(me.activeTab).removeCls(TAB_ACTIVE_WRAPPER_CLS);
      me.activeTab = newActiveTab;

      tabs.item(me.activeTab).addCls(TAB_ACTIVE_WRAPPER_CLS);

      var item = me.items[me.activeTab];

      item.theme = me.theme;
      item.wrapped = true;

      item.width = me.panelBodyWidth;
      item.height = me.panelBodyHeight;

      if (!item.rendered) {
        switch (item.type) {
          case 'form':
            me.items[me.activeTab] = new FancyForm(item);
            break;
          case 'grid':
            me.items[me.activeTab] = new FancyGrid(item);
            break;
          case 'tab':
            me.items[me.activeTab] = new FancyTab(item);
            break;
        }
      }
      else {
        me.setActiveItemWidth();
        me.setActiveItemHeight();
      }

      if (me.tabs) {
        me.tbar[oldActiveTab].removeCls(TAB_TBAR_ACTIVE_CLS);
        me.tbar[me.activeTab].addCls(TAB_TBAR_ACTIVE_CLS);
      }
    },
    /*
     * @param {String} value
     */
    setWidth: function (value) {
      var me = this;

      me.width = value;

      me.css('width', value);
      me.setPanelBodySize();

      me.setActiveItemWidth();
    },
    /*
     * @param {Number} value
     */
    setHeight: function (value) {
      var me = this;

      me.height = value;

      me.css('height', value);
      me.setPanelBodySize();

      me.setActiveItemHeight();
    },
    setActiveItemWidth: function () {
      var me = this;

      me.items[me.activeTab].setWidth(me.panelBodyWidth);
    },
    setActiveItemHeight: function () {
      var me = this;

      me.items[me.activeTab].setHeight(me.panelBodyHeight, false);
    }
  });

  FancyTab.get = function (id) {
    var tabId = F.get(id).select('.' + PANEL_TAB_CLS).dom.id;

    return F.getWidget(tabId);
  };

  if (!F.nojQuery && F.$) {
    F.$.fn.FancyTab = function (o) {
      if(this.selector){
        o.renderTo = $(this.selector)[0].id;
      }
      else{
        o.renderTo = this.attr('id');
      }

      return new FancyTab(o);
    };
  }

})();
/*
 * @class Fancy.Bar
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CLS = F.GRID_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

  var BAR_CLS = F.BAR_CLS;
  var BAR_CONTAINER_CLS = F.BAR_CONTAINER_CLS;
  var BAR_BUTTON_CLS = F.BAR_BUTTON_CLS;
  var BAR_SEG_BUTTON_CLS = F.BAR_SEG_BUTTON_CLS;
  var BAR_LEFT_SCROLLER_CLS = F.BAR_LEFT_SCROLLER_CLS;
  var BAR_RIGHT_SCROLLER_CLS = F.BAR_RIGHT_SCROLLER_CLS;

  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;
  var FIELD_SEARCH_CLS = F.FIELD_SEARCH_CLS;
  var FIELD_SEARCH_LIST_CLS = F.FIELD_SEARCH_LIST_CLS;
  var FIELD_SEARCH_PARAMS_LINK_CLS = F.FIELD_SEARCH_PARAMS_LINK_CLS;
  var FIELD_SEARCH_PARAMED_CLS = F.FIELD_SEARCH_PARAMED_CLS;
  var FIELD_SEARCH_PARAMED_EMPTY_CLS = F.FIELD_SEARCH_PARAMED_EMPTY_CLS;

  var PICKER_MONTH_ACTION_BUTTONS_CLS = F.PICKER_MONTH_ACTION_BUTTONS_CLS;
  var CLEARFIX_CLS = F.CLEARFIX_CLS;

  F.define('Fancy.Bar', {
    extend: F.Widget,
    widgetCls: BAR_CLS,
    containerCls: BAR_CONTAINER_CLS,
    cls: '',
    text: '',
    floating: 'left',
    sideRight: 3,
    scrolled: 0,
    tabOffSet: 5,
    tabScrollStep: 50,
    barScrollEnabled: true,
    /*
     * constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.init();
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.roles = {};
      me.render();

      if (me.barScrollEnabled) {
        me.initScroll();
        setTimeout(function () {
          me.checkScroll();
        }, 150);
      }
    },
    /*
     *
     */
    render: function () {
      var me = this;

      me.renderEl();
      me.renderItems();
      me.initTabEdit();
    },
    /*
     *
     */
    renderEl: function () {
      var me = this;

      if (!me.el) {
        var el = F.get(document.createElement('div'));

        el.addCls(
          me.widgetCls,
          me.cls
        );

        el.update(me.text);

        me.el = F.get(me.renderTo.appendChild(el.dom));

        if (me.style) {
          me.el.css(me.style);
        }
      }

      var containerEl = F.get(document.createElement('div'));
      containerEl.addCls(me.containerCls);

      me.containerEl = F.get(me.el.dom.appendChild(containerEl.dom));
    },
    /*
     *
     */
    renderItems: function () {
      var me = this,
        containerEl = me.containerEl,
        items = me.items || [],
        i = 0,
        iL = items.length,
        isSide = false,
        barItems = [],
        sidePassed = iL - 1,
        passedRight = 0;

      for (; i < iL; i++) {
        var item = items[i];

        if (isSide) {
          item = items[sidePassed];
          sidePassed--;
        }

        if (item.toggleGroup) {
          item.enableToggle = true;
        }

        if (F.isObject(item)) {
          item.type = item.type || 'button';
        }

        if (isSide) {
          me.floating = 'right';
          item.style = item.style || {};
          item.style['right'] = passedRight;
        }

        item.renderTo = containerEl.dom;

        switch (item) {
          case '|':
            var style = {
              'float': me.floating,
              'margin-right': '5px',
              'margin-top': '6px',
              'padding-left': '0px'
            };

            if (me.floating === 'right') {
              F.applyIf(style, {
                right: '1px',
                position: 'absolute'
              });
            }

            barItems.push(new F.Separator({
              //renderTo: el.dom,
              renderTo: containerEl.dom,
              style: style
            }));
            continue;
            break;
          case 'side':
            isSide = true;
            continue;
            break;
          default:
            if (isSide) {
              barItems[sidePassed] = me.renderItem(item);
            }
            else {
              barItems.push(me.renderItem(item));
            }
        }

        if(isSide){
          //TODO: redo with variable
          //Needs variable charWidth from theme
          //Possible place of bug: wrong right value.
          if(item.text){
            passedRight += item.text.length * 7 + 5 + 5 + 5;
          }
          else if(item.width){
            passedRight += item.width + 5;
          }

          if(item.imageCls){
            if(item.imageWidth){
              passedRight += item.imageWidth;
            }
            else{
              passedRight += 20;
            }
          }

          passedRight += 3;
        }
      }

      me.items = barItems;
    },
    /*
     * @param {Object} item
     * @return {Object}
     */
    renderItem: function (item) {
      var me = this,
        field,
        containerEl = me.containerEl,
        theme = me.theme;

      item.style = item.style || {};
      item.label = false;
      item.padding = false;
      item.theme = me.theme;

      F.applyIf(item.style, {
        'float': me.floating
      });

      if (me.floating === 'right') {
        F.applyIf(item.style, {
          right: me.sideRight,
          position: 'absolute'
        });
      }

      if (!item.scope && me.scope) {
        item.scope = me.scope;
      }

      switch (item.type) {
        case 'wrapper':
          if (item.cls === PICKER_MONTH_ACTION_BUTTONS_CLS) {
            containerEl.destroy();
            containerEl = me.el;
          }

          var renderTo = containerEl.append('<div class="' + (item.cls || '') + '"></div>').select('div').item(0),
            i = 0,
            iL = item.items.length,
            _item,
            width = 0;

          for (; i < iL; i++) {
            _item = item.items[i];

            if (F.isObject(_item)) {
              _item.type = _item.type || 'button';
            }

            _item.renderTo = renderTo.dom;
            field = me.renderItem(_item);
            var fieldEl = field.el;

            if (i === iL - 1) {
              fieldEl.css('margin-right', '0px');
            }
            else {
              width += parseInt(fieldEl.css('margin-right'));
            }

            if (F.nojQuery) {
              width += parseInt(fieldEl.width());
            }
            else {
              width += parseInt(fieldEl.$dom.outerWidth());
            }

            width += parseInt(fieldEl.css('margin-left'));

            //width += parseInt(fieldEl.css('padding-left'));
            //width += parseInt(fieldEl.css('padding-right'));
          }

          renderTo.css('width', width);

          break;
        case undefined:
        case 'button':
          item.extraCls = BAR_BUTTON_CLS;
          item.scope = item.scope || me.scope;

          field = new F.Button(item);
          break;
        case 'segbutton':
          item.extraCls = BAR_SEG_BUTTON_CLS;

          F.applyIf(item.style, {
            'margin-right': '6px'
          });

          field = new F.SegButton(item);
          break;
        case 'tab':
          field = new F.toolbar.Tab(item);
          break;
        case 'text':
          F.applyIf(item.style, {
            'margin-right': '10px',
            'padding-left': '0px',
            'padding-top': '11px'
          });

          F.apply(item, {
            renderTo: containerEl.dom,
            cls: item.cls || ''
          });

          field = new F.bar.Text(item);
          break;
        case 'combo':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 70
          });

          field = new F.Combo(item);
          break;
        case 'date':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 100
          });

          field = new F.DateField(item);

          break;
        case 'number':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 35
          });

          field = new F.NumberField(item);

          break;
        case 'checkbox':
          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          field = new F.CheckBox(item);

          break;
        case 'switcher':
          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 35
          });

          field = new F.Switcher(item);

          break;
        case 'string':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 100
          });

          field = new F.StringField(item);
          break;
        case 'search':
          item.inputWidth = 18;

          item.events = item.events || [];

          item.events = item.events.concat([{
            enter: function (field, value) {
              var grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).item(0).attr('id'));

              //this.search(['name', 'surname', 'position'], value);
              //this.search(value);
              //this.search(['a', 'b', 'c']);
              grid.search(value);
              if(grid.expander){
                grid.expander.reSet();
              }
            }
          }, {
            key: function (field, value) {
              var me = this,
                grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).item(0).attr('id'));

              if(grid.filter && grid.filter.autoEnterDelay === false){
                return;
              }

              if (!me.autoEnterTime) {
                me.autoEnterTime = new Date();
              }

              if (me.intervalAutoEnter) {
                clearInterval(me.intervalAutoEnter);
              }
              delete me.intervalAutoEnter;

              me.intervalAutoEnter = setInterval(function () {
                var now = new Date();

                if (now - me.autoEnterTime > 500) {
                  clearInterval(me.intervalAutoEnter);
                  delete me.intervalAutoEnter;
                  value = field.getValue();

                  grid.search(value);

                  if(grid.expander){
                    grid.expander.reSet();
                  }
                }
              }, 200);
            }
          }, {
            render: function (field) {
              var me = this,
                isIn = false;

              field.el.on('mouseenter', function () {
                isIn = true;
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('mousedown', function (e) {
                e.preventDefault();
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('click', function (e) {
                var toShow = false,
                  grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).attr('id')),
                  columns = grid.columns || [],
                  leftColumns = grid.leftColumns || [],
                  rightColumns = grid.rightColumns || [],
                  _columns = columns.concat(leftColumns).concat(rightColumns),
                  items = [],
                  i = 0,
                  iL = _columns.length,
                  height = 1;

                if(grid.searching.items){
                  F.each(grid.searching.items, function (item) {
                    items.push({
                      inputLabel: ' &nbsp;&nbsp;' + item.text,
                      value: true,
                      name: item.index
                    });

                    height += grid.fieldHeight;
                  })
                }
                else {
                  for (; i < iL; i++) {
                    var column = _columns[i],
                      title = column.title;

                    if (title === undefined) {
                      title = '';
                    }

                    if (column.searchable === false) {
                      continue;
                    }

                    switch (column.type) {
                      case 'color':
                      case 'combo':
                      case 'date':
                      case 'number':
                      case 'string':
                      case 'text':
                      case 'currency':
                        break;
                      default:
                        continue;
                    }

                    height += grid.fieldHeight;

                    items.push({
                      inputLabel: ' &nbsp;&nbsp;' + title,
                      value: true,
                      name: column.index
                    });
                  }
                }

                if (!me.list) {
                  me.list = new FancyForm({
                    width: 150,
                    height: height,
                    theme: theme,
                    defaults: {
                      type: 'checkbox',
                      label: false,
                      style: {
                        padding: '8px 16px 0px'
                      }
                    },
                    items: items,
                    cls: FIELD_SEARCH_LIST_CLS,
                    events: [{
                      set: function () {
                        grid.searching.setKeys(me.list.get());
                      }
                    }, {
                      init: function () {
                        setTimeout(function () {
                          var listEl = me.list.el;

                          listEl.on('mouseenter', function () {
                            isIn = true;
                          });

                          listEl.on('mouseleave', function () {
                            isIn = false;
                            setTimeout(function () {
                              if (isIn === false) {
                                if (me.list) {
                                  listEl.css('display', 'none');
                                }
                              }
                            }, 750);
                          });

                          var el = F.get(e.target),
                            offset = el.offset(),
                            fieldHeight = parseInt(field.el.css('height'));

                          listEl.css({
                            position: 'absolute',
                            top: offset.top + fieldHeight + 20,
                            left: offset.left
                          });

                          me.list.el.css('display', 'block');

                          listEl.animate({
                            duration: 200,
                            top: offset.top + fieldHeight - 1
                          });
                        }, 50);
                      }

                    }]
                  });
                }
                else if (me.list.el.css('display') !== 'none') {
                  me.list.el.css('display', 'none');
                  return;
                }
                else {
                  toShow = true;
                }

                var el = F.get(e.target),
                  offset = el.offset(),
                  fieldHeight = parseInt(field.el.css('height'));

                if (me.list && me.list.el) {
                  me.list.css({
                    position: 'absolute',
                    top: offset.top + fieldHeight + 20,
                    left: offset.left
                  });

                  if (toShow) {
                    me.list.css('display', 'block');
                  }

                  me.list.el.animate({
                    duration: 200,
                    top: offset.top + fieldHeight - 1
                  });
                }
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('mouseleave', function () {
                isIn = false;
                setTimeout(function () {
                  if (isIn === false) {
                    if (me.list) {
                      me.list.el.css('display', 'none');
                    }
                  }
                }, 750);
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS)
            }
          }]);

          F.applyIf(item.style, {
            'float': me.floating,
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          var cls = FIELD_SEARCH_CLS;

          if (item.paramsMenu) {
            item.tpl = [
              '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
              '{label}',
              '</div>',
              '<div class="' + FIELD_TEXT_CLS + '">',
              '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputWidth}" value="{value}">',
              '<div class="' + FIELD_SEARCH_PARAMS_LINK_CLS + '" style="">' + (item.paramsText || '&nbsp;') + '</div>',
              '</div>',
              '<div class="' + CLEARFIX_CLS + '"></div>'
            ];

            cls += ' ' + FIELD_SEARCH_PARAMED_CLS;
            if (!item.paramsText) {
              cls += ' ' + FIELD_SEARCH_PARAMED_EMPTY_CLS;
            }
          }

          F.applyIf(item, {
            padding: false,
            width: 250,
            cls: cls,
            emptyText: 'Search'
          });

          field = new F.StringField(item);
          break;
        default:
      }

      if (me.floating === 'right') {
        me.sideRight += field.width;
        me.sideRight += 7;
      }

      if (item.role) {
        me.roles[item.role] = field;
      }

      return field;
    },
    /*
     *
     */
    initScroll: function () {
      var me = this;

      me.leftScroller = new F.Button({
        imageCls: true,
        renderTo: me.el.dom,
        cls: BAR_LEFT_SCROLLER_CLS,
        height: me.height + 2,
        minWidth: 20,
        paddingTextWidth: 0,
        imageWidth: 20,
        width: 0,
        text: false,
        style: {
          position: 'absolute',
          left: -1,
          top: -1,
          display: 'none'
        },
        listeners: [{
          click: me.onPrevScrollClick,
          scope: me
        }]
      });

      me.rightScroller = new F.Button({
        imageCls: true,
        renderTo: me.el.dom,
        cls: BAR_RIGHT_SCROLLER_CLS,
        height: me.height + 2,
        minWidth: 20,
        paddingTextWidth: 0,
        imageWidth: 20,
        width: 0,
        text: false,
        style: {
          position: 'absolute',
          right: -1,
          top: -1,
          display: 'none'
        },
        listeners: [{
          click: me.onNextScrollClick,
          scope: me
        }]
      });
    },
    /*
     * @return {Number}
     */
    getBarWidth: function () {
      return parseInt(this.el.css('width'));
    },
    /*
     * @return {Number}
     */
    getItemsWidth: function () {
      var width = 0;

      F.each(this.items, function (item) {
        if(item.el.css('display') === 'none' ){
          return;
        }

        width += item.el.width();
        width += parseInt(item.el.css('margin-left'));
        width += parseInt(item.el.css('margin-right'));
        width += parseInt(item.el.css('padding-right'));
        width += parseInt(item.el.css('padding-left'));
      });

      return width;
    },
    /*
     *
     */
    onPrevScrollClick: function () {
      this.scrolled += this.tabScrollStep;
      this.applyScrollChanges();
    },
    /*
     *
     */
    onNextScrollClick: function () {
      this.scrolled -= this.tabScrollStep;
      this.applyScrollChanges();
    },
    /*
     *
     */
    applyScrollChanges: function () {
      var me = this,
        itemsWidth = me.getItemsWidth(),
        barWidth = me.getBarWidth() - parseInt(me.leftScroller.el.css('width')) - parseInt(me.rightScroller.el.css('width')),
        scrollPath = itemsWidth - barWidth;

      if (itemsWidth < barWidth) {
        me.scrolled = 0;

        me.leftScroller.el.hide();
        me.rightScroller.el.hide();

        me.containerEl.animate({'margin-left': '0px'}, F.ANIMATE_DURATION);
        //me.containerEl.css('margin-left', '0px');

        return;
      }
      else if (me.scrolled > 0) {
        me.scrolled = 0;
        me.leftScroller.disable();
        me.rightScroller.enable();
      }
      else if (me.scrolled < -scrollPath) {
        me.scrolled = -scrollPath;
        me.leftScroller.enable();
        me.rightScroller.disable();
      }

      me.leftScroller.el.show();
      me.rightScroller.el.show();

      //me.containerEl.css('margin-left', (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px');
      me.containerEl.animate({'margin-left': (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px'}, F.ANIMATE_DURATION);
    },
    /*
     *
     */
    onDocMouseUp: function () {
      var me = this;

      if (me.scrollInterval) {
        clearTimeout(me.scrollInterval);
        delete me.scrollInterval;
      }
    },
    /*
     *
     */
    checkScroll: function () {
      var me = this,
        itemsWidth = me.getItemsWidth(),
        barWidth = me.getBarWidth();

      if (me.disableScroll) {
        return;
      }

      if (itemsWidth > barWidth) {
        me.enableScroll();
      }
      else if(me.barScrollEnabled) {
        me.leftScroller.el.hide();
        me.rightScroller.el.hide();
      }
    },
    /*
     *
     */
    enableScroll: function () {
      var me = this;

      if(!me.barScrollEnabled){
        return;
      }

      me.leftScroller.el.show();
      me.rightScroller.el.show();

      if (me.scrolled === 0) {
        me.leftScroller.disable();
        me.containerEl.css('margin-left', (me.leftScroller.el.width() + me.tabOffSet) + 'px');
      }
    },
    /*
     *
     */
    initTabEdit: function () {
      var me = this;

      if (!me.tabEdit) {
        return;
      }

      var i = me.items.length - 1;

      for (; i > -1; i--) {
        var item = me.items[i];

        switch (item.type) {
          case 'number':
          case 'string':
          case 'date':
            item.on('tab', me.onTabLastInput, me);
            return;
            break;
        }
      }
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onTabLastInput: function (field, e) {
      var me = this,
        grid = F.getWidget(me.el.parent().select('.' + GRID_CLS).attr('id'));

      //NOTE: setTimeout to fix strange bug. It runs second second cell without it.
      e.preventDefault();

      if (grid.leftColumns.length) {
        setTimeout(function () {
          grid.leftBody.el.select('.' + GRID_CELL_CLS).item(0).dom.click();
        }, 100);
      }
      else {
        setTimeout(function () {
          grid.body.el.select('.' + GRID_CELL_CLS).item(0).dom.click();
        }, 100);
      }
    }
  });

})();
/*
 * @class Fancy.Separator
 */
Fancy.define('Fancy.Separator', {
  cls: Fancy.SEPARATOR_CLS,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.init();
  },
  /*
   *
   */
  init: function(){
    this.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addCls(me.cls);
    el.update('<div></div>');

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }
  }
});
/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  extend: Fancy.Widget,
  widgetCls: Fancy.BAR_TEXT_CLS,
  cls: '',
  text: '',
  tipTpl: '{value}',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);
    me.render();
    me.ons();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addCls(me.widgetCls, me.cls);
    el.update(me.text);

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }

    if(me.hidden){
      me.el.css('display', 'none');
    }

    if(me.id){
      me.el.attr('id', me.id);
    }

    if(me.width){
      me.el.css('width', me.width);
    }
  },
  /*
   * @return {String}
   */
  get: function() {
    return this.el.dom.innerHTML;
  },
  /*
   * @return {String}
   */
  getValue: function () {
    return this.get();
  },
  /*
   * @param {String} value
   */
  set: function (value) {
    this.el.dom.innerHTML = value;
  },
  /*
   *
   */
  ons: function () {
    var me = this,
      el = me.el;

    el.on('mouseover', me.onMouseOver, me);
    el.on('mouseout', me.onMouseOut, me);

    if(me.tip){
      me.el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   *
   */
  onMouseMove: function(e){
    var me = this;

    if(me.tip && me.tooltip){
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
     * @param {Object} e
     */
  onMouseOver: function(e){
    var me = this;

    me.fire('mouseover');

    if(me.tip){
      me.renderTip(e);
    }
  },
  /*
   * @param {Object} e
   */
  renderTip: function(e){
    var me = this;

    if(me.tooltip){
      me.tooltip.destroy();
    }

    if(me.tip === true) {
      me.tip = new Fancy.Template(me.tipTpl).getHTML({
        value: me.get()
      })
    }

    me.tooltip = new Fancy.ToolTip({
      text: me.tip
    });

    me.tooltip.css('display', 'block');
    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  onMouseOut: function(){
    var me = this;

    me.fire('mouseout');

    if(me.tooltip){
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
});
/**
 * @class Fancy.Form
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Form', 'FancyForm'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.form.mixin.Form',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.form.mixin.PrepareConfig'
  ],
  type: 'form',
  theme: 'default',
  i18n: 'en',
  //labelWidth: 100,
  maxLabelNumber: 11,
  minWidth: 200,
  minHeight: 200,
  barScrollEnabled: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(renderTo, config){
    var me = this;

    if(Fancy.isDom(renderTo)){
      config = config || {};
      config.renderTo = renderTo;
    }
    else{
      config = renderTo;
    }

    config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ) {
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    Fancy.loadStyle();

    if(!Fancy.modules['form'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(Fancy.modules['grid']){
        Fancy.loadModule('form', function(){
          preInit();
        });
      }
      else{
        me.loadModules(preInit, config);
      }
    }
    else{
      preInit();
    }
  },
  /*
   * @param {Function} preInit
   * @param {Object} config
   */
  loadModules: function(preInit, config){
    var me = this,
      requiredModules = {
        form: true
      };

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(config.url){
      requiredModules.ajax = true;
    }

    var containsMenu = function (item) {
      if(item.menu){
        requiredModules['menu'] = true;
        return true;
      }
    };

    Fancy.each(config.tbar, containsMenu);
    Fancy.each(config.bbar, containsMenu);
    Fancy.each(config.buttons, containsMenu);
    Fancy.each(config.subTBar, containsMenu);

    var readItems = function (items) {
      var i = 0,
        iL = items.length,
        item;

      for(;i<iL;i++){
        item = items[i];

        if(item.type === 'combo' && item.data && item.data.proxy){
          requiredModules.ajax = true;
        }

        if(item.type === 'date'){
          requiredModules.grid = true;
          requiredModules.date = true;
          requiredModules.selection = true;
        }

        if(item.items){
          readItems(item.items);
        }
      }
    };

    readItems(config.items || []);

    me.neededModules = {
      length: 0
    };

    for(var p in requiredModules){
      if(Fancy.modules[p] === undefined) {
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      preInit();
      return;
    }

    var onLoad = function(name){
      delete me.neededModules[name];
      me.neededModules.length--;

      if(me.neededModules.length === 0){
        me.neededModules = true;
        preInit();
      }
    };

    if(me.neededModules.dom){
      Fancy.loadModule('dom', function(){
        delete me.neededModules.dom;
        me.neededModules.length--;

        for(var p in me.neededModules){
          if(p === 'length'){
            continue;
          }

          Fancy.loadModule(p, onLoad);
        }
      });
    }
    else {
      for (var p in me.neededModules) {
        if (p === 'length') {
          continue;
        }

        Fancy.loadModule(p, onLoad);
      }
    }
  }
});
/*
 * @param {String} id
 */
FancyForm.get = function(id){
  var el = Fancy.get(id);

  if(!el.dom){
    return;
  }

  var formId = el.select('.fancy-form').dom.id;

  return Fancy.getWidget(formId);
};

FancyForm.defineTheme = Fancy.defineTheme;
FancyForm.defineController = Fancy.defineController;
FancyForm.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyForm = function(o){
    if(this.selector){
      o.renderTo = $(this.selector)[0].id;
    }
    else{
      o.renderTo = this.attr('id');
    }

    return new Fancy.Form(o);
  };
}
/*
 * @mixin Fancy.form.field.Mixin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_NOT_VALID_CLS = F.FIELD_NOT_VALID_CLS;
  var FIELD_LABEL_ALIGN_TOP_CLS = F.FIELD_LABEL_ALIGN_TOP_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXTAREA_TEXT_CLS = F.FIELD_TEXTAREA_TEXT_CLS;
  var FIELD_LABEL_ALIGN_RIGHT_CLS = F.FIELD_LABEL_ALIGN_RIGHT_CLS;
  var FIELD_DISABLED_CLS = F.FIELD_DISABLED_CLS;

  F.ns('Fancy.form.field');

  F.form.field.Mixin = function () {};

  F.form.field.Mixin.prototype = {
    padding: '8px 8px 0px 8px',
    inputHeight: 29,
    labelHeight: 18,
    failedValidCls: FIELD_NOT_VALID_CLS,
    cls: '',
    checkValidOnTyping: false,
    editable: true,
    /*
     *
     */
    ons: function () {
      var me = this,
        el = me.el,
        input = me.el.getByTag('input');

      me.input = input;
      input.on('blur', me.onBlur, me);
      input.on('focus', me.onFocus, me);
      input.on('input', me.onInput, me);
      input.on('keydown', me.onKeyDown, me);
      el.on('mouseenter', me.onMouseOver, me);
      el.on('mouseleave', me.onMouseOut, me);
      me.on('key', me.onKey, me);

      if (me.tip) {
        el.on('mousemove', me.onMouseMove, me);
      }

      if (me.format && me.format.inputFn) {
        switch (me.value) {
          case '':
          case undefined:
            break;
          default:
            me.formatValue(me.value);
        }
        me.on('key', me.onKeyInputFn);
      }

      if (me.stopPropagation) {
        el.on('mousedown', function (e) {
          e.stopPropagation();
        });
      }

      el.on('mousedown', function (e) {
        if(me.disabled){
          e.preventDefault();
          e.stopPropagation();
        }
      });
    },
    /*
     * @param {Object} field
     * @param {*} value
     * @param {Object} e
     */
    onKeyInputFn: function (field, value, e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      if(me.disabled){
        return;
      }

      switch (keyCode) {
        case key.ENTER:
        case key.ESC:
        case key.LEFT:
        case key.RIGHT:
          return;
          break;
      }

      this.formatValue(value);
    },
    /*
     * @param {*} value
     */
    formatValue: function (value) {
      value = this.format.inputFn(value);
      this.input.dom.value = value;
    },
    /*
     * @param {Object} e
     */
    onMouseOver: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      me.fire('mouseover');

      if (me.tip) {
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseOut: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      me.fire('mouseout');

      if (me.tip && me.tooltip) {
        me.tooltipToDestroy = true;
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = me.renderTo || document.body,
        renderAfter = me.renderAfter,
        renderBefore = me.renderBefore,
        el = F.get(document.createElement('div'));

      if (F.isString(renderTo)) {
        renderTo = document.getElementById(renderTo);
        if (!renderTo) {
          renderTo = F.select(renderTo).item(0);
        }
      }

      me.fire('beforerender');

      el.addCls(
        F.cls,
        me.cls,
        me.fieldCls
      );

      el.attr('id', me.id);

      var labelWidth = '',
        itemsHTML = '';

      if (me.itemsHTML) {
        itemsHTML = me.itemsHTML;
      }

      if (me.labelAlign === 'top' && me.label) {
        //auto fixing of wrong labelWidth.
        //will not fix right if user change color of label font-size to bigger
        if (me.labelWidth < me.label.length * 7) {
          me.labelWidth = (me.label.length + 2) * 7;
        }
      }

      if (me.labelWidth) {
        labelWidth = 'width:' + me.labelWidth + 'px;';
      }

      var label = me.label;

      if (me.label === '') {
        label = '&nbsp;';
      }
      else if (me.label === undefined) {
        label = '&nbsp;';
      }
      else if (me.labelAlign !== 'right') {
        label += ':';
      }

      var labelDisplay = '',
        inputLabelDisplay = '',
        inputLabel = '';

      if (me.label === false) {
        labelDisplay = 'display:none;';
      }

      if (!me.inputLabel) {
        inputLabelDisplay = 'display:none;';
      }
      else {
        inputLabel = me.inputLabel;
      }

      if (me.type === 'recaptcha') {
        el.update(me.tpl.getHTML({
            key: me.key
          })
        );
      }
      else {
        el.update(
          me.tpl.getHTML({
            labelWidth: labelWidth,
            label: label,
            labelDisplay: labelDisplay,
            inputLabelDisplay: inputLabelDisplay,
            inputLabel: inputLabel,
            emptyText: me.emptyText,
            value: me.value,
            height: me.height,
            itemsHTML: itemsHTML,
            errorTextStyle: '',
            buttonText: me.buttonText
          })
        );
      }

      me.el = el;
      me.setStyle();

      if (me.renderId === true) {
        el.attr('id', me.id);
      }

      if (renderAfter) {
        renderAfter = F.get(renderAfter);
        el = renderAfter.after(el.dom.outerHTML).next();
      }
      else if (renderBefore) {
        el = renderBefore.before(el.dom.outerHTML).prev();
      }
      else {
        renderTo.appendChild(el.dom);
      }
      me.el = el;

      if (me.type === 'textarea') {
        me.input = me.el.getByTag('textarea');
      }
      else {
        me.input = me.el.getByTag('input');
      }

      if (me.name) {
        me.input.name = me.name;
      }

      me.setSize();

      if (me.labelAlign === 'top') {
        me.el.addCls(FIELD_LABEL_ALIGN_TOP_CLS);
        me.el.select('.' + FIELD_TEXT_CLS).css('float', 'none');
      }
      else if (me.labelAlign === 'right') {
        me.el.addCls(FIELD_LABEL_ALIGN_RIGHT_CLS);
        switch (me.type) {
          case 'radio':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXT_CLS + ':last'));
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).css('float', 'right');
            break;
          case 'textarea':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXTAREA_TEXT_CLS));
            break;
          case 'checkbox':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).css('float', 'right');
            break;
          default:
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXT_CLS));
        }
      }
      else if (me.type !== 'radio') {}

      me.acceptedValue = me.value;
      me.fire('afterrender');
      me.fire('render');

      if (me.type !== 'recaptcha' && me.type !== 'chat') {
        setTimeout(function () {
          if (me.input && me.input.dom) {
            if (me.input.dom.value.length === 0) {
              if (me.prevColor === undefined) {
                me.prevColor = me.input.css('color');
              }

              //me.input.css('color', 'grey');
            }
          }
        }, 1);
      }

      if(me.disabled){
        switch(me.type){
          case 'hidden':
            break;
          default:
            me.addCls(FIELD_DISABLED_CLS);
        }

        if(me.input){
          me.input.attr('tabIndex', -1);
        }
      }
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      if(me.disabled){
        return;
      }

      //This disable filter expressions in number field
      /*
      if (me.type === 'field.number') {
        if (F.Key.isNumControl(keyCode, e) === false) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      */

      switch (keyCode) {
        case key.BACKSPACE:
        case key.DELETE:
          switch(me.type) {
            case 'field.number':
            case 'field.string':
              setTimeout(function () {
                if(me.getValue() === ''){
                  me.fire('empty');
                }
              }, 1);
              break;
          }
          break;
        case key.TAB:
          me.fire('tab', e);
          break;
        case key.ENTER:
          me.fire('enter', me.getValue());
          if (me.type !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case key.UP:
          switch (me.type) {
            case 'number':
            case 'field.number':
              me.spinUp();
              break;
          }

          me.fire('up', me.getValue());

          if (me.type !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case key.DOWN:
          switch (me.type) {
            case 'number':
            case 'field.number':
              me.spinDown();
              break;
          }

          me.fire('down', me.getValue());

          if (me.type !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case key.LEFT:
          break;
        case key.RIGHT:
          e.stopPropagation();
          break;
        default:
          setTimeout(function () {
            if (me.input) {
              if (me.input.dom.value.length === 0) {
                if (me.prevColor === undefined) {
                  me.prevColor = me.input.css('color');
                }

                me.input.css('color', 'grey');
              }
              else {
                if (me.prevColor) {
                  me.input.css('color', me.prevColor);
                }
                else {
                  me.input.css('color', ' ');
                }
              }
            }
          }, 1);
      }

      setTimeout(function () {
        me.fire('key', me.input.dom.value, e);
      }, 1);
    },
    /*
     * @param {Object} me
     * @param {*} value
     */
    onKey: function (me, value) {
      if(me.disabled){
        return;
      }

      if (!me.isValid() || me.checkValidOnTyping) {
        me.validate(value);
      }
    },
    /*
     * It used also for validation.
     * @return {Boolean} - returns true/false if validation passed successful.
     */
    onBlur: function () {
      var me = this;

      if(me.disabled){
        return true;
      }

      me.fire('blur');

      if (me.input) {
        if(me.type === 'combo'){
          setTimeout(function () {
            if(me.listItemClicked){}
            else{
              me.validate(me.input.dom.value);
            }
          }, 100);
        }
        else {
          return me.validate(me.input.dom.value);
        }
      }

      return true;
    },
    /*
     * @param {*} value
     */
    validate: function (value) {
      var me = this,
        vtype = me.vtype;

      if (vtype === undefined) {
        return true;
      }
      else {
        var valid = F.isValid(vtype, value);
        if (valid !== true) {
          me.errorText = new F.Template(valid.text).getHTML(valid);
          me.failedValid();

          return false;
        }
        else {
          me.successValid();
          return true;
        }
      }
    },
    /*
     *
     */
    isValid: function () {
      return !this.hasCls(this.failedValidCls);
    },
    /*
     *
     */
    onFocus: function (e) {
      var me = this;

      if(me.disabled || me.editable === false){
        this.input.blur();
        return;
      }

      me.fire('focus');
    },
    /*
     *
     */
    blur: function () {
      this.input.blur();
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        input = me.input,
        value = me.getValue(),
        oldValue = me.acceptedValue;

      if(me.disabled){
        return;
      }

      me.acceptedValue = me.get();
      me.fire('input', value);
      me.fire('change', value, oldValue);
    },
    /*
     *
     */
    get: function () {
      var me = this;

      if (me.format) {
        //Place of bugs
        if (F.isString(me.format)) {
        }
        else if (F.isObject(me.format)) {
          if (me.format.inputFn) {
            if (me.type === 'number' || me.type === 'field.number') {
              if (isNaN(parseFloat(me.value))) {
                return me.value;
              }

              return Number(me.value);
            }
          }
        }
        else {
          return me.value;
        }
      }

      return me.input.dom.value;
    },
    /*
     *
     */
    getValue: function () {
      return this.get();
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set: function (value, onInput) {
      var me = this;

      me.value = value;

      if (me.format && me.format.inputFn) {
        me.formatValue(value);
      }
      else {
        me.input.dom.value = value;
      }

      if (onInput !== false) {
        me.onInput();
      }

      me.validate(value);
    },
    setLabel: function (value) {
      var me = this;

      me.el.select('.' + FIELD_LABEL_CLS).update(value);
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     *
     */
    clear: function () {
      this.set('');
      this.clearValid();
    },
    /*
     *
     */
    failedValid: function () {
      var me = this;

      if (me.hasCls(me.failedValidCls)) {
        if (me.tooltip && me.errorText) {
          me.tooltip.update(me.errorText);
        }
      }
      else {
        if (!me.tooltip && me.errorText) {
          me.showErrorTip();

          me.el.on('mousemove', me.onMouseMove, me);
          me.input.hover(function (e) {
            if (me.errorText) {
              me.showErrorTip();
              me.tooltip.show(e.pageX + 15, e.pageY - 25);
            }
          }, function () {
            me.hideErrorTip();
          });
        }

        me.addCls(me.failedValidCls);
      }
    },
    clearValid: function () {
      this.removeCls(this.failedValidCls);
    },
    /*
     *
     */
    successValid: function () {
      var me = this;

      me.removeCls(me.failedValidCls);
      me.hideErrorTip();
      delete me.errorText;
    },
    /*
     *
     */
    showErrorTip: function () {
      var me = this;

      if (!me.tooltip) {
        me.tooltip = new F.ToolTip({
          text: me.errorText
        });
      }
    },
    /*
     *
     */
    hideErrorTip: function () {
      var me = this;

      if (me.tooltip) {
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {Object} o
     */
    setInputSize: function (o) {
      var me = this;

      if(me.type === 'combo'){
        me.inputContainer.css('width', o.width);
      }

      if (o.width) {
        me.input.css('width', o.width);
      }

      if (o.height) {
        me.input.css('height', o.height);
      }
    },
    /*
     *
     */
    focus: function () {
      var me = this;

      me.input.focus();
      setTimeout(function () {
        me.input.dom.selectionStart = me.input.dom.selectionEnd = 10000;
      }, 0);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.fire('beforehide');
      me.css('display', 'none');
      me.fire('hide');
    },
    /*
     *
     */
    show: function () {
      var me = this,
        animate = false;

      /*
      if(me.css('display') === 'none'){
        me.css('opacity', 0);
        animate = true;
      }
      */
      me.css('display', 'block');

      /*
      if(animate){
        me.el.animate({opacity: 1}, F.ANIMATE_DURATION);
      }
      */
    },
    /*
     * @param {Number|Object} width
     * @param {Number} height
     */
    setSize: function (width, height) {
      var me = this;

      switch (me.type) {
        case 'set':
        case 'line':
          return;
          break;
      }

      if (width === undefined && height === undefined) {
        width = me.width;
        height = me.height;
      }
      else if (height === undefined) {
        var o = width;
        if (o.width) {
          width = o.width;
        }
        else {
          width = me.width;
        }

        if (o.height) {
          height = o.height;
        }
        else {
          height = me.height;
        }
      }

      if (me.size) {
        me.size({
          width: width,
          height: height
        });

        return;
      }

      if (width !== undefined) {
        me.css('width', width);
      }

      if (me.labelAlign === 'top') {
        me.css('height', height * 1.5);
      }
      else {
        me.css('height', height);

        if (me.label) {
          me.el.select('.' + FIELD_LABEL_CLS).css('height', me.inputHeight);
        }
      }

      me.setInputSize({
        width: me.inputWidth,
        height: me.inputHeight
      });
    },
    /*
     *
     */
    setStyle: function () {
      var me = this,
        style = me.style || {},
        padding = me.padding;

      if (padding) {
        if (F.isNumber(padding)) {
          padding = padding + 'px';
        }
        else if (F.isString(padding)) {
        }

        if (style.padding === undefined) {
          style.padding = padding;
        }
      }
      else {
        style.padding = '0px';
      }

      if (me.hidden) {
        me.css('display', 'none')
      }

      me.css(style);
    },
    /*
     *
     */
    preRender: function () {
      var me = this;

      if (me.tpl && F.isObject(me.tpl) === false) {
        me.tpl = new F.Template(me.tpl);
      }

      me.calcSize();
    },
    /*
     *
     */
    calcSize: function () {
      var me = this,
        inputWidth,
        inputHeight = me.inputHeight,
        padding = me.padding,
        value,
        value1,
        value2,
        value3;

      if (F.isString(padding)) {
        padding = padding.replace(/px/g, '');
        padding = padding.split(' ');
        switch (padding.length) {
          case 1:
            value = Number(padding[0]);
            padding = [value, value, value, value];
            break;
          case 2:
            value1 = Number(padding[0]);
            value2 = Number(padding[1]);

            padding = [value1, value2, value1, value2];
            break;
          case 3:
            value1 = Number(padding[0]);
            value2 = Number(padding[1]);
            value3 = Number(padding[2]);

            padding = [value1, value2, value3, value1];
            break;
          case 4:
            padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
            break;
        }
      }
      else if (F.isNumber(padding)) {
        padding = [padding, padding, padding, padding];
      }
      else if (padding === false) {
        padding = [0, 0, 0, 0];
      }

      if (me.labelAlign === 'top') {
        me.height *= 1.5;
      }

      inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label) {
        inputWidth -= me.labelWidth;
      }

      if (me.height === me.inputHeight && me.padding !== false) {
        inputHeight -= padding[0] + padding[2];
      }

      if (me.type === 'radio' && !me.column) {
        me.calcColumns();
        if (me.rows !== 1) {
          inputHeight = (inputHeight - padding[0] - padding[2]) * me.rows;
        }
      }

      me.inputHeight = inputHeight;
      me.inputWidth = inputWidth - padding[1] - padding[3];
      me.height = inputHeight + padding[0] + padding[2];
    },
    /*
     * @param {Number} value
     */
    setWidth: function (value) {
      var me = this;

      me.width = value;
      me.calcSize();

      me.css('width', value);
      me.setInputSize({
        width: me.inputWidth
      });
    },
    /*
     * @param {Object} e
     */
    onMouseMove: function (e) {
      var me = this,
        //Link on grid if presented
        w = me.widget;

      if(me.disabled){
        return;
      }

      delete me.tooltipToDestroy;

      if(w){
        if(w.startResizing && me.tooltip){
          me.tooltip.destroy();
          return;
        }

        if(w.columndrag && w.columndrag.status === 'dragging'){
          me.tooltip.destroy();
          return;
        }
      }

      if (me.tip) {
        me.renderTip(e);
      }
      else if (me.tooltip) {
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip: function (e) {
      var me = this,
        value = '',
        tpl = new F.Template(me.tip || me.tooltip);

      if (me.getValue) {
        value = me.getValue();
      }

      var text = tpl.getHTML({
        value: value
      });

      if (me.tooltip) {
        me.tooltip.update(text);
      }
      else {
        me.tooltip = new F.ToolTip({
          text: text
        });
      }

      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     * @return {Object}
     */
    getInputSelection: function () {
      var me = this,
        start = 0,
        end = 0,
        normalizedValue,
        range,
        textInputRange,
        len,
        endRange,
        el = me.input.dom;

      if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
      }
      else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
          len = el.value.length;
          normalizedValue = el.value.replace(/\r\n/g, "\n");

          // Create a working TextRange that lives only in the input
          textInputRange = el.createTextRange();
          textInputRange.moveToBookmark(range.getBookmark());

          // Check if the start and end of the selection are at the very end
          // of the input, since moveStart/moveEnd doesn't return what we want
          // in those cases
          endRange = el.createTextRange();
          endRange.collapse(false);

          if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
            start = end = len;
          } else {
            start = -textInputRange.moveStart("character", -len);
            start += normalizedValue.slice(0, start).split("\n").length - 1;

            if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
              end = len;
            } else {
              end = -textInputRange.moveEnd("character", -len);
              end += normalizedValue.slice(0, end).split("\n").length - 1;
            }
          }
        }
      }

      return {
        start: start,
        end: end
      };
    },
    /*
     *
     */
    enable: function () {
      var me = this;

      me.disabled = false;
      me.removeCls(FIELD_DISABLED_CLS);

      if(me.button){
        me.button.enable();
      }

      if(me.input){
        me.input.attr('tabIndex', 0);
      }
    },
    /*
     *
     */
    disable: function () {
      var me = this;

      me.disabled = true;
      me.addCls(FIELD_DISABLED_CLS);

      if(me.button){
        me.button.disable();
      }

      if(me.input){
        me.input.attr('tabIndex', -1);
      }
    },
    /*
     *
     */
    getInputValue: function () {
      var me = this;

      return me.input.dom.value;
    }
  };

})();
/*
 * @class Fancy.StringField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.String', 'Fancy.StringField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.string',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab','change', 'key', 'empty');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    if( me.isPassword ){
      me.input.attr({
        "type": "password"
      });

      if(me.showPassTip) {
        me.el.select('.fancy-field-text').item(0).append('<div class="fancy-field-pass-tip">abc</div>');
        me.passTipEl = me.el.select('.fancy-field-pass-tip').item(0);

        me.passTipEl.on('mousedown', function (e) {
          e.preventDefault();
        });

        me.passTipEl.on('click', function () {
          if(me.input.attr('type') !== 'password'){
            me.passTipEl.update('abc');
            me.input.attr('type', 'password');
            me.passTipEl.css('line-height', '22px');
          }
          else {
            me.passTipEl.update('***');
            me.input.attr('type', '');
            me.passTipEl.css('line-height', '28px');
          }
        });
      }
    }

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: Fancy.FIELD_CLS,
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/*
 * @class Fancy.NumberField
 * @extends Fancy.Widget
 */
(function() {
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = Fancy.CLEARFIX_CLS;
  var FIELD_CLS = Fancy.FIELD_CLS;
  var FIELD_LABEL_CLS = Fancy.FIELD_LABEL_CLS;
  var FIELD_ERROR_CLS = Fancy.FIELD_ERROR_CLS;
  var FIELD_TEXT_CLS = Fancy.FIELD_TEXT_CLS;
  var FIELD_TEXT_INPUT_CLS = Fancy.FIELD_TEXT_INPUT_CLS;
  var FIELD_SPIN_CLS = Fancy.FIELD_SPIN_CLS;
  var FIELD_SPIN_UP_CLS = Fancy.FIELD_SPIN_UP_CLS;
  var FIELD_SPIN_DOWN_CLS = Fancy.FIELD_SPIN_DOWN_CLS;

  Fancy.define(['Fancy.form.field.Number', 'Fancy.NumberField'], {
    mixins: [
      Fancy.form.field.Mixin
    ],
    extend: Fancy.Widget,
    type: 'field.number',
    allowBlank: true,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      Fancy.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key', 'empty');

      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      me.initSpin();
    },
    fieldCls: FIELD_CLS,
    value: '',
    width: 100,
    emptyText: '',
    step: 1,
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '<input placeholder="{emptyText}" class="'+FIELD_TEXT_INPUT_CLS+'" style="{inputWidth}" value="{value}">',
      '<div class="'+FIELD_SPIN_CLS+'">',
      '<div class="'+FIELD_SPIN_UP_CLS+'"></div>',
      '<div class="'+FIELD_SPIN_DOWN_CLS+'"></div>',
      '</div>',
      '<div class="'+FIELD_ERROR_CLS+'" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    onInput: function () {
      var me = this,
        input = me.input,
        value = me.get(),
        oldValue = me.acceptedValue;

      if (me.isValid()) {
        var _value = input.dom.value,
          _newValue = '',
          i = 0,
          iL = _value.length;

        for (; i < iL; i++) {
          switch (_value[i]) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '-':
            case '+':
            case '.':
              _newValue += _value[i];
              break;
          }
        }

        if (!isNaN(Number(_newValue))) {
          me.value = _newValue;
          value = _newValue;
        }
      }

      me.acceptedValue = Number(me.get());
      me.fire('input', value);
      me.fire('change', Number(value), Number(oldValue));
    },
    /*
     * @param {String} value
     * @return {Boolean}
     */
    isNumber: function (value) {
      if (value === '' || value === '-') {
        return true;
      }

      return Fancy.isNumber(+value);
    },
    /*
     * @param {Number|String} value
     * @return {Boolean}
     */
    checkMinMax: function (value) {
      var me = this;

      if (value === '' || value === '-') {
        return true;
      }

      value = +value;

      return value >= me.min && value <= me.max;
    },
    /*
     * @param {Number} value
     */
    setMin: function (value) {
      this.min = value;
    },
    /*
     * @param {Number} value
     */
    setMax: function (value) {
      this.max = value;
    },
    /*
     *
     */
    initSpin: function () {
      var me = this;

      if (me.spin !== true) {
        return;
      }

      me.el.select('.' + FIELD_SPIN_CLS).css('display', 'block');

      me.el.select('.' + FIELD_SPIN_UP_CLS).on('mousedown', me.onMouseDownSpinUp, me);
      me.el.select('.' + FIELD_SPIN_DOWN_CLS).on('mousedown', me.onMouseDownSpinDown, me);
    },
    /*
     * @param {Object} e
     */
    onMouseDownSpinUp: function (e) {
      var me = this,
        docEl = Fancy.get(document),
        timeInterval = 700,
        time = new Date();

      if(me.disabled){
        return;
      }

      e.preventDefault();

      me.mouseDownSpinUp = true;

      me.spinUp();

      me.spinInterval = setInterval(function () {
        me.mouseDownSpinUp = false;
        if (new Date() - time > timeInterval) {
          if (timeInterval === 700) {
            timeInterval = 150;
          }

          time = new Date();
          me.spinUp();
          timeInterval--;
          if (timeInterval < 20) {
            timeInterval = 20;
          }
        }
      }, 20);

      docEl.once('mouseup', function () {
        clearInterval(me.spinInterval);
      });

      me.focus();
    },
    /*
     * @param {Object} e
     */
    onMouseDownSpinDown: function (e) {
      var me = this,
        docEl = Fancy.get(document),
        timeInterval = 700,
        time = new Date();

      if(me.disabled){
        return;
      }

      e.preventDefault();

      me.mouseDownSpinDown = true;

      me.spinDown();

      me.spinInterval = setInterval(function () {
        me.mouseDownSpinDown = false;

        if (new Date() - time > timeInterval) {
          if (timeInterval === 700) {
            timeInterval = 150;
          }

          time = new Date();
          me.spinDown();
          timeInterval--;
          if (timeInterval < 20) {
            timeInterval = 20;
          }
        }
      }, 20);

      docEl.once('mouseup', function () {
        clearInterval(me.spinInterval);
      });

      me.focus();
    },
    /*
     *
     */
    spinUp: function () {
      var me = this,
        newValue = +me.get() + me.step;

      if (Fancy.Number.isFloat(me.step)) {
        newValue = Fancy.Number.correctFloat(newValue);
      }

      if (isNaN(newValue)) {
        newValue = me.min || 0;
      }

      if (me.max !== undefined && newValue > me.max) {
        newValue = me.max;
      }
      else if (newValue < me.min) {
        newValue = me.min;
      }

      me.set(newValue);
    },
    /*
     *
     */
    spinDown: function () {
      var me = this,
        newValue = +me.get() - me.step;

      if (Fancy.Number.isFloat(me.step)) {
        newValue = Fancy.Number.correctFloat(newValue);
      }

      if (isNaN(newValue)) {
        newValue = me.min || 0;
      }

      if (me.min !== undefined && newValue < me.min) {
        newValue = me.min;
      }
      else if (newValue > me.max) {
        newValue = me.max;
      }

      me.set(newValue);
    }
  });

})();
/*
 * @class Fancy.TextField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Text', 'Fancy.TextField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.text',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.preRender();
    me.render();

    //me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: Fancy.FIELD_CLS + ' fancy-field-field-text',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-text-value">{value}</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @param {*} value
   */
  set: function(value){
    this.el.select('.fancy-field-text-value').item(0).update(value);
  }
});
/*
 * @class Fancy.EmptyField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Empty', 'Fancy.EmptyField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.empty',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents();

    me.Super('init', arguments);

    me.preRender();
    me.render();

    if( me.style ){
      me.css(me.style);
    }
  },
  /*
   *
   */
  ons: function(){},
  fieldCls: Fancy.FIELD_CLS + ' ' + Fancy.FIELD_EMPTY_CLS,
  width: 100,
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/*
 * @class Fancy.TextArea
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_TEXTAREA_CLS = F.FIELD_TEXTAREA_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXTAREA_TEXT_CLS = F.FIELD_TEXTAREA_TEXT_CLS;
  var FIELD_TEXTAREA_TEXT_INPUT_CLS = F.FIELD_TEXTAREA_TEXT_INPUT_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  var CLEARFIX_CLS = F.CLEARFIX_CLS;

  F.define(['Fancy.form.field.TextArea', 'Fancy.TextArea'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.textarea',
    /*
     * @constructor
     */
    constructor: function () {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('change', 'key');
      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();
    },
    fieldCls: FIELD_CLS + ' ' + FIELD_TEXTAREA_CLS,
    value: '',
    width: 250,
    height: 100,
    labelWidth: 60,
    inputWidth: 180,
    minHeight: 100,
    maxHeight: 210,
    lineHeight: 12.5,
    emptyText: '',
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '</div>',
      '<div class="' + FIELD_TEXTAREA_TEXT_CLS + '">',
      '<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="' + FIELD_TEXTAREA_TEXT_INPUT_CLS + '" style="{inputWidth}height:{inputHeight}px;">{value}</textarea>',
      '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     *
     */
    ons: function () {
      var me = this,
        input = me.el.getByTag('textarea');

      me.input = input;
      input.on('blur', me.onBlur, me);
      input.on('focus', me.onFocus, me);
      input.on('input', me.onInput, me);
      input.on('keydown', me.onKeyDown, me);
      me.on('key', me.onKey, me);

      if (me.autoHeight) {
        input.on('input', me.onChange, me);
      }

      input.on('mousedown', function (e) {
        if(me.disabled){
          e.preventDefault();
        }
      });
    },
    /*
     *
     */
    preRender: function () {
      var me = this;

      if (me.tpl) {
        me.tpl = new F.Template(me.tpl);
      }

      me.initHeight();
      me.calcSize();
    },
    /*
     *
     */
    initHeight: function () {
      var me = this,
        height;

      if (me.height) {
        height = me.height;
        if (me.maxHeight < me.height) {
          //me.maxHeight = me.height;
          setTimeout(function () {
            me.input.css({
              'overflow-y': 'scroll'
            });
          }, 1);
        }
      }
      else if (me.value) {
        var length = me.value.match(/\n/g);

        if (length) {
          length = length.length;
        }
        else {
          length = 1;
        }

        height = length * me.lineHeight;
      }
      else {
        height = me.height;
      }

      if (height < me.minHeight) {
        //height = me.minHeight;
      }
      else if (height > me.maxHeight) {
        //height = me.maxHeight;
        setTimeout(function () {
          me.input.css({
            'overflow-y': 'scroll'
          });
        }, 1);
      }

      me.height = height;
      me.inputHeight = height;
    },
    /*
     *
     */
    calcSize: function () {
      var me = this,
        inputWidth,
        padding = me.padding,
        value,
        value1,
        value2,
        value3;

      if (F.isString(padding)) {
        padding = padding.replace(/px/g, '');
        padding = padding.split(' ');
        switch (padding.length) {
          case 1:
            value = Number(padding[0]);
            padding = [value, value, value, value];
            break;
          case 2:
            value1 = Number(padding[0]);
            value2 = Number(padding[1]);

            padding = [value1, value2, value1, value2];
            break;
          case 3:
            value1 = Number(padding[0]);
            value2 = Number(padding[1]);
            value3 = Number(padding[2]);

            padding = [value1, value2, value3, value1];
            break;
          case 4:
            padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
            break;
        }
      }
      else if (F.isNumber(padding)) {
        padding = [padding, padding, padding, padding];
      }
      else if (padding === false) {
        padding = [0, 0, 0, 0];
      }

      if (me.labelAlign === 'top') {
        me.inputHeight -= 40;
      }

      inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label) {
        inputWidth -= me.labelWidth;
      }

      if (me.height === me.inputHeight && me.padding !== false) {
        me.inputHeight -= padding[0] + padding[2];
      }

      me.inputWidth = inputWidth - padding[1] - padding[3];
      me.height = me.inputHeight + padding[0] + padding[2];
    },
    /*
     *
     */
    onChange: function () {
      var me = this,
        value = me.input.dom.value,
        input = me.el.getByTag('textarea'),
        height = value.match(/\n/g).length * me.lineHeight;

      if (height < me.minHeight) {
        height = me.minHeight;
        input.css({
          'overflow-y': 'hidden'
        });
      }
      else if (height > me.maxHeight) {
        height = me.maxHeight;
        input.css({
          'overflow-y': 'scroll'
        });
      }
      else {
        input.css({
          'overflow-y': 'hidden'
        });
      }

      me.height = height;
    }
  });

})();
/*
 * @class Fancy.CheckBox
 * @extends Fancy.Widget
 */
(function() {
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = Fancy.CLEARFIX_CLS;
  var FIELD_CLS = Fancy.FIELD_CLS;
  var FIELD_LABEL_CLS = Fancy.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = Fancy.FIELD_TEXT_CLS;
  var FIELD_CHECKBOX_CLS = Fancy.FIELD_CHECKBOX_CLS;
  var FIELD_CHECKBOX_INPUT_CLS = Fancy.FIELD_CHECKBOX_INPUT_CLS;
  var FIELD_INPUT_LABEL_CLS =  Fancy.FIELD_INPUT_LABEL_CLS;
  var FIELD_CHECKBOX_ON_CLS = Fancy.FIELD_CHECKBOX_ON_CLS;

  Fancy.define(['Fancy.form.field.CheckBox', 'Fancy.CheckBox'], {
    mixins: [
      Fancy.form.field.Mixin
    ],
    extend: Fancy.Widget,
    type: 'field.checkbox',
    disabled: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      Fancy.applyConfig(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents(
        'focus', 'blur', 'input',
        'up', 'down',
        'beforechange', 'change',
        'key'
      );

      me.Super('init', arguments);

      me.preRender();
      me.render({
        labelWidth: me.labelWidth,
        labelDispay: me.labelText ? '' : 'none',
        label: me.label
      });

      if (me.expander) {
        me.addCls('fancy-checkbox-expander');
      }

      me.acceptedValue = me.value;
      me.set(me.value, false);

      me.ons();
    },
    labelText: '',
    labelWidth: 60,
    value: false,
    editable: true,
    stopIfCTRL: false,
    checkedCls: FIELD_CHECKBOX_ON_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_CHECKBOX_CLS,
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '<div class="'+FIELD_CHECKBOX_INPUT_CLS+'"></div>',
      '</div>',
      '<div class="'+FIELD_INPUT_LABEL_CLS+'" style="{inputLabelDisplay}">',
        '{inputLabel}',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    ons: function () {
      var me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
    },
    /*
     * @param {Object} e
     */
    onClick: function (e) {
      var me = this,
        el = me.el;

      if(me.disabled){
        return;
      }

      me.fire('beforechange');

      if (e.ctrlKey && me.stopIfCTRL) {
        return
      }

      if (me.editable === false) {
        return;
      }

      if (me.canceledChange === true) {
        me.canceledChange = true;
        return;
      }

      el.toggleCls(me.checkedCls);
      var oldValue = me.value;
      me.value = el.hasCls(me.checkedCls);
      me.fire('change', me.value, oldValue);
    },
    /*
     * @params {Object} e
     */
    onMouseDown: function (e) {

      e.preventDefault();
    },
    /*
     * @params {*} value
     * @params {Boolean} fire
     */
    set: function (value, fire) {
      var me = this,
        el = me.el;

      if (value === '') {
        value = false;
      }

      if (value === true || value === 1) {
        el.addCls(me.checkedCls);
        value = true;
      }
      else if (value === false || value === 0) {
        el.removeClass(me.checkedCls);
        value = false;
      }
      else if (value === undefined) {
        value = false;
      }
      else {
        throw new Error('not right value for checkbox ' + value);
      }

      me.value = value;
      if (fire !== false) {
        me.fire('change', me.value);
      }
    },
    /*
     * @params {*} value
     * @params {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     * @return {*}
     */
    getValue: function () {
      return this.value;
    },
    /*
     * @return {*}
     */
    get: function () {
      return this.getValue();
    },
    /*
     *
     */
    clear: function () {
      this.set(false);
    },
    /*
     *
     */
    toggle: function () {
      this.set(!this.value);
    },
    /*
     *
     */
    destroy: function () {
      this.Super('destroy', arguments);
    }
  });

})();
/*
 * @class Fancy.Switcher
 */
Fancy.define(['Fancy.form.field.Switcher', 'Fancy.Switcher'], {
  extend: Fancy.CheckBox,
  type: 'field.switcher',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.applyConfig(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
  },
  checkedCls: 'fancy-switcher-on',
  fieldCls: Fancy.FIELD_CLS + ' fancy-field-switcher',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
    '</div>',
    '<div class="fancy-field-input-label" style="{inputLabelDisplay}">',
      '{inputLabel}',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/**
 * @class Fancy.Combo
 * @extends Fancy.Widget
 *
 * Note: because multiselection code became overcomplex
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_COMBO_RESULT_LIST_CLS = F.FIELD_COMBO_RESULT_LIST_CLS;
  var FIELD_COMBO_CLS = F.FIELD_COMBO_CLS;
  var FIELD_COMBO_SELECTED_ITEM_CLS = F.FIELD_COMBO_SELECTED_ITEM_CLS;
  var FIELD_COMBO_FOCUSED_ITEM_CLS = F.FIELD_COMBO_FOCUSED_ITEM_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;
  var FIELD_DISABLED_CLS = F.FIELD_DISABLED_CLS;
  var FIELD_COMBO_DROPDOWN_BUTTON_CLS = F.FIELD_COMBO_DROPDOWN_BUTTON_CLS;
  var FIELD_COMBO_INPUT_CONTAINER_CLS = F.FIELD_COMBO_INPUT_CONTAINER_CLS;
  var FIELD_COMBO_LEFT_EL_CLS = F.FIELD_COMBO_LEFT_EL_CLS;
  var FIELD_LABEL_ALIGN_TOP_CLS = F.FIELD_LABEL_ALIGN_TOP_CLS;
  var FIELD_LABEL_ALIGN_RIGHT_CLS = F.FIELD_LABEL_ALIGN_RIGHT_CLS;
  var FIELD_CHECKBOX_INPUT_CLS = F.FIELD_CHECKBOX_INPUT_CLS;
  var FIELD_COMBO_LIST_VALUE_CLS = F.FIELD_COMBO_LIST_VALUE_CLS;

  F.define('Fancy.combo.Manager', {
    singleton: true,
    opened: [],
    add: function(combo){
      this.hideLists();

      this.opened.push(combo);
    },
    hideLists: function(){
      F.each(this.opened, function(item){
        item.hideList();
        item.hideAheadList();
      });

      this.opened = [];
    }
  });

  F.define(['Fancy.form.field.Combo', 'Fancy.Combo'], {
    type: 'field.combo',
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    selectedItemCls: FIELD_COMBO_SELECTED_ITEM_CLS,
    focusedItemCls: FIELD_COMBO_FOCUSED_ITEM_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_COMBO_CLS,
    width: 250,
    labelWidth: 60,
    listRowHeight: 25,
    dropButtonWidth: 27,
    leftWidth: 20,
    maxListRows: 9,
    emptyText: '',
    editable: true,
    typeAhead: true, // not right name
    readerRootProperty: 'data',
    valueKey: 'value',
    displayKey: 'text',
    multiSelect: false,
    itemCheckBox: false,
    listCls: '',
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="' + FIELD_TEXT_CLS + '">',
        '<div class="' + FIELD_COMBO_INPUT_CONTAINER_CLS + '" style="{inputWidth}{inputHeight}">',
          '<div class="' + FIELD_COMBO_LEFT_EL_CLS + '" style="{inputHeight}cursor:default;">&nbsp;</div>',
          '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputHeight}cursor:default;" value="{value}">',
          '<div class="' + FIELD_COMBO_DROPDOWN_BUTTON_CLS + '">&nbsp;</div>',
        '</div>',
      '</div>',
      '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     * @constructor
     */
    constructor: function () {
      this.tags = this.tags || [];
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents(
        'focus', 'blur', 'input',
        'up', 'down', 'change', 'key', 'enter', 'esc',
        'empty',
        'load'
      );
      me.Super('init', arguments);

      if(me.subSearch){
        me.editable = false;
      }

      if (!me.loadListData()) {
        me.data = me.configData(me.data);
      }

      if(me.multiSelect && me.data.length){
        me.initMultiSelect();
      }

      me.preRender();
      me.render();

      me.ons();

      me.applyStyle();
      me.applyTheme();

      /*
       * Bug fix: #1074
       * Theme is not applied to list element.
       */
      setTimeout(function () {
        me.applyTheme();
      }, 1);
    },
    /*
     * @return {Boolean}
     */
    loadListData: function () {
      var me = this;

      if (!F.isObject(me.data)) {
        return false;
      }

      var proxy = me.data.proxy,
        readerRootProperty = me.readerRootProperty;

      if (!proxy || !proxy.url) {
        throw new Error('[FancyGrid Error]: combo data url is not defined');
      }

      if (proxy.reader && proxy.reader.root) {
        readerRootProperty = proxy.reader.root;
      }

      F.Ajax({
        url: proxy.url,
        params: proxy.params || {},
        method: proxy.method || 'GET',
        getJSON: true,
        success: function (o) {
          me.data = me.configData(o[readerRootProperty]);
          me.renderList();
          me.onsList();

          if(me.multiSelect){
            me.initMultiSelect();

            if(me.value){
              me.updateInput();
            }
          }
          else if (me.value) {
            var displayValue = me.getDisplayValue(me.value);

            if (displayValue) {
              me.input.dom.value = displayValue;
            }
          }

          me.fire('load');
        }
      });

      return true;
    },
    /*
     * @param {Array} data
     * @return {Array}
     */
    configData: function (data) {
      if (F.isObject(data) || data.length === 0) {
        return data;
      }

      if (!F.isObject(data[0])) {
        var _data = [],
          i = 0,
          iL = data.length;

        for (; i < iL; i++) {
          _data.push({
            text: data[i],
            value: i
          });
        }

        return _data;
      }

      return data;
    },
    /*
     *
     */
    applyStyle: function () {
      var me = this;

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }
    },
    /*
     *
     */
    applyTheme: function () {
      var me = this;

      if (me.theme && me.theme !== 'default') {
        me.addCls('fancy-theme-' + me.theme);
        me.list.addCls('fancy-theme-' + me.theme);

        if(me.aheadList){
          me.aheadList.addCls('fancy-theme-' + me.theme);
        }
      }
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        drop = me.el.select('.' + FIELD_COMBO_DROPDOWN_BUTTON_CLS);

      me.input = me.el.getByTag('input');
      me.inputContainer = me.el.select('.' + FIELD_COMBO_INPUT_CONTAINER_CLS);
      me.drop = drop;

      me.onsList();

      me.input.on('blur', me.onBlur, me);
      me.input.on('mousedown', me.onInputMouseDown, me);
      me.input.on('click', me.onInputClick, me);
      drop.on('mousedown', me.onDropMouseDown, me);
      drop.on('click', me.onDropClick, me);
      me.on('key', me.onKey, me);

      if (me.typeAhead && me.editable) {
        me.input.on('keydown', me.onKeyDown, me);
      }

      me.on('esc', me.onEsc, me);
      me.on('enter', me.onEnter, me);
      me.on('up', me.onUp, me);
      me.on('down', me.onDown, me);
    },
    onSubSearchKeyDown: function (e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      switch (keyCode) {
        case key.ESC:
          me.fire('esc', e);
          break;
        case key.ENTER:
          me.fire('enter', e);
          break;
        case key.UP:
          me.fire('up', e);
          break;
        case key.DOWN:
          me.fire('down', e);
          break;
      }
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      switch (keyCode) {
        case key.ESC:
          me.fire('esc', e);
          break;
        case key.ENTER:
          me.fire('enter', e);
          break;
        case key.UP:
          me.fire('up', e);
          break;
        case key.DOWN:
          me.fire('down', e);
          break;
        case key.TAB:
          break;
        case key.BACKSPACE:
          setTimeout(function () {
            if (me.input.dom.value.length === 0) {
              me.value = -1;
              me.valueIndex = -1;
              me.hideAheadList();

              if (me.multiSelect) {
                me.values = [];
                me.clearListActive();
              }

              me.fire('empty');
            }
            else {
              if(me.multiSelect){
                if(me.input.dom.value.split(',').length !== me.valuesIndex.length){
                  var newValues = me.getFromInput();

                  me.set(newValues);
                }
              }

              if (me.generateAheadData().length === 0) {
                me.hideAheadList();
                return;
              }

              me.renderAheadList();
              me.showAheadList();
            }
          }, 100);
          break;
        default:
          setTimeout(function () {
            if (me.generateAheadData().length === 0) {
              me.hideAheadList();
              return;
            }

            me.renderAheadList();
            me.showAheadList();
          }, 1);
      }

      setTimeout(function () {
        me.fire('key', me.input.dom.value, e);
      }, 1);
    },
    /*
     * @param {Object} e
     */
    onInputClick: function (e) {
      var me = this,
        list = me.list;

      if(me.disabled){
        return;
      }

      if (me.editable === true) {
        return;
      }

      if (list.css('display') === 'none') {
        me.showList();
      }
      else {
        me.hideList();
      }
    },
    /*
     * @param {Object} e
     */
    onDropClick: function (e) {
      var me = this,
        list = me.list;

      if(me.disabled){
        return;
      }

      if (list.css('display') === 'none') {
        F.combo.Manager.add(this);
        
        me.showList();
      }
      else {
        me.hideList();
      }

      if (me.editable === true) {
        me.input.focus();
      }
    },
    /*
     *
     */
    showList: function () {
      var me = this,
        list = me.list,
        el = me.input.parent().parent(),
        p = el.$dom.offset(),
        xy = [p.left, p.top + el.$dom.height()],
        docEl = F.get(document),
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      me.hideAheadList();

      if (!me.list || me.data.length === 0) {
        return;
      }

      list.css({
        display: '',
        left: xy[0] + 'px',
        top: xy[1] + 3 + 'px',
        opacity: 0,
        width: me.getListWidth(),
        "z-index": 2000 + F.zIndex++
      });

      if(me.listCls){
        list.addCls(me.listCls);
      }

      list.animate({
        opacity: 1,
        top: xy[1]
      }, F.ANIMATE_DURATION);

      var index;

      me.clearFocused();

      var selected = list.select('.' + selectedItemCls);

      if (selected.length === 0) {
        if(me.multiSelect && me.values.length){
          me.valuesIndex.each(function (i, value, length) {
            if(index === undefined){
              index = i;
            }

            list.select('li').item(i).addCls(selectedItemCls);
          });
        }
        else {
          index = 0;
        }
      }
      else {
        if(me.multiSelect && selected.length !== me.valuesIndex.length){
          list.select('.' + selectedItemCls).removeCls(selectedItemCls);

          me.valuesIndex.each(function (i, value, length) {
            if(index === undefined){
              index = i;
            }
            list.select('li').item(i).addCls(selectedItemCls);
          });
        }

        index = selected.item(0).index();
      }

      if(index === -1){
        index = 0;
      }

      list.select('li').item(index).addCls(focusedItemCls);
      me.scrollToListItem(index);

      if (!me.docSpy) {
        me.docSpy = true;
        docEl.on('click', me.onDocClick, me);
      }

      if(me.subSearch !== false && me.subSearchField){
        me.subSearchField.setInputSize({
          width: me.getListWidth() - 6,
          height: 25
        });

        me.subSearchField.input.focus();
      }
    },
    /*
     *
     */
    showAheadList: function () {
      var me = this,
        list = me.aheadList,
        el = me.input.parent().parent(),
        p = el.$dom.offset(),
        xy = [p.left, p.top + el.$dom.height()],
        docEl = F.get(document);

      me.hideList();

      if (!list || me.data.length === 0) {
        return;
      }

      list.css({
        display: '',
        left: xy[0] + 'px',
        top: xy[1] + 'px',
        width: me.getListWidth(),
        "z-index": 2000 + F.zIndex++
      });

      if (!me.docSpy2) {
        me.docSpy2 = true;
        docEl.on('click', me.onDocClick, me);
      }
    },
    /*
     * @param {Object} e
     */
    onDocClick: function (e) {
      var me = this;

      if (me.input.parent().parent().within(e.target) === false) {
        if (me.list.within(e.target) === true) {
          return;
        }
        me.hideList();
        me.hideAheadList();
      }
    },
    /*
     *
     */
    hideList: function () {
      var me = this;

      if (!me.list) {
        return;
      }

      me.list.css('display', 'none');

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    hideAheadList: function () {
      var me = this;

      if (!me.aheadList) {
        return;
      }

      me.aheadList.css('display', 'none');

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     * @param {Object} e
     */
    onInputMouseDown: function (e) {
      var me = this;

      if(me.disabled){
        e.preventDefault();
        return;
      }

      if (me.editable === false) {
        e.preventDefault();
      }
    },
    /*
     * @param {Object} e
     */
    onDropMouseDown: function (e) {
      if(this.disabled){
        e.stopPropagation();
      }

      e.preventDefault();
    },
    /*
     *
     */
    onsList: function () {
      var me = this;

      me.list.on('mousedown', me.onListItemMouseDown, me, 'li');
      me.list.on('click', me.onListItemClick, me, 'li');
      me.list.on('mouseenter', me.onListItemOver, me, 'li');
      me.list.on('mouseleave', me.onListItemLeave, me, 'li');

      if(me.selectAllText){
        me.list.select('.fancy-combo-list-select-all').on('click', me.onSelectAllClick, me);
      }
    },
    /*
     *
     */
    onsAheadList: function () {
      var me = this;

      me.aheadList.on('click', me.onListItemClick, me, 'li');
    },
    /*
     * @param {Object} e
     */
    onListItemOver: function (e) {
      if(this.disabled) {
        return;
      }

      var li = F.get(e.target);
      if(li.prop('tagName').toLocaleLowerCase() !== 'li'){
        return;
      }

      li.addCls(this.focusedItemCls);
    },
    /*
     *
     */
    onListItemLeave: function () {
      if(this.disabled){
        return;
      }

      this.clearFocused();
    },
    onListItemMouseDown: function(){
      var me = this;

      me.listItemClicked = true;

      setTimeout(function(){
        delete me.listItemClicked;
      }, 1000);
    },
    /*
     * @param {Object} e
     */
    onListItemClick: function (e) {
      var me = this,
        li = F.get(e.currentTarget),
        value = li.attr('value'),
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      if(me.disabled){
        return;
      }

      if (F.nojQuery && value === 0) {
        value = '';
      }

      if (me.multiSelect) {
        if (me.values.length === 0) {
          me.clearListActive();
        }

        me.clearFocused();

        li.toggleCls(selectedItemCls);

        if (li.hasCls(selectedItemCls)) {
          me.addValue(value);
          li.addCls(focusedItemCls);
        }
        else {
          me.removeValue(value);
          me.clearFocused();

          if(me.selectAllText){
            me.list.select('.fancy-combo-list-select-all').removeCls('fancy-combo-item-selected');
          }
        }

        me.updateInput();
      }
      else {
        me.set(value);
        me.hideList();
      }

      if (me.editable) {
        me.input.focus();
      }
      else {
        me.onBlur();
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set: function (value, onInput) {
      var me = this,
        valueStr = '',
        index;

      if(me.multiSelect && !F.isArray(value)){
        if(value === -1){
          value = [];
        }
        else {
          value = [value];
        }
      }

      if(F.isArray(value) && me.multiSelect){
        var displayedValues = [];

        me.valuesIndex.removeAll();

        F.each(value, function(v, i){
          var _index = me.getIndex(v);

          if(_index === -1){
            return;
          }

          me.valuesIndex.add(_index, value[i]);

          displayedValues.push(me.data[_index][me.displayKey]);

          valueStr = displayedValues.join(', ');
        });

        me.values = value;
        index = me.getIndex(value[0]);
        me.value = value[0];
        me.valueIndex = index;
      }
      else{
        index = me.getIndex(value);

        if(index !== -1) {
          me.valueIndex = index;
          valueStr = me.data[index][me.displayKey];
          me.selectItem(index);
        }
        else{
          if (value !== -1 && value && value.length > 0) {
            valueStr = '';
            //valueStr = value;
            me.value = -1;
            me.valueIndex = -1;
          }
          else {
            valueStr = '';
          }
        }

        me.value = value;
      }

      me.input.dom.value = valueStr;

      if (onInput !== false) {
        me.onInput();
      }

      if(me.left){
        me.updateLeft();
      }

      if(!Fancy.isObject(me.data)){
        me.validate(valueStr);
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {*} v
     */
    addValue: function(v){
      var me = this,
        index = me.getIndex(v);

      if(index !== -1 && !me.valuesIndex.get(index)){
        me.value = v;
        me.values.push(v);
        me.valuesIndex.add(index, v);
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {*} v
     */
    removeValue: function(v){
      var me = this,
        index = -1;

      F.each(me.values, function(value, i){
        if( value === v ){
          index = i;
        }
      });

      if(index !== -1) {
        me.values.splice(index, 1);
        me.valuesIndex.remove(me.getIndex(v));
      }

      if (me.values.length) {
        me.value = me.values[me.values.length - 1];
      }
      else {
        me.value = -1;
        me.valueIndex = -1;
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {Boolean} onInput
     */
    updateInput: function(onInput){
      var me = this,
        displayValues = [];

      me.valuesIndex.each(function (i, v, length) {
        displayValues.push(me.data[i][me.displayKey]);
      });

      me.input.dom.value = displayValues.join(", ");

      if (onInput !== false) {
        me.onInput();
      }
    },
    /*
     * @param {Number} index
     */
    selectItem: function(index){
      var me = this;

      if (!me.list) {
        return;
      }

      if (!me.multiSelect) {
        me.clearListActive();
      }

      me.clearFocused();

      var item = me.list.select('li').item(index);

      item.addCls(me.focusedItemCls, me.selectedItemCls);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.get(document.createElement('div')),
        value = me.value,
        index = -1;

      el.attr('id', me.id);

      if (value === undefined) {
        value = '';
      }
      else {
        if(me.multiSelect && F.isArray(me.data) && me.data.length > 0){
          value = '';

          me.valuesIndex.each(function(i, v){
            if(index === -1){
              index = i;
              me.valueIndex = i;
            }

            value += me.data[i][me.displayKey] + ', ';
          });

          value = value.replace(/, $/, '');
        }
        else {
          index = me.getIndex(value);

          if (index !== -1) {
            me.valueIndex = index;
            value = me.data[index][me.displayKey];
          }
          else {
            value = '';
          }
        }
      }

      me.fire('beforerender');
      el.addCls(
        F.cls,
        me.cls,
        me.fieldCls
      );

      var labelWidth = '';

      if (me.labelWidth) {
        labelWidth = 'width:' + me.labelWidth + 'px;';
      }

      var label = me.label;

      if (me.label === '') {
        label = '&nbsp;';
      }
      else if (me.label === undefined) {
        label = '&nbsp;';
      }
      else if (me.labelAlign !== 'right') {
        label += ':';
      }

      el.update(me.tpl.getHTML({
        labelWidth: labelWidth,
        labelDisplay: me.label === false ? 'display: none;' : '',
        label: label === false ? '' : label,
        emptyText: me.emptyText,
        inputHeight: 'height:' + me.inputHeight + 'px;',
        value: value
      }));

      me.el = el;
      me.setStyle();

      me.input = me.el.getByTag('input');
      me.inputContainer = me.el.select('.' + FIELD_COMBO_INPUT_CONTAINER_CLS);
      me.drop = me.el.select('.' + FIELD_COMBO_DROPDOWN_BUTTON_CLS);

      if(me.leftTpl){
        me.left = me.el.select('.' + FIELD_COMBO_LEFT_EL_CLS);

        me.left.css({
          display: 'block',
          width: me.leftWidth
        });
      }

      me.setSize();
      renderTo.appendChild(el.dom);

      if (me.labelAlign === 'top') {
        me.el.addCls(FIELD_LABEL_ALIGN_TOP_CLS);
      }
      else if (me.labelAlign === 'right') {
        me.el.addCls(FIELD_LABEL_ALIGN_RIGHT_CLS);
        F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXT_CLS));
      }

      if (me.valueIndex) {
        me.acceptedValue = me.value;
      }

      if (me.editable) {
        me.input.css('cursor', 'auto');
      }
      else {
        if(me.input){
          me.input.attr('tabIndex', -1);
        }
      }

      if(me.disabled){
        me.addCls(FIELD_DISABLED_CLS);

        if(me.input){
          me.input.attr('tabIndex', -1);
        }
      }

      me.renderList();

      if(me.leftTpl) {
        setTimeout(function () {
          me.updateLeft();
        }, 1);

        //Bug fix with images
        setTimeout(function () {
          me.updateLeft();
        }, 500);

        //Bug fix with images
        setTimeout(function () {
          me.updateLeft();
        }, 1000);
      }

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderList: function () {
      var me = this,
        list = F.get(document.createElement('div')),
        listHtml = [];

      if(me.selectAllText){
        listHtml.push('<div class="fancy-combo-list-select-all"><div class="fancy-field-checkbox-input" style=""></div><span class="fancy-combo-list-select-all-text">' + me.selectAllText + '</span></div>');
      }

      if(me.editable === false && me.subSearch !== false && me.type !== 'checkbox'){
        listHtml.push('<div class="fancy-combo-list-sub-search-container"></div>');
      }

      if (me.list) {
        me.list.destroy();
      }

      listHtml.push([
        '<ul style="position: relative;">'
      ]);

      F.each(me.data, function (row, i) {
        var isActive = '',
          displayValue = row[me.displayKey],
          value = row[me.valueKey];

        if (me.value === value) {
          isActive = me.selectedItemCls;
        }

        if (displayValue === '' || displayValue === ' ') {
          displayValue = '&nbsp;';
        }
        else if (me.listItemTpl) {
          var listTpl = new F.Template(me.listItemTpl);
          displayValue = listTpl.getHTML(row);
        }

        if (me.multiSelect && me.itemCheckBox) {
          listHtml.push('<li value="' + value + '" class="' + isActive + '"><div class="' + FIELD_CHECKBOX_INPUT_CLS + '" style=""></div><span class="' + FIELD_COMBO_LIST_VALUE_CLS + '">' + displayValue + '</span></li>');
        }
        else {
          listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="' + FIELD_COMBO_LIST_VALUE_CLS + '">' + displayValue + '</span></li>');
        }
      });

      listHtml.push('</ul>');
      list.addCls(F.cls, FIELD_COMBO_RESULT_LIST_CLS);
      list.update(listHtml.join(""));

      list.css({
        display: 'none',
        left: '0px',
        top: '0px',
        width: me.getListWidth()
      });

      if (me.data.length > me.maxListRows) {
        /*
        list.css({
          height: me.listRowHeight * 9 + 'px',
          overflow: 'auto'
        });
        */
        list.select('ul').item(0).css({
          height: me.listRowHeight * me.maxListRows + 'px',
          overflow: 'auto'
        });
      }

      document.body.appendChild(list.dom);
      me.list = list;

      if(me.editable === false && me.type !== 'checkbox' && me.subSearch !== false){
        me.subSearchField = new F.StringField({
          renderTo: me.list.select('.fancy-combo-list-sub-search-container').item(0).dom,
          label: false,
          style: {
            padding: '2px 2px 0px 2px'
          },
          events: [{
            change: me.onSubSearchChange,
            scope: me
          }]
        });

        me.subSearchField.setInputSize({
          width: me.getListWidth() - 6,
          height: 25
        });

        me.subSearchField.input.on('keydown', me.onSubSearchKeyDown, me);
      }

      me.applyTheme();
    },
    /*
     * @return {Number}
     */
    getListWidth: function(){
      var me = this,
        el,
        listWidth = me.inputWidth + 14,
        minListWidth = me.minListWidth;

      if (me.input) {
        el = me.input.parent().parent();
        listWidth = el.width();
      }

      if (minListWidth && minListWidth > listWidth) {
        listWidth = minListWidth;
      }

      return listWidth;
    },
    /*
     * @return {Array}
     */
    generateAheadData: function(){
      var me = this,
        inputValue = me.input.dom.value.toLocaleLowerCase(),
        aheadData = [];

      if (me.multiSelect) {
        var splitted = inputValue.split(', '),
          inputSelection = me.getInputSelection(),
          passedCommas = 0;

        F.each(inputValue, function (v, i) {
          if(inputSelection.start <= i){
            return true;
          }

          if(inputValue[i] === ','){
            passedCommas++;
          }
        });

        inputValue = splitted[passedCommas];
      }

      F.each(me.data, function (item){
        if (new RegExp('^' + inputValue).test(item[me.displayKey].toLocaleLowerCase())) {
          aheadData.push(item);
        }
      });

      if (me.data.length === aheadData.length) {
        aheadData = [];
      }

      me.aheadData = aheadData;

      return aheadData;
    },
    /*
     *
     */
    renderAheadList: function () {
      var me = this,
        list,
        listHtml = [
          '<ul style="position: relative;">'
        ],
        presented = false;

      if (me.aheadList) {
        me.aheadList.firstChild().destroy();
        list = me.aheadList;
        presented = true;
      }
      else {
        list = F.get(document.createElement('div'));
      }

      F.each(me.aheadData, function (row, i) {
        var isActive = '',
          displayValue = row[me.displayKey],
          value = row[me.valueKey];

        if (i === 0) {
          isActive = me.selectedItemCls;
        }

        if (displayValue === '' || displayValue === ' ') {
          displayValue = '&nbsp;';
        }
        else if (me.listItemTpl) {
          var listTpl = new F.Template(me.listItemTpl);
          displayValue = listTpl.getHTML(row);
        }

        listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="' + FIELD_COMBO_LIST_VALUE_CLS + '">' + displayValue + '</span></li>');
      });

      listHtml.push('</ul>');

      list.update(listHtml.join(""));
      list.css({
        display: 'none',
        left: '0px',
        top: '0px',
        width: me.getListWidth()
      });

      list.css({
        'max-height': me.listRowHeight * me.maxListRows + 'px',
        overflow: 'auto'
      });

      if (presented === false) {
        list.addClass(F.cls, 'fancy-combo-result-list');
        document.body.appendChild(list.dom);
        me.aheadList = list;

        me.onsAheadList();
      }

      me.applyTheme();
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.css('display', 'none');
      me.hideList();
      me.hideAheadList();
    },
    /*
     *
     */
    clear: function () {
      var me = this;

      if(me.multiSelect){
        me.set([], false);
      }
      else {
        me.set(-1, false);
      }
    },
    /*
     *
     */
    clearListActive: function () {
      var me = this,
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      me.list.select('.' + focusedItemCls).removeCls(focusedItemCls);
      me.list.select('.' + selectedItemCls).removeCls(selectedItemCls);
    },
    clearFocused: function () {
      var me = this,
        focusedItemCls = me.focusedItemCls;

      if(me.list) {
        me.list.select('.' + focusedItemCls).removeCls(focusedItemCls);
      }

      if(me.aheadList) {
        me.aheadList.select('.' + focusedItemCls).removeCls(focusedItemCls);
      }
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        value = me.getValue(),
        oldValue = me.acceptedValue;

      me.acceptedValue = me.get();
      me.fire('change', value, oldValue);

      if(me.left){
        me.updateLeft();
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     * @param {key} value
     * @return {*}
     */
    getDisplayValue: function (value, returnPosition) {
      var me = this,
        index = me.getIndex(value);

      if(returnPosition){
        return index;
      }
      else{
        if(!me.data[index]){
          return '';
        }
        return me.data[index][me.displayKey];
      }
    },
    /*
     * @param {key} value
     * @param {Boolean} [returnPosition]
     */
    getValueKey: function (value, returnPosition) {
      var me = this,
        i = 0,
        iL = me.data.length;

      for(;i<iL;i++){
        if (me.data[i][me.displayKey] === value) {
          if (returnPosition) {
            return i;
          }

          return me.data[i][me.valueKey];
        }
      }
    },
    /*
     * @return {*}
     */
    get: function () {
      return this.getValue();
    },
    /*
     * @return {*}
     */
    getValue: function () {
      var me = this;

      if (me.multiSelect) {
        return me.values;
      }

      if (me.value === -1 || me.value === undefined) {
        if (me.value === -1 && me.input.dom.value) {
          return me.input.dom.value;
        }
        return '';
      }

      if (me.valueKey !== undefined) {
        return me.value;
      }

      return me.value;
    },
    /*
     * @param {Object} o
     */
    size: function (o) {
      var me = this,
        width = o.width,
        height = o.height,
        input = me.input,
        inputContainer = me.inputContainer,
        drop = me.drop;

      if (me.labelAlign !== 'top') {
        me.inputHeight = height;
      }

      if (height !== undefined) {
        me.height = height;
      }

      if (width !== undefined) {
        me.width = width;
      }

      me.calcSize();

      if (me.labelAlign === 'top') {
        me.css({
          height: me.height * 1.5,
          width: me.width
        });
      }
      else {
        me.css({
          height: me.height,
          width: me.width
        });
      }

      var inputWidth = me.inputWidth,
        minusWidth = 2;

      if(me.theme === 'dark'){
        minusWidth = 0;
      }

      var _inputWidth = inputWidth - minusWidth;

      if(me.left){
        _inputWidth -= me.leftWidth;
      }

      input.css({
        width: _inputWidth,
        height: me.inputHeight,
        'margin-left': me.left? me.leftWidth: 0
      });

      inputContainer.css({
        width: inputWidth,
        height: me.inputHeight
      });

      drop.css('height', me.inputHeight);
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onEnter: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls,
        selectedItemCls = me.selectedItemCls,
        value;

      if (me.multiSelect) {
        if (!list) {
          return;
        }

        var item = list.select('.' + focusedItemCls);

        if (!item || !item.dom) {
          item = list.select('.' + selectedItemCls).last();
        }

        if (item && item.dom) {
          value = item.attr('value');

          me.addValue(value);

          var position = me.getDisplayValue(value, true);
          me.selectItem(position);

          me.updateInput();
        }
      }
      else if (list) {
        var item = list.select('.' + focusedItemCls);

        if(!item || !item.dom){
          item = list.select('.' + selectedItemCls);
        }

        value = item.attr('value');

        me.set(value);
      }
      else {
        me.set(me.input.dom.value);
      }

      me.hideList();
      me.hideAheadList();
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onEsc: function (field, e) {
      var me = this;

      me.hideList();
      me.hideAheadList();
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onUp: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls,
        selectedItemCls = me.selectedItemCls;

      if (list) {
        list = me.getActiveList().select('ul');
        e.preventDefault();
        var activeLi = list.select('.' + focusedItemCls),
          notFocused = false;

        if (!activeLi.dom) {
          activeLi = list.select('.' + selectedItemCls);
        }

        if (!activeLi.dom) {
          notFocused = true;
          activeLi = list.lastChild();
        }

        if(activeLi.length > 1){
          activeLi = activeLi.item(0);
        }

        var index = activeLi.index(),
          lis = list.select('li'),
          height = parseInt(list.css('height'));

        if (index !== 0 && !notFocused) {
          index--;
        }
        else {
          index = lis.length - 1;
        }

        var nextActiveLi = lis.item(index),
          top = nextActiveLi.dom.offsetTop;

        if (top - list.dom.scrollTop > height) {
          list.dom.scrollTop = 10000;
        }
        else if (top - list.dom.scrollTop < 0) {
          list.dom.scrollTop = top;
        }

        me.clearFocused();

        nextActiveLi.addClass(focusedItemCls);
      }
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onDown: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls,
        selectedItemCls = me.selectedItemCls;

      if (list) {
        list = me.getActiveList().select('ul');
        e.preventDefault();

        var activeLi = list.select('.' + focusedItemCls),
          notFocused = false;

        if (!activeLi.dom) {
          activeLi = list.select('.' + selectedItemCls);
        }

        if (!activeLi.dom) {
          notFocused = true;
          activeLi = list.firstChild();
        }

        if(activeLi.length > 1){
          activeLi = activeLi.item(0);
        }

        var activeLiHeight = parseInt(activeLi.css('height')),
          index = activeLi.index(),
          lis = list.select('li'),
          height = parseInt(list.css('height'));

        if (index !== lis.length - 1 && !notFocused) {
          index++;
        }
        else {
          index = 0;
        }

        var nextActiveLi = lis.item(index),
          top = nextActiveLi.dom.offsetTop,
          nextActiveLiHeight = parseInt(nextActiveLi.css('height'));

        if (top - list.dom.scrollTop < 0) {
          list.dom.scrollTop = 0;
        }
        else if (top + nextActiveLiHeight + 3 - list.dom.scrollTop > height) {
          list.dom.scrollTop = top - height + activeLiHeight + nextActiveLiHeight;
        }

        me.clearFocused();

        nextActiveLi.addClass(focusedItemCls);
      }
      else {
        me.showList();
      }
    },
    /*
     * @param {Number} index
     */
    scrollToListItem: function (index) {
      var me = this,
        list = me.getActiveList().select('ul'),
        lis = list.select('li'),
        item = lis.item(index),
        //top = item.position().top,
        top = item.dom.offsetTop,
        height = parseInt(list.css('height'));

      if (index === 0) {
        list.dom.scrollTop = 0;
      }
      else if (index === lis.length - 1) {
        list.dom.scrollTop = 10000;
      }
      else {
        list.dom.scrollTop = top;
      }
    },
    /*
     * @return {Fancy.Element}
     */
    getActiveList: function () {
      var me = this,
        list = false;

      if (me.list && me.list.css('display') !== 'none') {
        list = me.list;
      }
      else if (me.aheadList && me.aheadList.css('display') !== 'none') {
        list = me.aheadList;
      }

      return list;
    },
    /*
     *
     */
    initMultiSelect: function () {
      var me = this,
        value = me.value;

      me.values = [];
      me.valuesIndex = new F.Collection();

      if(me.value !== undefined && value !== null && value !== ''){
        if(F.isArray(value)){
          me.values = value;
          me.value = value[0];
        }
        else{
          me.values = [me.value];
        }

        F.each(me.values, function(value){
          me.valuesIndex.add(me.getIndex(value), value);
        });
      }
    },
    /*
     * @param {*} value
     * @return {Number}
     */
    getIndex: function(value){
      var me = this,
        data = me.data,
        i = 0,
        iL = data.length,
        index = -1;

      for(;i<iL;i++){
        if(data[i][me.valueKey] == value) {
          return i;
        }
      }

      return index;
    },
    /*
     * Method used only for multiSelect
     *
     * @return {Array}
     */
    getFromInput: function(){
      var me = this,
        value = me.input.dom.value,
        values = value.split(','),
        _values = [];

      F.each(values, function(v){
        var displayValue = v.replace(/ $/, '').replace(/^ /, ''),
          _value = me.getValueKey(displayValue);

        if(_value){
          _values.push(_value);
        }
      });

      return _values;
    },
    /*
     *
     */
    updateLeft: function () {
      var me = this,
        item = me.data[me.getIndex(me.getValue())];

      me.left.update(new F.Template(me.leftTpl).getHTML(item));
    },
    /*
     *
     */
    setData: function(data){
      var me = this;

      me.data = data;
      me.renderList();
      me.onsList();
    },
    /*
     *
     */
    onSelectAllClick: function (e) {
      var me = this,
        lis = me.list.select('li'),
        selectAllEl = me.list.select('.fancy-combo-list-select-all').item(0),
        value = selectAllEl.hasClass('fancy-combo-item-selected');

      setTimeout(function() {
        if (value) {
          selectAllEl.removeCls('fancy-combo-item-selected');
        }
        else {
          selectAllEl.addCls('fancy-combo-item-selected');
        }
      }, 100);

      lis.each(function (li, i) {
        if(value){
          if(li.hasClass('fancy-combo-item-selected')){
            li.dom.click();
          }
        }
        else{
          if(li.hasClass('fancy-combo-item-selected')){}
          else{
            li.dom.click();
          }
        }

      });
    },
    /*
     * @param {Object} field
     * @param {String} value
     */
    onSubSearchChange: function (field, value) {
      var me = this,
        lis = me.list.select('li'),
        height = 0,
        maxListHeight = me.listRowHeight * me.maxListRows;

      value = value.toLocaleLowerCase();

      F.each(me.data, function (item, i){
        if (new RegExp('^' + value).test(item[me.displayKey].toLocaleLowerCase())) {
          lis.item(i).css('display', 'block');
          height += parseInt(lis.item(i).css('height'));
        }
        else{
          lis.item(i).css('display', 'none');
        }
      });

      var listUl = me.list.select('ul').item(0);

      if(height > maxListHeight){
        listUl.css('height', maxListHeight);
      }
      else{
        listUl.css('height', height);
      }
    }
  });

})();
/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
(function() {
  //SHORTCUTS
  var F = Fancy;
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_BUTTON_CLS= F.FIELD_BUTTON_CLS;

  F.define(['Fancy.form.field.Button', 'Fancy.ButtonField'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.button',
    pressed: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('click');

      me.Super('init', arguments);

      me.preRender();
      me.render();
      me.renderButton();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }
    },
    fieldCls: FIELD_CLS + ' ' + FIELD_BUTTON_CLS,
    value: '',
    width: 100,
    emptyText: '',
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    renderButton: function(){
      var me = this;

      me.button = new F.Button({
        renderTo: me.el.select('.' + FIELD_TEXT_CLS).item(0).dom,
        text: me.buttonText,
        disabled: me.disabled,
        pressed: me.pressed,
        enableToggle: me.enableToggle,
        imageCls: me.imageCls,
        handler: function () {
          if(me.disabled){
            return;
          }

          if (me.scope) {
            me.handler.apply(me.scope, [me]);
          }
          else {
            me.handler(me);
          }
        }
      });
    },
    /*
     *
     */
    ons: function () {
      var me = this;

      me.button.on('pressedchange', function (button, value) {
        me.fire('pressedchange', value);
      });
    },
    /*
     *
     */
    onClick: function () {
      var me = this;

      if(me.disabled){
        return;
      }

      me.fire('click');

      if (me.handler) {
        me.handler();
      }
    },
    setPressed: function (value) {
      this.button.setPressed(value);
    }
  });
})();
/*
 * @class Fancy.SegButtonField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.SegButton', 'Fancy.SegButtonField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.button',
  allowToggle: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click', 'change');

    me.Super('init', arguments);

    me.preRender();
    me.render();
    me.renderButton();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-button',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  renderButton: function(){
    var me = this;

    me.button = new Fancy.SegButton({
      renderTo: me.el.select('.fancy-field-text').item(0).dom,
      items: me.items,
      disabled: me.disabled,
      multiToggle: me.multiToggle,
      allowToggle: me.allowToggle
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this;

    me.button.on('toggle', function(){
      if(me.disabled){
        return;
      }
      me.fire('toggle');
    });
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    if(me.disabled){
      return;
    }

    me.fire('click');

    if(me.handler){
      me.handler();
    }
  },
  /*
   * @return {String}
   */
  get: function(){
    var me = this,
      pressed = [];

    Fancy.each(me.items, function (item, i) {
      if(item.pressed){
        if(item.value){
          pressed.push(item.value);
        }
        else {
          pressed.push(i);
        }
      }
    });

    return pressed.toString();
  },
  /*
   * @param {Boolean} [fire]
   */
  clear: function(fire){
    if(this.allowToggle){
      Fancy.each(this.items, function (item){
        item.setPressed(false, fire);
      });
    }
  }
});
/*
 * @class Fancy.Tab
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Tab', 'Fancy.Tab'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.tab',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('collapsed', 'expanded');

    me.Super('init', arguments);

    var i = 0,
      iL = me.items.length,
      isItemTop;

    for(;i<iL;i++){
      var item = me.items[i];

      if( item.labelAlign === 'top' ){
        isItemTop = true;
        //break;
        if( i === 0 ){
          item.style = {
            'padding-left': '0px'
          };
        }
      }
    }

    me.preRender();
    me.render();
  },
  fieldCls: 'fancy fancy-field-tab',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    //'<div class="fancy-field-text fancy-field-tab-items">',
    '<div class="fancy-field-tab-items">',
    '</div>'
  ]
});
/*
 * @class Fancy.Radio
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_RADIO_CLS = F.FIELD_RADIO_CLS;
  var FIELD_RADIO_COLUMN_CLS = F.FIELD_RADIO_COLUMN_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_RADIO_ON_CLS = F.FIELD_RADIO_ON_CLS;
  var FIELD_RADIO_INPUT_CLS = F.FIELD_RADIO_INPUT_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;

  F.define(['Fancy.form.field.Radio', 'Fancy.Radio'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.radio',
    /*
     * @private
     */
    radioRows: 1,
    /*
     * @constructor
     */
    constructor: function () {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('focus', 'blur', 'input', 'up', 'down', 'change', 'key');
      me.Super('init', arguments);

      var itemsHTML = '';

      if (me.column) {
        me.cls += ' ' + FIELD_RADIO_COLUMN_CLS;
        itemsHTML += '<div style="margin-left: ' + ( me.labelWidth ) + 'px;">';
      }

      F.each(me.items, function (item, i) {
        var marginLeft = '',
          itemCls = FIELD_TEXT_CLS;

        if (!me.column && i !== 0) {
          marginLeft = 'margin-left:10px;';
        }

        if (item.value === me.value) {
          itemCls += ' ' + FIELD_RADIO_ON_CLS;
        }

        itemsHTML += [
          '<div class="' + itemCls + '" value=' + item.value + '>',
          '<div class="' + FIELD_RADIO_INPUT_CLS + '" style="float:left;' + marginLeft + '"></div>',
          '<div style="float:left;margin:7px 0 0 0;">' + item.text + '</div>',
          '</div>'
        ].join("");
      });

      if (me.column) {
        itemsHTML += '</div>';
      }

      me.itemsHTML = itemsHTML;

      me.preRender();
      me.render();
      me.setColumnsStyle();
      me.acceptedValue = me.value;
      me.set(me.value);

      me.ons();
    },
    labelText: '',
    labelWidth: 60,
    value: false,
    checkedCls: FIELD_RADIO_ON_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_RADIO_CLS,
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
        '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
        '{itemsHTML}',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     *
     */
    ons: function () {
      var me = this,
        el = this.el;

      el.$dom.delegate('.' + FIELD_TEXT_CLS, 'click', function () {
        if(me.disabled){
          return;
        }
        me.set(F.get(this).attr('value'));
      });

      el.on('mousedown', me.onMouseDown, me);
    },
    /*
     *
     */
    onClick: function () {
      var me = this,
        checkedCls = me.checkedCls;

      if(me.disabled){
        return;
      }

      me.addCls(checkedCls);
      me.toggleCls(checkedCls);

      me.value = me.hasCls(checkedCls);

      me.fire('change', me.value);
    },
    /*
     * @param {Object} e
     */
    onMouseDown: function (e) {
      if(this.disabled){
        e.stopPropagation();
      }
      e.preventDefault();
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set: function (value, fire) {
      var me = this,
        el = me.el,
        checkedCls = me.checkedCls,
        radioEls = el.select('.' + FIELD_TEXT_CLS);

      radioEls.removeCls(checkedCls);

      el.select('[value=' + value + ']').addCls(checkedCls);

      me.value = value;
      if (fire !== false) {
        me.fire('change', me.value);
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     * @return {*} value
     */
    getValue: function () {
      return this.value;
    },
    /*
     * @return {*} value
     */
    get: function () {
      return this.getValue();
    },
    /*
     *
     */
    clear: function () {
      this.set(false);
    },
    /*
     *
     */
    calcColumns: function () {
      var me = this,
        maxChars = 0,
        inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label) {
        inputWidth -= me.labelWidth;
        inputWidth -= 20;
      }

      F.Array.each(me.items, function (item) {
        if (item.text.length > maxChars) {
          maxChars = item.text.length;
        }
      });

      var columns = Math.floor(inputWidth / (maxChars * 7 + 30));

      if (me.columns && me.columns <= columns) {
        columns = me.columns;
      }
      else {
        me.columns = columns;
      }

      me.columnWidth = Math.ceil(inputWidth / columns);
      me.rows = Math.ceil(me.items.length / columns);
    },
    /*
     *
     */
    setColumnsStyle: function () {
      var me = this;

      if (!me.columns || me.rows === 1) {
        return;
      }

      var radioEls = me.el.select('.' + FIELD_TEXT_CLS),
        radioInputs = me.el.select('.' + FIELD_TEXT_CLS + ' .' + FIELD_RADIO_INPUT_CLS);

      radioEls.each(function (item, i) {
        if (i % me.columns === 0) {
          radioInputs.item(i).css('margin-left', '0px');
        }

        item.css('width', me.columnWidth);
      });
    }
  });

})();
(function () {

  Fancy.vtypes = {};

  /*
   * @param {String} name
   * @param {Object} o
   */
  Fancy.addValid = function(name, o){
    Fancy.vtypes[name] = o;
  };


  /*
   * @param {*} type
   * @param {*} value
   * @return {Boolean}
   */
  Fancy.isValid = function(type, value){
    var vtype;

    if (Fancy.isString(type)) {
      vtype = Fancy.vtypes[type];
    }
    else if(Fancy.isObject(type)) {
      if(type.type){
        vtype = Fancy.vtypes[type.type];
        Fancy.applyIf(type, vtype);
      }
      else{
        vtype = type;
      }
    }

    if (vtype.before) {
      var before = vtype.before,
        list = [type];

      if (Fancy.isString(before)) {
        list.push(before);
      }
      else if (Fancy.isArray(before)) {
        list = list.concat(before);
      }

      list.reverse();

      var i = 0,
        iL = list.length;

      for (; i < iL; i++) {
        if (Fancy.isObject(list[i])) {
          vtype = list[i];
        }
        else {
          vtype = Fancy.vtypes[list[i]];
        }

        if (vtype.re) {
          if(vtype.re.test(value) === false){
            return vtype;
          }
        }
        else if (vtype.fn) {
          if (vtype.fn.apply(vtype, [value]) === false) {
            return vtype;
          }
        }
      }
    }
    else{
      if (vtype.re) {
        if(vtype.re.test(value) === false){
          return vtype;
        }
      }
      else if (vtype.fn.apply(vtype, [value]) === false) {
        return vtype;
      }
    }

    return true;
  };

})();
Fancy.addValid('notempty', {
  text: 'Must be present',
  fn: function(value){
    if(value === null || value === undefined){
      return false;
    }

    return String(value).length !== 0;
  }
});

Fancy.addValid('notnan', {
  text: 'Must be numeric',
  fn: function(value){
    return !isNaN(value);
  }
});

Fancy.addValid('min', {
  before: ['notempty', 'notnan'],
  text: 'Must be must be at least {param}',
  fn: function(value){
    return value >= this.param;
  }
});

Fancy.addValid('max', {
  before: ['notempty', 'notnan'],
  text: 'Must be no more than {param}',
  fn: function(value){
    return value <= this.param;
  }
});

Fancy.addValid('range', {
  before: ['notempty', 'notnan'],
  text: 'Must be between {min} and {max}',
  fn: function(value){
    return value >= this.min && value <= this.max;
  }
});

Fancy.addValid('email', {
  before: 'notempty',
  re: /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+\/=?\^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/,
  text: 'Is not a valid email address'
});
/*
 * @mixin Fancy.grid.mixin.Edit
 */
Fancy.Mixin('Fancy.grid.mixin.Edit', {
  /*
   * @param {*} o
   * @param {Boolean} at
   */
  remove: function(o, at){
    var me = this,
      store = me.store,
      method = 'remove';

    if(!me.store){
      setTimeout(function(){
        me.remove(o, at)
      }, 100);
      return;
    }

    if(at){
      method = 'removeAt';
    }

    if(Fancy.isArray(o)){
      var i = 0,
        iL = o.length;

      for(;i<iL;i++){
        store[method](o[i]);
      }
    }
    else{
      store[method](o);
    }

    me.setSidesHeight();
  },
  /*
   * @param {*} o
   */
  removeAt: function(o){
    this.remove(o, true);
  },
  /*
   * @param {Number} row
   */
  removeRow: function(row){
    this.remove(row, true);
  },
  /*
   * @param {*} id
   */
  removeRowById: function(id){
    this.remove(id);
  },
  /*
   * @param {*} id
   */
  removeRowByID: function(id){
    this.remove(id);
  },
  /*
   *
   */
  removeAll: function () {
    var me = this;

    me.store.removeAll();
    me.update();
    me.scroller.update();

    if(me.paging){
      me.paging.updateBar();
    }

    if(me.grouping){
      me.grouping.reGroup();
    }
  },
  /*
   * @param {*} o
   */
  add: function(o){
    var me = this;

    if(!me.store){
      setTimeout(function(){
        me.add(o)
      }, 100);
      return;
    }

    if(Fancy.isArray(o)){
      var i = 0,
        iL = o.length;

      for(;i<iL;i++){
        me.add(o[i]);
      }

      return;
    }

    me.store.add(o);
    me.setSidesHeight();
  },
  /*
   * @param {Number} index
   * @param {Object} o
   */
  insert: function(index, o){
    var me = this,
      s = me.store;

    if(!me.store){
      setTimeout(function(){
        me.insert(index, o)
      }, 100);
      return;
    }

    if(Fancy.isArray(o)){
      var i = o.length - 1;

      for(;i !== -1;i--){
        me.insert(o[i], index);
      }

      me.setSidesHeight();
      return;
    }
    else if(Fancy.isArray(index)){
      var i = index.length - 1;

      for(;i !== -1;i--){
        me.insert(index[i], 0);
      }

      me.setSidesHeight();
      return;
    }
    else if(Fancy.isObject(index) && o === undefined){
      o = index;
      index = 0;
    }
    else if(Fancy.isObject(index) && Fancy.isNumber(o)){
      var _index = o;
      o = index;
      index = _index;
    }

    if(me.paging && s.proxyType !== 'server'){
      index += s.showPage * s.pageSize;
    }

    s.insert(index, o);
    me.setSidesHeight();
  },
  /*
   * @param {Number} rowIndex
   * @param {String} key
   * @param {*} value
   */
  set: function(rowIndex, key, value){
    var me = this,
      s = me.store;

    if(!me.store){
      setTimeout(function(){
        me.set(rowIndex, key, value)
      }, 100);
      return;
    }

    if(Fancy.isObject(key) && value === undefined){
      s.setItemData(rowIndex, key, value);
    }
    else {
      s.set(rowIndex, key, value);
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} key
   * @param {*} value
   * @return {Number}
   */
  setById: function(id, key, value){
    var me = this,
      s = me.store,
      rowIndex = s.getRow(id);

    if(rowIndex === undefined){
      var item = s.getById(id);

      if(item === undefined){
        return false;
      }

      rowIndex = -1;
    }

    if(!me.store){
      setTimeout(function(){
        if(rowIndex === -1){
          me.setById(rowIndex, key, value)
        }
        else{
          me.set(rowIndex, key, value)
        }
      }, 100);
      return rowIndex;
    }

    if(Fancy.isObject(key) && value === undefined){
      for(var p in key){
        var column = me.getColumnByIndex(p);

        if(column && column.type === 'date'){
          var format = column.format,
            newDate = Fancy.Date.parse(key[p], format.read, format.mode),
            oldDate = Fancy.Date.parse(s.getById(id).get(p), format.edit, format.mode);

          if(+newDate === +oldDate){
            delete key[p];
          }
        }

        s.setItemData(rowIndex, key, value, id);

        if(rowIndex === -1){
          s.getById(id).set(key);
        }
      }
    }
    else {
      s.set(rowIndex, key, value, id);

      if(rowIndex === -1){
        s.getById(id).set(key, value);
      }
    }

    return rowIndex;
  },
  /*
   * TODO: undo by id and key
   */
  undo: function () {
    var me = this,
      s = me.store,
      action = s.undoActions.splice(s.undoActions.length - 1, 1)[0];

    switch(action.type){
      case 'edit':
        me.setById(action.id, action.key, action.oldValue);
        var value = action.value;
        action.value = action.oldValue;
        action.oldValue = value;
        s.redoActions.push(action);
        me.fire('undo');
        break;
      case 'insert':
        s.undoStoppped = true;
        me.remove(action.id);
        s.undoStoppped = false;
        s.redoActions.push(action);
        break;
      case 'remove':
        s.undoStoppped = true;
        me.insert(action.rowIndex, action.data);
        s.undoStoppped = false;
        s.redoActions.push(action);
        break;
    }
  },
  /*
   *
   */
  redo: function () {
    var me = this,
      s = me.store,
      action = s.redoActions.splice(s.redoActions.length - 1, 1)[0];

    s.redoing = true;
    switch(action.type){
      case 'edit':
        me.setById(action.id, action.key, action.oldValue);
        break;
      case 'insert':
        me.insert(action.rowIndex, action.data);
        break;
      case 'remove':
        me.remove(action.id);
        break;
    }

    delete s.redoing;
  },
  /*
   *
   */
  undoAll: function () {
    var me = this,
      s = me.store,
      i = 0,
      iL = s.undoActions.length;

    for(;i<iL;i++){
      me.undo();
    }
  }
});
/**
 * @class Fancy.Grid
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Grid', 'FancyGrid'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.grid.mixin.Grid',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.grid.mixin.PrepareConfig',
    'Fancy.grid.mixin.ActionColumn',
    Fancy.grid.mixin.Edit
  ],
  plugins: [{
    type: 'grid.updater'
  },{
    type: 'grid.scroller'
  },{
    type: 'grid.licence'
  }],
  type: 'grid',
  theme: 'default',
  i18n: 'en',
  emptyText: '',
  prefix: 'fancy-grid-',
  cls: '',
  widgetCls: Fancy.GRID_CLS,
  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  rowLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
  minColumnWidth: 30,
  defaultColumnWidth: 100,
  emptyValue: '&nbsp;',
  frame: true,
  draggable: false,
  activated: false,
  multiSort: false,
  tabEdit: true,
  dirtyEnabled: true,
  barScrollEnabled: true,
  startResizing: false,
  /*
   * @constructor
   * @param {*} renderTo
   * @param {Object} [config]
   */
  constructor: function(renderTo, config){
    var me = this;

    if(Fancy.isDom(renderTo)){
      config = config || {};
      config.renderTo = renderTo;
    }
    else{
      config = renderTo;
    }

    config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      if(config.id){
        me.id = config.id;
      }
      me.initId();
      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ){
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    if(!Fancy.modules['grid'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false){
      if(Fancy.nojQuery){
        Fancy.loadModule('dom', function(){
          Fancy.loadModule('grid', function(){
            preInit();
          });
        });
      }
      else{
        Fancy.loadModule('grid', function(){
          preInit();
        });
      }
    }
    else{
      preInit();
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    //me.initId();
    me.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
    me.addEvents(
      'headercellclick', 'headercellmousemove', 'headercellmousedown',
      'docmouseup', 'docclick', 'docmove',
      'beforeinit', 'init',
      'columnresize', 'columnclick', 'columndblclick', 'columnenter', 'columnleave', 'columnmousedown', 'columntitlechange',
      'cellclick', 'celldblclick', 'cellenter', 'cellleave', 'cellmousedown', 'beforecellmousedown',
      'rowclick', 'rowdblclick', 'rowenter', 'rowleave', 'rowtrackenter', 'rowtrackleave',
      'columndrag',
      'columnhide', 'columnshow',
      'scroll', 'nativescroll',
      'remove',
      'insert',
      'set',
      'update',
      'beforesort', 'sort',
      'beforeload', 'load', 'servererror', 'serversuccess',
      'select', 'selectrow', 'deselectrow',
      'clearselect',
      'activate', 'deactivate',
      'beforeedit',
      'startedit',
      'changepage', 'changepagesize',
      'dropitems',
      'collapse', 'expand',
      'lockcolumn', 'rightlockcolumn', 'unlockcolumn',
      'filter',
      'contextmenu',
      'statechange'
    );

    Fancy.loadStyle();

    if(Fancy.fullBuilt !== true && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(me.wtype !== 'datepicker' && me.wtype !== 'monthpicker') {
        me.loadModules();
        return;
      }
    }

    me.initStore();

    me.initPlugins();

    me.ons();

    me.initDateColumn();
    me.fire('beforerender');
    me.preRender();
    me.render();
    me.initElements();
    me.initActionColumnHandler();
    me.fire('render');
    me.fire('afterrender');
    me.setSides();
    me.setSidesHeight();
    me.setColumnsPosition();
    me.update();
    me.initTextSelection();
    me.initTouch();

    me.fire('beforeinit');

    setTimeout(function(){
      me.inited = true;
      me.fire('init');

      me.setBodysHeight();
    }, 1);
  },
  /*
   *
   */
  loadModules: function(){
    var me = this,
      requiredModules = {},
      columns = me.columns || [],
      leftColumns = me.leftColumns || [],
      rightColumns = me.rightColumns || [];

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(me.summary){
      requiredModules.summary = true;
    }

    if(me.exporter){
      requiredModules.exporter = true;
      requiredModules.excel = true;
    }

    if(me.paging){
      requiredModules.paging = true;
    }

    if(me.filter || me.searching){
      requiredModules.filter = true;
    }

    if(me.data && me.data.proxy){
      requiredModules.edit = true;
    }

    if(me.clicksToEdit){
      requiredModules.edit = true;
    }

    if(me.stateful || me.state){
      requiredModules.state = true;
    }

    if(Fancy.isObject(me.data)){
      if(me.data.proxy){
        requiredModules['server-data'] = true;
        if(Fancy.nojQuery){
          requiredModules['ajax'] = true;
        }
      }

      if(me.data.chart){
        requiredModules['chart-integration'] = true;
      }
    }

    if(me.expander){
      requiredModules['expander'] = true;
    }

    if(me.isGroupedHeader){
      requiredModules['grouped-header'] = true;
    }

    if(me.grouping){
      requiredModules['grouping'] = true;
    }

    if(me.summary){
      requiredModules['summary'] = true;
    }

    if(me.exporter){
      requiredModules['exporter'] = true;
      requiredModules['excel'] = true;
    }

    if(me.trackOver || me.columnTrackOver || me.cellTrackOver || me.selection){
      requiredModules['selection'] = true;
    }

    if(me.contextmenu){
      requiredModules['menu'] = true;
    }

    var containsMenu = function (item) {
      if(item.menu){
        requiredModules['menu'] = true;
        return true;
      }
    };

    Fancy.each(me.events, function (e) {
      for(var p in e){
        if(p === 'contextmenu'){
          requiredModules.menu = true;
        }
      }
    });

    Fancy.each(me.controls, function (c) {
      if(c.event === 'contextmenu'){
        requiredModules.menu = true;
      }
    });
    
    Fancy.each(me.tbar, containsMenu);
    Fancy.each(me.bbar, containsMenu);
    Fancy.each(me.buttons, containsMenu);
    Fancy.each(me.subTBar, containsMenu);

    var _columns = columns.concat(leftColumns).concat(rightColumns);

    Fancy.each(_columns, function(column){
      if(column.draggable === true){
        requiredModules['column-drag'] = true;
      }

      if(column.sortable === true){
        requiredModules.sort = true;
      }

      if(column.editable === true){
        requiredModules.edit = true;
      }

      if(column.menu){
        requiredModules.menu = true;
      }

      if(column.filter){
        requiredModules.filter = true;
      }

      switch(column.type){
        case 'select':
          me.checkboxRowSelection = true;
          requiredModules['selection'] = true;
          break;
        case 'combo':
          if(column.data && column.data.proxy){
            requiredModules['ajax'] = true;
          }
          break;
        case 'progressbar':
        case 'progressdonut':
        case 'grossloss':
        case 'hbar':
          requiredModules.spark = true;
          break;
        case 'tree':
          requiredModules.tree = true;
          break;
        case 'date':
          requiredModules.date = true;
          requiredModules.selection = true;
          break;
      }
    });

    if(Fancy.isArray(me.tbar)){
      Fancy.each(me.tbar, function(item){
        switch(item.action){
          case 'add':
          case 'remove':
            requiredModules.edit = true;
            break;
        }
      });
    }

    if(me.gridToGrid){
      requiredModules.dd = true;
    }

    if(me.rowDragDrop){
      requiredModules.dd = true;
    }

    me.neededModules = {
      length: 0
    };

    for(var p in requiredModules){
      if(Fancy.modules[p] === undefined) {
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      me.init();
      return;
    }

    var onLoad = function(name){
      delete me.neededModules[name];
      me.neededModules.length--;

      if(me.neededModules.length === 0){
        me.neededModules = true;
        me.init();
      }
    };

    if(me.neededModules.dom){
      Fancy.loadModule('dom', function (name) {
        delete me.neededModules[name];
        me.neededModules.length--;

        if(me.neededModules.length === 0){
          me.neededModules = true;
          me.init();
        }
        else{
          for (var p in me.neededModules) {
            if (p === 'length') {
              continue;
            }

            Fancy.loadModule(p, onLoad);
          }
        }
      });
    }
    else {
      for (var p in me.neededModules) {
        if (p === 'length') {
          continue;
        }

        Fancy.loadModule(p, onLoad);
      }
    }
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  lockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    if(Fancy.isString(indexOrder)){
      Fancy.each(me.columns, function (column, i) {
        if(column.index === indexOrder){
          indexOrder = i;
          return true;
        }
      });
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, me.leftColumns.length, 'left');
    me.body.reSetIndexes();
    me.leftBody.reSetIndexes();

    me.fire('lockcolumn', {
      column: removedColumn
    });
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  rightLockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    if(Fancy.isString(indexOrder)){
      Fancy.each(me.columns, function (column, i) {
        if(column.index === indexOrder){
          indexOrder = i;
          return true;
        }
      });
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, 0, 'right');
    me.body.reSetIndexes();
    me.rightBody.reSetIndexes();

    me.fire('rightlockcolumn', {
      column: removedColumn
    });
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  unLockColumn: function(indexOrder, side){
    var me = this,
      removedColumn;

    if(side === undefined){
      if(Fancy.isString(indexOrder)) {
        Fancy.each(me.leftColumns, function (column, i) {
          if (column.index === indexOrder) {
            side = 'left';
            indexOrder = i;
            return true;
          }
        });

        if(side === undefined){
          Fancy.each(me.rightColumns, function (column, i) {
            if (column.index === indexOrder) {
              side = 'right';
              indexOrder = i;
              return true;
            }
          });
        }
      }
      else{
        side = 'left';
      }
    }

    switch(side){
      case 'left':
        if(Fancy.isString(indexOrder)){
          Fancy.each(me.leftColumns, function (column, i) {
            if(column.index === indexOrder){
              indexOrder = i;
              return true;
            }
          });
        }

        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, 0, 'center', 'left');

        if(me.leftColumns.length === 0){
          me.leftEl.addCls(Fancy.GRID_LEFT_EMPTY_CLS);
          me.centerEl.css('left', '0px');
        }
        break;
      case 'right':
        if(Fancy.isString(indexOrder)){
          Fancy.each(me.rightColumns, function (column, i) {
            if(column.index === indexOrder){
              indexOrder = i;
              return true;
            }
          });
        }

        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, me.columns.length, 'center', 'right');

        if(me.rightColumns.length === 0){
          me.rightEl.addCls(Fancy.GRID_RIGHT_EMPTY_CLS);
          var bodyWidth = parseInt(me.body.el.css('width'));

          me.body.el.css('width', bodyWidth + 2);
        }
        break;
    }

    if(side === 'left' && me.grouping && me.leftColumns.length === 0){
      me.grouping.insertGroupEls();
    }

    me.body.reSetIndexes();
    me.leftBody.reSetIndexes();
    me.rightBody.reSetIndexes();

    me.fire('unlockcolumn', {
      column: removedColumn
    });
  },
  /*
   * @param {String} fromSide
   * @param {String} toSide
   * @param {Number} fromIndex
   * @param {Number} toIndex
   * @param {Object} [grouping]
   */
  moveColumn: function (fromSide, toSide, fromIndex, toIndex, grouping) {
    var me = this,
      removedColumn;

    if(grouping){
      var i = 0,
        iL = grouping.end - grouping.start + 1,
        groupIndex = grouping.cell.attr('index'),
        toHeader = me.getHeader(toSide),
        groupCellHTML = grouping.cell.dom.outerHTML;

      for(;i<iL;i++){
        me.moveColumn(fromSide, toSide, grouping.end - i, toIndex);
      }

      var toColumns = me.getColumns(toSide);
      var cells = toHeader.el.select('.' + Fancy.GRID_HEADER_CELL_CLS);

      i = toIndex;
      iL = i + (grouping.end - grouping.start + 1);

      for(;i<iL;i++){
        var column = toColumns[i],
          cell =  cells.item(i);

        column.grouping = groupIndex;
        cell.attr('group-index', groupIndex);
      }

      toHeader.el.append(groupCellHTML);

      toHeader.fixGroupHeaderSizing();

      return;
    }

    if(fromSide === 'center'){
      removedColumn = me.removeColumn(fromIndex, 'center');
      switch(toSide){
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'center');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'center');
          break;
      }
    }
    else if(fromSide === 'left'){
      removedColumn = me.removeColumn(fromIndex, 'left');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'left');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'left');
          break;
      }
    }
    else if(fromSide === 'right'){
      removedColumn = me.removeColumn(fromIndex, 'right');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'right');
          break;
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'right');
          break;
      }
    }

    if(me.groupheader){
      me.header.fixGroupHeaderSizing();

      if(me.leftColumns){
        me.leftHeader.fixGroupHeaderSizing();
      }

      if(me.rightColumns){
        me.rightHeader.fixGroupHeaderSizing();
      }
    }

    me.getHeader(fromSide).reSetCheckBoxes();
    me.getHeader(toSide).reSetCheckBoxes();
  },
  updateColumnsVisibilty: function () {
    var me = this;

    if(me.columns){
      if(me.header){
        me.header.updateCellsVisibility();
      }
      me.body.updateColumnsVisibility();
    }

    if(me.leftColumns){
      if(me.leftHeader){
        me.leftHeader.updateCellsVisibility();
      }
      me.leftBody.updateColumnsVisibility();
    }

    if(me.rightColumns){
      if(me.rightHeader){
        me.rightHeader.updateCellsVisibility();
      }
      me.rightBody.updateColumnsVisibility();
    }
  }
});

/*
 * @param {String} id
 */
FancyGrid.get = function(id){
  var el = Fancy.get(id);

  if(!el.dom){
    return;
  }

  var gridEl = el.select('.' + Fancy.GRID_CLS).item(0);

  if(!gridEl.dom){
    return;
  }

  var gridId = gridEl.dom.id;

  return Fancy.getWidget(gridId);
};

FancyGrid.defineTheme = Fancy.defineTheme;
FancyGrid.defineController = Fancy.defineController;
FancyGrid.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyGrid = function(o){
    if(this.selector){
      o.renderTo = $(this.selector)[0].id;
    }
    else{
      o.renderTo = this.attr('id');
    }

    return new Fancy.Grid(o);
  };
}
/*
 * @class Fancy.grid.plugin.RowHeight
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.grid.plugin.RowHeight', {
    extend: F.Plugin,
    ptype: 'grid.rowheight',
    inWidgetName: 'rowheight',
    cellTip: '{value}',
    stopped: true,
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);

      this.rows = {};
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.on('init', me.onInit, me);
      w.on('update', me.onUpdate, me);
    },
    onInit: function () {
      var me = this,
        w = me.widget;

      setTimeout(function () {
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    onUpdate: function () {
      var me = this,
        w = me.widget,
        viewData = w.getDataView(),
        totalHeight = 0;

      F.each(viewData, function (item) {
        var id = item.id,
          height = me.rows[id],
          rowIndex = w.getRowById(id),
          cells = w.getDomRow(rowIndex);

        F.each(cells, function (cellDom) {
          var cell = F.get(cellDom);

          cell.css('height', height);
        });

        totalHeight += height;
      });

      me.totalHeight = totalHeight;

      if(w.grouping){
        me.totalHeight += w.grouping.getGroupRowsHeight();
      }

      setTimeout(function () {
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    add: function (id, height) {
      this.rows[id] = height;
    },
    /*
     *
     */
    getRowsHeight: function (items) {
      var me = this,
        height = 0;

      F.each(items, function (item) {
        var id = item.get('id');

        height += me.rows[id];
      });

      return height;
    }
  });

})();
/*
 * @class Fancy.grid.plugin.CellTip
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;
  var HIDE_TIMEOUT = 500;

  var TOOLTIP_CLS = F.TOOLTIP_CLS;
  var TOOLTIP_INNER_CLS = F.TOOLTIP_INNER_CLS;

  F.define('Fancy.grid.plugin.CellTip', {
    extend: F.Plugin,
    ptype: 'grid.celltip',
    inWidgetName: 'celltip',
    cellTip: '{value}',
    stopped: true,
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      w.on('cellenter', me.onCellEnter, me);
      w.on('cellleave', me.onCellLeave, me);
      docEl.on('touchend', me.onTouchEnd, me);
      docEl.on('mousemove', me.onDocMove, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellEnter: function (grid, o) {
      var me = this,
        column = o.column,
        cellTip = me.cellTip,
        e = o.e;

      if (column.cellTip) {
        if (F.isString(column.cellTip)) {
          cellTip = column.cellTip;
        }
        else if (F.isFunction(column.cellTip)) {
          cellTip = column.cellTip(o);
          if (cellTip === false) {
            return;
          }
        }

        var tpl = new F.Template(cellTip),
          data = {
            title: column.title,
            value: o.value,
            columnIndex: 0,
            rowIndex: 0
          };

        me.stopped = false;
        F.apply(data, o.data);

        F.tip.update(tpl.getHTML(data));
        F.tip.show(e.pageX + 15, e.pageY - 25);

      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellLeave: function (grid, o) {
      this.stopped = true;
      F.tip.hide(HIDE_TIMEOUT);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onTouchEnd: function (grid, o) {
      this.stopped = true;
      F.tip.hide(HIDE_TIMEOUT);
    },
    /*
     * @param {Object} e
     */
    onDocMove: function (e) {
      if (this.stopped === true) {
        return;
      }

      var me = this,
        w = me.widget;

      if(w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none')){
        me.stopped = true;
        F.tip.hide(HIDE_TIMEOUT);
        return;
      }

      var targetEl = F.get(e.target);

      if(targetEl.prop('tagName').toLocaleLowerCase() === 'body'){
        me.stopped = true;
        F.tip.hide(HIDE_TIMEOUT);
        return;
      }

      if(!targetEl.hasClass(TOOLTIP_CLS) && !targetEl.hasClass(TOOLTIP_INNER_CLS)){
        if(w.el.within(targetEl) === false){
          me.stopped = true;
          F.tip.hide(HIDE_TIMEOUT);
          return;
        }
      }

      F.tip.show(e.pageX + 15, e.pageY - 25);
    }
  });

})();
/*
 * @class Fancy.ToolTip
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var TOOLTIP_CLS = F.TOOLTIP_CLS;
  var TOOLTIP_INNER_CLS = F.TOOLTIP_INNER_CLS;

  F.define('Fancy.ToolTip', {
    extend: F.Widget,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.initTpl();
      this.render();
      this.ons();
    },
    tpl: [
      '<div class="' + TOOLTIP_INNER_CLS + '">{text}</div>'
    ],
    widgetCls: TOOLTIP_CLS,
    cls: '',
    extraCls: '',
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.get(document.createElement('div'));

      el.addCls(
        F.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
      );

      el.update(me.tpl.getHTML({
        text: me.text
      }));

      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     * @param {Number} x
     * @param {Number} y
     */
    show: function (x, y) {
      var me = this;

      if (me.timeout) {
        clearInterval(me.timeout);
        delete me.timeout;
      }

      if (me.css('display') === 'none') {
        me.css({
          display: 'block'
        });
      }

      me.css({
        left: x,
        top: y
      });
    },
    /*
     * @param {Number} [delay]
     */
    hide: function (delay) {
      var me = this;

      if (me.timeout) {
        clearInterval(me.timeout);
        delete me.timeout;
      }

      if (delay) {
        me.timeout = setTimeout(function () {
          me.el.hide();
        }, delay);
      }
      else {
        me.el.hide();
      }
    },
    /*
     *
     */
    destroy: function () {
      this.el.destroy();
    },
    /*
     * @param {String} html
     */
    update: function (html) {
      this.el.select('.' + TOOLTIP_INNER_CLS).update(html);
    },
    ons: function () {
      var me = this;

      me.el.on('mouseenter', me.onMouseEnter, me);
    },
    onMouseEnter: function (e) {
      var me = this;

      //me.show(e.pageX + parseInt(me.el.css('width')), e.pageY - parseInt(me.el.css('height'))/2);
      me.hide(500);
    }
  });

  F.tip = {
    update: function (text) {
      F.tip = new F.ToolTip({
        text: text
      });
    },
    show: function (x, y) {
      F.tip = new F.ToolTip({
        text: ' '
      });
      F.tip.show(x, y);
    },
    hide: function () {
      F.tip = new F.ToolTip({
        text: ' '
      });
    }
  };

})();
/*
 *
 */
Fancy.enableCompo = function(){
  var doc = document,
    componentsLength = 0,
    components = {},
    interval;

  /*
   * @constructor
   * @param {String} selector
   * @param {Object} o
   */
  Fancy.Component = function (selector, o) {
    componentsLength++;
    components[selector] = o;
  };

  /*
   *
   */
  Fancy.stopWatch = function(){
    clearInterval(interval);
  };

  function findComponent() {
    if (componentsLength === 0) return;

    for (var p in components) {
      var comp = components[p],
        founded = doc.querySelectorAll(p),
        attrPreSelector = comp.appPreSelector ? comp.appPreSelector + '-' : 'data-',
        preSelector = comp.preSelector ? comp.preSelector + '-' : 'fancy-',
        i = 0,
        iL = founded.length,
        j,
        jL;

      if (founded.length === 0) {
        return;
      }

      for (; i < iL; i++) {
        var itemConfig = {},
          item = founded[i],
          id = item.id || 'rand-id-' + (+new Date()),
          attrs = item.attributes;

        j = 0;
        jL = attrs.length;

        //Get values in attributes values
        for (; j < jL; j++) {
          var attr = attrs[j],
            attrName = attr.name,
            attrValue = attr.value;

          if (new RegExp(attrPreSelector).test(attrName)) {
            attrValue = prePareValue(attrValue);

            itemConfig[attrName.replace(attrPreSelector, '')] = attrValue;
          }
        }

        //Get values in innerHTML tags
        (function getValuesInTags() {
          var childs = item.getElementsByTagName('*');

          j = 0;
          jL = childs.length;

          for (; j < jL; j++) {
            var child = childs[j],
              tagName = child.tagName.toLowerCase(),
              name,
              value;

            if (new RegExp(preSelector).test(tagName)) {
              name = tagName.replace(preSelector, '');
              value = prePareValue(child.innerHTML);

              itemConfig[name.replace(attrPreSelector, '')] = value;
            }
          }

        })(item, itemConfig);

        item.outerHTML = '<div id="' + id + '"></div>';
        comp.init(doc.getElementById(id), itemConfig);
      }
    }
  }

  /*
   * @param {String} v
   * @return {String}
   */
  function prePareValue(v) {
    if (/\[/.test(v) || /\{/.test(v)) {
      v = v.replace(/\n/g, '');
      v = (new Function("return " + v + ";")());
    }
    else if (!isNaN(Number(v))) {
      v = Number(v);
    }
    else {
      v = v.replace(/\n/g, '');
    }

    return v;
  }

  findComponent();

  doc.addEventListener("DOMContentLoaded", function() {
    findComponent();
  });

  setTimeout(function(){
    findComponent();
  }, 1);

  interval = setInterval(function(){
    findComponent();
  }, 250);

  Fancy.Component('fancy-grid', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyGrid(config);
    }
  });

  Fancy.Component('fancy-form', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyForm(config);
    }
  });

  Fancy.Component('fancy-tab', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyTab(config);
    }
  });
};

  return Fancy;
}));