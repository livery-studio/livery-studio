const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = "paint";
let drawing = false;

let lastX = 0;
let lastY = 0;

// Optional: load aircraft background
const bg = new Image();
bg.src = "aircraft.png"; // put your plane image in same folder
bg.onload = () => {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
};

function redrawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  }
}

// TOOL SWITCH
function setTool(selected) {
  tool = selected;
}

// DRAW START
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;

  if (tool === "text") {
    const text = prompt("Enter text:");
    if (text) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(text, lastX, lastY);
    }
  }
});

// DRAW MOVE
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (tool === "paint") {
    drawLine(lastX, lastY, x, y, "black");
  }

  if (tool === "eraser") {
    drawLine(lastX, lastY, x, y, "white");
  }

  lastX = x;
  lastY = y;
});

// STOP DRAW
canvas.addEventListener("mouseup", () => {
  drawing = false;
});

// DRAW FUNCTION
function drawLine(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// CLEAR
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawBackground();
}

// EXPORT
function exportImage() {
  const link = document.createElement("a");
  link.download = "skypaint-livery.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
