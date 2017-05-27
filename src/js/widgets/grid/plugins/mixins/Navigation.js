/*
 * @class Fancy.grid.selection.mixin.Navigation
 */
Fancy.Mixin('Fancy.grid.selection.mixin.Navigation', {
  /*
   *
   */
  initNavigation: function(){
    var me = this,
      w = me.widget;

    me.addEvents('up', 'down', 'left', 'right');

    me.onsNav();
  },
  /*
   *
   */
  onsNav: function(){
    var me = this,
      w = me.widget,
      doc = Fancy.get(document);

    doc.on('keydown', me.onKeyDown, me);
    w.el.on('keydown', me.onKeyDown, me);
  },
  /*
   * @param {Object} e
   */
  onKeyDown: function(e){
    var me = this,
      w = me.widget,
      keyCode = e.keyCode,
      key = Fancy.key,
      selModel = w.selModel;

    switch(keyCode) {
      case key.TAB:

        break;
      case key.UP:

        break;
      case key.DOWN:

        break;
      case key.LEFT:

        break;
      case key.RIGHT:

        break;
    }
  }
});