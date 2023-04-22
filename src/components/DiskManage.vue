<template>
    <div class="disk-module">
        <div class="disk-manage-wrap">
            <div class="disk-manage-head">
                <h3 class="title">设置</h3>
            </div>
            <div class="disk-manage-content">
                <h3 class="title">暂存盘</h3>
                <TableModule :thead="thead" :tbody="tbody" v-on:single-click="singleClick" />
                <h3 class="title">存储位置</h3>
                <input class="disk" type="text" v-model="disk" />
            </div>
            <div class="disk-manage-foot">
                <button class="btn marginR10" @click="close()">取消</button>
                <button class="btn" @click="save">确定</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { editDeviceApi } from '../composables/request';
import TableModule from '../components/TableModule.vue';
import { logicaldisk } from '../composables/readFile';
import on from '../assets/on.svg';
import off from '../assets/off.svg';
import { setValue, getValue, createMsg } from '../util/ADS';

export default {
    components: {
        TableModule,  
    },
    props:{
        device: Object
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, drive } = useState();
        const router = useRouter();
        
        const thead = ref([{'label': '盘符', 'parameter': 'Mounted'},
        {'label': '空间', 'parameter': 'Blocks'},
        {'label': '剩余空间', 'parameter': 'Available'}]);

        const tbody = ref([]);

        const singleClick = (data) => {
            if(!drive){
                disk.value = data.Mounted;
            }
        }

        const disk = ref('');

        const toggleImage = ref(true);
        const changeImage = () => {
            toggleImage.value = !toggleImage.value
        }

        const close = () => {
            if(disk.value){
                context.emit('close', '');
            }else{
                createMsg('请选择盘符');
            }
        }

        const save = () => {
            if(disk.value){
                changePropertyValue('drive', disk.value);
                setValue('drive', disk.value);
                context.emit('close', disk.value);
            }else{
                createMsg('请选择盘符');
            }
        }

        onMounted(() => {
            logicaldisk((disk) => {
                let list = [];
                disk.forEach((ele) => {
                    list.push({'Blocks': '', 'Mounted': ele, 'Available': ''});
                });
                tbody.value = list;
            });
            disk.value = getValue('drive');
        });

        return {
            thead, tbody, singleClick, disk, on, off, toggleImage, changeImage, close, save, drive, 
        }
    }
}
</script>
<style lang="scss" scoped>
.disk-module{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
}
.disk-manage-wrap{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 500px;
    padding: 0 30px 30px 30px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
    .disk-manage-head{
        height: 40px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .disk-manage-content{
        position: relative;
        width: 100%;
        .disk{
            width: 100%;
            height: 40px;
            border-radius: 3px;
            border: 1px solid #ddd;
            text-indent: 10px;
            display: block;
        }
        .sync{
            cursor: pointer;
        }
    }
    .disk-manage-foot{
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .btn{
            width: 120px;
        }
        .marginR10{
            margin-right: 10px;
            background: #999;
        }
    }
    .title{
        height: 40px;
        line-height: 40px;
        margin-top: 20px;
        font-size: 14px;
    }
}
</style>