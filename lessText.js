/* eslint-disable no-console */
const fs = require('fs');

var txt;
var less;

const lessText = () => {
    fs.readdir('./assets/themes/less', (e, files) => {
        if (e) {
            return console.log(e);
        }
        files.forEach(function(file) {
            fs.stat('./assets/themes/less/' + file, (er, stats) => {
                if (er) {
                    return console.log(er);
                }
                if (stats.isFile()) {
                    fs.readFile('./assets/themes/less/' + file, 'UTF-8', (err, data) => {
                        if (err) {
                            return console.log(err);
                        }
                        txt = file.replace('\.less', '\.txt');
                        less = data.replace(/@import([^;]+);/g, '');
                        console.log(txt);
                        fs.writeFile('./assets/themes/txt/' + txt, less, 'UTF-8', (error) => {
                            if (error) {
                                return console.log(error);
                            }
                        });
                    });
                }
            });
        });
    });
};

lessText();
