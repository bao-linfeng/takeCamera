<template>
    <div class="image-center-wrap">
        <div class="image-center-head">
            <img src="../assets/left.svg" @click="goBack" alt="">
            <h3>影像中心</h3>
            <div class="tool-box">
                <span class="spin" @click="handleReset">重置</span>
                <img class="spin" @click="handleRotate(false)" title="左旋90°" src="../assets/spinL.svg" alt="">
                <img class="spin" @click="handleRotate()" title="右旋90°" src="../assets/spinR.svg" alt="">
                <img class="spin" @click="handleZoom(false)" title="缩小" src="../assets/zoomIn.svg" alt="">
                <img class="spin" @click="handleZoom()" title="放大" src="../assets/zoomOut.svg" alt="">
                <span class="mark" @click="isPassModule = !isPassModule">标记打回</span>
            </div>
        </div>
        <div class="image-center-content">
            <div class="image-box" id="large-image">
                <img :style="{transform: 'translate('+x+'px, '+y+'px) rotate('+rotate+'deg) scale('+scale+')'}" :src="imageURL" alt="">
                <div class="img-hand" @mousedown="dragStart" @wheel.passive="handleWheel"></div>
            </div>
            <div class="pass-wrap" v-if="resionList.length || RepulseRecord.length">
                <h3 v-if="RepulseRecord.length">打回原因历史:</h3>
                <div class="repulseRecord-box" v-for="(item,index) in RepulseRecord" :key="index">
                    <span>第{{RepulseRecord.length - index}}次打回原因({{item.orgOrFS == 2 ? '微站' : '机构'}})</span>
                    <p :class="{active: imageURLActive == item2.name}" v-for="(item2,index2) in item.returePageArray" :key="index2" @click="changeImage(item2.index, item2.name)">{{index2+1}}.  第{{item2.index+1}}页 {{item2.returnReason}}</p>
                </div>
                <h3 v-if="resionList.length">当前打回原因:</h3>
                <p :class="{active: imageURLActive == item.name}" v-for="(item,i) in resionList" :key="i" @click="changeImage(item.index, item.name)">{{i+1}}.  第{{item.index+1}}页 {{item.returnReason}}</p>
            </div>
        </div>
        <div class="image-center-foot">
            <div class="thumbnail-box" :class="{active: imageURLActive === item.name}" v-for="(item,index) in imageList" :key="index" :id="index" @click="changeImage(index)">
                <img class="lazyload" :data-src="yun+item.name" :src="'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs'" alt="" />
                <div class="page-box">
                    <i>{{index+1}}</i>
                </div>
                <img class="attachedSheet" v-if="item.attachedSheet == 1" title="附页" src="../assets/attachedSheet.svg" alt="">
            </div>
        </div>
        <Loading v-if="startCapture" />
        <PassModule v-if="isPassModule" :passReasonA="passReason" v-on:set-reason="patchPageReturn" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch, watchEffect, computed, provide,readonly, toRefs, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changePropertyValue, useState } from '../store';
import { createMsg, getQueryVariable } from '../util/ADS';
import { camera } from '../util/api';
import { openNikon, writeFile, readFile, unlink, makeCameraDir, openImageCheck} from '../composables/readFile';
import Loading from '../components/Loading.vue';
import zoomOut from '../assets/zoomOut.svg';
import zoomIn from '../assets/zoomIn.svg';
import PassModule from '../components/PassModule.vue';

