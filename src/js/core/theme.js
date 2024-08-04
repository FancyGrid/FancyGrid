Fancy.themes = {};

/**
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineTheme = (name, o) => {
  const themeConfig = {};

  if (o.extend) {
    Fancy.apply(themeConfig, Fancy.getTheme(o.extend).config);
    themeConfig.extendedThemes = themeConfig.extendedThemes || [];
    themeConfig.extendedThemes.push(o.extend);
  }
  else if (name !== 'default') {
    Fancy.apply(themeConfig, Fancy.getTheme('default').config);
  }

  Fancy.apply(themeConfig, o.config);
  o.config = themeConfig;

  Fancy.themes[name] = o;
};

/**
 * @param {String} name
 * @return {String}
 */
Fancy.getThemeCSSCls = (name) => {
  const theme = Fancy.getTheme(name);
  let cls = `fancy-theme-${name}`;

  if (theme && theme.config.extendedThemes) {
    Fancy.each(theme.config.extendedThemes, name => {
      cls += ` fancy-theme-${name}`;
    });
  }

  return cls;
};

/**
 * @param {Object|String} name
 * @return {Object} o
 */
Fancy.getTheme = (name) => {
  const theme = {
    config: {}
  };

  if (Fancy.isObject(name)) {
    Fancy.applyIf(theme, Fancy.themes[name.name || 'default']);
    Fancy.apply(theme.config, Fancy.themes[name.name || 'default'].config);
    Fancy.apply(theme.config, name.config);

    return theme;
  }

  return Fancy.themes[name];
};

Fancy.defineTheme('default', {
  config: {
    cellHeaderHeight: 30,
    cellWidth: 70,
    minCellWidth: 40,
    cellHeight: 32,
    titleHeight: 42,
    subTitleHeight: 42,
    barHeight: 38,
    bottomScrollHeight: 12,
    minCenterWidth: 100,
    panelBorderWidth: 2,
    groupRowHeight: 31,
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,2,2,2],

    knobOffSet: 2,
    fieldHeight: 37,

    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('blue', {
  config: {
    panelBorderWidth: 1,
    //borders: [1,1,0,1],
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('gray', {
  config: {
    panelBorderWidth: 0,
    //borders: [0,0,1,0],
    gridBorders: [0,0,1,0],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('extra-gray', {
  config: {
    panelBorderWidth: 0,
    gridBorders: [0,0,1,0],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],
    charWidth: 7,
    menuItemHeight: 27,
    titleHeight: 32,
    subTitleHeight: 32,
    cellHeight: 28,
    cellHeaderHeight: 28,
    barHeight: 32,
    datePickerHeight: 287
  }
});

Fancy.defineTheme('extra-dark', {
  extend: 'extra-gray',
  config: {

  }
});

Fancy.defineTheme('dark', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('sand', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [0,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],

    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('bootstrap', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],
    charWidth: 7,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('bootstrap-no-borders', {
  config: {
    panelBorderWidth: 0,
    gridBorders: [0, 0, 0, 0],
    gridWithoutPanelBorders: [0, 0, 0, 0],
    panelBodyBorders: [0,0,0,0],
    columnLines: false,
    charWidth: 8,
    menuItemHeight: 30
  }
});

Fancy.defineTheme('material', {
  config: {
    columnLines: false,
    cellHeaderHeight: 40,
    panelBorderWidth: 0,
    cellHeight: 40,
    titleHeight: 48,
    barHeight: 48,
    subTitleHeight: 48,
    groupRowHeight: 40,
    //borders: [0,0,1,0],
    gridBorders: [1,0,1,0],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0],
    charWidth: 7,
    menuItemHeight: 35
  }
});
