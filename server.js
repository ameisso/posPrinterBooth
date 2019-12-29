'use strict';
const http = require('http');
const escpos = require('escpos');
const fs = require('fs');
const path = require('path');


const hostname = '127.0.0.1';
const printerIP = '192.168.192.168';
const port = 3000;


const server = http.createServer(handleRequest);
let io = require('socket.io').listen(server);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

});


function handleRequest(req, res) {
  // What did we request?
  let pathname = req.url;
  console.log('requesting' + req.url)
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/client/index.html';
  }

  // Ok what's our file extension
  let ext = path.extname(pathname);

  // Map extension to file type
  const typeExt = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };

  // What is it?  Default to plain text
  let contentType = typeExt[ext] || 'text/plain';

  // Now read and write back the file with the appropriate content type
  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Dynamically setting content type
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  );
}

//SOCKET 
io.sockets.on('connection',
  function (socket) {
    console.log("We have a new client: " + socket.id);
    socket.on('disconnect', function () {
      console.log("Client has disconnected");
    });


    socket.on('image',
      function (data) {
        fs.readdir('photos', (error, files) => {
          let totalFiles = 0;
         totalFiles = files.length; // return the number of files
         
          console.log('fileCount ' + totalFiles); // print the total number of files
          var imagePath = 'photos/' + totalFiles + '.png';
          var base64Data = JSON.stringify(data.image).substr(22);
          fs.writeFile(imagePath, base64Data, 'base64', function (err) {
            if (err) { console.log('write error' + err); }
            //  console.log('image received '+base64Data);
            printImage(imagePath);
          });
        });
      });
    socket.on('cut',
      function (data) {
        cutPaper();
      });
  }
);


function cutPaper() {
  console.log('cut');
  printer.cut();
  printer.flush();

}



const device = new escpos.Network(printerIP);
const options = { encoding: "Cp850" }
const printer = new escpos.Printer(device, options);

device.open(function (err) {
  if (err && err.stack && err.message) {
    console.log('error in connection')
  }
  else {
    console.log('printer connected');
  }
});


function printQRCode() {

  printer
    .font('a')
    .align('ct')
    .style('bu')
    .size(1, 1)
    .qrimage('http://ameisso.fr/', function (err) {
      this.cut();
      this.close();
    });
}


function printImage(path) {

  console.log('printing image ' + path);
  escpos.Image.load(path, 'image/png', function (image) {
    // console.log('size ' + JSON.stringify(image.size))
    printer.align('ct')
    // printer.image(image)
    // printer.image(image, 'd8')
    //printer.image(image, 's24')
    // printer.image(image, 'd24')

    printer.raster(image)
    //printer.raster(image, 'dw')
    // printer.raster(image, 'dh')

    //printer.raster(image, 'dwdh')
    // printer.cut();
    printer.flush();
    // printer.close();
  });
}