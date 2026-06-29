// Canvas

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1400;
canvas.height = 700;

// Selected template

const template = localStorage.getItem("template");

// Tool

let currentTool = "paint";

// Paint settings

let paintColor = "#ff0000";
let brushSize = 12;

// Mouse

let drawing = false;

// Text objects

let texts = [];

// Undo history

let history = [];
let historyStep = -1;

// Aircraft image

const aircraft = new Image();

aircraft.src = "templates/" + template + ".png";

aircraft.onload = () => {

    redraw();

    saveHistory();

};

// -------------------------

// Toolbar

// -------------------------

document.getElementById("paintTool").onclick = () => {

    currentTool = "paint";

};

document.getElementById("eraserTool").onclick = () => {

    currentTool = "eraser";

};

document.getElementById("textTool").onclick = () => {

    currentTool = "text";

};

document.getElementById("paintColor").oninput = e => {

    paintColor = e.target.value;

};

document.getElementById("brushSize").oninput = e => {

    brushSize = Number(e.target.value);

};

// -------------------------

// Drawing paths

// -------------------------

const paths = [];

// One paint stroke

class Stroke {

    constructor(color, size, erase = false) {

        this.color = color;

        this.size = size;

        this.erase = erase;

        this.points = [];

    }

}

// -------------------------

// Redraw everything

// -------------------------

function redraw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(aircraft, 0, 0, canvas.width, canvas.height);

    // Draw paint

    paths.forEach(stroke => {

        if (stroke.points.length < 2) return;

        ctx.save();

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke.size;

        if (stroke.erase) {

            ctx.globalCompositeOperation = "destination-out";

        } else {

            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = stroke.color;

        }

        ctx.beginPath();

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {

            ctx.lineTo(

                stroke.points[i].x,

                stroke.points[i].y

            );

        }

        ctx.stroke();

        ctx.restore();

    });

    // Draw text

    texts.forEach(t => {

        ctx.fillStyle = t.color;

        ctx.font = `${t.size}px ${t.font}`;

        ctx.fillText(t.text, t.x, t.y);

    });

}
// -------------------------
// Mouse Position Helper
// -------------------------

function getMousePos(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };

}

// Current stroke

let currentStroke = null;

// -------------------------
// Start Drawing
// -------------------------

canvas.addEventListener("mousedown", (event) => {

    if (currentTool === "text") return;

    drawing = true;

    const pos = getMousePos(event);

    currentStroke = new Stroke(

        paintColor,

        brushSize,

        currentTool === "eraser"

    );

    currentStroke.points.push(pos);

    paths.push(currentStroke);

    redraw();

});

// -------------------------
// Draw
// -------------------------

canvas.addEventListener("mousemove", (event) => {

    if (!drawing) return;

    const pos = getMousePos(event);

    currentStroke.points.push(pos);

    redraw();

});

// -------------------------
// Stop Drawing
// -------------------------

canvas.addEventListener("mouseup", () => {

    if (!drawing) return;

    drawing = false;

    currentStroke = null;

    saveHistory();

});

canvas.addEventListener("mouseleave", () => {

    if (!drawing) return;

    drawing = false;

    currentStroke = null;

    saveHistory();

});

// -------------------------
// Touch Support (Optional)
// -------------------------

canvas.addEventListener("touchstart", (event) => {

    event.preventDefault();

    if (currentTool === "text") return;

    drawing = true;

    const touch = event.touches[0];

    const fakeEvent = {

        clientX: touch.clientX,

        clientY: touch.clientY

    };

    const pos = getMousePos(fakeEvent);

    currentStroke = new Stroke(

        paintColor,

        brushSize,

        currentTool === "eraser"

    );

    currentStroke.points.push(pos);

    paths.push(currentStroke);

    redraw();

});

canvas.addEventListener("touchmove", (event) => {

    event.preventDefault();

    if (!drawing) return;

    const touch = event.touches[0];

    const fakeEvent = {

        clientX: touch.clientX,

        clientY: touch.clientY

    };

    const pos = getMousePos(fakeEvent);

    currentStroke.points.push(pos);

    redraw();

});

