# select-element-by-mouse

通过鼠标选择 html 上的元素。

## 使用说明

安装：
```
$ npm install select-element-by-mouse --save
```

使用举例，更多细节请参考 [demo](./demo)：

```js
const { EVENT_NAME, SelectElement } = require('select-element-by-mouse');

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
```

## API

### SelectElement

#### init()

初始化。

#### destroy()

销毁。

#### on(eventName: string, handler: (el?: HTMLElement) => any)

监听事件。


### EVENT_NAME

事件名字。

```js
export const EVENT_NAME = {
  INIT: 'INIT',
  DESTROY: 'DESTROY',
  MOUSE_MOVE: 'MOUSE_MOVE',
  BLUR: 'BLUR',
  CLICK: 'CLICK'
};
```
