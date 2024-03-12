// Handle event
let btnToggleDraw = document.querySelector(".toggle-draw");
let btnToggleMic = document.querySelector(".toggle-mic");
let btnToggleCamera = document.querySelector(".toggle-camera");
let btnStopShare = document.querySelector(".stop-share");

let canvas = document.querySelector("canvas#draw");
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
  if (ipcRenderer) {
    ipcRenderer.send("TOGGLE_MIC");
    btnToggleMic.classList.toggle("active");
  }
});

btnToggleCamera.addEventListener("click", () => {
  if (ipcRenderer) {
    ipcRenderer.send("TOGGLE_CAMERA");
    btnToggleCamera.classList.toggle("active");
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
  });
}



// Canvas draw
let timer = null;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let painting = false;
function startPosition(e) {
  painting = true;
  draw(e);
  if(timer) {
    clearTimeout(timer);
  }
}

function endPosition() {
  painting = false;
  ctx.beginPath();
  timer = setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
}

function draw(e) {
  if (!painting) return;

  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";

  ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);

// Make line draw of canvas fade out and remove
