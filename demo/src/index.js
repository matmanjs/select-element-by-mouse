const { EVENT_NAME, SelectElement } = require('../../');

const selectElement = new SelectElement();

selectElement.on(EVENT_NAME.INIT, () => {
  console.log('--init--');
});

selectElement.on(EVENT_NAME.DESTROY, () => {
  console.log('--destroy--');
});

selectElement.on(EVENT_NAME.MOUSE_MOVE, (el) => {
  console.log('--mouse move--', el);
});

selectElement.on(EVENT_NAME.MOUSE_MOVE, (el) => {
  console.log('--mouse move--', el);
});

selectElement.on(EVENT_NAME.CLICK, (el) => {
  console.log('--click--', el);
});

selectElement.on(EVENT_NAME.BLUR, () => {
  console.log('--blur--');
});

// 初始化
selectElement.init();

setTimeout(() => {
  // 销毁
  selectElement.destroy();
}, 5000);
