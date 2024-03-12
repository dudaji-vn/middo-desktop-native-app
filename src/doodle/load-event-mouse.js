window.addEventListener("DOMContentLoaded", () => {
  const interactiveElements = document.querySelectorAll(".interactive");
  const enableMouse = () => {
    ipcRenderer.send("set-ignore-mouse-events", false);
  };

  const disableMouse = () => {
    const isDrawActive = document.body.classList.contains("draw");
    if (!isDrawActive) {
      ipcRenderer.send("set-ignore-mouse-events", true, {
        forward: true,
      });
    }
  };
  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", enableMouse);
    element.addEventListener("mouseleave", disableMouse);
    element.addEventListener("mousedown", enableMouse);
    element.addEventListener("mouseup", () => disableMouse);
  });
});
