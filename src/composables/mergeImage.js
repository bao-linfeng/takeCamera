import { ref, onMounted, reactive, watch, toRefs, onBeforeUnmount } from 'vue'
import { Base64, dataURLtoBlob, qrcode, cacheImage, getValue } from '../util/ADS';
import { useState, changePropertyValue } from '../store';
import { uploadFile } from '../util/qiniu'
import { mergeImageApi } from './request';
import { useRoute } from 'vue-router'

export default function mergeImage(){
    const { ws } = useState();
    const { qiniuToken,config, code } = toRefs(useState());
    const mergeData = ref('');
    const timer = ref('');
    const countDown = ref(10);
    const isFirst = ref(true);
    const bg = useRoute().query.bg;
    const picKey = useRoute().query.key;
    const eventKey = useRoute().query.eid;
    console.log(bg);
    mergeData.value = 'https://cdn-icare.qingtime.cn/'+bg;

    const uploadImg  = () => {
        let base64 = dataURLtoBlob(mergeData.value);
        uploadFile(base64, (str) => {
            let path = window.location.origin + '/tc?i='+str.replace('https://cdn-icare.qingtime.cn/','')+'&p='+getValue('bgPlace');
            qrcode(path, 'qrcode');
            mergeImageApi(picKey, str);
            isFirst.value = false;
        }, qiniuToken.value);
    }

    const initCountdown = () =>{
        timer.value = setInterval(() => {
            countDown.value = countDown.value - 1;
            if(countDown.value <= 0){
                clearInterval(timer.value);
                timer.value = null;
                ws.send('stopSendImage');
                uploadImg();
            }
        }, 1000);
    }

    const initWebSocket = () =>{
        var base = new Base64;  
        let setBackGroundImage = 'setBackGroundImage:'+base.encode(bg);

        ws.addEventListener('open', () => {
            console.log('Connection opened.');
            ws.send('getImage');
            ws.send('startSendImage');
            ws.send(setBackGroundImage);
            initCountdown();
        });
        if(ws.readyState === 1){
            console.log('Connection opened.');
            ws.send('getImage');
            ws.send('startSendImage');
            ws.send(setBackGroundImage);
            initCountdown();
        }
        ws.onmessage = (e) => {
            cacheImage(e.data, (data) => {
                mergeData.value = data;
            });
        };
        ws.onclose = (evt) => {
            console.log("Connection closed.");
        }; 
    }

    watch(config, (nv,ov) =>{
        if(nv && nv.length){
            nv.map((item)=>{
                if(item.code == code.value){
                    changeconfig(item.max, item.min, item.adjustRate, item.transparent);
                }
            });
        }
    });

    const changeconfig = (max, min, adjustRate, transparent) =>{
        let setMaxFore = 'setMaxFore:'+max;// 人物透明度
        let setBackRange = 'setBackRange:'+min;// 人物完整度
        let setAdjustRate = 'setAdjustRate:'+adjustRate;
        let setTransparentRate = 'setTransparentRate:'+transparent;

        ws.send(setMaxFore);
        ws.send(setBackRange);
        ws.send(setAdjustRate);
        ws.send(setTransparentRate);
    }

    const reShooting = () =>{
        ws.send('startSendImage');
        countDown.value = 10;
        initCountdown();
    }

    onMounted(() => {
        initWebSocket();
    });

    onBeforeUnmount(() => {
        ws.send('stopSendImage');
        timer.value ? clearInterval(timer.value) : null;
    });

    return {
        mergeData, countDown, reShooting
    }
}