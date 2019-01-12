/*
 * @mixin Fancy.panel.mixin.Resize
 */
Fancy.Mixin('Fancy.panel.mixin.Resize', {
  cornerResizeCls: 'fancy-panel-resize-corner',
  resizeMaskCls: 'fancy-panel-resize-mask',
  /*
   *
   */
  initResize: function(){
    var me = this;

    me.activeResizeEl = undefined;

    me.renderResizeEls();
    me.onsResizeEls();
  },
  /*
   *
   */
  renderResizeEls: function(){
    var me = this,
      el = me.el,
      cornerEl = Fancy.get(document.createElement('div'));

    cornerEl.addCls(me.cornerResizeCls);

    me.cornerResizeEl = Fancy.get(el.dom.appendChild(cornerEl.dom));
  },
  /*
   *
   */
  onResize: function(){
    var me = this;

    if(me.tbar){
      me._tbar.applyScrollChanges();
    }

    if(me.subTBar){
      me._subTBar.applyScrollChanges();
    }

    if(me.bbar){
      me._bbar.applyScrollChanges();
    }

    if(me.footer){
      me._footer.applyScrollChanges();
    }

    if(me.buttons){
      me._buttons.applyScrollChanges();
    }
  },
  /*
   *
   */
  onsResizeEls: function(){
    var me = this;

    if(Fancy.isTouch){
      me.cornerResizeEl.on('touchstart', me.onMouseDownResizeEl, me);
    }
    else {
      me.cornerResizeEl.on('mousedown', me.onMouseDownResizeEl, me);
    }

    me.on('resize', me.onResize, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownResizeEl: function(e){
    var me = this,
      docEl = Fancy.get(document);

    e.preventDefault();

    if(Fancy.nojQuery){
      me.el.select('.' + Fancy.GRID_ANIMATION_CLS).removeCls(Fancy.GRID_ANIMATION_CLS);
    }

    if(Fancy.isTouch){
      e = e.originalEvent || e;
      var _e = e.changedTouches[0];

      docEl.once('touchend', me.onMouseUpResize, me);
      docEl.on('touchmove', me.onMouseMoveResize, me);

      me.renderResizeMask();

      me.startClientX = _e.clientX;
      me.startClientY = _e.clientY;
    }
    else{
      docEl.once('mouseup', me.onMouseUpResize, me);
      docEl.on('mousemove', me.onMouseMoveResize, me);

      me.renderResizeMask();

      me.startClientX = e.clientX;
      me.startClientY = e.clientY;
    }
  },
  /*
   *
   */
  onMouseUpResize: function(){
    var me = this,
      docEl = Fancy.get(document);

    delete me.activeResizeEl;
    me.resizeMaskEl.destroy();

    delete me.startClientX;
    delete me.startClientY;

    docEl.un('mousemove', me.onMouseMoveResize, me);

    me.setWidth(me.newResizeWidth);
    me.setHeight(me.newResizeHeight);

    me.fire('resize', {
      width: me.newResizeWidth,
      height: me.newResizeHeight
    });

    if(Fancy.nojQuery){
      me.el.select('.fancy-grid').addCls(Fancy.GRID_ANIMATION_CLS);
    }
  },
  /*
   * @param {Object} e
   */
  onMouseMoveResize: function(e){
    var me = this,
      clientX = e.clientX,
      clientY = e.clientY;

    if(Fancy.isTouch){
      e = e.originalEvent || e;
      var _e = e.originalEvent.changedTouches[0];

      clientX = _e.clientX;
      clientY = _e.clientY;
    }

    var deltaX = me.startClientX - clientX,
      deltaY = me.startClientY - clientY,
      newWidth = me.startResizeWidth - deltaX,
      newHeight = me.startResizeHeight - deltaY;

    e.preventDefault();
    e.stopPropagation();

    if(newWidth < me.minWidth){
      newWidth = me.minWidth;
    }

    if(newHeight < me.minHeight){
      newHeight = me.minHeight;
    }

    me.newResizeWidth = newWidth;
    me.newResizeHeight = newHeight;

    me.resizeMaskEl.css({
      width: newWidth,
      height: newHeight
    })
  },
  /*
   *
   */
  renderResizeMask: function(){
    var me = this,
      el = me.el,
      maskWidth = 2;

    var maskEl = Fancy.get(document.createElement('div')),
      panelTop = parseInt(el.css('top')),
      panelLeft = parseInt(el.css('left')),
      panelWidth = parseInt(el.css('width')) - maskWidth * 2,
      panelHeight = parseInt(el.css('height')) - maskWidth * 2,
      panelZIndex = parseInt(el.css('z-index'));

    me.startResizeWidth = panelWidth;
    me.startResizeHeight = panelHeight;

    if(!me.window && el.css('position') !== 'absolute'){
      var offset = el.offset();

      panelTop = offset.top;
      panelLeft = offset.left;
    }

    maskEl.addCls(me.resizeMaskCls);

    maskEl.css({
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
      'z-index': panelZIndex
    });

    me.resizeMaskEl = Fancy.get(document.body.appendChild(maskEl.dom));
  }
});