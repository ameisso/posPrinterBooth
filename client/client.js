let socket;
let ditherShader;
var capture;
var globalCanvas;
var offlineCanvas;
var croppedCanvas;
var ditheredCanvas;
let snapButton;
let cutButton;
const imageWidth = 320;
const imageHeight = 240;

function preload() {
    capture = createCapture(VIDEO);
    // capture.size(imageWidth, imageHeight);
    capture.hide();
    ditherShader = loadShader('client/shader.vert', 'client/shader.frag');
}

function setup() {
    //globalCanvas = createCanvas(imageHeight, imageWidth);
    globalCanvas = createCanvas(2000, 320);
    offlineCanvas = createGraphics(imageWidth, imageWidth);
    croppedCanvas = createGraphics(imageHeight, imageWidth);

    ditheredCanvas = createGraphics(imageWidth, imageHeight, WEBGL);
    socket = io.connect();

    let sliderX = 1 * imageWidth + 20;
    rSlider = createSlider(0, 100, 30);
    rSlider.position(sliderX, 20);
    gSlider = createSlider(0, 100, 59);
    gSlider.position(sliderX, 50);
    bSlider = createSlider(0, 100, 11);
    bSlider.position(sliderX, 80);
    minSlider = createSlider(0, 100, 20);
    minSlider.position(sliderX, 110);
    maxSlider = createSlider(0, 100, 50);
    maxSlider.position(sliderX, 140);

    snapButton = createButton('snap !');
    snapButton.position(sliderX, 170);
    snapButton.mousePressed(takeSnap);

    cutButton = createButton('cut !');
    cutButton.position(sliderX + 65, 170);
    cutButton.mousePressed(cutPaper);
    background(0);
}

function draw() {

    if (capture) {
        var frame = capture.get();
        //image(frame, 0, 0, imageWidth, imageHeight);
        ditheredCanvas.shader(ditherShader);
        ditherShader.setUniform('tex0', frame);
        ditheredCanvas.fill(255, 255, 0);
        ditherShader.setUniform('desatR', rSlider.value() / 100.);
        ditherShader.setUniform('desatG', gSlider.value() / 100.);
        ditherShader.setUniform('desatB', bSlider.value() / 100.);

        ditherShader.setUniform('smoothMin', minSlider.value() / 100.);
        ditherShader.setUniform('smoothMax', maxSlider.value() / 100.);
        ditheredCanvas.rect(-ditheredCanvas.width / 2, -ditheredCanvas.height / 2, ditheredCanvas.width, ditheredCanvas.height);
    }

    offlineCanvas.push();
    offlineCanvas.translate(imageWidth / 2, imageWidth / 2);
    offlineCanvas.rotate(PI / 2)
    offlineCanvas.translate(-imageWidth / 2, -imageWidth / 2);
    offlineCanvas.fill(127);
    offlineCanvas.rect(0, 0, offlineCanvas.width, offlineCanvas.height);
    offlineCanvas.image(ditheredCanvas, 0, 0, imageWidth, imageHeight);
    offlineCanvas.pop();

    croppedCanvas.fill(255, 255, 0);

    croppedCanvas.rect(0, 0, croppedCanvas.width, croppedCanvas.height);
    croppedCanvas.line(0, 0, croppedCanvas.width, croppedCanvas.height);
    croppedCanvas.line(0, croppedCanvas.height, croppedCanvas.width, 0);
    croppedCanvas.copy(offlineCanvas, imageWidth - imageHeight, 0, imageWidth, imageWidth, 0, 0, imageWidth, imageWidth);

    image(ditheredCanvas, 0, 0);
    //  image(offlineCanvas, 2 * imageWidth + 20, 0);
    noStroke();
    fill(127);
    rect(1 * imageWidth, 0, 250, 320);
    fill(255);
    drawTextNearSlider('red', rSlider);
    drawTextNearSlider('green', gSlider);
    drawTextNearSlider('blue', bSlider);
    drawTextNearSlider('smooth Min', minSlider);
    drawTextNearSlider('smooth Max', maxSlider);
    //image(croppedCanvas, 3 * imageWidth + 30, 0);

}

function drawTextNearSlider(t, slider) {
    fill(255);
    text(t, slider.x + slider.width + 10, slider.y + 15);

}

function takeSnap() {
    sendImageToPrinter();
}

function cutPaper() {
    socket.emit('cut', {});
}

function sendImageToPrinter() {
    console.log('send');
    var element = croppedCanvas.elt;
    let d = pixelDensity();
    var pixels = element.toDataURL();
    //console.log(pixels);
    var iname = 'get';
    let canvasJSON = {
        name: iname,
        image: pixels
    };
    // Send that object to the socket
    socket.emit('image', canvasJSON);
}

function keyPressed() {
    //console.log("pressed" + keyCode);
    if (keyCode == 32) {
        takeSnap();
    }
}