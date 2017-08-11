/**
 * @class Fancy.panel.Tab
 */
Fancy.define(['Fancy.panel.Tab', 'Fancy.Tab', 'FancyTab'], {
  extend: Fancy.Panel,
  /*
   * @constructor
   * @param config
   * @param scope
   */
  constructor: function(config, scope){
    var me = this;

    me.prepareConfigTheme(config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.prepareTabs();
    me.Super('init', arguments);

    me.setActiveTab(me.activeTab);
  },
  tabWrapperCls: 'fancy-tab-wrapper',
  activeTabWrapperCls: 'fancy-active-tab-wrapper',
  activeTabTBarButtonCls: 'fancy-toolbar-tab-active',
  activeTab: 0,
  theme: 'default',
  /*
   *
   */
  render: function(){
    var me = this;

    me.Super('render', arguments);

    me.panelBodyEl = me.el.select('.fancy-panel-body-inner').item(0);

    me.setPanelBodySize();

    me.renderTabWrappers();

    if(!me.wrapped){
      me.el.addClass('fancy-panel-grid-inside');
    }
    me.el.addClass('fancy-panel-tab');

    me.rendered = true;
  },
  setPanelBodySize: function(){
    var me = this,
      height = me.height,
      panelBodyBorders = me.panelBodyBorders;

    if(me.title){
      height -= me.titleHeight;
    }

    if(me.subTitle){
      height -= me.subTitleHeight;
      height += panelBodyBorders[2];
    }

    if(me.bbar){
      height -= me.barHeight;
    }

    if(me.tbar){
      height -= me.barHeight;
    }

    if(me.subTBar){
      height -= me.barHeight;
    }

    if(me.buttons){
      height -= me.barHeight;
    }

    if(me.footer){
      height -= me.barHeight;
    }

    height -= panelBodyBorders[0] + panelBodyBorders[2];

    me.panelBodyEl.css({
      height: height
    });

    me.panelBodyHeight = height;
    me.panelBodyWidth = me.width - panelBodyBorders[1] - panelBodyBorders[3];
    //me.panelBodyWidth = me.width;
  },
  prepareConfigTheme: function(config){
    var me = this,
      themeName = config.theme || me.theme,
      themeConfig = Fancy.getTheme(themeName).config,
      wrapped = me.wrapped || config.wrapped;

    if(wrapped){
      config.panelBodyBorders = [0,0,0,0];
      me.panelBodyBorders = [0,0,0,0];
    }

    Fancy.applyIf(config, themeConfig);
    Fancy.apply(me, config);
  },
  prepareTabs: function(){
    var me = this,
      tabs = [],
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var item = me.items[i],
        tabConfig = {
          type: 'tab'
        };

      if(item.tabTitle){
        tabConfig.text = item.tabTitle;
      }
      else if(item.title){
        tabConfig.text = item.title;
        delete item.title;
      }

      tabConfig.handler = (function(i){
        return function(){
          me.setActiveTab(i);
        }
      })(i);

      tabs.push(tabConfig);
    }

    me.tbar = tabs;
    me.tabs = tabs;
  },
  renderTabWrappers: function(){
    var me = this,
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var el = Fancy.get( document.createElement('div') );

      el.addClass(me.tabWrapperCls);

      me.items[i].renderTo = me.panelBodyEl.dom.appendChild(el.dom);
    }
  },
  setActiveTab: function(newActiveTab){
    var me = this,
      activeTabWrapperCls = me.activeTabWrapperCls,
      tabs = me.el.select('.' + me.tabWrapperCls),
      oldActiveTab = me.activeTab;

    if(me.items.length === 0){
      return;
    }

    tabs.item(me.activeTab).removeClass(activeTabWrapperCls);
    me.activeTab = newActiveTab;

    tabs.item(me.activeTab).addClass(activeTabWrapperCls);

    var item = me.items[me.activeTab];

    item.theme = me.theme;
    item.wrapped = true;

    item.width = me.panelBodyWidth;
    item.height = me.panelBodyHeight;

    if(!item.rendered){
      switch(item.type){
        case 'grid':
          me.items[me.activeTab] = new FancyGrid(item);
          break;
        case 'tab':
          me.items[me.activeTab] = new FancyTab(item);
          break;
      }
    }
    else{
      me.setActiveItemWidth();
      me.setActiveItemHeight();
    }

    if(me.tabs){
      me.tbar[oldActiveTab].removeClass(me.activeTabTBarButtonCls);
      me.tbar[me.activeTab].addClass(me.activeTabTBarButtonCls);
    }
  },
  /*
   * @param {String} value
   */
  setWidth: function(value){
    var me = this;

    me.width = value;

    me.css('width', value);
    me.setPanelBodySize();

    me.setActiveItemWidth();
  },
  /*
   * @param {Number} value
   */
  setHeight: function(value){
    var me = this;

    me.height = value;

    me.css('height', value);
    me.setPanelBodySize();

    me.setActiveItemHeight();
  },
  setActiveItemWidth: function(){
    var me = this;

    me.items[me.activeTab].setWidth(me.panelBodyWidth);
  },
  setActiveItemHeight: function(){
    var me = this;

    me.items[me.activeTab].setHeight(me.panelBodyHeight, false);
  }
});

FancyTab.get = function(id){
  var tabId = Fancy.get(id).select('.fancy-panel-tab').dom.id;

  return Fancy.getWidget(tabId);
};

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyTab = function(o){
    o.renderTo = $(this.selector)[0].id;

    return new FancyTab(o);
  };
}