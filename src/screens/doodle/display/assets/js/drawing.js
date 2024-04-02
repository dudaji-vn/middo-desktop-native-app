let width = window.innerWidth;
let height = window.innerHeight;

// first we need Konva core things: stage and layer
let stage = new Konva.Stage({
  container: "draw",
  width: width,
  height: height,
});

let layer = new Konva.Layer();
stage.add(layer);

let isPaint = false;
let mode = "brush";
let lastLine;
let timer = null;

function checkTimer() {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        layer?.destroyChildren();
    }, 3000);
}

stage.on("mousedown touchstart", function (e) {
  isPaint = true;
  let pos = stage.getPointerPosition();
  lastLine = new Konva.Line({
    stroke: "#3d88ed",
    strokeWidth: 5,
    globalCompositeOperation:
      mode === "brush" ? "source-over" : "destination-out",
    // round cap for smoother lines
    lineCap: "round",
    lineJoin: "round",
    // add point twice, so we have some drawings even on a simple click
    points: [pos.x, pos.y, pos.x, pos.y],
  });
  layer.add(lastLine);
  if (timer) {
    clearTimeout(timer);
  }
  checkTimer();
});

stage.on("mouseup touchend", function () {
  isPaint = false;
});

// and core function - drawing
stage.on("mousemove touchmove", function (e) {
  if (!isPaint) {
    return;
  }

  // prevent scrolling on touch devices
  e.evt.preventDefault();

  const pos = stage.getPointerPosition();
  let newPoints = lastLine.points().concat([pos.x, pos.y]);
  lastLine.points(newPoints);
  checkTimer();
});

