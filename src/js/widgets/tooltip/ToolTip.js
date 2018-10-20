/*
 * @class Fancy.ToolTip
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var TOOLTIP_CLS = F.TOOLTIP_CLS;
  var TOOLTIP_INNER_CLS = F.TOOLTIP_INNER_CLS;

  F.define('Fancy.ToolTip', {
    extend: F.Widget,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function () {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.initTpl();
      this.render();
      this.ons();
    },
    tpl: [
      '<div class="' + TOOLTIP_INNER_CLS + '">{text}</div>'
    ],
    widgetCls: TOOLTIP_CLS,
    cls: '',
    extraCls: '',
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.get(document.createElement('div'));

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
    show: function (x, y) {
      var me = this;

      if (me.timeout) {
        clearInterval(me.timeout);
        delete me.timeout;
      }

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
    hide: function (delay) {
      var me = this;

      if (me.timeout) {
        clearInterval(me.timeout);
        delete me.timeout;
      }

      if (delay) {
        me.timeout = setTimeout(function () {
          me.el.hide();
        }, delay);
      }
      else {
        me.el.hide();
      }
    },
    /*
     *
     */
    destroy: function () {
      this.el.destroy();
    },
    /*
     * @param {String} html
     */
    update: function (html) {
      this.el.select('.' + TOOLTIP_INNER_CLS).update(html);
    },
    ons: function () {
      var me = this;

      me.el.on('mouseenter', me.onMouseEnter, me);
    },
    onMouseEnter: function (e) {
      var me = this;

      //me.show(e.pageX + parseInt(me.el.css('width')), e.pageY - parseInt(me.el.css('height'))/2);
      me.hide(500);
    }
  });

  F.tip = {
    update: function (text) {
      F.tip = new F.ToolTip({
        text: text
      });
    },
    show: function (x, y) {
      F.tip = new F.ToolTip({
        text: ' '
      });
      F.tip.show(x, y);
    },
    hide: function () {
      F.tip = new F.ToolTip({
        text: ' '
      });
    }
  };

})();