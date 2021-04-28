import { findNode } from './utils';

const hoverColor = 'rgba(255, 187, 51, 0.66)';
const clickColor = 'rgba(68, 68, 228, 0.66)';

function isInnerColor(color: any) {
  return [hoverColor, clickColor].includes(color);
}

function preventDefault(e: Event) {
  e.preventDefault();
}

export const EVENT_NAME = {
  MOUSE_MOVE: 'MOUSE_MOVE',
  BLUR: 'BLUR',
  CLICK: 'CLICK'
};

export class SelectElement {
  private markLeft?: HTMLDivElement;
  private markRight?: HTMLDivElement;
  private markTop?: HTMLDivElement;
  private markBottom?: HTMLDivElement;
  private mouseMoveEl?: HTMLElement;
  private mouseMoveElBackColor?: string;

  private get masks(): HTMLElement[] {
    return [this.markTop, this.markLeft, this.markBottom, this.markRight].filter(Boolean) as HTMLElement[];
  }

  private customEventHandlers = new Map<string, ((el?: HTMLElement) => any)[]>();

  /**
   * 初始化
   */
  public init() {
    this.bind();
  }

  /**
   * 销毁
   */
  public destroy() {
    this.unBind();
  }

  /**
   * 绑定事件，激活选择
   */
  public bind() {
    this.initEl();
    this.unBind();

    const { masks } = this;
    masks.forEach((item) => {
      item?.addEventListener('click', this.onClick);
      item?.addEventListener('mousemove', this.onMouseMove);
    });

    window.addEventListener('keydown', preventDefault);
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mouseout', this.onMouseOut);

    this.showEl();
  }

  /**
   * 解除事件
   */
  public unBind() {
    const { masks } = this;

    masks.forEach((item) => {
      item?.removeEventListener('click', this.onClick);
      item?.removeEventListener('mousemove', this.onMouseMove);
    });

    window.removeEventListener('keydown', preventDefault);
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mouseout', this.onMouseOut);

    this.hideEl();

    if (this.mouseMoveEl) {
      this.mouseMoveEl.style.backgroundColor = this.mouseMoveElBackColor || '';
    }
    this.mouseMoveEl = undefined;
    this.mouseMoveElBackColor = undefined;
  }

  /**
   * 注册一个指定名字的事件，支持多次注册
   * @param eventName
   * @param handler
   */
  public on(eventName: string, handler: (el?: HTMLElement) => any) {
    const handlerList = this.customEventHandlers.get(eventName) || [];

    handlerList.push(handler);

    this.customEventHandlers.set(eventName, handlerList);
  }

