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