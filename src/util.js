
export function setProps(stateNode, oldProps, newProps) {
  for(const key in oldProps) {

  }
  for(const key in newProps) {
    if (key != 'children') {
      setProp(stateNode, key, newProps[key]);
    }
  }
}

function setProp(stateNode, key, value) {
  if (/^on/.test(key)) {
    stateNode[key.toLowerCase()] = value;
    return;
  }
  if (key == 'style') {
    if (value) {
      for(const styleName in value) {
        stateNode.style[styleName] = value[styleName];
      }
    }
    return;
  }
  stateNode.setAttribute(key, value);
}