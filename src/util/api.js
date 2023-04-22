import axios from 'axios';
import { createMsg } from './ADS';

let baseURL = 'https://pumudata.qingtime.cn';
let uploadFileURL = 'https://sync.qingtime.cn';
if(window.location.origin.indexOf('camera.1jiapu.com') > -1){
	baseURL = 'http://genealogydata.1jiapu.com';
	uploadFileURL = 'http://223.111.180.111:8085';
}

axios.interceptors.response.use(
    (response) => {
        switch (response.data.statusCode || response.data.status) {
            case '701':
                localStorage.clear()
                createMsg('登录失效');
                break
            case '201':
                createMsg(response.data.msg)
                break
            default:
        }

        return response
    },
    (err) => {
      console.log(err)
    }
)

const request = {
    get: (url, params, base = '') => {
        return new Promise((resolve, reject) => {
            axios
            .get((base ? base : baseURL)+url, {params})
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    createMsg(response.data.msg);
                    window.location.href = window.location.origin+'/authentication';
                }
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    },
    post: (url, params, base) => {
        return new Promise((resolve, reject) => {
            axios
            .post((base ? base : baseURL)+url, params)
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    createMsg(response.data.msg);
                    window.location.href = window.location.origin+'/authentication';
                }
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    patch: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .patch(baseURL+url, params)
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    createMsg(response.data.msg);
                    window.location.href = window.location.origin+'/authentication';
                }
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    delete: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .delete(baseURL+url, {
                data: params
            })
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    createMsg(response.data.msg);
                    window.location.href = window.location.origin+'/authentication';
                }
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    }
}

const user = {
    getUserInfo(token){
        let param = {
            token: token
        }
        return request.get('/sgbh/account/userinfo', param, 'https://baokudata.qingtime.cn');
    }
}

