<template>
    <div class="image-center-wrap" @mousemove.prevent="mouseLMove" @mouseup="mouseLEnd">
		<WinBar />
        <!-- head -->
        <div class="image-center-head">
			<div class="head-left">
				<!-- 返回 -->
				<img class="back" title="返回" src="../assets/left.svg" @click="goBack" alt="">
				<p class="marginL10">{{genealogyName}}</p>
				<SelectModule v-if="volumeList.length" class="width130 marginL10" :list="volumeList" :defaultValue="volumeKey" v-on:get-value="changeVolumeKey" />
			</div>
            <h3 class="title">影像中心({{scale*100}}%)</h3>
            <!-- 工具栏 -->
            <div class="tool-box">
				<button v-if="['2212520818', '2211712248'].indexOf(deviceKey) > -1" class="autoCamera" @click="autoCamera">{{autoCameraTimer ? '取消自动' : '自动'}}拍摄</button>
				<SelectModule v-if="((detail.takeStatus <= 2) || detail.takeStatus == 6) && detail.isLeadImages != 1" class="width120" :list="cameraList" :defaultValue="typename" v-on:get-value="getTypename" />
				<SelectModule v-if="((detail.takeStatus <= 2) || detail.takeStatus == 6) && detail.isLeadImages != 1" class="width80" :list="rotateList" :defaultValue="cameraRotate" v-on:get-value="getCameraRotate" />
                <img v-if="((detail.takeStatus <= 2) || detail.takeStatus == 6) && detail.isLeadImages != 1" src="../assets/singleClip.svg" title="单页裁剪" alt="" @click="changeFabric({'f': 1, 't': 1})" />
                <img v-if="((detail.takeStatus <= 2) || detail.takeStatus == 6) && detail.isLeadImages != 1" src="../assets/doubleClip.svg" title=" 双页裁剪" alt="" @click="changeFabric({'f': 3, 't': 2})" />
                <span class="patch-submit" @click="patchVolumeStatus(5)" v-if="detail.takeStatus == 4 && detail.syncSuccess">提交审阅</span>
				<img src="../assets/help.svg" @click="isHelp = true" title="帮助中心" alt="" />
                <img v-if="imageList.length" src="../assets/more.svg" title="更多" @click="toggleMore" alt="">
            </div>
        </div>
        <!-- content -->
        <div class="image-center-content" :style="{height: IH+'px', background: bgColor}">
            <!-- 大图 -->
            <div class="image-box" :class="{active: false}" id="large-image">
				<div class="image-box-inner">
					<img :class="{active: isNatural}" :style="{transform: 'translate('+x+'px, '+y+'px) rotate('+rotate+'deg) scale('+scale+')'}" :src="imageURL.indexOf('gif') > -1 ? imageURL : (imageList[imageIndex].v ? (imageURL+'?v='+imageList[imageIndex].v) : imageURL)" @load="loadImage" alt="">
				</div>
                <div class="img-hand" @mousedown="dragStart" @mousemove.prevent="mouseMove" @wheel.passive="handleWheel"></div>
            </div>
            <!-- 打回原因列表、图片查重列表 -->
            <div class="pass-wrap style1" v-show="sidebarShow">
                <h3 v-if="resionList.length">打回原因历史:</h3>
                <div class="repulseRecord-box" v-for="(item,index) in resionList" :key="index">
                    <span>{{index+1}}、{{item.userName || item.mobile}} {{item.createTimeO}}</span>
                    <div class="returnReason-box" v-for="(item2,index2) in item.returePageArray" :key="index2">
					    <i class="check-box" :class="{active: item2.isFinish}" @click="finishRepulseRecord(item, item2)"></i>
						<p class="returnReason" :class="{decoration: item2.isFinish, active: imageURLActive == item2.name}" @click="changeImage(item2.index, item2.name)">{{item.type == 2 ? ('第'+(item2.index+1)+'页') : ''}} {{item2.returnReason}}</p>
					</div>
                </div>
				<div v-if="leaveMsgList.length" class="leave-msg-list">
					<h3 class="title">拍机备注</h3>
					<p class="leave-msg-p" :class="{active: imageIndex === item.i}" @click="changeImage(item.i)" v-for="(item, index) in leaveMsgList" :key="index">第{{item.i+1}}页 {{item.leaveMsg}}</p>
				</div>
				<img class="close" @click="sidebarShow = false" title="收起" src="../assets/l_close.svg" alt="">
            </div>
			<div class="page-big-box" v-if="imageList.length">{{imageIndex+1}}</div>
			<img v-show="!sidebarShow" class="open-side" title="展开" @click="sidebarShow = true" src="../assets/r_open.svg" alt="">
			<div class="shootTime" v-show="shootTime">{{shootTime || 0}} ms</div>
			<img v-if="imageIndex > 0" class="prev" @click="prevPage" src="../assets/leftW.svg" alt="上一页">
			<img v-if="imageIndex < imageList.length - 1" class="prev next" @click="nextPage" src="../assets/rightW.svg" alt="下一页">
        </div>
		<!-- 旋转、缩放、重置、删除 -->
		<div class="rotate-zoom-delete-box" @mousedown="mouseLStart">
			<div class="tool-bar-inbox" @mousedown.stop="">
				<input v-if="imageList.length" class="page-input" v-model="page" @keyup.enter.stop="changePage" type="text" placeholder="页码" />
				<i v-if="imageList.length">/共{{imageList.length}}页</i>
				<div class="bg-color" title="设置背景色" @click="isColor = !isColor" :style="{background: bgColor}">
					<div v-show="isColor" class="bg-color-box">
						<span class="color" v-for="(item, index) in bgColorList" :key="index" @click.stop="changeBgColor(item)" :style="{background: item.value}"></span>
					</div>
				</div>
				<img class="icon" @click="handleNatural" title="原图查看" :src="isNatural ? naturalOpen : naturalClose" alt="">
				<img class="icon" @click="handleMagnifier" title="放大镜" :src="isMagnifier == 1 ? magnifierOpen : magnifierClose" alt="">
				<img class="icon" v-if="detail.isLeadImages != 1" @click="rotateImageByNikon()" title="左旋90°" src="../assets/spinR.svg" alt="">
				<img class="icon" v-if="detail.isLeadImages != 1" @click="rotateImageByNikon(-90)" title="右旋90°" src="../assets/spinL.svg" alt="">
				<img class="icon" @click="handleZoom(false)" title="缩小" src="../assets/zoomIn.svg" alt="">
				<img class="icon" @click="handleZoom()" title="放大" src="../assets/zoomOut.svg" alt="">
				<img class="icon" @click="handleResetImage" title="图像复位" src="../assets/reset.svg" alt="">
				<img class="icon" v-if="((detail.takeStatus <= 2) || detail.takeStatus == 6) && detail.isLeadImages != 1" @click="handleReset" title="裁剪重置" src="../assets/reset_clip.svg" alt="">
				<img class="icon" v-if="(detail.takeStatus >= 2 && detail.takeStatus <= 3) || detail.takeStatus == 6" @click="handleAttachedSheet" title="附页" src="../assets/attachedSheet.svg" alt="">
				<img class="icon" v-if="imageList.length && ((detail.takeStatus >= 2 && detail.takeStatus <= 3) || detail.takeStatus == 6)" title="删除" src="../assets/delete.svg" @click="handleDeleteImages" alt="">
				<img class="icon" v-if="(detail.takeStatus >= 2 && detail.takeStatus <= 3) || detail.takeStatus == 6" @click="isShow = !isShow" title="拍机备注" src="../assets/leaveMsg.svg" alt="">
				<LeaveMsgModule v-if="isShow" v-on:save-data="handleLeaveMsg" />
			</div>
		</div>
        <!-- foot -->
        <!-- 缩略图 -->
        <div class="image-center-foot" :style="{height: TH+'px'}">
            <div class="thumbnail-box" :class="{active: imageURLActive === item.name}" v-for="(item,index) in thumbnailList" :key="index" :id="index+(thumbnailPage - 1)*thumbnailLimit" @click="changeImage(index+(thumbnailPage - 1)*thumbnailLimit)">
                <img class="lazyload" :src="(item.isYun == 1 ? (yun+item.name) : (item.nail ? drive+(item.v ? (item.nail+'?v='+item.v) : item.nail) : 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs'))" alt="" />
				<i class="page-box">{{index+1+(thumbnailPage - 1)*thumbnailLimit}}</i>
				<img v-if="item.selfChecked == 1" class="self-check" src="../assets/imageCenter/tick_blue.svg"  title="自检完成" />
                <img v-if="item.attachedSheet == 1" class="attachedSheet" src="../assets/attachedSheetA.svg"  title="附页" />
				<i v-if="(detail.takeStatus >= 2 && detail.takeStatus <= 3) || detail.takeStatus == 6" class="check-box" :class="{active: checkImageList.indexOf(item.name) > -1}" :title="checkImageList.indexOf(item.name) > -1 ? '已选中' : '未选中'" @click.stop="checkImage(item.name)"></i>
            </div>
        </div>
        <!-- 裁剪 -->
        <div class="clip-wrap" v-if="isFabric == 1 || isFabric == 3">
            <div class="clip-head">
                <h3>{{isFabric == 1 ? '单' : ''}}{{isFabric == 3 ? '双' : ''}}页裁剪</h3>
            </div>
            <div class="clip-content" :style="{height: 'calc(100% - '+(70+Number(TH))+'px)'}">
                <canvas id="fabric-canvas" :width="imgW" :height="imgH"></canvas>
            </div>
            <div class="clip-foot" :style="{height: (Number(TH)+30)+'px'}">
                <div class="clip-direction" v-show="isFabric >= 3">
                    <span class="marginR10" :class="{active: typeSet == 'ltr'}" @click="changeTypeSet('ltr')">从左往右</span>
                    <span :class="{active: typeSet == 'rtl'}" @click="changeTypeSet('rtl')">从右往左</span>
                </div>
				<div class="auto-box" v-if="isFabric == 1" @click="isAuto = !isAuto">
					<i :class="{active: isAuto}"></i>
					<span :class="{active: isAuto}">自动裁剪</span>
				</div>
                <div class="btn-box" @click="clearFabric({'f': cutText.indexOf('@') > -1 ? 4 : 2, 't': isFabric <= 2 ? 1 : 2})">
                    <img src="../assets/delete-c.svg" alt="">
                    <span>取消</span>
                </div>
                <div class="btn-box" @click="changeFabric({'f': isFabric <= 2 ? 2 : 4, 't': isFabric <= 2 ? 1 : 2})">
                    <img src="../assets/check-c.svg" alt="">
                    <span>确定</span>
                </div>
            </div>
        </div>
		<!-- 放大镜 -->
		<div class="magnifier-box" v-show="isMagnifier == 1" :style="{top: (magnifierY+30)+'px', left: (magnifierX+30)+'px'}">
			<img class="magnifier" :style="{top: magnifierNaturalY+'px', left: magnifierNaturalX+'px'}" :src="imageURL" alt="">
		</div>
		<!-- 帮助中心 -->
		<HelpModule v-if="isHelp" v-on:close="isHelp = false" />
        <!-- 图片查重、拍摄完成、自查完成 -->
        <ImageSet v-if="isMore" v-on:manual-insertion="toggleInsertion" v-on:re-name="rename" :takeStatus="detail.takeStatus" :syncSuccess="detail.syncSuccess" v-on:start-camera="startCamera" v-on:change-image="imageCheck" v-on:change-check="changeCheck" v-on:start-check="startCheck" v-on:multiple-delete="multipleDeleteConfirm" />
        <!-- 加载页 -->
        <!-- <Loading v-if="!startCapture" /> -->
        <!-- 确认框 -->
        <ConfirmModule v-if="isConfirm" :msg="MSG" v-on:change-confirm="changeConfirm" />
        <!-- 进度条 -->
        <ProcessModule v-if="isProcess" :imageI="uploadIndex" :l="imageList.length" v-on:close="closeProcess" />
		<!-- 提示框 -->
		<PromptBoxModule v-if="isPromptBoxModule" :msg="msg" v-on:close="closePromptBox" />
		<div v-if="startCheckTimer" class="startCheckTimer"></div>
		<!-- 手动补拍 -->
		<ManualInsertion v-if="isInsertion" v-on:close="isInsertion = 0" v-on:save="saveInsertion" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch, watchEffect, computed, provide,readonly, toRefs, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changePropertyValue, useState } from '../store';
