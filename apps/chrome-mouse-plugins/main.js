/*
 * @Date: 2022-09-13 15:26:42
 * @Description: shift + 用户鼠标控制网站前进后退
 */

document.addEventListener("click", function(event) {
  const {shiftKey, ctrlKey, altKey, metaKey} = event;
  if(shiftKey && !ctrlKey && !altKey && !metaKey) {
    const activeElment = document.activeElement;
    if(
      ["input", "textarea"].includes(activeElment.nodeType)
      || activeElment.contentEditable === "true"
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    history.go(-1)
  }
})
document.addEventListener("contextmenu", function(event) {
  const {shiftKey, ctrlKey, altKey, metaKey} = event;
  if(shiftKey && !ctrlKey && !altKey && !metaKey) {
    const activeElment = document.activeElement;
    if(
      ["input", "textarea"].includes(activeElment.nodeType)
      || activeElment.contentEditable === "true"
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    history.forward(-1)
  }
})