const camera = {
    getDeviceByUser(userKey, siteKey){// 根据用户获取对应的拍机号
        let param = {
            userKey: userKey,
            siteKey: siteKey
        }
        return request.get('/v2/camera/device/listOfUser', param);
    },
    getDeviceList(userKey, siteKey){// 拍机号列表
        let param = {
            userKey: userKey,
            siteKey: siteKey
        }
        return request.get('/camera/device/list', param);
    },
    getDeviceByOrg(orgKey, siteKey, userKey){// 拍机号列表
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            userKey: userKey
        }
        return request.get('/v2/camera/device/list', param);
    },
    getOrg(userKey, siteKey){// 用户对应的机构信息
        let param = {
            siteKey: siteKey,
            userKey: userKey
        }
        return request.get('/org/member/info', param);
    },
    getOrgMember(orgKey){// 机构人员
        let param = {
            orgKey: orgKey
        }
        return request.get('/org/member', param);
    },
    getSwitchCode(deviceKey, userKey, siteKey){// 获取验证码
        let param = {
            deviceKey: deviceKey,
            userKey: userKey,
            siteKey: siteKey
        }
        return request.get('/camera/device/switchCode', param);
    },
    verfiyCode(deviceKey, code, userKey, siteKey){//验证码校验
        let param = {
            deviceKey: deviceKey,
            code: code,
            userKey: userKey,
            siteKey: siteKey
        }
        return request.post('/camera/device/verfiyCode', param);
    },
    editDevice(deviceKey, clientUser, mobile){// 编辑拍机号
        let param = {
            deviceKey: deviceKey,
            clientUser: clientUser,
            mobile: mobile,
        }
        return request.patch('/camera/device', param);
    },
    editDeviceByUser(code, deviceKey, userKey){// 编辑拍机号
        let param = {
            code: code,
            deviceKey: deviceKey,
            userKey: userKey,
        }
        return request.patch('/v2/camera/device', param);
    },
    mergeImage(bgKey, mergeUrl){
        let param = {
            bgKey: bgKey,
            mergeUrl: mergeUrl
        }
        return request.post('merge', param, 'https://fdcskcydata.qingtime.cn/');
    },
    statisticsData(code){// 步骤统计数据
        let param = {
            code: code,
        }
        return request.get('/v3/camera/task/statisticsData', param);
    },
    taskList(stage, code, filterDevice, filterStatus, page, limit){// 任务列表
        let param = {
            stage: stage,
            code: code,
            filterDevice: filterDevice,
            filterStatus: filterStatus,
            page: page,
            limit: limit,
        }
        return request.get('/v2/camera/task/list', param);
    },
	taskListV3(stage, code, filterDevice, filterStatus, genealogyName, hall, gcKey, publish, fileName, keyWord, volumeNumber, claim, page, limit){// 任务列表
	    let param = {
	        stage: stage,
	        code: code,
	        filterDevice: filterDevice,
	        filterStatus: filterStatus,
			genealogyName: genealogyName,
			hall: hall,
			gcKey: gcKey,
			publish: publish, 
			fileName: fileName,
			keyWord: keyWord,
			volumeNumber: volumeNumber,
			claim: claim,
	        page: page,
	        limit: limit,
	    }
	    return request.get('/v3/camera/task/listNew', param);
	},
    taskDetail(code, catalogKey){// 家谱详情
        let param = {
            code: code,
            catalogKey: catalogKey,
        }
        return request.get('/camera/catalog/detail', param);
    },
	patchCatalog(code, catalogKey, patchData){// 编辑谱目
		let param = {
		    code: code,
		    catalogKey: catalogKey,
		    patchData: patchData
		}
		return request.patch('/camera/catalog/catalog', param);
	},
	patchCatalogPass(code, catalogKey, status, siteKey="1528234980"){// 家谱审核通过
		let param = {
		    code: code,
		    catalogKey: catalogKey,
		    status: status,
			siteKey: siteKey
		}
		return request.patch('/v3/camera/task/catalogPass', param);
	},
    updateCatalog(code, catalogKey, patchData){// 编辑家谱
        let param = {
            code: code,
            catalogKey: catalogKey,
            patchData: patchData
        }
        return request.patch('/v3/camera/catalog/updateGCAndCheck', param);
    },
    directTakeCatalog(code, catalogData){// 创建离线家谱
        let param = {
            code: code,
            catalogData: catalogData,
        }
        return request.post('/v3/camera/catalog/directTake', param);
    },
    taskClaim(code, catalogKey){// 领取
        let param = {
            code: code,
            catalogKey: catalogKey,
        }
        return request.patch('/v2/camera/task/claim', param);
    },
	patchClaimBatch(code, catalogKeyArray){// 批量领取
		let param = {
		    code: code,
		    catalogKeyArray: catalogKeyArray,
		}
		return request.patch('/v3/camera/task/claimBatch', param);
	},
    taskGiveUp(code, catalogKey){// 放弃、拍摄
        let param = {
            code: code,
            catalogKey: catalogKey,
        }
        return request.patch('/camera/task/giveUp', param);
    },
    taskstatus(code, catalogKey, status){// 更新状态
        let param = {
            code: code,
            catalogKey: catalogKey,
            status: status,
        }
        return request.patch('/camera/task/status', param);
    },
	patchStatusBatch(code, status){// 一键提交审阅、一键自检完成
		let param = {
		    code: code,
			status: status,
		}
		return request.patch('/v3/camera/task/statusBatch', param);
	},
    taskDone(code, catalogKey){// 完成拍照
        let param = {
            code: code,
            catalogKey: catalogKey,
        }
        return request.patch('/camera/task/done', param);
    },
    taskBegin(code, catalogKey){// 开始任务
        let param = {
            code: code,
            catalogKey: catalogKey,
        }
        return request.patch('/camera/task/begin', param);
    },
	getVolumeNotTotalSync(code){//待上传卷册列表（包含未上传、上传部分）
		let param = {
		    code: code,
			page: 1,
			limit: 50,
		}
		return request.get('/v3/camera/catalog/volumeNotTotalSync', param);
	},
    addVolume(code, catalogKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID){//新增卷册
        let param = {
            code: code,
            catalogKey: catalogKey,
            volumeNumber: volumeNumber,
            internalSerialNumber: internalSerialNumber,
			isLeadImages: isLeadImages,
			electronicCopy: electronicCopy,
			singleOrTwo: singleOrTwo,
			memo: memo,
			imageSource: imageSource,
			DorProjectID: DorProjectID, 
			DorMediaID: DorMediaID,
        }
        return request.post('/v3/camera/catalog/volume', param);
    },
    editVolumeNumber(code, volumeKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID){//编辑卷册
        let param = {
            code: code,
            volumeKey: volumeKey,
            volumeNumber: volumeNumber,
            internalSerialNumber: internalSerialNumber,
			isLeadImages: isLeadImages,
			electronicCopy: electronicCopy,
			singleOrTwo: singleOrTwo,
			memo: memo,
			imageSource: imageSource,
			DorProjectID: DorProjectID,
			DorMediaID: DorMediaID,
        }
        return request.patch('/camera/catalog/volumeNumber', param);
    },
    deleteVolume(code, volumeKey){//删除卷册
        let param = {
            code: code,
            volumeKey: volumeKey,
        }
        return request.delete('/camera/catalog/volume', param);
    },
    getVolumeResion(code, volumeKey){// 打回原因
        let param = {
            code: code,
            volumeKey: volumeKey,
        }
        return request.get('/camera/catalog/volume/reason', param);
    },
	finishRepulseRecord(repulseRecordKey, index, isFinish){// 打回原因标记
		let param = {
		    repulseRecordKey: repulseRecordKey,
		    index: index,
		    isFinish: isFinish,
		}
		return request.patch('/v3/camera/task/finishRepulseRecord', param);
	},
    getRepulseRecord(volumeKey, orgOrFS, gcKey = '',siteKey = '1528234980'){// 打回原因列表
        let param = {
            volumeKey: volumeKey,
            orgOrFS: orgOrFS,
            gcKey: gcKey, 
            siteKey: siteKey,
        }
        return request.get('/review/task/repulseRecord', param);
    },
    getVolume(code, catalogKey, volumeStatus){//卷册列表
        let param = {
            code: code,
            catalogKey: catalogKey,
			volumeStatus: volumeStatus
        }
        return request.get('/camera/catalog/volume', param);
    },
    sortGCVolume(code, catalogKey, volumeSortArray){//卷册排序
        let param = {
            code: code,
            catalogKey: catalogKey,
            volumeSortArray: volumeSortArray,
        }
        return request.patch('/camera/catalog/sortGCVolume', param);
    },
    volumeDetail(code, volumeKey){//卷册详情
        let param = {
            code: code,
            volumeKey: volumeKey,
        }
        return request.get('/camera/catalog/volume/detail', param);
    },
	patchVolumeInfo(code, volumeKey, takePages, syncTime){//更新卷册拍摄信息（刷数据库影像表/卷册加同步成功标志位）实拍页数、同步累计时间
		let param = {
		    code: code,
		    volumeKey: volumeKey,
		    takePages: takePages,
		    syncTime: syncTime,
		}
		return request.patch('/v3/camera/catalog/volume', param);
	},
	patchVolumeStatus(code, volumeKey, status, siteKey="1528234980"){// 更改状态（卷册）
		let param = {
		    code: code,
		    volumeKey: volumeKey,
		    status: status,
		    siteKey: siteKey,
		}
		return request.patch('/v3/camera/task/status', param);
	},
    editVolume(code, volumeKey, beginTime, doneTime, takePages, hasCheckSelf, syncTime){//编辑卷册
        let param = {
            code: code,
            volumeKey: volumeKey,
            beginTime: beginTime,
            doneTime: doneTime,
            takePages: takePages,
            hasCheckSelf: hasCheckSelf,
            syncTime: syncTime,
        }
        return request.patch('/camera/catalog/volume', param);
    },
    addCameraBill(code, catalogKeyArr){//创建发票
        let param = {
            code: code,
            catalogKeyArr: catalogKeyArr,
        }
        return request.post('/camera/bill', param);
    },
    getCameraBill(code){//发票列表
        let param = {
            code: code,
        }
        return request.get('/camera/bill', param);
    },
    getBillDetail(code, billKey){// 发票详情
        let param = {
            code: code,
            billKey: billKey, 
        }
        return request.get('/camera/bill/detail', param);
    },
    updateBillCollection(code, billKey){// 更新批次状态
        let param = {
            code: code, 
            billKey: billKey, 
        }
        return request.patch('/camera/bill/collection', param);
    },
    getMessageList(code, status, page, limit){//消息列表
        let param = {
            code: code,
            status: status,
            page: page, 
            limit: limit
        }
        return request.get('/camera/device/messageList', param);
    },
    messageOneKeyRead(code){// 一键已读
        let param = {
            code: code
        }
        return request.post('/camera/device/messageOneKeyRead', param);
    },
    messageRead(messageId, status){// 消息已读
        let param = {
            messageId: messageId,
            status: status
        }
        return request.patch('/message/status', param);
    },
    notReadMessageNumber(code){// 未读消息统计
        let param = {
            code: code
        }
        return request.post('/camera/device/notReadMessageNumber', param);
    },
    reviewPageList(volumeKey){// 影像列表
        let param = {
            volumeKey: volumeKey
        }
        return request.get('/review/page/list', param);
    },
    reviewPageReturn(pageKey, returnReason){// 打回原因
        let param = {
            pageKey: pageKey,
            returnReason: returnReason,
        }
        return request.patch('/review/page/return', param);
    },
    reviewVolumeReturn(volumeKey, userKey, orgOrFS){// 卷册打回
        let param = {
            volumeKey: volumeKey,
            userKey: userKey, 
            orgOrFS: orgOrFS,
        }
        return request.patch('/review/volume/return', param);
    },
    adminVerify(code, catalogKey, operate, returnReason = '', siteKey = '1528234980'){// 机构管理员 审核
        let param = {
            code: code,
            catalogKey: catalogKey,
            operate: operate,
            returnReason: returnReason,
            siteKey: siteKey,
        }
        return request.patch('/camera/task/adminVerify', param);
    },
	uploadFile(param){// 上传文件
		return request.post('/uploadFile', param, uploadFileURL);
	},
	patchUpdateReason(volumeKey, reason){// 更新错误原因（上传报错）
		let param = {
		    volumeKey: volumeKey,
		    reason: reason
		}
		return request.patch('/v3/camera/catalog/updateReason', param);
	},
	testOverTime(){//测试超时
	    let param = {
	        
	    }
	    return request.patch('/v3/review/catalog/testOverTime', param);
	},
}

export {
    camera, user
}