const base64Img = require('base64-img')
const os = require('os')
const networkInterfaces = os.networkInterfaces();
for (let i = 0; i < networkInterfaces.WiFi.length; i++) {
    if (networkInterfaces.WiFi[i].family != "IPv4") continue;
    else if (networkInterfaces.WiFi[i].address) window.ip = networkInterfaces.WiFi[i].address;
}
var canvas1 = document.createElement("canvas");
function capture() {
    if (!optimal.closest) return;
    var skipped = 0;
    for (let i = 0; i < boatPos.length; i++) {
        if (boatPos[i] == 'SPACE') {
            getClass('label')[i].getTag('span')[0].style.visibility = 'hidden';
            getClass('label')[i].getTag('b')[0].innerText = 'SPACE';
            skipped += 1;
        } else {
            getClass('label')[i].getTag('span')[0].innerText = i - skipped + 1;
            getClass('label')[i].getTag('b')[0].innerText = boatPos[i].n;
        }
    }
    html2canvas(get('boat-container')).then(canvas => {
        document.body.appendChild(canvas)
        var ctx = canvas.getContext('2d')
        // Crop Canvas
        var crop = removeBlanks(canvas, ctx, canvas.width, canvas.height)
        var imageData = ctx.getImageData(crop.x - 10, crop.y - 10, crop.width + 20, crop.height + 20);
        // Make new canvas from image data
        canvas1.width = imageData.width;
        canvas1.height = imageData.height;
        var ctx1 = canvas1.getContext("2d");
        ctx1.rect(0, 0, imageData.width, imageData.height);
        ctx1.fillStyle = 'white';
        ctx1.fill();
        ctx1.putImageData(imageData, 0, 0);
        // Do stuff with image data
        var img = canvas1.toDataURL("image/png")
        get('screenshot-img').src = img;
        get('save-screenshot').href = img;
        get('save-screenshot').download = 'untitled.png';
        if (window.serverError && serverError == 'USRDBLD') get('btn-share').style.display = 'none';
        document.body.removeChild(canvas)
        get('add-modal1').style.display = 'block';
    });
    for (let i = 0; i < boatPos.length; i++) {
        getClass('label')[i].getTag('span')[0].innerText = i + 1;
        getClass('label')[i].getTag('span')[0].style.visibility = 'visible';
        getClass('label')[i].getTag('b')[0].innerText = (boatPos[i]=='SPACE')?'SPACE':`${boatPos[i].n} (${boatPos[i].w}kg)`;
    }
}
var removeBlanks = function (canvas, context, imgWidth, imgHeight) {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
    data = imageData.data,
    getRBG = function(x, y) {
        return {
            red:   data[(imgWidth*y + x) * 4],
            green: data[(imgWidth*y + x) * 4 + 1],
            blue:  data[(imgWidth*y + x) * 4 + 2]
        };
    },
    isWhite = function (rgb) {
        return (rgb.red == 255 && rgb.green == 255 && rgb.blue == 255)
            || (rgb.red == 25, rgb.green == 25, rgb.blue == 27)
    },
    scanY = function (fromTop) {
        var offset = fromTop ? 1 : -1;
        // loop through each row
        for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
            // loop through each column
            for(var x = 0; x < imgWidth; x++) {
                if (!isWhite(getRBG(x, y))) {
                    return y;                        
                }      
            }
        }
        return null; // all image is white
    },
    scanX = function (fromLeft) {
        var offset = fromLeft? 1 : -1;
        // loop through each column
        for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
            // loop through each row
            for(var y = 0; y < imgHeight; y++) {
                if (!isWhite(getRBG(x, y))) {
                    return x;                        
                }      
            }
        }
        return null; // all image is white
    };
    var cropTop = scanY(true),
        cropBottom = scanY(false),
        cropLeft = scanX(true),
        cropRight = scanX(false);
    return { y: cropTop, height: cropBottom - cropTop, x: cropLeft, width: cropRight - cropLeft }
    // cropTop is the last topmost white row. Above this row all is white
    // cropBottom is the last bottommost white row. Below this row all is white
    // cropLeft is the last leftmost white column.
    // cropRight is the last rightmost white column.
};
function shareImg() {
    if (window.ip && !window.serverError) {
        base64Img.img(get('screenshot-img').src, path.join(__dirname, 'img'), 'boat', function(err, filepath) {
            if (err) {
                alert('An error occured while trying to share files', 'error')
            } else {
                alert('Successfully sharing image locally')
                alert('In order to view and download this on other devices, those devices must be connected to the same internet as this computer.')
                alert('Go to http://'+ip+':7409/boat.png in any browser on the connecting device(s). The image should appear.')
            }
        });
    } else if (!window.ip) {
        alert('An error occured while trying to share files - An IPv4 address could not be established.', 'error')
    } else if (serverError.error == 'EADDRINUSE') {
        alert('An error occured while trying to share files - Another Paddle Balancer app on a different device is already sharing.', 'error')
    } else {
        alert('An error occured while trying to startup a sharing server.', 'error')
    }
}