/*
 *
 */
Fancy.enableCompo = function(){
  var doc = document,
    componentsLength = 0,
    components = {},
    interval;

  /*
   * @constructor
   * @param {String} selector
   * @param {Object} o
   */
  Fancy.Component = function (selector, o) {
    componentsLength++;
    components[selector] = o;
  };

  /*
   *
   */
  Fancy.stopWatch = function(){
    clearInterval(interval);
  };

  function findComponent() {
    if (componentsLength === 0) return;

    for (var p in components) {
      var comp = components[p],
        founded = doc.querySelectorAll(p),
        attrPreSelector = comp.appPreSelector ? comp.appPreSelector + '-' : 'data-',
        preSelector = comp.preSelector ? comp.preSelector + '-' : 'fancy-',
        i = 0,
        iL = founded.length,
        j,
        jL;

      if (founded.length === 0) {
        return;
      }

      for (; i < iL; i++) {
        var itemConfig = {},
          item = founded[i],
          id = item.id || 'rand-id-' + (+new Date()),
          attrs = item.attributes;

        j = 0;
        jL = attrs.length;

        //Get values in attributes values
        for (; j < jL; j++) {
          var attr = attrs[j],
            attrName = attr.name,
            attrValue = attr.value;

          if (new RegExp(attrPreSelector).test(attrName)) {
            attrValue = prePareValue(attrValue);

            itemConfig[attrName.replace(attrPreSelector, '')] = attrValue;
          }
        }

        //Get values in innerHTML tags
        (function getValuesInTags() {
          var childs = item.getElementsByTagName('*');

          j = 0;
          jL = childs.length;

          for (; j < jL; j++) {
            var child = childs[j],
              tagName = child.tagName.toLowerCase(),
              name,
              value;

            if (new RegExp(preSelector).test(tagName)) {
              name = tagName.replace(preSelector, '');
              value = prePareValue(child.innerHTML);

              itemConfig[name.replace(attrPreSelector, '')] = value;
            }
          }

        })(item, itemConfig);

        item.outerHTML = '<div id="' + id + '"></div>';
        comp.init(doc.getElementById(id), itemConfig);
      }
    }
  }

  /*
   * @param {String} v
   * @return {String}
   */
  function prePareValue(v) {
    if (/\[/.test(v) || /\{/.test(v)) {
      v = v.replace(/\n/g, '');
      v = (new Function("return " + v + ";")());
    }
    else if (!isNaN(Number(v))) {
      v = Number(v);
    }
    else {
      v = v.replace(/\n/g, '');
    }

    return v;
  }

  findComponent();

  doc.addEventListener("DOMContentLoaded", function() {
    findComponent();
  });

  setTimeout(function(){
    findComponent();
  }, 1);

  interval = setInterval(function(){
    findComponent();
  }, 250);

  Fancy.Component('fancy-grid', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyGrid(config);
    }
  });

  Fancy.Component('fancy-form', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyForm(config);
    }
  });

  Fancy.Component('fancy-tab', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyTab(config);
    }
  });
};
