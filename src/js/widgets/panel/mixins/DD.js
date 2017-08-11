/*
 * @mixin Fancy.panel.mixin.DD
 */
Fancy.Mixin('Fancy.panel.mixin.DD', {
  ddCls: 'fancy-panel-draggable',
  /*
   *
   */
  initDD: function(){
    var me = this;

    me.addDDCls();
    me.addDD();
  },
  /*
   *
   */
  addDDCls: function(){
    var me = this;

    me.el.addClass(me.ddCls);
  },
  /*
   *
   */
  addDD: function(){
    var me = this;

    Fancy.DD.add({
      dragEl: me.el,
      overEl: me.el.select('.fancy-panel-header').item(0)
    });
  }
});