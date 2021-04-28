const { EVENT_NAME, SelectElement } = require('../../');

console.log('hello2!');

const selectElement = new SelectElement();

selectElement.on(EVENT_NAME.MOUSE_MOVE, (el) => {
  console.log('--1--', el);
});

selectElement.on(EVENT_NAME.MOUSE_MOVE, (el) => {
  console.log('--2--', el);
});

selectElement.init();
