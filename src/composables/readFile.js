const fs = window.require("fs");
const path = window.require("path");
const { ipcRenderer  } = require('electron');
const { spawn, exec } = window.require("child_process");

const openPath = (path) => {
    ipcRenderer.invoke("openPath", path);
}

const sendWin = (msg) => {
    ipcRenderer.invoke(msg, '');
}

const showNotification = (title, body) => {
    ipcRenderer.invoke("showNotification", {'title': title, 'body': body});
}

let DEV = true;
if(window.location.origin.indexOf('camera.1jiapu.com') > -1 || window.location.origin == 'https://shootimage.qingtime.cn' || window.location.origin == 'https://paiji.qingtime.cn' || window.location.origin == 'https://paiji.1jiapu.com'){
    DEV = false;
}

// 尼康抓图
const openNikon = (name, callback) => {
    let exePath = "";
    if (window.process.platform === "darwin") {
        if (DEV) {
            exePath = path.join(window.__dirname, "/public"+name);
        } else {
            exePath = path.join(window.__dirname, "./"+name);
        }
    } else if (window.process.platform === "win32") {
        if (DEV) {
            exePath = path.join(window.__dirname, "/public"+name+".exe");
        } else {
            exePath = path.join(window.__dirname, "./"+name+".exe");
        }
    } else {
        return;
    }

    console.log(exePath);

    if(DEV){//win 本地 地址不对
        exePath = exePath.replace('\\node_modules\\electron\\dist\\resources\\electron.asar\\renderer\\public','');
    }else{
        exePath = exePath.replace('\\electron.asar\\renderer','\\app');
    }
    console.log(exePath);
    const child = spawn(exePath);

    child.stdout.on("data", data => {
        callback(data);
    });

    child.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    child.on("close", code => {
        console.log(`子进程退出码：${code}`);
    });

    child.on("error", err => {
        console.log(`执行出错: ${err}`);
    });

    
    return child;
}

// 图片查重
const openImageCheck = (name, callback) => {
    let exePath = "";
    if (window.process.platform === "darwin") {
        if (DEV) {
            exePath = path.join(window.__dirname, "/public"+name);
        } else {
            exePath = path.join(window.__dirname, "./"+name);
        }
    } else if (window.process.platform === "win32") {
        if (DEV) {
            exePath = path.join(window.__dirname, "/public"+name+".exe");
        } else {
            exePath = path.join(window.__dirname, "./"+name+".exe");
        }
    } else {
        return;
    }

    if(DEV){//win 本地 地址不对
        exePath = exePath.replace('\\node_modules\\electron\\dist\\resources\\electron.asar\\renderer\\public','');
    }else{
        exePath = exePath.replace('\\electron.asar\\renderer','\\app');
    }
    
    const child = spawn(exePath);

    child.stdout.on("data", data => {
        callback(data);
    });

    child.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    child.on("close", code => {
        console.log(`子进程退出码：${code}`);
    });

    child.on("error", err => {
        console.log(`执行出错: ${err}`);
    });

    
    return child;
}

const logicaldisk = (callback) => {//获取自盘分区的字符串
    exec('wmic logicaldisk get caption', {
        windowsHide: true
    }, (err, stdout, stderr) => {
        if(err || stderr) { 
            console.log("root path open failed" + err + stderr);
            return;
        }
        let disk = stdout.replace(/[' ','\r']/g, '').trim().split('\n');
        disk.shift();
        callback(disk);
    });
}

const makeCameraDir = (path) => {
    fs.mkdir(path, (err) => {
        if(err){
            return console.log(err);
        }
        console.log('新建'+path+'文件夹成功');
    });
}

const makeDir = (path, callback) => {
    fs.mkdir(path, (err) => {
        if(err){
            return console.log(err);
        }
        console.log('新建'+path+'文件夹成功');
        callback();
    });
}

const removeDir = (path) => {
    fs.rmdir(path, (err) => {
        if(err){
            return console.log(err);
        }
        console.log('删除'+path+'文件夹成功');
    });
}

