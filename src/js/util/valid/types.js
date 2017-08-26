Fancy.addValid('notempty', {
  text: 'Must be present',
  fn: function(value){
    if(value === null || value === undefined){
      return false;
    }

    return String(value).length !== 0;
  }
});

Fancy.addValid('notnan', {
  text: 'Must be numeric',
  fn: function(value){
    return !isNaN(value);
  }
});

Fancy.addValid('min', {
  before: ['notempty', 'notnan'],
  text: 'Must be must be at least {param}',
  fn: function(value){
    return value >= this.param;
  }
});

Fancy.addValid('max', {
  before: ['notempty', 'notnan'],
  text: 'Must be no more than {param}',
  fn: function(value){
    return value <= this.param;
  }
});

Fancy.addValid('range', {
  before: ['notempty', 'notnan'],
  text: 'Must be between {min} and {max}',
  fn: function(value){
    return value >= this.min && value <= this.max;
  }
});

Fancy.addValid('email', {
  before: 'notempty',
  re: /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+\/=?\^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/,
  text: 'Is not a valid email address'
});