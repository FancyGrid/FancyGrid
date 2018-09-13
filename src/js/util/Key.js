Fancy.key = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  RETURN: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_DOT: 110,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  DOT: 190,
  PAGE_UP: 33,
  PAGE_DOWN: 34
};

Fancy.Key = {
  /*
   * @param {number} c
   * @return {Boolean}
   */
  isNum: function(c){
    var key = Fancy.key;

    switch(c){
      case key.ZERO:
      case key.ONE:
      case key.TWO:
      case key.THREE:
      case key.FOUR:
      case key.FIVE:
      case key.SIX:
      case key.SEVEN:
      case key.EIGHT:
      case key.NINE:
      case key.NUM_ZERO:
      case key.NUM_ONE:
      case key.NUM_TWO:
      case key.NUM_THREE:
      case key.NUM_FOUR:
      case key.NUM_FIVE:
      case key.NUM_SIX:
      case key.NUM_SEVEN:
      case key.NUM_EIGHT:
      case key.NUM_NINE:
        return true;
      default:
        return false;
    }
  },
  /*
   * @param {Number} c
   * @param {Object} w
   * @return {Boolean}
   */
  isNumControl: function(c, e){
    var key = Fancy.key;

    if( Fancy.Key.isNum(c) ){
      return true;
    }

    if( e.shiftKey && c === 187){
      return true;
    }

    switch(c){
      case key.NUM_PLUS:
      case 189:
      case key.NUM_MINUS:
      case key.NUM_DOT:
      case key.BACKSPACE:
      case key.DELETE:
      case key.TAB:
      case key.ENTER:
      case key.RETURN:
      case key.SHIFT:
      case key.CTRL:
      case key.ALT:
      case key.ESC:
      case key.END:
      case key.HOME:
      case key.LEFT:
      case key.UP:
      case key.RIGHT:
      case key.DOWN:
      case key.INSERT:
      case key.DOT:
        return true;
        break;
      default:
        return false;
    }
  }
};