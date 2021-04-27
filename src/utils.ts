export function findNode(node: HTMLDivElement, find: (node: HTMLDivElement) => boolean) {
  let target = node;
  while (!find(target)) {
    if (target.parentNode) {
      target = target.parentNode as any;
    } else {
      return null;
    }
  }
  return target;
}
