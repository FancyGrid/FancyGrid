(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = root.document ?
      factory(root) :
      factory;
  }
  else {
    root.Fancy = factory(root);
  }
}(typeof window !== 'undefined' ? window : this, function(win){