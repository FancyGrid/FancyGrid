/*
 * @mixin Fancy.panel.mixin.DD
 */
Fancy.Mixin('Fancy.panel.mixin.DD', {
  ddCls: Fancy.PANEL_DRAGGABLE_CLS,
  /*
   *
   */
  initDD(){
    this.addDDCls();
    this.addDD();
  },
  /*
   *
   */
  addDDCls(){
    this.el.addCls(this.ddCls);
  },
  /*
   *
   */
  addDD(){
    Fancy.DD.add({
      dragEl: this.el,
      overEl: this.el.select(`.${Fancy.PANEL_HEADER_CLS}`).item(0)
    });
  }
});
