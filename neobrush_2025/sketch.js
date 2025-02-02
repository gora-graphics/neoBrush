let lines = [];
let src;
let canvas;
let controlPanel;

let lineWeight = 1;
let lineAlpha = 100;
let easeMin = 0.01;
easeMax = 0.5;
let speedMin = 0.25;
let speedMax = 0.5;
let numberOfLines = 100;
let numberOfVerticesMin = 5;
let numberOfVerticesMax = 10;

function preload() {
  src = loadImage("Honeyview_img20230716_22171431.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  canvas = createGraphics(src.width, src.height);
  canvas.clear();
  controlPanel = new ControlPanel();
}

function draw() {
  image(src, 0, 0, width, height);
  image(canvas, 0, 0, width, height);
  controlPanel.update();
  
  if (mouseIsPressed || touches.length > 0) {
    for (let line of lines) {
      line.update();
      line.render();
    }
  }
}

function mousePressed() {
  addLines();
}

function mouseReleased() {
  lines = [];
}

function touchStarted() {
  addLines();
  return false;
}

function touchEnded() {
  lines = [];
  return false;
}

function addLines() {
  for (let i = 0; i < numberOfLines; i++) {
    lines.push(new SketchLine(
      ceil(random(numberOfVerticesMin, numberOfVerticesMax)),
      random(easeMin, easeMax),
      random(speedMin, speedMax)
    ));
  }
}

function keyPressed() {
  if (key === ' ') {
    canvas.clear();
  }
  if (key === 's') {
    let fileName = `composition-${month()}-${day()}-${hour()}-${minute()}-${second()}.png`;
    saveCanvas(canvas, fileName, 'png');
    print("Saved: " + fileName);
  }
}

class SketchLine {
  constructor(numberOfVertices, easeFactor, speedFactor) {
    this.numberOfVertices = numberOfVertices;
    this.easeFactor = easeFactor;
    this.speedFactor = speedFactor;
    this.curveVertices = Array.from({ length: numberOfVertices }, () => createVector(mouseX, mouseY));
    this.distances = Array.from({ length: numberOfVertices }, () => createVector(0, 0));
    this.endPoints = Array.from({ length: numberOfVertices }, () => createVector(0, 0));
  }

  update() {
    for (let i = 0; i < this.numberOfVertices; i++) {
      let mappedMouseX = map(mouseX, 0, width, 0, src.width);
      let mappedMouseY = map(mouseY, 0, height, 0, src.height);
      this.distances[i].x = (i === 0) ? mappedMouseX - this.curveVertices[0].x : this.curveVertices[i - 1].x - this.curveVertices[i].x;
      this.distances[i].y = (i === 0) ? mappedMouseY - this.curveVertices[0].y : this.curveVertices[i - 1].y - this.curveVertices[i].y;
      this.distances[i].mult(this.easeFactor);
      this.endPoints[i].add(this.distances[i]);
      this.curveVertices[i].add(this.endPoints[i]);
      this.endPoints[i].mult(this.speedFactor);
    }
  }

  render() {
    canvas.beginShape();
    for (let i = 0; i < this.numberOfVertices; i++) {
      canvas.noFill();
      canvas.strokeWeight(lineWeight);
      let r = floor(this.numberOfVertices / 2);
      let c = src.get(
        constrain(this.curveVertices[r].x, 0, src.width - 1),
        constrain(this.curveVertices[r].y, 0, src.height - 1)
      );
      canvas.stroke(color(c[0], c[1], c[2], lineAlpha));
      canvas.curveVertex(this.curveVertices[i].x, this.curveVertices[i].y);
    }
    canvas.endShape();
  }
}

class ControlPanel {
  constructor() {
    this.lineWeightSlider = createSlider(1, 10, lineWeight);
    this.lineAlphaSlider = createSlider(10, 255, lineAlpha);
    this.lineWeightSlider.position(10, height + 10);
    this.lineAlphaSlider.position(10, height + 40);
  }

  update() {
    lineWeight = this.lineWeightSlider.value();
    lineAlpha = this.lineAlphaSlider.value();
  }
}
