<template>
    <div class="code-module-wrap">
        <div class="code-module-box">
            <div class="code-head">
                <h3 class="title">输入短信或邮箱验证码</h3>
                <img class="close" src="../assets/close.svg" @click="close" alt="">
            </div>
            <input class="code-input" type="text" v-model="localCode" placeholder="请输入验证码" @keyup.enter="verfiyCode" />
            <button class="btn" @click="verfiyCode">确定</button>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { getSwitchCodeApi, verfiyCodeApi } from '../composables/request';
import { setValue } from '../util/ADS';
export default {
    props:{
        deviceKey: String,
        deviceID: String,
        device: String,
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, deviceKey, drive} = useState();
        const router = useRouter();
        const localCode = ref('');

        // 替换角色、管理员第一次登陆
        if(deviceKey != props.deviceKey){
            getSwitchCodeApi(props.deviceKey, userKey, siteKey);
        }

        const close = () => {
            context.emit('close', false);
        }

        const verfiyCode = () => {
            const { CODE } = verfiyCodeApi(props.deviceKey, localCode.value, userKey, siteKey);

            watch(CODE, (nv, ov) => {
                close();
                changePropertyValue('isAdmin', props.device == 'admin' ? 1 : '');
                setValue('isAdmin', props.device == 'admin' ? 1 : '');
                changePropertyValue('deviceKey', props.deviceKey);
                setValue('deviceKey', props.deviceKey);
                changePropertyValue('deviceID', props.deviceID);
                setValue('deviceID', props.deviceID);
                changePropertyValue('device', props.device);
                setValue('device', props.device);
                router.push('/taskCenter');
            });
        }

        return {
            localCode, close, verfiyCode, 
        }
    }
}
</script>
<style lang="scss" scoped>
.code-module-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0 , 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .code-module-box{
        width: 500px;
        height: 400px;
        background: #ffffff;
        box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
        text-align: center;
        .code-head{
            position: relative;
            padding: 80px 0;
            .close{
                position: absolute;
                top: 20px;
                right: 20px;
                background: #000;
                cursor: pointer;
            }
        }
        .title{
            font-weight: 400;
        }
        .code-input{
            display: block;
            width: 200px;
            height: 40px;
            line-height: 40px;
            text-indent: 20px;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin: 0 auto 40px auto;
        }
    }
}
</style>