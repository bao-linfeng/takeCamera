// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, ipcMain, dialog, shell, screen, Notification } = require("electron");
const path = require("path");
const url = require("url");
const exec = require("child_process").exec;
// 引用package.json
const pkg = require("../package.json");
const setting = require("../setting.json");

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

ipcMain.handle("openPath", (e, msg) => {
  shell.openPath(msg);
});

ipcMain.handle("min", (e, msg) => {
  mainWindow.minimize();
});

ipcMain.handle("max", (e, msg) => {
	if (mainWindow.isMaximized()) {
	    mainWindow.unmaximize();
	}else{
	    mainWindow.maximize();
	}
  // mainWindow.maximize();
});

ipcMain.handle("close", (e, msg) => {
  mainWindow.close();
});

ipcMain.handle("showNotification", (e, data) => {
  new Notification({ 'title': data.title, 'body': data.body }).show();
});

console.log(__dirname);

function createWindow() {
  //创建浏览器窗口,宽高自定义具体大小
  mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width - 80,
    height: screen.getPrimaryDisplay().workAreaSize.height - 80,
    resizable: true,
    icon: path.join(__dirname+'./icon.ico'),
    titleBarStyle: "hidden",
    // titleBarOverlay: {
    //   color: '#fff',
    //   symbolColor: 'black'
    // },
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false 
    }
  });
  // contextIsolation: false 才可以使用 window.require() electron 12以上
  if (pkg.DEV) {
    // 加载应用----适用于 react 项目
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    // vue无法本地预览=>打包到服务器
    // mainWindow.loadFile(path.join(__dirname, "index.html"));
    // mainWindow.loadURL(
    //   url.format({
    //     pathname: path.join(__dirname, "index.html"),
    //     protocol: 'file',
    //     slashes: true
    //   })
    // );
	  // mainWindow.loadURL("https://paiji.qingtime.cn?v="+Date.now());
	mainWindow.loadURL("http://camera.1jiapu.com?v="+Date.now());
    // mainWindow.loadURL("https://shootimage.qingtime.cn");
  }
  
  mainWindow.maximize();

  // 打开开发者工具，默认不打开
  // mainWindow.webContents.openDevTools()

  // 关闭window时触发下列事件.
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on("ready", createWindow);

// 所有窗口关闭时退出应用.
app.on("window-all-closed", function() {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});
