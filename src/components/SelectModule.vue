<template>
    <div class="select-module-wrap">
        <span class="label" :title="selectLabel" @click="toggle">{{selectLabel}}</span>
        <img class="triangle" @click="toggle" :src="triangle_b" alt="" />
        <ul class="select-content style1" v-if="isShow">
            <li v-for="(item, index) in list" :key="index" @click="change(item)" :title="item.label">{{item.label}}</li>
        </ul>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, watchEffect, inject } from 'vue';
import triangle_b from '../assets/triangle_b.svg';

export default {
    props:{
        list: Array,
        defaultValue: String,
    },
    emits: ['get-value'],
    setup(props, context) {
        const selectLabel = ref('');
        const selectValue = ref('');
        const isShow = ref(false);

        const toggle = () => {
            isShow.value = !isShow.value;
        }

        const change = (data) => {
            selectLabel.value = data.label;
            selectValue.value = data.value;
            isShow.value = false;
            context.emit('get-value', data);
        }

        const cancelWatch = watchEffect(() => {
            props.list.forEach((ele) => {
                if(ele.value == props.defaultValue){
                    selectLabel.value = ele.label;
                }
            });
        });
        
        return {
            selectLabel, selectValue, isShow, toggle, change, triangle_b,
        }
    }
}
</script>
<style lang="scss" scoped>
.select-module-wrap{
    position: relative;
    width: 200px;
    height: 30px;
    // border: 1px solid #ddd;
    cursor: pointer;
    z-index: 10;
	color: #333;
    .label{
        position: absolute;
        width: calc(100% - 20px);
        padding-right: 20px;
        height: 100%;
        line-height: 30px;
        text-indent: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
		background: #fff;
    }
    .triangle{
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;
    }
    .select-content{
        position: absolute;
        top: calc(100% + 2px);
        left: 0;
        width: 100%;
        max-height: 150px;
        overflow-y: auto;
        background: #fff;
        box-shadow: 0 0 1px 1px #ddd;
        text-indent: 20px;
        li{
            height: 30px;
            line-height: 30px;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
}
</style>