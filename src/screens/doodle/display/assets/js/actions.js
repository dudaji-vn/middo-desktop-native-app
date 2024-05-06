// Handle event
let btnToggleDraw = document.querySelector(".toggle-draw");
let btnToggleMic = document.querySelector(".toggle-mic");
let btnToggleCamera = document.querySelector(".toggle-camera");
let btnStopShare = document.querySelector(".stop-share");
let btnToggleMinimize = document.querySelector(".toggle-minimize");
let dragableContent = document.querySelector(".dragable-content");
let isWaitingForLoadMedia = false;
let canvas = document.querySelector("#draw");

btnToggleMinimize.addEventListener("click", () => {
  dragableContent.classList.toggle('minimize')
});

btnToggleDraw.addEventListener("click", () => {
  const isActive = btnToggleDraw.classList.contains("active");
  if (isActive) {
    btnToggleDraw.classList.remove("active");
    document.body.classList.remove("draw");
    ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
    canvas.style.display = "none";
  } else {
    btnToggleDraw.classList.add("active");
    document.body.classList.add("draw");
    ipcRenderer.send("set-ignore-mouse-events", false);
    canvas.style.display = "block";
  }
});

btnToggleMic.addEventListener("click", () => {
  if (ipcRenderer && !isWaitingForLoadMedia) {
    ipcRenderer.send("TOGGLE_MIC");
    isWaitingForLoadMedia = true;
  }
});

btnToggleCamera.addEventListener("click", () => {
  if (ipcRenderer && !isWaitingForLoadMedia) {
    ipcRenderer.send("TOGGLE_CAMERA");
    isWaitingForLoadMedia = true;
  }
});

btnStopShare.addEventListener("click", () => {
  if (ipcRenderer) {
    ipcRenderer.send("STOP_SHARE");
  }
});

if (ipcRenderer) {
  ipcRenderer.on("CALL_STATUS", (data) => {
    const { mic, camera } = data;
    if (mic) {
      btnToggleMic.classList.add("active");
    } else {
      btnToggleMic.classList.remove("active");
    }

    if (camera) {
      btnToggleCamera.classList.add("active");
    } else {
      btnToggleCamera.classList.remove("active");
    }

    isWaitingForLoadMedia = false;
  });
}
