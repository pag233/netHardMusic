const fs = require('fs');
const multer = require('multer');
const cryptoRandomString = require('crypto-random-string');

const fileServer = process.env.FileServer;

function generateImageFileName() {
    return new Date().getTime() + cryptoRandomString({ length: 16 });
}

module.exports = function imageUploader(imageDest) {
    const imageSavePath = fileServer + imageDest;
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            try {
                cb(null, imageSavePath);
            } catch (error) {
                console.error(error);
            }
        },
        filename: function (req, file, cb) {
            try {
                let imageFileName = generateImageFileName();
                if (fs.existsSync(imageSavePath + imageFileName)) {
                    imageFileName = generateImageFileName();
                }
                cb(null, imageFileName);
            } catch (error) {
                console.error(error);
            }
        }
    });
    return multer({
        storage,
        limits: {
            fieldNameSize: 64,
            fileSize: 4194304
        }
    });
};