import { createMsg, getLocalTime, getQueryVariable, setValue, createPromptBox } from '../util/ADS';
import { camera } from '../util/api';
import { renameFile, openNikon, writeFile, readFile, unlink, makeCameraDir, openImageCheck, readDirGetFileNames, viewProcessMessage} from '../composables/readFile';
import ImageSet from '../components/ImageSet.vue';
import Loading from '../components/Loading.vue';
import ConfirmModule from '../components/ConfirmModule.vue';
import ProcessModule from '../components/ProcessModule.vue';
import PromptBoxModule from '../components/PromptBoxModule.vue';
import WinBar from '../components/WinBar.vue';
import LeaveMsgModule from '../components/LeaveMsgModule.vue';
import SelectModule from '../components/SelectModule.vue';
import HelpModule from '../components/HelpModule.vue';
import ManualInsertion from '../components/ManualInsertion.vue';
import magnifierOpen from '../assets/magnifierOpen.svg';
import magnifierClose from '../assets/magnifierClose.svg';
import naturalOpen from '../assets/naturalOpen.svg';
import naturalClose from '../assets/naturalClose.svg';

export default {
    components: {
        HelpModule, SelectModule, ImageSet, Loading,
		ConfirmModule, ProcessModule, PromptBoxModule, WinBar, LeaveMsgModule, 
		ManualInsertion, 
    },
    name: 'imageCenter',
    props: ['id'],
    setup(props, context) {
        const { NikonData, imagePath, uploadIndex, isProcess, cutText, isAdmin, cameraRotate, typename, syncCount, thumbnailH, deviceKey } = toRefs(useState());
        const { userName, userKey, siteKey, device, code, drive } = useState();
        const router = useRouter();
        const id = props.id;

        let gid = getQueryVariable('g');
        let vid = getQueryVariable('v');
		const genealogyName = ref(getQueryVariable('n') ? decodeURIComponent(getQueryVariable('n')) : '');
		
		const bgColor = ref('#ecc48b');
		const isColor = ref(false);
		const bgColorList = ref([{'label': '', 'value': '#ecc48b'}, {'label': '', 'value': '#333'}, {'label': '', 'value': '#000'}]);
		const changeBgColor = (data) => {
			bgColor.value = data.value;
			isColor.value = false;
		}
        console.log(gid, vid);
        let startTime = Date.now();
		// 返回
        const goBack = () => {
			if(detail.value.takeStatus == 1){
				router.push('/cameraCenter?id='+gid+'&s='+detail.value.takeStatus);
			}else{
				router.push('/taskCenter?s='+(detail.value.takeStatus >= 7 && detail.value.takeStatus != 12 ? 7 : detail.value.takeStatus));
			}
        }

        // 打回原因
        const resionList = ref([]);
        // 打回原因列表api
        const getRepulseRecord = async () => {
            const result = await camera.getRepulseRecord(vid, 1, '', siteKey);
            if(result.status == 200){
                resionList.value = result.data.map((ele) => {
                    ele.createTimeO = ele.createTime ? getLocalTime(ele.createTime, '-', 1) : '';
                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }
		// 标记打回原因
		const finishRepulseRecord = async (ele1, ele2) => {
			const result = await camera.finishRepulseRecord(ele1._key, ele2.index, ele2.isFinish ? 0 : 1);
			if(result.status == 200){
			    getRepulseRecord();
			}else{
			    createMsg(result.msg);
			}
		}

        // 影像
        const imageURL = ref('data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=');
        const imageList = ref([]);
        const imageIndex = ref(0);
        const imageURLActive = ref('');
        // 缩略图选取
        const changeImage = (i,n = '') => {
			if(i === undefined){
				return;
			}
            if(n){
                let ind = '';
                imageList.value.forEach((ele, index) => {
                    if(n.indexOf(ele.name) > -1){
                        ind = imageIndex.value = index;
                    }
                });
                console.log(ind);
                if(ind === ''){
                    createMsg('该图片已被删除');
                    return;
                }
            }else{
                imageIndex.value = i;
            }
			shootTime.value = imageList.value[imageIndex.value].shootTime;
            imageURLActive.value = imageList.value[imageIndex.value].name;
            imageURL.value = (imageList.value[imageIndex.value].isYun == 1 ? yun.value : drive)+imageList.value[imageIndex.value].name;
			scrollIntoView();
        }
        // 删除图片
        const deleteImage = () => {
            let mark = imageList.value[imageIndex.value].mark, imgI = 0;
            let filename = imageList.value[imageIndex.value].name, filename2 = '';
            if(mark){// 双页删除
                if(imageIndex.value === 0 && imageList.value[imageIndex.value + 1].mark == mark){
                    filename2 = imageList.value[imageIndex.value + 1].name;
                    imgI = imageIndex.value + 1;
                }else if(imageIndex.value === imageList.value.length - 1 && imageList.value[imageIndex.value - 1].mark == mark){
                    filename2 = imageList.value[imageIndex.value - 1].name;
                    imgI = imageIndex.value - 1;
                }else{
                    if(imageList.value[imageIndex.value - 1].mark == mark){
                        filename2 = imageList.value[imageIndex.value - 1].name;
                        imgI = imageIndex.value - 1;
                    }
                    if(imageList.value[imageIndex.value + 1].mark == mark){
                        filename2 = imageList.value[imageIndex.value + 1].name;
                        imgI = imageIndex.value + 1;
                    }
                }
            }
            if(filename2){
                if(imgI > imageIndex.value){
                    imageList.value.splice(imageIndex.value, 2);
                    if(imageIndex.value >= 1){
                        imageIndex.value = imageIndex.value - 1;
                    }else{
                        imageIndex.value = 0;
                    }
                }else{
                    imageList.value.splice(imageIndex.value - 1, 2);
                    if(imageIndex.value >= 2){
                        imageIndex.value = imageIndex.value - 2;
                    }else{
                        imageIndex.value = 0;
                    }
                }
            }else{
                imageList.value.splice(imageIndex.value, 1);
                if(imageIndex.value >= 1){
                    imageIndex.value = imageIndex.value - 1;
                }else{
                    imageIndex.value = 0;
                }
            }

            imageURL.value = imageList.value.length ? drive+imageList.value[imageIndex.value].name : 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
            imageURLActive.value = imageList.value.length ? imageList.value[imageIndex.value].name : '';
            writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
            //单页删除->缩略图分页
			if(imageList.value.length){
				initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
			}else{
				clearThumbnail();
			}
			
			if(filename2){
				unlink(drive+filename2, () => {});
				unlink(drive+filename2.replace(vid, vid+'_nail'), () => {});
			}
			// 大图删除
            unlink(drive+filename, () => {});
			// 缩略图删除
			unlink(drive+filename.replace(vid, vid+'_nail'), () => {});
			Observer();
			
			updateLeaveMsg();
        }
        // 更多
        const isMore = ref(false);
        const toggleMore = () => {
            isMore.value = !isMore.value;
        }
        // 拍照
        const isCover = ref(false);
		const isPrev = ref(false);
        const takeCamera = (f = 0) => {
			if(startCheckTimer.value){
				return createMsg('自动检查中，检查完成后在拍摄');
			}
            if(isFabric.value == 1 || isFabric.value == 3){
                return createMsg('裁剪操作未完成，不能继续拍摄');
            }
            if(startCapture.value){
                let clipURL = '';
                if(f == 1){// 覆盖图片
                    isCover.value = true;
                }
				if(f == 2){// 前插入图片
				    isPrev.value = true;
				}
				changePropertyValue('imagePath', drive+'/'+device+'/'+gid+'/'+vid +'/'+Date.now()+'.jpg');
                startCapture.value = false;
                startTime = Date.now();
                if(isFabric.value >= 3){
                    clipURL = `splitImage::${imagePath.value.replace('.jpg', typeSet.value == 'rtl' ? '_1.jpg' : '_2.jpg')}::${cutText.value.split('@')[1]}::${imagePath.value.replace('.jpg', typeSet.value == 'rtl' ? '_2.jpg' : '_1.jpg')}::${cutText.value.split('@')[0]}\n`;
                }else{
                    clipURL = `${cutText.value}${imagePath.value}\n`;
                }
                console.log(clipURL);
                window.NikonClip.stdin.write(clipURL, error => {
                    if (error) {
                        console.log(error);
                    }
                });
            }else{
				// 2023.3.8 用户反馈一直提示，表示拍摄慢 先不提示 看看反馈
                // createMsg('稍等一会在拍摄，正在处理中');
            }
        }
        
        // 关闭拍照exe
        const closeNikon = (f = false) => {
            if(window.NikonClip){
                window.NikonClip.stdin.write(`close\n`, error => {
                    if (error) {
                        console.log(error);
                    }
                    window.NikonClip = null;
					if(f){
						initCamera();
					}
                });
            }
        }
		// 旋转图片（真实旋转）
		const rotateImageByNikon = (deg = 90) => {
			let original = drive + imageList.value[imageIndex.value].name, nail = original.replace(vid, vid+'_nail');
			if(window.NikonClip){
				window.NikonClip.stdin.write('changeImgDirection,'+original+','+nail+','+deg+'\n', error => {
				    if (error) {
				        console.log(error);
				    }
				});
			}
		}
		
        // 键盘判断
        const enterKey = (event) => {
            const keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
            console.log(keyCode);
            // enter space 向后拍摄
            if(keyCode == 13 || keyCode == 32){
				// 未拍摄、拍摄中、自检中、打回
				if((detail.value.takeStatus >= 1 && detail.value.takeStatus <= 2) || detail.value.takeStatus == 6){
					detail.value.isLeadImages == 1 ? null : takeCamera(0);
				}
            }
            // F12 覆盖
            if(keyCode == 123){
				// 未拍摄、拍摄中、自检中、打回 且 有影像
				if(((detail.value.takeStatus >= 1 && detail.value.takeStatus <= 2) || detail.value.takeStatus == 6) && imageList.value.length){
					detail.value.isLeadImages == 1 ? null : takeCamera(1);
				}
            }
			// F10 向前插入图片
			if(keyCode == 121){
				if((detail.value.takeStatus >= 1 && detail.value.takeStatus <= 2) || detail.value.takeStatus == 6){
					detail.value.isLeadImages == 1 ? null : takeCamera(2);
				}
			}
            // 左、上
            if(keyCode == 37 || keyCode == 38){
                prevPage();
            }
            // 右、下
            if(keyCode == 39 || keyCode == 40){
                nextPage();
            }
			// S => STOP
			if(keyCode == 83){
				// 停止 自动检查
				clearInterval(startCheckTimer.value);
				startCheckTimer.value = null;
				createMsg('已停止自动检查！', true);
            }
        }
		
		const prevPage = () => {
			if(imageIndex.value >= 1){
			    changeImage(imageIndex.value - 1);
				initThumbnail((imageIndex.value)%thumbnailLimit.value ? Math.ceil((imageIndex.value + 1 - 1)/thumbnailLimit.value) : Math.ceil((imageIndex.value + 1 - 1)/thumbnailLimit.value) + 1);
			}else{
			    createMsg('第一页了');
			}
		}
		
		const nextPage = () => {
			if(imageIndex.value < imageList.value.length - 1){
			    changeImage(imageIndex.value + 1);
				initThumbnail((imageIndex.value+1)%thumbnailLimit.value ? Math.ceil((imageIndex.value + 1 + 1)/thumbnailLimit.value) : Math.ceil((imageIndex.value + 1 + 1)/thumbnailLimit.value) - 1);
			}else{
			    createMsg('末一页了');
			}
		}
        // 初始化enter事件
        const enterKeyUp = () => {
            document.addEventListener('keyup', enterKey);
        }
        // 销毁enter事件
        const enterKeyUpDestoryed = () => {
            document.removeEventListener('keyup', enterKey);
        }

        const startCapture = ref(false);
		
		// 本地数据丢失，云端获取数据
        const yun = ref(window.location.origin.indexOf('camera.1jiapu.com') > -1 ? 'http://223.111.180.111:8085/photo' : 'https://sync.qingtime.cn/photo');
        const getReviewPageList = async () => {
            const result = await camera.reviewPageList(vid);
            if(result.status == 200){
				if(result.data && result.data.length){
					imageList.value = result.data.map((ele) => {
					    return {'name': ele.name, 'success': ele.success, 'isYun': 1};
					});
					imageIndex.value = imageList.value.length - 1;
					imageURL.value = (imageList.value[imageIndex.value].isYun == 1 ? yun.value : drive)+imageList.value[imageIndex.value].name;
					imageURLActive.value = imageList.value[imageIndex.value].name;
					Observer();
					// 拍照顺序本地保存
					writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
				}else{
					createPromptBox('本地和云端均无数据，请重新拍摄！', 'error');
				}
            }else{
				createPromptBox('本地和云端均无数据，请重新拍摄！', 'error');
            }
        }
		
		// 卷册详情
        const detail = ref({'beginTime': '', 'doneTime': '', 'takeStatus': '', 'takePages': '', 'hasCheckSelf': '', 'submitCount': 0, 'syncSuccess': false});
		const isPromptBoxModule = ref(false);
		const msg = ref('');
		const scrollIntoView = () => {
			let timer = setTimeout(() => {
				document.getElementById(imageIndex.value+'').scrollIntoView();
				clearTimeout(timer);
				timer = null;
			}, 300)
		}
		
		let waitTimer = null, waitTime = 10;
		const clearWaitTimer = () => {
			waitTimer ? clearInterval(waitTimer) : null;
			waitTimer = null;
			isPromptBoxModule.value = false;
		}
        const volumeDetail = async () => {
            const result = await camera.volumeDetail(code, vid);
            if(result.status == 200){
                detail.value = result.data;
                // 拍照顺序获取
                initJson();
	
				// 拍机程序只启动一次 2023.3.2 => baolf
				if(window.NikonClip){
					startCapture.value = true;
				}else{
					if(detail.value.isLeadImages == 1){// 电子谱
						startCapture.value = true;
					}else{
						msg.value = '正在初始化相机，请稍等！(10s)';
						isPromptBoxModule.value = true;
						// 定时器倒计时
						waitTimer = setInterval(() => {
							waitTime--;
							msg.value = '正在初始化相机，请稍等！('+waitTime+'s)';
							if(waitTime <= 0){
								clearWaitTimer();
							}
						}, 1000)
					}
					
					// 初始化 相机拍照
					initCamera();
				}
				// 打回中 => 打回原因列表
                if(detail.value.takeStatus == 6){
					sidebarShow.value = true;
                    getRepulseRecord();
                }
            }else{
                createMsg(result.msg);
            }
        }
		
		// 初始化读取json获取影像数据
		const initJson = () => {
			readFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', (data) => {
			    // console.log(data);
				// image.json文件为空
				if(!data){
					return createMsg('本卷册image.json文件为空，需要重新初始化！', true);
				}
				// 本地json无数据、打回中
			    if(data == 'error'){
			        if(detail.value.takeStatus == 6){
						createPromptBox('本地无影像，正在拉取云端数据，请稍等！', 'error');
			            getReviewPageList();
			        }
			        return;
			    }
				// 获取本地json数据
			    if(JSON.parse(data).length){
			        imageList.value = JSON.parse(data);
			        imageIndex.value = imageList.value.length - 1;
			        imageURL.value = (imageList.value[imageIndex.value].isYun == 1 ? yun.value : drive)+imageList.value[imageIndex.value].name;
			        imageURLActive.value = imageList.value[imageIndex.value].name;
					//初始化->缩略图分页
					initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
					// 留言列表
					updateLeaveMsg();
					// 图片懒加载
			        Observer();
					// 滑动定位
					scrollIntoView();
			    }
			});
		}
		
		const nowTime = ref(Date.now());
		const shootTime = ref(0);
		// 初始化相机程序
		const initCamera = () => {
			window.NikonClip = openNikon('/NikonCtrl/demo_capture', (data) => {
			    // console.log(`stdout: ${data}`);
				changePropertyValue('NikonData', data);
			});
		}
		
		watch(NikonData, (data) => {
			console.log(`stdout: ${data}`);
			// console.log(imagePath.value);
			// 可以拍摄
			if(data.indexOf('begin capture') > -1 && data.indexOf('begin capture picture') == -1){
				clearWaitTimer();
				
			    isPromptBoxModule.value = false;
				msg.value = '';
				startCapture.value = true;
			    createMsg('可以开始拍摄啦', true);
			}
			// 没有驱动提示
			if(data.indexOf("Couldn't find MD3 file") > -1){
				clearWaitTimer();
				createPromptBox('没有找到驱动程序，请手动设置!', 'error');
				isPromptBoxModule.value = false;
			}
			// 更新驱动
			if(data.indexOf('typenamekeep') > -1){
				startCapture.value = true;
				createMsg('可以开始拍摄啦', true);
			}
			// 更新驱动 关闭相机然后重启
			if(data.indexOf('typenameok') > -1){
				closeNikon(true);
			}
			// 旋转图片
			if(data.indexOf('rotateok') > -1){
				startCapture.value = true;
				createMsg('可以开始拍摄啦', true);
			}
			// 旋转图片 成图
			if(data.indexOf('changeImgDirectionOk') > -1){
				nowTime.value = Date.now();
				// imageURL.value = imageURL.value+'?v='+nowTime.value;
				imageList.value[imageIndex.value].v = imageList.value[imageIndex.value].v ? imageList.value[imageIndex.value].v + 1 : 1;
				
				Observer();
				writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
			}
			// 光线太暗
			if(data.indexOf('sunlight') > -1){
				// console.log(data.toString().split('\n'));
				let sunlight = data.toString().trim().split('\n');
				sunlight.forEach((ele) => {
					if(ele.indexOf('sunlight:') > -1){
						sunlight = ele;
					}
				});
				sunlight = sunlight.replace('sunlight:', '').replace('\r', '');
				// console.log(sunlight);
				if(sunlight <= 50){
					createPromptBox('家谱拍摄环境光线太暗,请开灯!', 'error');
					// msg.value = '家谱拍摄环境光线太暗,请开灯!';
					// isPromptBoxModule.value = true;
				    startCapture.value = true;
				}
			}
			// 程序繁忙
			if(data.indexOf('busy') > -1){
				createPromptBox('程序繁忙，请稍后拍摄', 'error');
				startCapture.value = false;
			}
			// 拍摄失败
			if(data.indexOf('nailfail') > -1){
				createPromptBox('拍摄失败，请重新拍摄', 'error');
				startCapture.value = true;
			}
			// 拍摄缩略图
			if(data.indexOf('nailok') > -1){
				console.log('拍摄缩略图耗时：'+(Date.now() - startTime));
				// createMsg('可以继续拍摄啦', true);
				if(isFabric.value >= 3){// 双页裁剪
					imageURL.value = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=' || imagePath.value.replace('.jpg', '_2.jpg').replace(vid, vid+'_nail');
				    let imgIndex = 0, mark = imagePath.value.substring(imagePath.value.lastIndexOf('/')+1);
				    console.log(mark);
				    if(isCover.value){// 覆盖拍摄
				        isCover.value = false;
				        imgIndex = 1;
				        unlink(drive+imageList.value[imageIndex.value].name, () => {});
						// 缩略图删除
						unlink(drive+(imageList.value[imageIndex.value].name).replace(vid, vid+'_nail'), () => {});
				    }else{
						if(isPrev.value){// 前插入
							isPrev.value = false;
							if(imageList.value.length){
							    imageIndex.value = imageIndex.value + 1;
							}else{
							    imageIndex.value = 1;
							}
						}else{
							if(imageList.value.length){
							    imageIndex.value = imageIndex.value + 1 + 1;
							}else{
							    imageIndex.value = 1;
							}
						}
				    }
					// 影像数组更新
				    imageList.value.splice(imageIndex.value - 1, imgIndex, {'name': imagePath.value.replace('.jpg', '_1.jpg').replace(drive, ''), 'nail' : imagePath.value.replace('.jpg', '_1.jpg').replace(vid, vid+'_nail').replace(drive, ''), 'success': '', 'mark': mark}, {'name': imagePath.value.replace('.jpg', '_2.jpg').replace(drive, ''), 'nail': imagePath.value.replace('.jpg', '_2.jpg').replace(vid, vid+'_nail').replace(drive, ''), 'success': '', 'mark': mark});
				}else{
					let nail = imagePath.value.replace(vid, vid+'_nail'),
					original = imagePath.value;
					
				    imageURL.value = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=' || nail;
				    let imgIndex = 0;
				    if(isCover.value){// 覆盖拍摄
				        isCover.value = false;
				        imgIndex = 1;
				        unlink(drive+imageList.value[imageIndex.value].name, () => {});
						// 缩略图删除
						unlink(drive+(imageList.value[imageIndex.value].name).replace(vid, vid+'_nail'), () => {});
				    }else{
						if(isPrev.value){// 前插入
						    isPrev.value = false;
							if(imageList.value.length){
							    imageIndex.value = imageIndex.value;
							}else{
							    imageIndex.value = 0;
							}
						}else{
							if(imageList.value.length){
							    imageIndex.value = imageIndex.value + 1;
							}else{
							    imageIndex.value = 0;
							}
						}
				    }
					// 影像数组更新
				    imageList.value.splice(imageIndex.value, imgIndex, {'name': original.replace(drive, ''), 'nail': nail.replace(drive, ''), 'success': ''});
				}
				// 当前大图URL
				imageURLActive.value = imageList.value[imageIndex.value].name;
				// 拍照顺序本地保存
				writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
				//拍摄->缩略图分页
				if(imageList.value.length){
					initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
				}else{
					clearThumbnail();
				}
				// 缩略图懒加载
				Observer();
				// 滑动定位
				scrollIntoView();
			}
			// 拍摄成功
			if(data.indexOf('fileok') > -1){
				startCapture.value = true;
				shootTime.value = (Date.now() - startTime);
				console.log('拍摄原图耗时：'+shootTime.value);
				imageURL.value =  drive + imageList.value[imageIndex.value].name;
				
				imageList.value[imageIndex.value].shootTime = shootTime;
				// 拍照顺序本地保存
				// writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
			}
		})

        const loadImage = (e) => {//大图加载
            console.log(e.target.width, e.target.height, e.target.naturalWidth, e.target.naturalHeight);
            imgW.value = e.target.width;
            imgNW.value = e.target.naturalWidth;
            imgH.value = e.target.height;
            imgNH.value = e.target.naturalHeight;
            console.log('加载耗时：'+(Date.now() - startTime));
        }

        // fabric
        const imgW = ref(1920);
        const imgH = ref(1080);
        const imgNW = ref(0);
        const imgNH = ref(0);
        const isFabric = ref(2);
        const typeSet = ref('rtl');
		const isAuto = ref(false);
        let canvas, t = 100, l = 170;
		
		const autoCut = (s) => {
			if(window.NikonClip){
				window.NikonClip.stdin.write(s+'\n', error => {
				    if (error) {
				        console.log(error);
				    }
				});
			}
		}
		
		watch(isAuto, (nv, ov) => {
			console.log(nv);
			if(nv){
				autoCut('autoCut');
			}else{
				autoCut('stopAutoCut');
			}
		});

        const initFabric = (f = 0) => {// 初始化Fabric
            canvas = new fabric.Canvas('fabric-canvas');
            canvas.add(new fabric.Rect({
                top : t,
                left : l,
                width : f ? (imgW.value - 2*l)/2 - 10 : imgW.value - 2*l,
                height : (imgH.value - 2*t),
                fill : 'rgba(255,255,255,0.3)'
            }));

            canvas.item(0).set({
                borderColor: '#85b83e',
                cornerColor: '#85b83e',
                cornerSize: 12,
                transparentCorners: true
            });
            canvas.setActiveObject(canvas.item(0));
            if(f){
                canvas.add(new fabric.Rect({
                    top : t,
                    left : l + (imgW.value - 2*l)/2,
                    width : (imgW.value - 2*l)/2 - 10,
                    height : (imgH.value - 2*t),
                    fill : 'rgba(255,255,255,0.3)'
                }));

                canvas.item(1).set({
                    borderColor: '#85b83e',
                    cornerColor: '#85b83e',
                    cornerSize: 12,
                    transparentCorners: true
                });
                canvas.setActiveObject(canvas.item(1));
            }
        }

        const clearFabric = (data) => {
            isFabric.value = data.f;
        }

        const changeTypeSet = (t) => {
            typeSet.value = t;
        }

        const changeFabric = (data) => {
            console.log(data);
            isFabric.value = data.f;
            if(data.t == 1){
                if(data.f == 1){
                    nextTick(() => {
                        initFabric();
                    });
                }else{
                    // console.log(canvas.item(0));
					let x, y, top, left, width, height;
					x = canvas.item(0).lineCoords.br.x > imgW.value ? imgW.value : canvas.item(0).lineCoords.br.x;
					y = canvas.item(0).lineCoords.bl.y > imgH.value ? imgH.value : canvas.item(0).lineCoords.bl.y;
					top = Math.floor((canvas.item(0).top < 0 ? 0 : canvas.item(0).top)*imgNH.value/imgH.value);
					left = Math.floor((canvas.item(0).left < 0 ? 0 : canvas.item(0).left)*imgNW.value/imgW.value);
					width = Math.floor((x - (canvas.item(0).left < 0 ? 0 : canvas.item(0).left))*imgNW.value/imgW.value);
					height = Math.floor((y - (canvas.item(0).top < 0 ? 0 : canvas.item(0).top))*imgNH.value/imgH.value);
                    
					changePropertyValue('cutText', 'left:'+left+',top:'+top+',width:'+width+',height:'+height+'\n');
                }
            }
            if(data.t == 2){
                if(data.f == 3){
                    nextTick(() => {
                        initFabric(1);
                    });
                }else{
                    // console.log(canvas.item(0));
                    // console.log(canvas.item(1));
                    let x = canvas.item(0).lineCoords.br.x > imgW.value ? imgW.value : canvas.item(0).lineCoords.br.x;
                    let y = canvas.item(0).lineCoords.bl.y > imgH.value ? imgH.value : canvas.item(0).lineCoords.bl.y;
                    let top = Math.floor((canvas.item(0).top < 0 ? 0 : canvas.item(0).top)*imgNH.value/imgH.value);
                    let left = Math.floor((canvas.item(0).left < 0 ? 0 : canvas.item(0).left)*imgNW.value/imgW.value);
                    let width = Math.floor((x - (canvas.item(0).left < 0 ? 0 : canvas.item(0).left))*imgNW.value/imgW.value);
                    let height = Math.floor((y - (canvas.item(0).top < 0 ? 0 : canvas.item(0).top))*imgNH.value/imgH.value);

                    let xR = canvas.item(1).lineCoords.br.x > imgW.value ? imgW.value : canvas.item(1).lineCoords.br.x;
                    let yR = canvas.item(1).lineCoords.bl.y > imgH.value ? imgH.value : canvas.item(1).lineCoords.bl.y;
                    let topR = Math.floor((canvas.item(1).top < 0 ? 0 : canvas.item(1).top)*imgNH.value/imgH.value);
                    let leftR = Math.floor((canvas.item(1).left < 0 ? 0 : canvas.item(1).left)*imgNW.value/imgW.value);
                    let widthR = Math.floor((xR - (canvas.item(1).left < 0 ? 0 : canvas.item(1).left))*imgNW.value/imgW.value);
                    let heightR = Math.floor((yR - (canvas.item(1).top < 0 ? 0 : canvas.item(1).top))*imgNH.value/imgH.value);

                    changePropertyValue('cutText', ''+left+','+top+','+width+','+height+'@'+leftR+','+topR+','+widthR+','+heightR);
                }
            }
        }

        const closeProcess = () => {
            changePropertyValue('isProcess', false);
            createMsg('在后台继续上传图片', true);
        }
		
		// 更新卷册信息=>实拍页数、同步累计时间
		const patchVolumeInfo = async (takePages, syncTime) => {
			const result = await camera.patchVolumeInfo(code, vid, takePages, syncTime);
			if(result.status == 200){
				if(syncTime){
					detail.value.syncSuccess = result.data.syncSuccess || false;
				}
			}else{
				createMsg(result.msg);
			}
		}
		
		// 获取未上传卷册列表
		const getVolumeNotTotalSync = async () => {
			const result = await camera.getVolumeNotTotalSync(code);
			if(result.status == 200){
				changePropertyValue('uploadVolumeTotal', result.total);
				changePropertyValue('uploadVolumeList', result.data);
			}
		}
		
		// 更新卷册状态信息
		const patchVolumeStatus = async (status) => {
			const result = await camera.patchVolumeStatus(code, vid, status);
			if(result.status == 200){
				detail.value.takeStatus = status;
				if(status == 2){
					// 重新拍摄 重置数据且打开相机
					// 相机重置
					handleReset(false);
					// 图片复位
					handleResetImage(false);
					// 关闭相机 => 重启相机 
					if(window.NikonClip){
					  
					}else{
						// initCamera();
					}
				}
				if(status == 3){
					// closeNikon();
					startCapture.value = false;
					patchVolumeInfo(imageList.value.length, '');
				}
				if(status == 4){
					patchVolumeInfo(imageList.value.length, '');
					getVolumeNotTotalSync();
					router.push('/cameraCenter?id='+gid+'&isAdd=1');
				}
				if(status == 5){
					router.push('/taskCenter?s=12');
				}
			}else{
				createMsg(result.msg);
			}
		}
		
		watch(syncCount, (nv, ov) => {
			if(nv && nv == vid){
				detail.value.syncSuccess = true;
			}
		})
		
		// 图片懒加载
        let timer, images, observer;
        const Observer = () => {
            // timer = setTimeout(() => {
            //     images = document.querySelectorAll(".lazyload");
            //     observer = new IntersectionObserver(entries => {
            //         entries.forEach(item => {
            //             if (item.isIntersecting) {
            //                 item.target.src = item.target.dataset.src; // 开始加载图片,把data-origin的值放到src
            //                 observer.unobserve(item.target); // 停止监听已开始加载的图片
            //             }
            //         });
            //     },{rootMargin: "0px -20px 0px 0px"});
            //     images.forEach(item => observer.observe(item)); 

            //     clearTimeout(timer);
            //     timer = null;
            // }, 200);
        }
        
        onMounted(() => {
			volumeKey.value = vid;
			// viewProcessMessage('InitCamera2.exe');
			// 相机重置
			handleReset(false);
			// 图片复位
			handleResetImage(false);
            // 创建卷册文件夹
            makeCameraDir(drive+'/'+device+'/'+gid+'/'+vid);
            // 缩略图文件夹
            makeCameraDir(drive+'/'+device+'/'+gid+'/'+vid+'_nail');
            // 键盘初始化
            enterKeyUp();
			// 卷册列表
			getVolume();
            // 卷册详情
            volumeDetail();
        });
		
		// 重新拍摄
		const startCamera = () => {
			patchVolumeStatus(2);
		}
		
		// 初始化卷册拍摄（当前卷册拍完，拍摄下一卷）
		const initVolume = (id) => {
			vid = id;
			router.push('/imageCenter?g='+gid+'&v='+vid);
			
			imageList.value = [];
			imageIndex.value = 0;
			imageURL.value = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
			imageURLActive.value = '';
			// 离开相机
			// closeNikon();
			// 相机重置
			handleReset(false);
			// 图片复位
			handleResetImage(false);
			// 创建卷册文件夹
			makeCameraDir(drive+'/'+device+'/'+gid+'/'+vid);
			// 缩略图文件夹
			makeCameraDir(drive+'/'+device+'/'+gid+'/'+vid+'_nail');
			// 键盘初始化
			// enterKeyUp();
			// 卷册列表
			// getVolume();
			// 卷册详情
			volumeDetail();
		}
		// 切换卷册
		const changeVolumeKey = (data) => {
			console.log(data);
			volumeKey.value = data.value;
			
			initVolume(data.value);
		}
		
		const volumeList = ref([]);
		const volumeKey = ref('');
		const statusO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中'};
		const getVolume = async () => {// 卷册列表
		    const result = await camera.getVolume(code, gid, '');
		    if(result.status == 200){
				let volumeArr = [];
		        result.data.map((ele, i) => {
		            if(ele.takeStatus >= 1 && ele.takeStatus <= 3){
						volumeArr.push({'label': ele.volumeNumber+'('+statusO[ele.takeStatus]+')', 'value': ele._key})
					}
		        });
				volumeList.value = volumeArr;
		    }else{
		        createMsg(result.msg);
		    }
		}
		
		// 批量删除
		const deleteImageLists = () => {
			msg.value = '正在批量删除，请稍等！';
			isPromptBoxModule.value = true;
			let max = imageList.value.length - 1, images = [];
			
			imageList.value.forEach((ele, index) => {
				if(checkImageList.value.indexOf(ele.name) > -1){
					console.log(index);
					if(max >= index){
						max = index;
					}
				}else{
					images.push(ele);
				}
			});
			console.log(max);
			imageIndex.value = max ? max - 1 : 0;
			imageList.value = images;
			
			imageURL.value = imageList.value.length ? drive+imageList.value[imageIndex.value].name : '';
			imageURLActive.value = imageList.value.length ? imageList.value[imageIndex.value].name : '';
			
			// 拍照顺序本地保存
			writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
			Observer();
			
			// 批量删除->缩略图分页
			if(imageList.value.length){
				initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
			}else{
				clearThumbnail();
			}
			
			checkImageList.value.forEach((ele, i) => {
				unlink(drive+ele, (data) => {});
				unlink((drive+ele).replace(vid, vid+'_nail'), (data) => {});
			});
			msg.value = '';
			isPromptBoxModule.value = false;
			checkImageList.value = [];
		}

        // 确认删除
        const isConfirm = ref(0);
		const MSG = ref('');
		const handleDeleteImages = () => {
			isConfirm.value = 1;
			MSG.value = '你已选择 '+(checkImageList.value.length ? checkImageList.value.length : 1)+' 个影像页,请确认是否删除!';
		}
        const changeConfirm = (f) => {
			MSG.value = '';
            if(f){
				if(isConfirm.value == 1){
					if(checkImageList.value.length){
						// 选中批量删除
						deleteImageLists();
					}else{
						// 当前页删除
						deleteImage();
					}
				}else if(isConfirm.value == 2){
					// 全部删除
					multipleDelete();
				}
            }
			isConfirm.value = 0;
        }
		
		// 1 待拍摄 2 拍摄中 3 自检中 4 同步中 12 机构审阅中 5 微站审阅中 6 打回中 7 完成
        onBeforeUnmount(() => {
            if(!isAdmin.value){
                enterKeyUpDestoryed();
				startCheckTimer.value ? clearInterval(startCheckTimer.value) : null;
				// 拍摄中、自检中 才能更新卷册实拍页数
				detail.value.takeStatus >= 2 && detail.value.takeStatus <= 3 ? patchVolumeInfo(imageList.value.length, '') : null;
            }
        });
		
		// 拍摄完成
        const imageCheck = (f) => {
			patchVolumeStatus(3);
        }
		// 自检完成 自检中 => 同步中、打回中 => 同步中
        const changeCheck = (f) => {
			patchVolumeStatus(4);
        }

        // 旋转
        const rotate = ref(0);
        const scale = ref(1);
        let pointerX = 0;
        let pointerY = 0;
        const x = ref(0);
        const y = ref(0);
		// 开始拖动
        const dragStart = (ev) =>{
			if(isMagnifier.value == 1){
				return;
			}
            pointerX = ev.clientX;
            pointerY = ev.clientY;
            document.onmousemove = (e)=>{
                let nowX = 0, nowY = 0;
                nowX = e.clientX - pointerX;
                nowY = e.clientY - pointerY;
                x.value = x.value + nowX;
                y.value = y.value + nowY;
                pointerX = e.clientX;
                pointerY = e.clientY;
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        }
		// 重置 => 裁剪
        const handleReset = (f = true) =>{
            isFabric.value = 2;
            isAuto.value = false;
            changePropertyValue('cutText', 'stopCut\n');
			
            if(f){
            	createMsg('已重置成功', true);
				takeCamera(0);
            }
        }
		// 图像复位
		const handleResetImage = (f = true) => {
			isMagnifier.value = 0;
			isNatural.value = false;
			
			TH.value = thumbnailH.value || 80;
			IH.value = window.innerHeight - 90 - thumbnailH.value;
			
			scale.value = 1;
			rotate.value = 0;
			x.value = 0;
			y.value = 0;
			if(f){
				createMsg('已重置成功', true);
			}
		}
		// 缩放
        const handleZoom = (f = true) =>{
			if(isMagnifier.value == 1 || isNatural.value){
				return;
			}
            if(f){
                scale.value = scale.value + 1;
            }else{
                if(scale.value >= 2){
                    scale.value = scale.value - 1;
                }else{
					handleResetImage(false);
                    createMsg('已经最小尺寸啦');
                }
            }
        }
		// 鼠标滚轮缩放
        const handleWheel = (e) => {
			if(isMagnifier.value == 1 || isNatural.value){
				return;
			}
            // console.log(e.deltaY);
            if(e.deltaY > 0){
                handleZoom(false);
            }
            if(e.deltaY < 0){
                handleZoom();
            }
        }
		
		// 标记附页
        const handleAttachedSheet = () => {
            if(imageList.value[imageIndex.value].attachedSheet == 1){
                imageList.value[imageIndex.value].attachedSheet = 0;
            }else{
                imageList.value[imageIndex.value].attachedSheet = 1;
            }
            console.log(imageList.value[imageIndex.value].attachedSheet);
            writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
        }
		
		// 留言 => 原稿件不清晰，但又要拍摄，拍摄人员可做标识说明；审核人员可见，左侧显示 2022.9.1 9:28
		const isShow = ref(0);
		const leaveMsgList = ref([]);
		// 更新显示留言 => 新增或修改留言、初始化、删除
		const updateLeaveMsg = () => {
			leaveMsgList.value = imageList.value.filter((ele, i) => {
				ele.i = i;
				return ele.leaveMsg;
			});
		}
		const handleLeaveMsg = (data) => {
			isShow.value = 0;
			imageList.value[imageIndex.value].leaveMsg = data;
			updateLeaveMsg();
			writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
		}
		
		// 修改相机图片旋转角度
		const getCameraRotate = (data) => {
			console.log(data);
			setValue('cameraRotate', data.value);
			changePropertyValue('cameraRotate', data.value);
			changeRotate(data.value);
		}
		const rotateList = ref([{'label': '0°', 'value': '0'}, {'label': '90°', 'value': '90'}, {'label': '180°', 'value': '180'}, {'label': '270°', 'value': '270'}]);
		const changeRotate = (cameraRotate) => {
			if(window.NikonClip){
				startCapture.value = false;
				window.NikonClip.stdin.write('rotate:'+cameraRotate+'\n', error => {
				    if (error) {
				        console.log(error);
				    }
				});
			}
		}
		
		// 相机驱动
		const cameraList = ref([{'label': 'D800', 'value': 'type0006.md3'}, {'label': 'D810', 'value': 'type0014.md3'}, {'label': 'D850', 'value': 'type0022.md3'}]);
		const getTypename = (data) => {
			console.log(data);
			setValue('typename', data.value);
			changePropertyValue('typename', data.value);
			changetypename(data.value);
		}
		// 设置相机驱动
		const changetypename = (typename) => {
			if(window.NikonClip){
				startCapture.value = false;
				window.NikonClip.stdin.write('typename:'+typename+'\n', error => {
				    if (error) {
				        console.log(error);
				    }
				});
			}
		}
		
		// 帮助模块
		const isHelp = ref(false);
		
		// 开始自检
		const startCheckTimer = ref('');
		const checkTime = ref(1);
		const startCheck = (i) => {
			console.log(i);
			imageList.value[0].selfChecked = '1'; //设置图片自检过
			changeImage(0);
			// 缩略图分页
			initThumbnail(1);
			startCheckTimer.value = setInterval(() => {
				if(imageIndex.value < imageList.value.length - 1){
					if(i == 1){
						imageList.value[imageIndex.value+1].selfChecked = '1'; //设置图片自检过
						changeImage(imageIndex.value+1);
						// 缩略图分页
						initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
					}else{
						if(imageList.value.length <= 4){
							imageList.value.forEach((ele) => {
								ele.selfChecked = '1';
							});
							// 自检完成保存json
							writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
							clearInterval(startCheckTimer.value);
							startCheckTimer.value = null;
							createMsg('已自检，请进行下一步 自检完成', true);
						}else{
							imageList.value[imageIndex.value+(imageIndex.value ? (imageList.value.length%5) && (imageIndex.value+1+5) > imageList.value.length ? (imageList.value.length%5) : 5 : 4)].selfChecked = '1'; //设置图片自检过
							changeImage(imageIndex.value+(imageIndex.value ? (imageList.value.length%5) && (imageIndex.value+1+5) > imageList.value.length ? (imageList.value.length%5) : 5 : 4));
							// 缩略图分页
							initThumbnail(Math.ceil((imageIndex.value+1+(imageIndex.value ? (imageList.value.length%5) && (imageIndex.value+1+5) > imageList.value.length ? (imageList.value.length%5) : 5 : 4))/thumbnailLimit.value));
						}
					}
				}else{
					imageList.value.forEach((ele) => {
						ele.selfChecked = '1';
					});
					// 自检完成保存json
					writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
					clearInterval(startCheckTimer.value);
					startCheckTimer.value = null;
					createMsg('已自检，请进行下一步 自检完成', true);
				}
			}, (i == 1 ? 1000 : 500)*checkTime.value)
		}
		
		const multipleDeleteConfirm = () => {
			isConfirm.value = 2;
		}
		
		// 批量删除
		const multipleDelete = () => {
			if(!imageList.value.length){
				return '暂无影像可删除！';
			}
			readDirGetFileNames(drive+'/'+device+'/'+gid+'/'+vid, (res) => {
				// console.log(res);
				if(res == 'error'){
					createMsg('读取文件夹失败，请重新删除');
				}else{
					msg.value = '影像正在删除中，请不要做其他操作!';
					isPromptBoxModule.value = true;
					
					imageList.value = [];
					imageIndex.value = 0;
					imageURL.value = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
					imageURLActive.value = '';
					// 清空缩略图
					clearThumbnail();
					Observer();
					
					deleteImageList(res);
				}
			});
		}
		const deleteImageList = (list) => {
			let file = list.shift();
			console.log(file);
			unlink(drive+'/'+device+'/'+gid+'/'+vid+'/'+file, (data) => {
				if(list.length){
					deleteImageList(list);
				}else{
					msg.value = '';
					isPromptBoxModule.value = false;
					isMore.value = false;
				}
			});
			if(file.indexOf('image.json') > -1){
				
			}else{
				unlink(drive+'/'+device+'/'+gid+'/'+vid+'_nail/'+file, (data) => {
					
				});
			}
		}
		// 删除失败的影像列表（部分影像删除失败需要提示给用户，让他们手动删除）
		const errorImages = ref([]);
		const deleteImages = () => {
			let filename = imageList.value[imageIndex.value].name;
			imageList.value.splice(imageIndex.value, 1);
			imageIndex.value = imageIndex.value - 1;
			imageURL.value = imageList.value.length ? drive+imageList.value[imageIndex.value].name : 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
			imageURLActive.value = imageList.value.length ? imageList.value[imageIndex.value].name : '';
			writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
			Observer();
			unlink(drive+filename, (data) => {
				// 文件删除失败
				if(data.error){
					errorImages.value.push(data.filename);
				}
				if(imageIndex.value >= 0){
					deleteImages();
				}else{
					// 批量删除结束
					if(errorImages.value.length){
						isPromptBoxModule.value = false;
						// msg.value = '如下图片删除失败：'+errorImages.value.join()+'，请手动删除';
					}else{
						msg.value = '';
						isPromptBoxModule.value = false;
					}
					isMore.value = false;
				}
			});
		}
		
		const closePromptBox = () => {
			msg.value = '';
			isPromptBoxModule.value = false;
			errorImages.value = [];
		}
		
		// 左侧栏显示隐藏
		const sidebarShow = ref(false);
		// 多选图片
		const checkImageList = ref([]);
		const checkImage = (i) => {
			let t = checkImageList.value.indexOf(i);
			if(t > -1){
				checkImageList.value.splice(t, 1);
			}else{
				checkImageList.value.push(i);
			}
		}
		
		// 拖动
		const isMouseMove = ref(false);
		const Y = ref(0);
		const TH = ref(thumbnailH.value || 80);
		const IH = ref(window.innerHeight - 90 - thumbnailH.value);
		const mouseLStart = (e) =>{
			if(isMagnifier.value == 1){
				return;
			}
			Y.value = e.clientY;
			isMouseMove.value = true;
		}
		const mouseLMove = (e) =>{
			let nowY = 0;
			let disY = 0;
			nowY = e.clientY;
			disY = nowY - Y.value;
			if(!isMouseMove.value){
				return;
			}
			Y.value = nowY;
			TH.value = TH.value - disY;
			changePropertyValue('thumbnailH', TH.value);
			setValue('thumbnailH', TH.value);
			IH.value = IH.value + disY;
		}
		const mouseLEnd = (e) =>{
			if(!isMouseMove.value){
				return;
			}
			isMouseMove.value = false;
		}
		
		// 移动放大镜
		const isMagnifier = ref(0);
		const magnifierX = ref(0);
		const magnifierY = ref(0);
		const magnifierNaturalX = ref(0);
		const magnifierNaturalY = ref(0);
		const windowW = ref(window.innerWidth);
		const windowH = ref(window.innerHeight);
		const mouseMove = (e) => {
			if(isMagnifier.value != 1){
				return;
			}
			magnifierX.value = e.clientX;
			magnifierY.value = e.clientY;
			magnifierNaturalX.value = -(e.clientX - (windowW.value - imgW.value)/2)*imgNW.value/imgW.value+100;
			magnifierNaturalY.value = -(e.clientY - 60)*imgNH.value/imgH.value + 100;
		}
		
		const handleMagnifier = () => {// 切换放大镜模式
			isMagnifier.value = isMagnifier.value == 1 ? 0 : 1;
			isNatural.value = false;
			scale.value = 1;
			rotate.value = 0;
			x.value = 0;
			y.value = 0;
			TH.value = thumbnailH.value || 80;
			IH.value = window.innerHeight - 90 - thumbnailH.value;
		}
		
		// 原图查看
		const isNatural = ref(false);
		const handleNatural = () => {
			isMagnifier.value = 0;
			isNatural.value = !isNatural.value;
			scale.value = 1;
			rotate.value = 0;
			x.value = 0;
			y.value = 0;
			TH.value = thumbnailH.value || 80;
			IH.value = window.innerHeight - 90 - thumbnailH.value;
		}
		
		// 快速定位
		const page = ref(1);
		const changePage = () => {
			console.log(page.value);
			if(page.value >= 1 && page.value <= imageList.value.length){
				changeImage(Number(page.value) - 1);
				//快速定位->缩略图分页
				initThumbnail(Math.ceil(Number(page.value)/thumbnailLimit.value));
			}
		}
		
		watch(imageIndex, () => {
			page.value = imageIndex.value + 1;
		})
		
		// 自动拍摄
		const autoCameraTimer = ref(null);
		const autoCamera = () => {
			if(autoCameraTimer.value){
				clearInterval(autoCameraTimer.value);
				autoCameraTimer.value = null;
			}else{
				takeCamera(0);
				autoCameraTimer.value = setInterval(() => {
					takeCamera(0);
				}, 4*1000);
			}
		}
		
		// 缩略图分页
		const thumbnailPage = ref(0);
		const thumbnailPages = ref(0);
		const thumbnailLimit = ref(200);
		const thumbnailTotal = ref(0);
		const thumbnailList = ref([]);
		
		const initThumbnail = (p = 1) => {
			thumbnailTotal.value = imageList.value.length;
			thumbnailPages.value = Math.ceil(thumbnailTotal.value/thumbnailLimit.value);
			thumbnailList.value = imageList.value.slice((p - 1)*thumbnailLimit.value, p*thumbnailLimit.value);
			thumbnailPage.value = p;
		}
		
		const clearThumbnail = () => {
			thumbnailTotal.value = 0;
			thumbnailPages.value = 0;
			thumbnailList.value = [];
			thumbnailPage.value = 0;
		}
		
		// 批量重命名原图及记录
		const rename = () => {
			if(!imageList.value.length){
				return createMsg('暂无影像数据，不能一键重命名！');
			}
			let l = imageList.value.length, count = 0;
			startCheckTimer.value = Date.now();
			msg.value = '正在批量重命名影像中，请不要做其他操作!';
			isPromptBoxModule.value = true;
			// 对数组所有数据新增字段、按规则命名
			imageList.value.forEach((ele, index) => {
				ele.rename = '/'+device+'/'+gid+'/'+vid + '/' + gid+'_'+vid+'_'+completeID(index+1)+'.jpg';
				renameFile(drive, ele.name, ele.rename, index, (data) => {
					console.log(index, data);
					count++;
					if(data.log == 'ok'){
						imageList.value[data.i].name = imageList.value[data.i].rename;
					}
					if(l == count){
						console.log('全部重命名结束！');
						imageURL.value = imageList.value.length ? drive+imageList.value[imageIndex.value].name : 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
						imageURLActive.value = imageList.value.length ? imageList.value[imageIndex.value].name : '';
						//快速定位->缩略图分页
						initThumbnail(Math.ceil(Number(page.value)/thumbnailLimit.value));
						// 自检完成保存json
						writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', imageList.value.length ? JSON.stringify(imageList.value) : '[]', 'w', () => {});
						
						msg.value = '';
						isPromptBoxModule.value = false;
						startCheckTimer.value = null;
						createMsg('全部重命名结束！');
					}
				});
			});
		}
		
		const completeID = (s) =>{
		    if(s && s.length>=5){
		        return s
		    }
		    return ("00000"+s.toString()).substr(-5);
		}
		
		// 切换 补拍开关
		const isInsertion = ref(0);
		const toggleInsertion = (i) => {
		    isInsertion.value = i;	
		}
		const saveInsertion = (data) => {
			console.log(data);
			
			imageURL.value = drive+'/'+device+'/'+gid+'/'+vid+'/'+data.imageName;
			let imgIndex = 0;
			if(data.insertion === '0'){// 覆盖拍摄
			    imgIndex = 1;
				imageIndex.value = Number(data.page) - 1;
			}
			if(data.insertion === '-1'){// 前插入
				if(imageList.value.length){
				    imageIndex.value = Number(data.page) - 1;
				}else{
				    imageIndex.value = 0;
				}
			}
			if(data.insertion === '1'){// 后插
				if(imageList.value.length){
				    imageIndex.value = Number(data.page) - 1 + 1;
				}else{
				    imageIndex.value = 0;
				}
			}
			// 影像数组更新
			imageList.value.splice(imageIndex.value, imgIndex, {'name': '/'+device+'/'+gid+'/'+vid+'/'+data.imageName, 'nail': '/'+device+'/'+gid+'/'+vid+'_nail/'+data.imageName, 'success': ''});
			// 当前大图URL
			imageURLActive.value = imageList.value[imageIndex.value].name;
			// 拍照顺序本地保存
			writeFile(drive+'/'+device+'/'+gid+'/'+vid+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
			//拍摄->缩略图分页
			if(imageList.value.length){
				initThumbnail(Math.ceil((imageIndex.value+1)/thumbnailLimit.value));
			}else{
				clearThumbnail();
			}
			// 缩略图懒加载
			Observer();
			// 滑动定位
			scrollIntoView();
			
			isInsertion.value = 0;
		}

        return {
            goBack, imageURL, imageList, imageIndex, changeImage, deleteImage, toggleMore, cutText, isAuto, msg, 
            isMore, startCapture, changeConfirm, isConfirm, imageCheck, changeCheck, typeSet, changeTypeSet,
            isProcess, uploadIndex, drive, resionList, imageURLActive,  loadImage, closeProcess, nowTime, deviceKey, 
            rotate, scale, x, y, dragStart, handleReset, handleZoom, imgW, imgH, isFabric, changeFabric, handleWheel, clearFabric,
            yun, handleAttachedSheet, isPromptBoxModule, detail, handleLeaveMsg, isShow, leaveMsgList, patchVolumeStatus, 
			getCameraRotate, cameraRotate, rotateList, cameraList, getTypename, typename, isHelp, startCheck, 
			closePromptBox, finishRepulseRecord, sidebarShow, checkImage, checkImageList, mouseLMove, mouseLEnd, mouseLStart,
			TH, IH, mouseMove, magnifierX, magnifierY, magnifierNaturalX, magnifierNaturalY, isMagnifier, handleMagnifier, magnifierOpen, magnifierClose, naturalOpen, naturalClose,
			isNatural, handleNatural, multipleDeleteConfirm, handleResetImage, volumeList, volumeKey, changeVolumeKey, rotateImageByNikon, genealogyName, bgColor, bgColorList, changeBgColor, isColor, 
			startCamera, startCheckTimer, page, changePage, MSG, handleDeleteImages, shootTime, autoCamera, autoCameraTimer,
			thumbnailList, thumbnailTotal, thumbnailPages, thumbnailPage, thumbnailLimit, rename, toggleInsertion, isInsertion, saveInsertion,
			nextPage, prevPage, 
        }
    }
}
</script>

<style lang="scss" scoped>
.image-center-wrap{
    position: relative;
    width: 100%;
    height: calc(100% - 20px);
	padding-top: 20px;
    color: #333;
    background: #000;
    font-size: 14px;
	overflow: hidden;
}
.image-center-head{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background: #404040;
	.head-left{
		display: flex;
		align-items: center;
	}
    .tool-box{
        display: flex;
        align-items: center;
        img{
            cursor: pointer;
            background: #404040;
            margin-left: 10px;
        }
		.patch-submit{
			cursor: pointer;
			margin-left: 10px;
		}
    }
    .title{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .back{
        cursor: pointer;
		z-index: 100;
    }
}
.image-center-content{
    position: relative;
    width: 100%;
    height: calc(100% - 150px);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
	background: #ecc48b;
    .image-box{
        position: relative;
        display: inline-flex;
		justify-content: center;
		align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
		.image-box-inner{
			position: relative;
			display: inline-block;
			height: 100%;
		}
        .img-hand{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
        &.active{
            overflow: auto;
        }
        img{
            height: 100%;
            display: block;
            margin: 0 auto;
            &.active{
                height: auto;
            }
        }
    }
	.open-side{
		position: absolute;
		height: 16px;
		cursor: pointer;
		top: 6px;
		left: 10px;
	}
    .pass-wrap{
        position: absolute;
        top: 1px;
        bottom: 0;
        width: 200px;
        left: 0;
        background: #404040;
        text-align: left;
        padding: 20px 0 0 20px;
        color: #fff;
        overflow-y: auto;
		.close{
			position: absolute;
			top: 6px;
			right: 10px;
			cursor: pointer;
			height: 8px;
		}
        h3{
            font-weight: normal;
        }
        .repulseRecord-box{
            margin-bottom: 10px;
            span{
                font-size: 12px;
                opacity: 0.3;
            }
            .returnReason-box{
                position: relative;
                padding: 2px 5px;
                margin: 0 5px 0 0;
				display: flex;
				align-items: center;
				.check-box{
					width: 14px;
					height: 14px;
					border: 1px solid #85b83e;
					border-radius: 3px;
					cursor: pointer;
					margin-right: 5px;
					z-index: 10;
					&.active{
						background: #85b83e;
					}
				}
				.returnReason{
					z-index: 10;
					&.active{
					    color: #85b83e;
					}
					&.decoration{
						text-decoration: line-through;
						color: #ddd;
					}
				}
                &::before{
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: #fff;
                    opacity: 0.1;
                }
            }
        }
        p{
            cursor: pointer;
            margin: 5px 5px 5px 0;
            &.active{
                color: #85b83e;
            }
        }
        .image-duplicate-wrap{
            position: relative;
            width: 100%;
            li{
                margin-top: 5px;
                border-bottom: 1px dashed #ddd;
                .image-duplicate-box{
                    position: relative;
                    display: inline-block;
                    margin: 0 5px 5px 0;
                    cursor: pointer;
                    img{
                        height: 50px;
                    }
                    i{
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 12px;
                        background: rgba(0,0,0,0.3);
                        text-align: center;
                        font-size: 10px;
                    }
                    &.active{
                        border: 1px solid #85b83e;
                        img{
                            height: 48px;
                        }
                    }
                }
            }
        }
    }
	.prev{
		position: absolute;
		top: 50%;
		left: 10px;
		transform: translateY(-50%);
		cursor: pointer;
	}
	.next{
		left: auto;
		right: 10px;
	}
}
.rotate-zoom-delete-box{
	position: relative;
	width: 100%;
	height: 30px;
	background: #666;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	.tool-bar-inbox{
		position: relative;
		height: 100%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: 0 20px;
		.bg-color{
			position: relative;
			width: 20px;
			height: 20px;
			cursor: pointer;
			margin: 0 10px;
			.bg-color-box{
				position: absolute;
				bottom: 30px;
				display: flex;
				align-items: center;
				left: 50%;
				transform: translateX(-50%);
				background: #fff;
				padding: 5px;
				.color{
					width: 20px;
					height: 20px;
					cursor: pointer;
					margin: 0 5px;
				}
			}
		}
		.icon{
			display: block;
			margin: 0 10px;
			cursor: pointer;
			height: 20px;
			width: 20px;
			&:hover{
				background: #333;
				padding: 4px;
				height: 12px;
				width: 12px;
			}
		}
	}
}
.image-center-foot{
    position: relative;
    height: 80px;
    background: #232323;
    width: calc(100% - 40px);
    padding: 0 20px;
    overflow-x: auto;
    display: flex;
    align-items: center;
    .thumbnail-box{
        position: relative;
        height: calc(100% - 10px);
        margin-right: 10px;
        display: block;
        cursor: pointer;
        .attachedSheet{
            position: absolute;
            top: 0;
            left: 0;
			width: 16px;
            cursor: pointer;
        }
		.self-check{
			position: absolute;
			top: 4px;
			right: 4px;
			color: #85b83e;
			width: 20px;
			height: 20px;
			border-radius: 3px;
		}
		.check-box{
			position: absolute;
			bottom: 5px;
			right: 2px;
			cursor: pointer;
			width: 14px;
			height: 14px;
			// background: #fff;
			border: 1px solid #f00;
			&.active{
				background: url('../assets/imageCenter/tick_red.svg') 50% 50% no-repeat;
				background-size: cover;
				border: none;
			}
		}
        .lazyload{
            height: 100%;
        }
        &.active{
            border: 5px solid #85b83e;
            height: calc(100% - 10px);
        }
        .page-box{
            position: absolute;
            width: 100%;
            height: 14px;
            bottom: 0;
            left: 0;
			font-size: 12px;
			color: #fff;
			display: block;
			text-align: center;
        }
    }
}
.clip-wrap{
    position: fixed;
    top: 20px;
    right: 0;
    bottom: 0;
    left: 0;
    .clip-head{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background: rgba(0,0,0,0.50);
        backdrop-filter: blur(8px);
        h3{
            font-size: 14px;
            font-weight: normal;
        }
    }
    .clip-content{
        position: relative;
        width: 100%;
        height: calc(100% - 150px);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .clip-foot{
        position: relative;
        height: 110px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.50);
        backdrop-filter: blur(8px);
        .clip-direction{
            position: absolute;
            top: 50%;
            left: 20px;
            transform: translateY(-50%);
            display: flex;
            color: #fff;
            span{
                cursor: pointer;
            }
            .marginR10{
                margin-right: 10px;
            }
            .active{
                color: #85b83e;
            }
        }
		.auto-box{
			display: flex;
			align-items: center;
			color: #fff;
			cursor: pointer;
			i{
				width: 18px;
				height: 18px;
				border: 1px solid #85b83e;
				border-radius: 3px;
				margin-right: 5px;
				&.active{
					background: #85b83e;
				}
			}
			span{
				&.active{
					color: #85b83e;
				}
			}
		}
        .btn-box{
            width: 120px;
            height: 40px;
            background: #ffffff;
            border-radius: 4px;
            margin: 0 25px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            span{
                margin-left: 10px;
            }
        }
    }
}
// 留言列表
.leave-msg-list{
	position: relative;
	.title{
		font-size: 16px;
	}
	.leave-msg-p{
		margin-bottom: 5px;
		&.active{
			color: #85b83e;
		}
	}
}
.width80{
	width: 70px;
}
.width120{
	width: 80px;
	margin-right: 10px;
}
.magnifier-box{
	position: absolute;
	border: 1px solid #ddd;
	width: 200px;
	height: 200px;
	z-index: 100;
	background: #fff;
	overflow: hidden;
	.magnifier{
		position: absolute;
		display: block;
	}
}
.marginL10{
	margin-left: 10px;
}
.width130{
	width: 130px;
}
.page-big-box{
	position: absolute;
	top: 50%;
	right: 50px;
	transform: translateY(-50%);
	font-size: 100px;
	color: #fff;
}
.shootTime{
	position: absolute;
	top: 10px;
	right: 10px;
	color: #fff;
}
.startCheckTimer{
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 10000;
}
.page-input{
	width: 100px;
	height: 20px;
	line-height: 20px;
	outline: none;
	border: none;
	background: #fff;
	text-indent: 10px;
}
.autoCamera{
	height: 30px;
	line-height: 30px;
	width: 100px;
	margin-right: 10px;
}
</style>