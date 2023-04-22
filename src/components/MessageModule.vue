<template>
    <div class="msg-wrap">
        <div class="msg-box">
            <div class="head">
                <h3 class="title">消息</h3>
                <span class="all-read" @click="messageOneKeyRead">一键已读</span>
                <img class="close" @click="close" src="../assets/close.svg" alt="关闭" />
            </div>
            <div class="content">
               <ul class="tab">
                   <li :class="{active: tab === index}" v-for="(item, index) in msgTab" :key="index" @click="changeTab(index)">{{item}}</li>
               </ul>
            </div>
            <div class="foot style1">
                <table class="table">
                    <tbody class="tbody">
                        <tr v-for="(item, index) in msgList" :key="index" @click="messageRead(item)">
                            <td>{{item.userName || ''}}{{item.content}}</td>
                            <td>{{item.timeO}}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="more-data" v-if="page < pages" @click="getMore">更多</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { camera } from '../util/api';
import { showNotification } from '../composables/readFile';
import { createMsg, getLocalTime } from '../util/ADS';
export default {
    props:{
        device: Object
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code } = useState();
        const router = useRouter();

        const msgTab = ref(['未读消息', '已读消息']);
        const tab = ref(0);
        const changeTab = (i) => {
            page.value = 1;
            tab.value = i;
            getMessageList();
        }

        const msgList = ref([]);
        const page = ref(1);
        const pages = ref(0);
		const total = ref(0);

        const getMessageList = async () => {// 消息列表
            const result = await camera.getMessageList(code, tab.value, page.value, 12);
            if(result.status == 200){
                if(page.value == 1){
                    msgList.value = result.result.list.map((ele, i) => {
                        ele.timeO = getLocalTime(ele.time);
                        return ele;
                    });
                    pages.value = result.result.pageNum;
                }else{
                    let msgListA = result.result.list.map((ele, i) => {
                        ele.timeO = getLocalTime(ele.time);
                        return ele;
                    });
                    msgList.value = msgList.value.concat(msgListA);
                }
                
            }else{
                createMsg(result.msg);
            }
        }

        const notReadMessageNumberHandle = async () => {// 未读消息统计
            const result = await camera.notReadMessageNumber(code);
            if(result.status == 200){
                changePropertyValue('notReadMsgNumber', result.result);
            }else{
                createMsg(result.msg);
            }
        }

        const messageOneKeyRead = async () => {
            const result = await camera.messageOneKeyRead(code);
            if(result.status == 200){
                page.value = 1;
                notReadMessageNumberHandle();
                getMessageList();
            }else{
                createMsg(result.msg);
            }
        }

        const messageRead = async (data) => {// 消息已读
            // console.log(data);
            if(data.status === 0){// 未读消息
                const result = await camera.messageRead([data._key], 1);
                if(result.status == 200){
                    if(data.logType == '打回'){// 打回跳转
                        router.push('/imageCenter?g='+data.catalogKey+'&v='+data.volumeKey+'&s=');
                    }else{
                        page.value = 1;
                        notReadMessageNumberHandle();
                        getMessageList();
                    }
                }else{
                    createMsg(result.msg);
                }
            }
        }

        const getMore = () => {
            page.value = page.value + 1;
            getMessageList();
        }
        
        const close = () => {
            context.emit('close', false);
        }

        onMounted(() => {
            getMessageList();
        });

        return {
            close, msgTab, changeTab, tab, msgList, page, pages,
            getMore, messageOneKeyRead, messageRead, 
        }
    }
}
</script>
<style lang="scss" scoped>
.msg-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .msg-box{
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        min-width: 500px;
        .head{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            .all-read{
                position: absolute;
                top: 50%;
                right: 50px;
                transform: translateY(-50%);
                cursor: pointer;
            }
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background: #000;
                cursor: pointer;
            }
        }
        .content{
            .tab{
                height: 40px;
                display: flex;
                align-items: center;
                li{
                    margin-right: 20px;
                    cursor: pointer;
                    &.active{
                        color: #85B83E;
                    }
                }
            }
        }
        .foot{
            height: 382px;
            overflow-y: auto;
            .msg-list{
                cursor: pointer;
                margin-top: 10px;
            }
        }
    }
}
.table{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        tr{
            cursor: pointer;
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            td{
                padding: 5px 0;
                min-width: 80px;
            }
        }
    }
}
.more-data{
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    text-align: center;
}
</style>