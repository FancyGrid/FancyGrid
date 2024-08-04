/*
 * @mixin Fancy.panel.mixin.methods
 */
Fancy.Mixin('Fancy.panel.mixin.methods', {
  /*
   * @param {String} value
   */
  setTitle(value){
    if (this.panel) {
      this.panel.setTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getTitle(){
    if (this.panel) {
      return this.panel.getTitle();
    }
  },
  /*
   * @param {String} value
   */
  setSubTitle(value){
    if (this.panel) {
      this.panel.setSubTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getSubTitle(){
    if (this.panel) {
      return this.panel.getSubTitle();
    }
  }
});
