/*
 * @class Fancy.ToolTip
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const TOOLTIP_CLS = F.TOOLTIP_CLS;
  const TOOLTIP_INNER_CLS = F.TOOLTIP_INNER_CLS;

  F.define('Fancy.ToolTip', {
    extend: F.Widget,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      this.initTpl();
      this.render();
      this.ons();
    },
    tpl: [
      `<div class="${TOOLTIP_INNER_CLS}">{text}</div>`
    ],
    widgetCls: TOOLTIP_CLS,
    cls: '',
    extraCls: '',
    /*
     *
     */
    render(){
      const me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.newEl('div');

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
    show(x, y){
      const me = this;

      clearInterval(me.timeout);
      delete me.timeout;

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
    hide(delay){
      const me = this;

      clearInterval(me.timeout);

      if (delay) {
        me.timeout = setTimeout(() => {
          me.el.hide();
          delete me.timeout;
        }, delay);
      }
      else {
        me.el.hide();
      }
    },
    /*
     *
     */
    destroy(){
      this.el.destroy();
    },
    /*
     * @param {String} html
     */
    update(html){
      this.el.select(`.${TOOLTIP_INNER_CLS}`).update(html);
    },
    ons(){
      const me = this;

      me.el.on('mouseenter', me.onMouseEnter, me);
    },
    onMouseEnter(){
      const me = this;

      //me.show(e.pageX + parseInt(me.el.css('width')), e.pageY - parseInt(me.el.css('height'))/2);
      me.hide(500);
    }
  });

  F.tip = {
    update(text){
      F.tip = new F.ToolTip({
        text: text
      });
    },
    show(x, y){
      F.tip = new F.ToolTip({
        text: ' '
      });
      F.tip.show(x, y);
    },
    hide(){
      F.tip = new F.ToolTip({
        text: ' '
      });
    }
  };

})();