export default {
    components: {
        Loading, PassModule, 
    },
    name: 'imageCenter',
    props: ['id'],
    setup(props, context) {
        const { isAdmin } = toRefs(useState());
        const { userName, userKey, siteKey, deviceKey, device, code, drive } = useState();
        const router = useRouter();
        const id = props.id;

        const gid = getQueryVariable('g');
        const vid = getQueryVariable('v');
        let status = getQueryVariable('s');
        console.log(gid, vid, status);

        const goBack = () => {
            router.push('/cameraCenter?id='+gid+'&s='+status);
        }

        // 打回原因
        const resionList = ref([]);
        const RepulseRecord = ref([]);
        const isPassModule = ref(false);
        const passReason = ref([]);
        const getVolumeResion = async () => {
            const result = await camera.getVolumeResion(code, vid);
            if(result.status == 200){
                resionList.value = result.data;
            }else{
                createMsg(result.msg);
            }
        }

        const getRepulseRecord = async () => {
            const result = await camera.getRepulseRecord(vid, 1, '', siteKey);
            if(result.status == 200){
                RepulseRecord.value = result.data;
            }else{
                createMsg(result.msg);
            }
        }

        // 设置打回原因
        const patchPageReturn = async (returnReason) => {
            let result = await camera.reviewPageReturn(pageKey.value, returnReason);
            if(result.status == 200){
                createMsg('设置成功', true);
                getVolumeResion();
            }else{
                createMsg(result.msg);
            }
        }

        // 影像
        const startCapture = ref(false);
        const imageURL = ref('data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=');
        const imageList = ref([]);
        const imageIndex = ref(0);
        const imageURLActive = ref('');
        const pageKey = ref('');

        const yun = ref('https://sync.qingtime.cn/photo');
        const getReviewPageList = async () => {
            const result = await camera.reviewPageList(vid);
            if(result.status == 200){
                imageList.value = result.data;
                imageIndex.value = imageList.value.length - 1;
                imageURL.value = yun.value+imageList.value[imageIndex.value].name;
                imageURLActive.value = imageList.value[imageIndex.value].name;
                pageKey.value = imageList.value[imageIndex.value]._key;
                Observer();
            }else{
                createMsg(result.msg);
            }
        }

        // 缩略图选取
        const changeImage = (i,n = '') => {
            if(n){
                let ind = '';
                imageList.value.forEach((ele, index) => {
                    if(n.indexOf(ele.name) > -1){
                        ind = imageIndex.value = index;
                    }
                });
                resionList.value.forEach((ele) => {
                    if(n.indexOf(ele.name) > -1){
                        passReason.value = ele.returnReason.split(',');
                    }
                });
                // console.log(ind);
                if(ind === ''){
                    createMsg('该图片已被删除');
                    return;
                }
            }else{
                imageIndex.value = i;
                resionList.value.forEach((ele) => {
                    if(ele.index === i){
                        passReason.value = ele.returnReason.split(',');
                    }
                });
            }
            imageURLActive.value = imageList.value[imageIndex.value].name;
            imageURL.value = yun.value+imageList.value[imageIndex.value].name;
            pageKey.value = imageList.value[imageIndex.value]._key;
            document.getElementById(imageIndex.value).scrollIntoView();
        }

        
        let timer, images, observer;
        const Observer = () => {// 图片懒加载
            timer = setTimeout(() => {
                images = document.querySelectorAll(".lazyload");
                observer = new IntersectionObserver(entries => {
                    entries.forEach(item => {
                        if (item.isIntersecting) {
                            item.target.src = item.target.dataset.src; // 开始加载图片,把data-origin的值放到src
                            observer.unobserve(item.target); // 停止监听已开始加载的图片
                        }
                    });
                },{rootMargin: "0px -100px 0px 0px"});
                images.forEach(item => observer.observe(item)); 

                clearTimeout(timer);
                timer = null;
            }, 200);
        }
        
        onMounted(() => {
            getVolumeResion();
            getRepulseRecord();
            getReviewPageList();
        });

        // 旋转
        const rotate = ref(0);
        const scale = ref(1);
        let pointerX = 0;
        let pointerY = 0;
        const x = ref(0);
        const y = ref(0);

        const dragStart = (ev) =>{
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

        const handleReset = () =>{
            scale.value = 1;
            rotate.value = 0;
            x.value = 0;
            y.value = 0;
        }

        const handleRotate = (f = true) =>{
            if(f){
                rotate.value = rotate.value + 90;
            }else{
                rotate.value = rotate.value - 90;
            }
        }

        const handleZoom = (f = true) =>{
            if(f){
                scale.value = scale.value + 1;
            }else{
                if(scale.value >= 2){
                    scale.value = scale.value - 1;
                }else{
                    createMsg('已经最小尺寸啦')
                }
            }
        }

        const handleWheel = (e) => {
            console.log(e.deltaY);
            if(e.deltaY > 0){
                handleZoom();
            }
            if(e.deltaY < 0){
                handleZoom(false);
            }
        }

        return {
            goBack, imageURL, imageList, imageIndex, changeImage, startCapture, drive, resionList, imageURLActive, zoomIn, zoomOut,
            rotate, scale, x, y, dragStart, handleReset, handleRotate, handleZoom, handleWheel, yun, isPassModule, passReason,
            patchPageReturn, RepulseRecord, 
        }
    }
}
</script>

<style lang="scss" scoped>
.image-center-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    background: #000;
    font-size: 14px;
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
    .tool-box{
        display: flex;
        align-items: center;
        .spin{
            cursor: pointer;
            margin-right: 20px;
        }
        .more{
            background: #404040;
        }
        .mark{
            cursor: pointer;
        }
    }
    img{
        cursor: pointer;
    }
}
.image-center-content{
    position: relative;
    width: 100%;
    height: calc(100% - 140px);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    .image-box{
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
        // height: calc(100% - 24px);
        // border: 4px dashed #85b83e;
        overflow: hidden;
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
    .canvas-box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .pass-wrap{
        position: absolute;
        top: 0;
        bottom: 0;
        width: 180px;
        left: 0;
        background: #404040;
        text-align: left;
        padding: 20px 0 0 20px;
        color: #fff;
        h3{
            font-weight: normal;
        }
        p{
            cursor: pointer;
            margin: 5px 0;
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
                padding-bottom: 5px;
                .image-duplicate-box{
                    position: relative;
                    display: inline-block;
                    margin-right: 10px;
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
}
.image-center-foot{
    position: relative;
    height: 100px;
    background: #232323;
    width: calc(100% - 40px);
    padding: 0 20px;
    overflow-x: auto;
    display: flex;
    align-items: center;
    .thumbnail-box{
        position: relative;
        height: 70px;
        margin-right: 10px;
        display: block;
        cursor: pointer;
        .attachedSheet{
            position: absolute;
            top: 10px;
            left: 10px;
            cursor: pointer;
        }
        .lazyload{
            height: 100%;
        }
        &.active{
            border: 2px solid #85b83e;
            height: 66px;
        }
        .page-box{
            position: absolute;
            width: 100%;
            height: 20px;
            bottom: 0;
            left: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(8px);
            i{
                color: #fff;
                font-weight: bold;
            }
        }
    }
}
</style>