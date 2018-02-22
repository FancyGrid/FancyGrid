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