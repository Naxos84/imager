const electron = require("electron");
const looksSame = require("looks-same");
const constants = require("./constants");
const { ipcRenderer } = electron;
let leftImage, rightImage, leftButton, rightButton, compareButton, tolerance;
document.addEventListener('DOMContentLoaded', (event) => {
    leftImage = document.getElementById("leftImage");
    rightImage = document.getElementById("rightImage");
    leftButton = document.getElementById("leftButton");
    rightButton = document.getElementById("rightButton");
    compareButton = document.getElementById("compare");
    tolerance = document.getElementById("tolerance");



    leftButton.addEventListener("click", (ev) => {
        console.log("left button clicked");
        ipcRenderer.send(constants.LEFT_IMAGE_SELECTION_CHANNEL);
    });
    rightButton.addEventListener("click", (ev) => {
        console.log("right button clicked");
        ipcRenderer.send(constants.RIGHT_IMAGE_SELECTION_CHANNEL);
    });
    compareButton.addEventListener("click", (ev) => {
        ipcRenderer.send("image:compare", [leftImage.src, rightImage.src]);
        console.log("Comparing images", leftImage.src, rightImage.src);
        // looksSame(leftImage.src, rightImage.src, (error, result) => {
        //     if (error) {
        //         console.error(error);
        //     }
        //     console.log("Compared images. Result: ", result);
        // })
    });
    tolerance.addEventListener("change", (ev) => {
        const value = ev.target.value;
        ipcRenderer.send("set:tolerance", value);
    })
})


ipcRenderer.on("image:open:left", (ev, imagePath) => {
    leftImage.src = imagePath;
});
ipcRenderer.on("image:open:right", (ev, imagePath) => {
    rightImage.src = imagePath;
})
