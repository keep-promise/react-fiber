import { TEXT } from "./const"

/**
 * @description: 创建虚拟dom方法
 * @param {*} type 元素类型:div、span、img
 * @param {*} config 配置对象属性 key、ref
 * @param {array} children 子元素
 * @return {*}
 */
function createElement(type, config, ...children) {
  return {
    type,
    props: {
      ...config,
      children: children.map(child => {
        // 每一个资源都可能是createElement返回的对象，如果是字符串，需转成文本节点
        return typeof child === 'object' ? child : {
          type: TEXT,
          props: { text: child, children: [] }
        }
      })
    }
  };
}

const React = {
  createElement
}

export default React;
