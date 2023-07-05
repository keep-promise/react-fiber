import React from './react';
import ReactDOM from './react-dom';

const style = {
  border: '3px solid red',
  margin: '5px'
};
const app = (
  <div id="A1" style={style}>
    A1
    <div id="B1" style={style}>
      B1
      <div id="C1" style={style}>C1</div>
      <div id="C2" style={style}>C2</div>
    </div>
    <div id="B2" style={style}>B2</div>
  </div>
);
// jsx通过bable转换成React.createElement生成虚拟dom
// 虚拟dom本质是js对象，通过js对象描述界面dom
// const app = /*#__PURE__*/React.createElement("div", {
//   id: "A1"
// }, /*#__PURE__*/React.createElement("div", {
//   id: "B1"
// }, /*#__PURE__*/React.createElement("div", {
//   id: "C1"
// }, "C1"), /*#__PURE__*/React.createElement("div", {
//   id: "C2"
// }, "C2")), /*#__PURE__*/React.createElement("div", {
//   id: "B2"
// }, "B2"));
// React.createElement = function(type, props, ...children)

console.log('vdom', app)


ReactDOM.render(app,
  document.getElementById('root')
);