Fancy.controllers = {};

/*
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineController = (name, o) => {
  Fancy.controllers[name] = o;
};

Fancy.defineControl = Fancy.defineController;

/*
 * @param {String} name
 * @return {Object}
 */
Fancy.getController = (name) => {
  return Fancy.controllers[name];
};

Fancy.getControl = Fancy.getController;
