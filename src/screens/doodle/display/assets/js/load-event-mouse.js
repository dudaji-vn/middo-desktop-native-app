const STATUS = {
  ENABLE: "ENABLE",
  DISABLE: "DISABLE",
}
window.addEventListener("DOMContentLoaded", () => {
  const interactiveElements = document.querySelectorAll(".interactive");
  let currentStatus = STATUS.ENABLE;
  const enableMouse = () => {
    if(currentStatus === STATUS.ENABLE) return;
    ipcRenderer.send("set-ignore-mouse-events", false);
    currentStatus = STATUS.ENABLE;
  };

  const disableMouse = () => {
    if(currentStatus === STATUS.DISABLE) return;
    const isDrawActive = document.body.classList.contains("draw");
    if (!isDrawActive) {
      ipcRenderer.send("set-ignore-mouse-events", true, {
        forward: true,
      });
      currentStatus = STATUS.DISABLE;
    }
  };
  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", enableMouse);
    element.addEventListener("mouseleave", disableMouse);
    // element.addEventListener("mousedown", enableMouse);
    // element.addEventListener("mouseup", () => disableMouse);
  });
});
