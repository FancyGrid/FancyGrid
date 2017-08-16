(function () {

  Fancy.vtypes = {};

  /*
   * @param {String} name
   * @param {Object} o
   */
  Fancy.addValid = function(name, o){
    Fancy.vtypes[name] = o;
  };


  /*
   * @param {*} type
   * @param {*} value
   * @return {Boolean}
   */
  Fancy.isValid = function(type, value){
    var vtype;

    if (Fancy.isString(type)) {
      vtype = Fancy.vtypes[type];
    }
    else if(Fancy.isObject(type)) {
      if(type.type){
        vtype = Fancy.vtypes[type.type];
        Fancy.applyIf(type, vtype);
      }
      else{
        vtype = type;
      }
    }

    if (vtype.before) {
      var before = vtype.before,
        list = [type];

      if (Fancy.isString(before)) {
        list.push(before);
      }
      else if (Fancy.isArray(before)) {
        list = list.concat(before);
      }

      list.reverse();

      var i = 0,
        iL = list.length;

      for (; i < iL; i++) {
        if (Fancy.isObject(list[i])) {
          vtype = list[i];
        }
        else {
          vtype = Fancy.vtypes[list[i]];
        }

        if (vtype.re) {
          if(vtype.re.test(value) === false){
            return vtype;
          }
        }
        else if (vtype.fn) {
          if (vtype.fn.apply(vtype, [value]) === false) {
            return vtype;
          }
        }
      }
    }
    else{
      if (vtype.re) {
        if(vtype.re.test(value) === false){
          return vtype;
        }
      }
      else if (vtype.fn.apply(vtype, [value]) === false) {
        return vtype;
      }
    }

    return true;
  };

})();