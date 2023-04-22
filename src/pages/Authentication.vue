<template>
    <div class="authentication-wrap">
        <div class="authentication-box">
            <div class="authentication-head">
                <div class="head-left">
                    <h3>身份验证</h3>
                    <p>机构名: FS({{userName}})</p>
                </div>
                <img class="close" @click="logout" src="../assets/close.svg" alt="">
            </div>
            <div class="authentication-content">
                <img class="auth" src="../assets/auth.svg" alt="身份校验" />
            </div>
            <div class="authentication-foot">
                <div class="device-id-wrap">
                    <span class="label">选择当前拍机号:</span>
                    <SelectModule :list="deviceList" :defaultValue="deviceKey" v-on:get-value="getDeviceValue" />
                </div>
                <div class="main-btn-wrap">
                    <button v-if="deviceM == 'admin'" class="btn active" @click="toggleCode(true)">管理员入口</button>
                    <button v-else class="btn" @click="toggleCode(true, 1)">拍摄者入口</button>
                </div>
            </div>
        </div>
        <CodeModule v-if="isCode" :deviceKey="deviceKey" :deviceID="deviceID" :device="deviceM" v-on:close="closeCode" />
        <WinBar />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changePropertyValue, useState } from '../store';
import { createMsg, setValue, getValue } from '../util/ADS';
import { camera } from '../util/api';
import { sendWin } from '../composables/readFile';
import SelectModule from '../components/SelectModule.vue';
import CodeModule from '../components/CodeModule.vue';
import WinBar from '../components/WinBar.vue';

export default {
    components: {
        SelectModule, CodeModule, WinBar, 
    },
    name: 'authentication',
    props: ['id'],
    setup(props, context) {
        const { userName, userKey, siteKey, code } = useState();
        const router = useRouter();
        const id = props.id;
        const deviceKey = ref('');
        const deviceID = ref('');
        const deviceM = ref('');
        const isCode = ref(false);

        const getDeviceValue = (data) => {
            deviceKey.value = data.value;
            deviceID.value = data.label;
            deviceM.value = data.device;
        }

        const deviceList = ref([]);

        const getDeviceByUser = async () => {
            deviceList.value = [];
            const { data } = await camera.getDeviceByUser(userKey, siteKey);
            deviceList.value = data.map((ele, i) => { 
                if(!getValue('deviceKey') && (ele.device == 'admin' || i === 0)){
                    deviceKey.value = ele._key;
                    deviceID.value = ele.device + '(' + (ele.userName || '') + ')';
                    deviceM.value = ele.device;
                }
                
                return {'label': ele.device + '(' + (ele.userName || '') + ')', 'value': ele._key, 'device': ele.device}; 
            });
        }

        const getSwitchCode = async (deviceKey) => {
            const { data } = await camera.getSwitchCode(deviceKey, userKey, siteKey);
        }

        const verfiyCode = async (deviceKey) => {
            const result = await camera.verfiyCode(deviceKey, code, userKey, siteKey);
            if(result.status == 200){
                router.push('/taskCenter');
            }else{
                // createMsg(result.msg);
                getSwitchCode(deviceKey);
                isCode.value = true;
            }
        }

        const toggleCode = (f, a = '') => {
            if(a && !deviceKey.value){
                createMsg('请选择拍机号');
                return;
            }

            if(window.localStorage.getItem('deviceKey') && window.localStorage.getItem('deviceKey') == deviceKey.value){
                verfiyCode(deviceKey.value);
            }else{
                isCode.value = f;
            }
        }

        const closeCode = () => {
            isCode.value = false;
        }

        const logout = () => {
            setValue('token', '');
			setValue('deviceKey', '');
			setValue('deviceID', '');
			setValue('device', '');
            changePropertyValue('token', '');
            nextTick(() => {
                router.push('/');
            });
        }

        const minimizeWin = (t) => {
            sendWin(t);
        }

        onMounted(() => {
            if(getValue('deviceKey')){
                deviceKey.value = getValue('deviceKey');
                deviceID.value = getValue('deviceID');
                deviceM.value = getValue('device');
            }
            getDeviceByUser();
        });

        return {
            userName, deviceList, getDeviceValue, deviceKey, toggleCode, isCode, deviceID, deviceM,
            logout, closeCode, minimizeWin, 
        }
    }
}
</script>

<style lang="scss" scoped>
.authentication-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    font-size: 1.6rem;
    display: flex;
    justify-content: center;
    align-items: center;
    .authentication-box{
        padding: 0 100px;
        border: 1px solid #ddd;
        border-radius: 10px;
		box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
    }
}
.authentication-head{
    position: relative;
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    .close{
        position: absolute;
        top: 30px;
        right: -80px;
        background: #000;
        cursor: pointer;
    }
}
.authentication-content{
    position: relative;
    width: 100%;
    height: calc(100% - 300px);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    .auth{
        display: block;
    }
}
.authentication-foot{
    position: relative;
    width: 100%;
    height: 200px;
    .device-id-wrap{
        position: relative;
        width: 100%;
        margin-bottom: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        .label{
            margin-right: 20px;
        }
    }
    .main-btn-wrap{
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .btn{
            width: 200px;
            height: 40px;
            line-height: 40px;
            border-radius: 20px;
            cursor: pointer;
            margin: 0 40px;
            &.active{
                background: #1890FF;
            }
        }
    }
}
</style>