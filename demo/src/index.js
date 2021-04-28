const { EVENT_NAME, SelectElement } = require('../../');

console.log('hello2!');

const selectElement = new SelectElement();

selectElement.on(EVENT_NAME.MOUSE_MOVE, (el) => {
  console.log('--mouse move--', el);
});

selectElement.on(EVENT_NAME.CLICK, (el) => {
  console.log('--click--', el);
});

selectElement.init();