  /**
   * 触发一个指定名字的事件
   * @param eventName
   * @param el
   */
  public emit(eventName: string, el?: HTMLElement) {
    const handlerList = this.customEventHandlers.get(eventName);

    // 注意可能有多个回调，依次执行
    if (handlerList && handlerList.length) {
      handlerList.forEach((callFn) => {
        callFn.call(this, el);
      });
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    e.stopPropagation();

    // 需要将蒙层隐藏，否则调用 document.elementFromPoint 时会导致选中蒙层元素而不是实际的目标元素
    this.hideEl();

    // 获取当前鼠标的坐标
    const { clientX, clientY } = e;

    // 通过鼠标当前的坐标，获得当前鼠标所在位置最上层的元素
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint
    const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement;

    // console.log('--onMouseMove clientX, clientY, targetElement--', clientX, clientY, targetElement);

    // 恢复遮盖
    this.showEl();

    // 若无法找到目标元素则不进行后续处理
    if (!targetElement) {
      return;
    }

    // 若当前鼠标指向的元素与上一次一致，也不再进行后续处理
    if (targetElement === this.mouseMoveEl) {
      return;
    }

    // 恢复上一个高亮元素
    if (this.mouseMoveEl) {
      this.mouseMoveEl.style.backgroundColor = this.mouseMoveElBackColor || '';
    }

    // 通过指定元素，找到其或其祖先元素为 frame 的那个元素
    const frame = getFrame(this.mouseMoveEl);

    // 如果为iframe, 或者父级有frame, 蒙层绕开
    if (frame) {
      console.log('===当前是frame===');
      // 获得元素的大小及其相对于视口的位置
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
      const { top, left, width, height } = frame.getBoundingClientRect();

      this.surround(left, top, width, height);

      return;
    }

    // 高亮当前元素，注意要存储高亮之前的背景色，以便后续还原
    const originColor = targetElement.style.backgroundColor;
    this.mouseMoveElBackColor = isInnerColor(originColor) ? '' : originColor;
    targetElement.style.backgroundColor = hoverColor;

    // 更新当前鼠标移动上去的元素
    this.mouseMoveEl = targetElement;

    // 广播事件
    this.emit(EVENT_NAME.MOUSE_MOVE, this.mouseMoveEl);
  };

  private onClick = (e: MouseEvent) => {
    e.stopPropagation();

    // 需要将蒙层隐藏，否则调用 document.elementFromPoint 时会导致选中蒙层元素而不是实际的目标元素
    this.hideEl();

    // 获取当前鼠标的坐标
    const { clientX, clientY } = e;

    // 通过鼠标当前的坐标，获得当前鼠标所在位置最上层的元素
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint
    const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement;

    // console.log('--onMouseMove clientX, clientY, targetElement--', clientX, clientY, targetElement);

    // 恢复遮盖
    this.showEl();

    // 若无法找到目标元素则不进行后续处理
    if (!targetElement) {
      return;
    }

    // 记录一下改变之前的背景色值
    const oldBackColor =
      (targetElement === this.mouseMoveEl && !isInnerColor(this.mouseMoveElBackColor) && this.mouseMoveElBackColor) ||
      targetElement.style.backgroundColor;
    targetElement.style.backgroundColor = clickColor;

    // 点击变色之后，1s 之后再恢复
    setTimeout(() => {
      targetElement.style.backgroundColor = isInnerColor(oldBackColor) ? '' : oldBackColor;
    }, 1000);

    // 广播事件
    this.emit(EVENT_NAME.CLICK, targetElement);
  };

  private initEl() {
    if (this.markLeft) {
      if (!this.markLeft.parentElement) {
        // 容错
        document.body.appendChild(this.markLeft);
        document.body.appendChild(this.markRight!);
        document.body.appendChild(this.markTop!);
        document.body.appendChild(this.markBottom!);
      }
      return;
    }

    this.markLeft = this.buildMark('sebm-mark-left');
    this.markRight = this.buildMark('sebm-mark-right');
    this.markTop = this.buildMark('sebm-mark-top');
    this.markBottom = this.buildMark('sebm-mark-bottom');

    this.surround(0, 0, 0, 0);
  }

  private buildMark(id: string) {
    const el = document.createElement('div');
    document.body.appendChild(el);

    el.id = id;
    el.style.backgroundColor = 'transparent';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.zIndex = '999999999';

    return el;
  }

  private onMouseOut = (e: MouseEvent) => {
    const el = e.target as HTMLDivElement;
    if (!el) {
      return;
    }

    if (el.id?.includes('sebm-mark')) {
      this.onBlur();
    }
  };

  private onBlur = () => {
    if (!this.mouseMoveEl) {
      return;
    }

    this.mouseMoveEl.style.backgroundColor = this.mouseMoveElBackColor || '';
    this.mouseMoveElBackColor = undefined;
    this.mouseMoveEl = undefined;

    // 广播事件
    this.emit(EVENT_NAME.BLUR);
  };

  /*
   * 驱动蒙层绕开指定区域
   */
  private surround(left: number, top: number, width: number, height: number) {
    // top
    this.markTop!.style.left = '0';
    this.markTop!.style.top = '0';
    this.markTop!.style.width = '100%';
    this.markTop!.style.height = `${top}px`;
    // this.markTop!.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';

    // left
    this.markLeft!.style.left = '0';
    this.markLeft!.style.top = `${top}px`;
    this.markLeft!.style.width = `${left}px`;
    this.markLeft!.style.height = '100%';
    // this.markLeft!.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';

    // right
    this.markRight!.style.left = `${left + width}px`;
    this.markRight!.style.top = `${top}px`;
    this.markRight!.style.width = '100%';
    this.markRight!.style.height = '100%';
    // this.markRight!.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';

    // bottom
    this.markBottom!.style.left = `${left}px`;
    this.markBottom!.style.top = `${top + height}px`;
    this.markBottom!.style.width = `${width}px`;
    this.markBottom!.style.height = '100%';
    // this.markBottom!.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
  }

  private showEl() {
    if (this.markLeft) {
      this.markLeft.style.display = 'block';
      this.markRight!.style.display = 'block';
      this.markTop!.style.display = 'block';
      this.markBottom!.style.display = 'block';
    }
  }

  private hideEl() {
    if (this.markLeft) {
      this.markLeft.style.display = 'none';
      this.markRight!.style.display = 'none';
      this.markTop!.style.display = 'none';
      this.markBottom!.style.display = 'none';
    }
  }
}

function isIframe(el: HTMLElement) {
  return el?.tagName?.toLowerCase() === 'iframe';
}

/**
 * 通过指定元素，找到其或其祖先元素为 frame 的那个元素
 * @param el
 */
function getFrame(el?: HTMLElement) {
  if (!el) {
    return null;
  }

  if (isIframe(el)) {
    return el;
  }

  const iframe = findNode(el as any, isIframe);

  return iframe as HTMLElement;
}
