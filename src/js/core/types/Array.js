Fancy.Array = {
  copy(a, deep){
    if(!deep){
      return a.slice();
    }

    let newArray = [],
      i = 0,
      iL = a.length;

    for(;i<iL;i++){

      switch(Fancy.typeOf(a[i])){
        case 'object':
          newArray[i] = Fancy.Object.copy(a[i]);
          break;
        case 'array':
          newArray[i] = Fancy.Array.copy(a[i]);
          break;
        default:
          newArray = a[i];
      }
    }

    return newArray;
  },
  each(arr, fn){
    let i = 0,
      iL = arr.length;

    for(;i<iL;i++){
      fn(arr[i], i);
    }
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  count(values){
    return values.length;
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  sum(values){
    var i = 0,
      iL = values.length,
      value = 0;

    if(Fancy.isArray(values[0])){
      value = [];
      for (;i<iL;i++){
        var j = 0,
          jL = values[i].length;

        for(;j<jL;j++){
          if(value[j] === undefined){
            value[j] = 0;
          }

          value[j] += values[i][j];
        }
      }
    }
    else {
      for (; i < iL; i++){
        if(Fancy.isNumber(values[i]) === false){
          continue;
        }
        value += values[i];
      }
    }

    return value;
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  min(values){
    return Math.min.apply(this, values);
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  max(values){
    return Math.max.apply(this, values);
  },
  /*
   * @param {Array} values
   * @return {Number}
   */
  average(values){
    var sum = 0,
      i = 0,
      iL = values.length;

    for(;i<iL;i++){
      if (Fancy.isNumber(values[i]) === false){
        continue;
      }
      sum += values[i];
    }

    return Math.round(sum/values.length);
  },
  /*
   * @param {Array} arr
   * @param {Number} index
   * @param {Array} insert
   * @return {Array}
   */
  insert(arr, index, insert){
    const arr2 = arr.splice(index, arr.length - index);

    arr = arr.concat(insert).concat(arr2);

    return arr;
  }
};
