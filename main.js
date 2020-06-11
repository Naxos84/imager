const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const constants = require("./constants");
const looksSame = require("looks-same");
const language = require("./language");
const oslocale = require("os-locale");

const { app, BrowserWindow, Menu, dialog, ipcMain, ipcRenderer } = electron;

const imageFileExtensions = ["png"];

let mainWindow;
let addWindow;
let diffWindow;

let leftImage, rightImage;

let tolerance = 2.5;


// Listen for app to be ready
app.on("ready", () => {
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true }
    });
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file:",
        slashes: true
    })); //file://__firname/mainWindow.html

    //Quit app when closed
    mainWindow.on("closed", () => {
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(createMainMenuTemplate(app.getLocale()));
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shopping Item",
        webPreferences: { nodeIntegration: true }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: "file:",
        slashes: true
    })); //file://__firname/mainWindow.html
    //Remove menu in addWindow
    // addWindow.setMenu(null);

    //Garbage collection handle
    addWindow.on("close", () => {
        addWindow = null;
    })
}

function createDiffWindow(title) {
    diffWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Diff: " + title,
        webPreferences: { nodeIntegration: true }
    });
    diffWindow.loadURL(url.format({
        pathname: path.join(__dirname, "diffWindow.html"),
        protocol: "file:",
        slashes: true
    })); //file://__firname/mainWindow.html
    //Remove menu in addWindow
    diffWindow.setMenu(null);

    //Garbage collection handle
    diffWindow.on("close", () => {
        diffWindow = null;
    })
}

// Catch item:add
ipcMain.on("item:add", (ev, item) => {
    console.log("item:add ", item);
    mainWindow.webContents.send("item:add", item);
    addWindow.close();
});
ipcMain.on(constants.LEFT_IMAGE_SELECTION_CHANNEL, (ev) => {
    console.log("Selecting left image");
    dialog.showOpenDialog({ buttonLabel: "Öffnen", message: "Some message", title: "Bild öffnen", properties: ["openFile"], filters: [{ extensions: imageFileExtensions, name: "Bilder" }] }).then(value => {
        if (value.filePaths.length > 0) {
            const [imagePath] = value.filePaths;
            console.log("Opened ", imagePath);
            mainWindow.webContents.send("image:open:left", imagePath);
            leftImage = imagePath;
        } else {
            console.log("No image selected");
        }
    }).catch(error => {
        console.error(error);
    })
});
ipcMain.on(constants.RIGHT_IMAGE_SELECTION_CHANNEL, (ev) => {
    console.log("Selecting left image");
    dialog.showOpenDialog({ buttonLabel: "Öffnen", message: "Some message", title: "Bild öffnen", properties: ["openFile"], filters: [{ extensions: imageFileExtensions, name: "Bilder" }] }).then(value => {
        if (value.filePaths.length > 0) {
            const [imagePath] = value.filePaths;
            console.log("Opened ", imagePath);
            mainWindow.webContents.send("image:open:right", imagePath);
            rightImage = imagePath;
        } else {
            console.log("No image selected");
        }
    }).catch(error => {
        console.error(error);
    })
});
ipcMain.on("image:compare", (ev, imagesPaths) => {
    if (leftImage && rightImage) {
        console.log("Comparing with tolerance ", tolerance);
        looksSame(leftImage, rightImage, { tolerance: tolerance }, (error, result) => {
            if (error) {
                console.error("Error comparing images: ", error);
            } else {
                console.log("Compare result: ", result);
            }
        });
        console.log("Writing diff to ", path.resolve(__dirname, "diff.png"));
        looksSame.createDiff({
            reference: leftImage,
            current: rightImage,
            diff: path.resolve(__dirname, "diff.png"),
            highlightColor: '#ff00ff', // color to highlight the differences
            strict: false, // strict comparsion
            tolerance: tolerance,
            antialiasingTolerance: 0,
            ignoreAntialiasing: true, // ignore antialising by default
            ignoreCaret: true // ignore caret by default
        }, function (error) {
            if (error) {
                console.error("Error while creating diff ", error);
            } else {
                createDiffWindow(path.resolve(__dirname, "diff.png"));
            }
        });
    }
});
ipcMain.on("set:tolerance", (ev, value) => {
    tolerance = value;
})

// Create Menu Template
function createMainMenuTemplate(locale) {
    const template = [
        {
            label: "File",
            submenu: [
                {
                    label: language.get(locale, "add_item"),
                    accelerator: process.platform === "darwin" ? "Command+N" : "Ctrl+N",
                    click() {
                        createAddWindow();
                    }
                },
                {
                    label: language.get(locale, "clear_items"),
                    accelerator: process.platform === "darwin" ? "Command+R" : "Ctrl+R",
                    click() {
                        console.log("Clear Items");
                    }
                },
                {
                    label: language.get(locale, "quit"),
                    accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
                    click() {
                        app.quit();
                    }
                }
            ]
        }
    ];
    // Add developer tools if not in production
    if (!app.isPackaged) {
        template.push({
            label: "DevTools",
            submenu: [
                {
                    label: "Toggle Dev-Tools",
                    accelerator: process.platform === "darwin" ? "Command+D" : "Ctrl+D",
                    click(item, focusedWindow) {
                        console.log("Open Dev Tools", item);
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role: "reload"
                }
            ]
        })
    }
    return template;
}

// If mac, add empty object to menuTemplate
if (process.platform === "darwin") {
    mainMenuTemplate.unshift({});
}


