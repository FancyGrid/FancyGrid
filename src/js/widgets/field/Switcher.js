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