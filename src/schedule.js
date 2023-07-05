import { PLACEMENT, TAG_HOST, TAG_ROOT, TAG_TEXT, TEXT } from "./const";
import { setProps } from "./util";

/**
 * @description: 从根节点开始渲染和调度 
 * 两个阶段
 * 1. diff阶段，对比新旧的虚拟dom，进行增量 更新 创建. render阶段
 * 这个阶段比较花时间，可以对任务进行拆分，拆分维度是虚拟dom，此阶段可以暂停
 * render阶段成果是effect list 知道哪些节点更新哪些节点删除哪些节点增加
 * render阶段有两个任务1.根据虚拟dom生成fiber树2.收集effetlist
 * 2. commit阶段 进行真实dom更新创建阶段，此阶段不能暂停，要一气呵成
 * @param {*} rootFiber
 * @return {*}
 */
let nextUnitOfWork = null; // 下一个任务单元
let workInProgressRoot = null; // RootFiber应用的根
function scheduleRoot(rootFiber) { // {tag, stateNode, props}
  workInProgressRoot = rootFiber;
  nextUnitOfWork = rootFiber;
}

function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while(currentFiber) {
    completeUnitOfWork(currentFiber); // 没有儿子让自己完成
    if (currentFiber.sibling) { // 有弟弟，返回弟弟
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return; // 找父亲然后让父亲完成
  }
}

// 在完成的时候收集有副作用的Fiber
function completeUnitOfWork(currentFiber) {
  const returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      } else {
        returnFiber.lastEffect = currentFiber.lastEffect;
      }
    }
    const effectTag = currentFiber.effectTag;
    if(effectTag) {
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber
    }
  }
}

/**
 * @description: beginWork开始收下线的钱
 * completeUnitOfWork 把下线的钱收完了
 * 1. 创建真实dom
 * @return {*}
 */
function beginWork(currentFiber) {
  if (currentFiber.tag == TAG_ROOT) {
    updateHostRoot(currentFiber);
    return;
  }

  // 处理文本节点
  if (currentFiber.tag == TAG_TEXT) {
    updateHostText(currentFiber)
    return;
  }

  if (currentFiber.tag == TAG_HOST) {
    updateHost(currentFiber)
    return;
  }
}

function updateHost(currentFiber) {
  if (!currentFiber.stateNode) { // 如果此fiber没有创建DOM节点
    currentFiber.stateNode = createDom(currentFiber)
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

function createDom(currentFiber) {
  if (currentFiber.tag == TAG_TEXT) { // 创建文本节点dom
    return document.createTextNode(currentFiber.props.text);
  }
  if (currentFiber.tag == TAG_HOST) { // 创建文本节点dom
    const stateNode = document.createElement(currentFiber.type);
    setDomAttr(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}

function setDomAttr(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps)
}

function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDom(currentFiber)
  }
}

function updateHostRoot(currentFiber) {
  let newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

function reconcileChildren(currentFiber, newChildren) {
  let newChildrenIndex = 0;
  let prevSibling;
  while(newChildrenIndex < newChildren.length) {
    let newChild = newChildren[newChildrenIndex];
    let tag;
    if (newChild.type == TEXT) {
      tag = TAG_TEXT;
    } else if(typeof newChild.type == 'string') {
      tag = TAG_HOST; // 如果type是字符串，那么这是一个原生DOM节点
    }
    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props, 
      stateNode: null, // div还没创建dom元素
      return: currentFiber, // return指向父Fiber
      effectTag: PLACEMENT, // 副作用标识，render我们要会收集副作用 增加 删除 更新
      nextEffect: null // effect list 也是一个单链表
      // effect list顺序和完成顺序是一样的，但是节点只放在那些出钱的人的fiber节点，不出钱绕过
    }
    // 最小的儿子没有弟弟
    if (newChildrenIndex == 0) {
      currentFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    newChildrenIndex++;
  }
}


// 循环执行任务，nextUnitWork
function workLoop(deadline) {
  let shouldYield = false; // 是否让出时间片/控制权
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 执行完一个任务后
    shouldYield = deadline.timeRemaining() < 1; // 没有时间（小于1ms)的话就要让出控制权
  }
  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('render阶段结束');
    commitRoot();
  }
  // 不管有没有任务都请求再次调度 ---》每帧都要执行workLoop
  requestIdleCallback(workLoop, { timeout: 500 })
}

function commitRoot() {
  let currentFiber = workInProgressRoot.firstEffect;
  while(currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  workInProgressRoot = null;
}

function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDom = returnFiber.stateNode;
  if (currentFiber.effectTag == PLACEMENT) {
    returnDom.appendChild(currentFiber.stateNode);
  }
  returnFiber.effectTag = null;
}

// 执行浏览器调度: 在每帧（1000/60=16.6）空闲的时候执行任务，如果超过500ms还没执行，就必须执行
window.requestIdleCallback(workLoop, { timeout: 500 });

export {
  scheduleRoot
}
