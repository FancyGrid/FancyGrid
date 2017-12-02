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