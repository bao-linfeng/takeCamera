<template>
    <div class="home-wrap">
        <div class="home-box">
            <img class="logo" src="../assets/logo.svg" alt="DCam" />
            <img class="camera" src="../assets/camera.png" alt="camera" />
            <button class="btn" @click="login">{{token ? '进入' : '登录'}}</button>
        </div>
        <WinBar />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs, camelize } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg } from '../util/ADS';
import { getUserInfoApi } from '../composables/request';
import { camera, user } from '../util/api';
import WinBar from '../components/WinBar.vue';

export default {
    components: {
        WinBar, 
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin, userKey, siteKey } = useState();
        const router = useRouter();
        const id = props.id;
        console.log(token);

        const getOrg = async (key) => {
            const result = await camera.getOrg(key, siteKey);
            if(result.status == 200){
                setValue('orgKey', result.data.orgKey);
                setValue('orgName', result.data.orgName);
                changePropertyValue('orgKey', result.data.orgKey);
                changePropertyValue('orgName', result.data.orgName);
            }else{
                createMsg(result.msg);
            }
        }

        const getUserInfo = async (t) => {
            const { result } = await user.getUserInfo(t);
            changePropertyValue('userKey', result._key);
            changePropertyValue('userName', result.profile && (result.profile.trueName || result.profile.nickName));
            changePropertyValue('profile', result.profile);
            changePropertyValue('avatar', result.profile.avatar);
            setValue('userKey', result._key);
            setValue('userName', result.profile && (result.profile.trueName || result.profile.nickName));
            setValue('profile', JSON.stringify(result.profile));
            setValue('avatar', result.profile && result.profile.avatar);

            getOrg(result._key);
        }

        onMounted(() => {
            const TOKEN = getQueryVariable('token');
            if(TOKEN){
                getUserInfo(TOKEN);
                changePropertyValue('token', TOKEN);
                setValue('token', TOKEN);
            }
            if(token || getValue('token')){
                getOrg(userKey);
            }
        });

        const login = () => {
            if(token || getValue('token')){
                router.push('/authentication');
            }else{
                window.location.href = 'https://account.qingtime.cn?apphigh=52&app=1&logo=https://shootimage.qingtime.cn/logo.svg&redirect='+encodeURI(origin);
            }
        }

        return {
            login, token, 
        }
    }
}
</script>

<style lang="scss" scoped>
.home-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    .home-box{
        position: relative;
		padding: 30px 200px;
		border: 1px solid #ddd;
		border-radius: 10px;
		box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
        .logo{
            display: block;
			height: 100px;
        }
        .camera{
            display: block;
            height: 80px;
            margin: 40px auto 100px auto;
        }
        .btn{
            width: 200px;
            height: 40px;
            line-height: 40px;
            border-radius: 20px;
            background: #85B83E;
            color: #fff;
            cursor: pointer;
            margin: 0 auto;
            display: block;
        }
    }
}
</style>