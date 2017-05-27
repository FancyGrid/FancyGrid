/*
 * @mixin Fancy.panel.mixin.methods
 */
Fancy.Mixin('Fancy.panel.mixin.methods', {
  /*
   * @param {String} value
   */
  setTitle: function(value){
    var me = this;

    if(me.panel){
      me.panel.setTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getTitle: function(){
    var me = this;

    if(me.panel){
      return me.panel.getTitle();
    }
  },
  /*
   * @param {String} value
   */
  setSubTitle: function(value){
    var me = this;

    if(me.panel){
      me.panel.setSubTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getSubTitle: function(){
    var me = this;

    if(me.panel){
      return me.panel.getSubTitle();
    }
  }
});