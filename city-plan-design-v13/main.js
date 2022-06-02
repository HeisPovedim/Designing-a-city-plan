// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const mysql = require("mysql2");
const fs = require("fs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "city-plan",
  password: "root866705"
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'Load statistics',
          click: async () => {
            const selectStatisticsSql = 'SELECT * FROM `statistics`;';
            connection.query(selectStatisticsSql, (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                  // fs.writeFileSync("statistics.txt", results);
                  // let arr = [results]
                  // fs.writeFile('./statistics.json', results);
                  console.log(results);
                  let arrayResults =[];
                  for (let index = 0; index < results.length; index++) {
                    arrayResults.push(results[index].id, results[index].timestamp);
                  }
                  fs.writeFileSync('./statistics.txt', JSON.stringify(arrayResults));
                }
            });
          }
        },
        isMac ? { role: 'close' } : { role: 'quit' }
        
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Некоторые интерфейсы API могут использоваться только после возникновения этого события.
app.whenReady().then(() => {
  createWindow()
  let now = new Date();
  let options = {
    era: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  let timestamp = now.toLocaleString("ru", options);
  const insertSql = 'INSERT INTO `statistics`(timestamp) VALUES(?)';
 
        connection.query(insertSql, timestamp, function (err, results) {
          if (err) console.log(err);
          else console.log("Add data");
        });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})