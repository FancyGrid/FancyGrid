(function() {
  var toggleGroups = {};

  /**
   * @class Fancy.Button
   * @extends Fancy.Widget
   */
  Fancy.define('Fancy.Button', {
    extend: Fancy.Widget,
    //minWidth: 43,
    minWidth: 30,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function(config, scope){
      var me = this;

      if (config.toggleGroup) {
        toggleGroups[config.toggleGroup] = toggleGroups[config.toggleGroup] || {
            active: false,
            items: []
          };

        toggleGroups[config.toggleGroup].items.push(me);
      }

      me.scope = scope;

      me.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'pressedchange');
      me.Super('init', arguments);

      me.style = me.style || {};

      me.initTpl();
      me.render();
      me.setOns();
    },
    /*
     *
     */
    setOns: function () {
      var me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
      el.on('mouseup', me.onMouseUp, me);
      el.on('mouseover', me.onMouseOver, me);
      el.on('mouseout', me.onMouseOut, me);

      if(me.tip){
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    widgetCls: 'fancy-button',
    cls: '',
    disabledCls: 'fancy-button-disabled',
    extraCls: '',
    text: '',
    height: 28,
    paddingTextWidth: 5,
    imageWidth: 20,
    pressed: false,
    tpl: [
      '<div class="fancy-button-image"></div>',
      '<a class="fancy-button-text">{text}</a>',
      '<div class="fancy-button-drop" style="{dropDisplay}"></div>'
    ],
    /*
     *
     */
    initTpl: function () {
      var me = this;

      me.tpl = new Fancy.Template(me.tpl);
    },
    /*
     *
     */
    render: function(){
      var me = this,
        renderTo,
        el = Fancy.get(document.createElement('div')),
        width = 0;

      me.fire('beforerender');

      if( me.wrapper ){
        me.renderWrapper();
      }

      renderTo = Fancy.get(me.renderTo || document.body).dom;

      if(me.width){
        width = me.width;
      }
      else{
        if(me.text !== false){
          width += me.text.length * 7 + 7*2;
        }
      }

      if(me.imageColor){
        me.imageCls = 'fancy-button-image-color';
      }

      if(width < me.minWidth){
        if(me.text && me.text.length > 0){
          width = me.minWidth;
        }
        else{
          width = me.minWidth;
        }
      }

      if(me.imageCls && me.text){
        width += me.imageWidth;
      }

      el.addClass(Fancy.cls);
      el.addClass(me.widgetCls);
      el.addClass(me.cls);
      el.addClass(me.extraCls);

      if (me.disabled) {
        el.addClass(me.disabledCls);
      }

      el.css({
        width: width + 'px',
        height: me.height + 'px'
      });

      el.css(me.style || {});

      el.update(me.tpl.getHTML({
        text: me.text || ''
      }));

      if(me.imageCls){
        var imageEl = el.select('.fancy-button-image');
        if(me.imageColor){
          imageEl.css('background-color', me.imageColor);
        }
        imageEl.css('display', 'block');
        if(Fancy.isString(me.imageCls)){
          imageEl.addClass(me.imageCls);
        }
      }

      me.el = Fancy.get(renderTo.appendChild(el.dom));

      Fancy.each(me.style, function (value, p) {
        me.el.css(p, value);
      });

      if (me.disabled) {
        me.disable();
      }

      if(me.pressed){
        me.setPressed(me.pressed);
      }

      me.initToggle();

      me.width = width;

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderWrapper: function(){
      var me = this,
        wrapper = me.wrapper,
        renderTo = Fancy.get(me.renderTo || document.body).dom,
        el = Fancy.get(document.createElement('div'));

      el.css(wrapper.style || {});
      el.addClass(wrapper.cls || '');

      me.wrapper = Fancy.get(renderTo.appendChild(el.dom));

      me.renderTo = me.wrapper.dom;

    },
    /*
     *
     */
    initToggle: function(){
      var me = this;

      if (!me.enableToggle) {
        return;
      }
    },
    /*
     * @param {Boolean} value
     */
    setPressed: function(value, fire){
      var me = this;

      if (value) {
        me.addClass('fancy-button-pressed');
        //me.el.removeClass('fancy-button-not-pressed');
        me.pressed = true;

        if(me.toggleGroup){
          var active = toggleGroups[me.toggleGroup].active;
          if(active){
            active.setPressed(false);
          }

          toggleGroups[me.toggleGroup].active = me;
        }
      }
      else {
        //me.el.addClass('fancy-button-not-pressed');
        me.removeClass('fancy-button-pressed');
        me.pressed = false;
      }

      if(fire !== false){
        me.fire('pressedchange', me.pressed);
      }
    },
    /*
     *
     */
    toggle: function(){
      var me = this,
        value = !me.pressed;

      me.setPressed(value);
      me.pressed = value;
    },
    /*
     *
     */
    onClick: function(){
      var me = this,
        handler = me.handler;

      me.fire('click');

      if(me.disabled !== true){
        if(handler){
          if(Fancy.isString(handler)){
            handler = me.getHandler(handler);
          }

          if (me.scope) {
            handler.apply(me.scope, [me]);
          }
          else {
            handler(me);
          }
        }

        if(me.enableToggle){
          if(me.toggleGroup){
            me.setPressed(true);
          }
          else {
            me.toggle();
          }
        }
      }
    },
    /*
     * @param {String} name
     */
    getHandler: function(name){
      var me = this,
        grid = Fancy.getWidget(me.el.parent().parent().select('.fancy-grid').attr('id'));

      return grid[name] || function(){
          throw new Error('[FancyGrid Error] - handler does not exist');
        };
    },
    /*
     *
     */
    onMouseDown: function(){
      var me = this;

      me.fire('mousedown');
    },
    /*
     *
     */
    onMouseUp: function(){
      var me = this;

      me.fire('mouseup');
    },
    /*
     * @param {Object} e
     */
    onMouseOver: function(e){
      var me = this;

      me.fire('mouseover');

      if(me.tip){
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip: function(e){
      var me = this;

      if(me.tooltip){
        me.tooltip.destroy();
      }

      me.tooltip = new Fancy.ToolTip({
        text: me.tip
      });

      me.tooltip.css('display', 'block');
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     *
     */
    onMouseOut: function(){
      var me = this;

      me.fire('mouseout');

      if(me.tooltip){
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {String} text
     */
    setText: function(text){
      var me = this,
        el = me.el;

      me.css('width', ((parseInt(el.css('font-size')) + 2 ) * text.length) + parseInt(me.css('padding-right')) * 2 + 2  );

      el.select('.fancy-button-text').update(text);
    },
    /*
     *
     */
    disable: function(){
      var me = this;

      me.disabled = true;
      me.el.addClass(me.disabledCls);
    },
    /*
     *
     */
    enable: function(){
      var me = this;

      me.disabled = false;
      me.el.removeClass(me.disabledCls);
    },
    /*
     *
     */
    onMouseMove: function(e){
      var me = this;

      if(me.tip && me.tooltip){
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    }
  });
})();