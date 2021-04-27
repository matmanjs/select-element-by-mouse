import { findNode } from './utils';

const hoverColor = 'rgba(255, 187, 51, 0.66)';
const clickColor = 'rgba(68, 68, 228, 0.66)';

function isInnerColor(color: any) {
  return [hoverColor, clickColor].includes(color);
}

function preventDefault(e: Event) {
  e.preventDefault();
}

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

  private customElementHandlers = new Map<string, (el: HTMLElement) => any>();

  /**
   * 初始化
   */
  async init() {
    this.bind();
  }

  /**
   * 绑定事件，激活选择
   */
  bind() {
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
  unBind() {
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

  registerElementHandler(key: string, handler: (el: HTMLElement) => any) {
    if (this.customElementHandlers.has(key)) {
      return;
    }

    this.customElementHandlers.set(key, handler);
  }

  private onMouseMove = (e: MouseEvent) => {
    e.stopPropagation();

    this.hideEl();
    this.showEl();

    const { clientX, clientY } = e;
    const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement;

    if (!targetElement) {
      return;
    }

    if (targetElement === this.mouseMoveEl) {
      return;
    }

    // 恢复上一个高亮元素
    if (this.mouseMoveEl) {
      this.mouseMoveEl.style.backgroundColor = this.mouseMoveElBackColor || '';
    }

    const frame = getFrame(this.mouseMoveEl);
    // 如果为iframe,或者父级有frame, 蒙层绕开
    if (frame) {
      const { top, left, width, height } = frame.getBoundingClientRect();

      this.surround(left, top, width, height);
      return;
    }
    // 高亮当前元素
    const originColor = targetElement.style.backgroundColor;
    this.mouseMoveElBackColor = isInnerColor(originColor) ? '' : originColor;
    targetElement.style.backgroundColor = hoverColor;
    this.mouseMoveEl = targetElement;
  };

  private onClick = (e: MouseEvent) => {
    e.stopPropagation();
    const { clientX, clientY } = e;
    this.hideEl();
    const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement;
    this.showEl();
    if (targetElement) {
      const color =
        (targetElement === this.mouseMoveEl && !isInnerColor(this.mouseMoveElBackColor) && this.mouseMoveElBackColor) ||
        targetElement.style.backgroundColor;
      targetElement.style.backgroundColor = clickColor;
      setTimeout(() => {
        targetElement.style.backgroundColor = isInnerColor(color) ? '' : color;
      }, 1000);

      // const customHandler = this.customElementHandlers.get(this.type);
      // if (customHandler) {
      //   customHandler?.(targetElement);
      // } else {
      //   throw new Error(`[element assert]: ${this.type} 找不到elementHandler`);
      // }
    }
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
