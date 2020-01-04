let socket;
let ditherShader;
var capture;
var globalCanvas;
var offlineCanvas;
var croppedCanvas;
var ditheredCanvas;
let snapButton;
let cutButton;
let invertBox;
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
    globalCanvas = createCanvas(2000, 240);
    offlineCanvas = createGraphics(imageWidth, imageWidth);
    croppedCanvas = createGraphics(imageHeight, imageWidth);

    ditheredCanvas = createGraphics(imageWidth, imageHeight, WEBGL);
    socket = io.connect();

    let sliderX = 1 * imageWidth + 20;
    desatSlider = createSlider(0, 100, 50);
    desatSlider.position(sliderX, 20);
    centerSlider = createSlider(0, 100, 80);
    centerSlider.position(sliderX, 50);
    deltaSlider = createSlider(0, 100, 20);
    deltaSlider.position(sliderX, 80);

    snapButton = createButton('snap !');
    snapButton.position(sliderX, 170);
    snapButton.mousePressed(takeSnap);

    cutButton = createButton('cut !');
    cutButton.position(sliderX + 65, 170);
    cutButton.mousePressed(cutPaper);

    invertBox = createCheckbox('invert', false);
    invertBox.position(sliderX, 110);

    flipBox = createCheckbox('flip', false);
    flipBox.position(sliderX, 140);
    background(0);
}

function draw() {

    if (capture) {
        var frame = capture.get();
        //image(frame, 0, 0, imageWidth, imageHeight);
        ditheredCanvas.shader(ditherShader);
        ditherShader.setUniform('tex0', frame);
        ditheredCanvas.fill(255, 255, 0);
        ditherShader.setUniform('desat', desatSlider.value() / 100.);

        ditherShader.setUniform('smoothCenter', centerSlider.value() / 100.);
        ditherShader.setUniform('smoothDelta', deltaSlider.value() / 100.);
        ditherShader.setUniform('invert',invertBox.checked());
        ditherShader.setUniform('flip',flipBox.checked());
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
    drawTextNearSlider('desat', desatSlider);
    drawTextNearSlider('smooth center', centerSlider);
    drawTextNearSlider('smooth delta', deltaSlider);
    //image(croppedCanvas, 3 * imageWidth + 30, 0);
    stroke(255,0,0);
    line(0,140,320,140);





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