const copyFile = (list, callback) => {
    let i = 0, l = list.length - 1;
    function copy(){
        fs.copyFile(list[i], list[i].replace('_Copy', ''), 0 , (e) => {
            if(i < l){
                callback(i+1);
                i++;
                copy();
            }else{
                callback(i+1);
            }
        });
    }
    copy();
}

const writeFile = (filename, data, f , callback) => {
    fs.writeFile(filename, data, {'flag': f}, (err) => {
        if (err) {
            return console.log(err);
        }
        callback();
    });
}

const readFile = (filename, callback) => {
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            callback('error')
            return console.log(err);
        }
        callback(data);
    });
}

const readDirGetFileNames = (path, callback) => {
	let arr = [];
	fs.readdir(path, (err, files) => {
		// console.log(files);
		if (err) {
		    callback('error');
			return console.log(err);
		}
		files.forEach((filename) => {
			arr.push(filename)
		});
		callback(arr);
	});
}

const unlink = (filename, callback) => {
    fs.unlink(filename, (err) => {
        if (err){
			console.error(err);
		}else{
			console.log(filename+' was deleted');
		}
		callback({'filename': filename, 'error': err || ''});
    });
}

let host = '139.155.227.129';
let port = '22';
if(window.location.origin.indexOf('camera.1jiapu.com') > -1){
	host = '223.111.180.111';
	port = '22';
}

// let Client = require('ssh2-sftp-client');
console.log(localStorage.getItem('device'),localStorage.getItem('deviceKey'));
let config = {
    'host': host,
    'port': port,
    username: localStorage.getItem('device') || '',
    password: localStorage.getItem('deviceKey') || ''
};
const initsftp = (src, remotePath, callback) => {
    let sftp = new Client();
    sftp.connect(config).then(() => {
        // {step: (total_transferred, chunk, total) =>{}}
        return sftp.fastPut(src, remotePath);
    }).then(data => {
        console.log(data);
        callback(data);
        return sftp.end();
    }).catch(err => {
        console.log(err);
        callback('error');
        return sftp.end();
    });
}

const sftpmkdir = (remoteDir) => {
    let sftp = new Client();

    sftp.connect(config)
    .then(() => {
        return sftp.mkdir(remoteDir, true);
    })
    .then((data) => {
        console.log(data);
        return sftp.end();
    })
    .catch(err => {
        console.error(err.message);
        return sftp.end();
    });
}

const sftprmdir = (remoteDir) => {
    let sftp = new Client();
    
    sftp.connect(config)
    .then(() => {
        return sftp.rmdir(remoteDir);
    })
    .then((data) => {
        console.log(data);
        return sftp.end();
    })
    .catch(err => {
        console.error(err.message);
        return sftp.end();
    });
}

// 数据流读取
function createReadStream(fileName, callback){
	var data = '';
	
	// 创建可读流
	var readerStream = fs.createReadStream(fileName);
	
	// 设置编码为 utf8。
	// readerStream.setEncoding('UTF8');
	
	// 处理流事件 --> data, end, and error
	readerStream.on('data', function(chunk) {
	   data += chunk;
	});
	
	readerStream.on('end',function(){
	   callback(data);
	});
	
	readerStream.on('error', function(err){
	   console.log(err.stack);
	});
}

// 读取本地文件 注意 数据类型不需要写 txt文档有中文 需要utf-8
const readFile2 = (filename, callback) => {
    fs.readFile(filename, (err, data) => {
        if (err) {
            callback('error')
            return console.log(err);
        }
        callback(data);
    });
}

// 文件重命名
const renameFile = (drive, path, newPath, i, callback) => {
	fs.rename(drive+path, drive+newPath, (err) => {
		if(err){
			console.log(err);
			callback({'i': i, 'log': 'err'});
		}else{
			callback({'i': i, 'log': 'ok'});
		}
	});
}

export {
    showNotification,
    openPath,
    logicaldisk, 
    openNikon, 
    openImageCheck, 
    makeCameraDir,
    writeFile, 
    readFile, 
    unlink,
    makeDir,
    removeDir, 
    copyFile,
    initsftp,
    sftpmkdir,
    sftprmdir, 
    sendWin,
	readDirGetFileNames, 
	readFile2, 
	createReadStream,
	renameFile,
}