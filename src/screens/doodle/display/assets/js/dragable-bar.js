dragElement(document.querySelector(".dragable-header"));
function dragElement(elmnt) {
  let dragContainer = elmnt.parentElement;
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (elmnt.querySelector("move")) {
    /* if present, the header is where you move the DIV from:*/
    elmnt.querySelector("move").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let top = dragContainer.offsetTop - pos2;
    let left = dragContainer.offsetLeft - pos1;
    let maxTop = window.innerHeight - dragContainer.clientHeight;
    let maxLeft = window.innerWidth - dragContainer.clientWidth / 2;
    if (top < 0) {
      top = 0;
    }
    if (left < dragContainer.clientWidth / 2) {
      left = dragContainer.clientWidth / 2;
    }
    if (top > maxTop) {
      top = maxTop;
    }
    if (left > maxLeft) {
      left = maxLeft;
    }
    dragContainer.style.top = top + "px";
    dragContainer.style.left = left + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
