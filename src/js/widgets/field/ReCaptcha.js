/**
 * @class Fancy.ReCaptcha
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.ReCaptcha', 'Fancy.ReCaptcha'], {
  type: 'field.recaptcha',
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init(){
    const me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'esc', 'change', 'key');

    me.Super('init', arguments);

    me.tpl = new Fancy.Template(me.tpl);
    me.render();

    me.name = 'recaptcha';

    //me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }

    const s = document.createElement('script');

    s.type = 'text/javascript';
    s.src = 'https://www.google.com/recaptcha/api.js';

    Fancy.get(document.head).append(s);
  },
  /*
   * @return {'wait'|*}
   */
  get(){
    const me = this,
      formReCaptchaEl = me.el.select('form');

    if (me.value) {
      return me.value;
    }

    me.value = 'wait';

    formReCaptchaEl.one('submit', function(e){
      e.preventDefault();
      me.value = Fancy.$(this).serialize().replace('g-recaptcha-response=', '');
    });

    formReCaptchaEl.submit();

    return me.value;
  },
  fieldCls: Fancy.FIELD_CLS,
  value: '',
  width: 100,
  tpl: [
    '<form method="POST">',
    '<div class="g-recaptcha" data-sitekey="{key}"></div>',
    '</form>'
  ]
});