canvas.addEventListener("touchend", () => {

    if (!drawing) return;

    drawing = false;

    currentStroke = null;

    saveHistory();

});
// -------------------------
// Text Tool
// -------------------------

let draggingText = false;
let selectedText = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Add text button

document.getElementById("addText").onclick = () => {

    const value = document.getElementById("textInput").value.trim();

    if (value === "") return;

    texts.push({

        text: value,

        x: canvas.width / 2,
        y: canvas.height / 2,

        font: document.getElementById("fontSelect").value,

        size: Number(document.getElementById("fontSize").value),

        color: document.getElementById("textColor").value

    });

    redraw();

    saveHistory();

};

// -------------------------
// Find clicked text
// -------------------------

function findText(x, y) {

    for (let i = texts.length - 1; i >= 0; i--) {

        const t = texts[i];

        ctx.font = `${t.size}px ${t.font}`;

        const width = ctx.measureText(t.text).width;

        const height = t.size;

        if (

            x >= t.x &&
            x <= t.x + width &&
            y <= t.y &&
            y >= t.y - height

        ) {

            return t;

        }

    }

    return null;

}

// -------------------------
// Start dragging text
// -------------------------

canvas.addEventListener("mousedown", (event) => {

    if (currentTool !== "text") return;

    const pos = getMousePos(event);

    const hit = findText(pos.x, pos.y);

    if (!hit) return;

    selectedText = hit;

    draggingText = true;

    dragOffsetX = pos.x - hit.x;

    dragOffsetY = pos.y - hit.y;

});

// -------------------------
// Drag text
// -------------------------

canvas.addEventListener("mousemove", (event) => {

    if (!draggingText) return;

    const pos = getMousePos(event);

    selectedText.x = pos.x - dragOffsetX;

    selectedText.y = pos.y - dragOffsetY;

    redraw();

});

// -------------------------
// Stop dragging
// -------------------------

canvas.addEventListener("mouseup", () => {

    if (draggingText) {

        draggingText = false;

        selectedText = null;

        saveHistory();

    }

});

canvas.addEventListener("mouseleave", () => {

    if (draggingText) {

        draggingText = false;

        selectedText = null;

        saveHistory();

    }

});
// -------------------------
// History System
// -------------------------

function saveHistory() {

    // Remove any redo states
    history = history.slice(0, historyStep + 1);

    history.push({

        paths: JSON.parse(JSON.stringify(paths)),
        texts: JSON.parse(JSON.stringify(texts))

    });

    historyStep++;

}

function loadHistory(index) {

    if (index < 0 || index >= history.length) return;

    historyStep = index;

    paths.length = 0;
    texts.length = 0;

    history[index].paths.forEach(p => paths.push(p));
    history[index].texts.forEach(t => texts.push(t));

    redraw();

}

// -------------------------
// Undo
// -------------------------

document.getElementById("undo").onclick = () => {

    if (historyStep <= 0) return;

    loadHistory(historyStep - 1);

};

// -------------------------
// Redo
// -------------------------

document.getElementById("redo").onclick = () => {

    if (historyStep >= history.length - 1) return;

    loadHistory(historyStep + 1);

};

// -------------------------
// Download PNG
// -------------------------

document.getElementById("download").onclick = () => {

    redraw();

    const link = document.createElement("a");

    link.download = template + "-livery.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

};

// -------------------------
// Prevent accidental text selection
// -------------------------

canvas.onselectstart = () => false;

// -------------------------
// Keyboard Shortcuts
// -------------------------

document.addEventListener("keydown", (event) => {

    // Ctrl + Z
    if (event.ctrlKey && event.key.toLowerCase() === "z") {

        event.preventDefault();

        if (historyStep > 0)
            loadHistory(historyStep - 1);

    }

    // Ctrl + Y
    if (event.ctrlKey && event.key.toLowerCase() === "y") {

        event.preventDefault();

        if (historyStep < history.length - 1)
            loadHistory(historyStep + 1);

    }

});
