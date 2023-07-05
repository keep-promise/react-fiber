import { TAG_ROOT } from "./const";
import { scheduleRoot } from "./schedule";

/**
 * @description: 元素渲染到容器
 * @param {*} ele 元素
 * @param {*} container 容器
 * @return {*}
 */
function render(ele, container) {
  let rootFiber = {
    tag: TAG_ROOT, // fiber的tag标识，此元素类型
    stateNode: container, // stateNode指向真实dom
    props: {
      // props.children是数组，存放React元素 虚拟DOM 后面每个React元素创建对应的Fiber
      children: [ele]
    }
  }
  scheduleRoot(rootFiber);
}

const ReactDOM = {
  render
};

export default ReactDOM;
// reconciler
// schedule
