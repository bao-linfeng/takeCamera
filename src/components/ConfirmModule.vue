<template>
    <div class="confirm-wrap">
        <div class="confirm-box">
            <div class="confirm-head">
                <h3 class="title">{{MSG ? MSG : '您是否确认进行此操作？'}}</h3>
            </div>
            <div class="confirm-foot">
                <button class="btn marginR30" @click="open(false)">取消</button>
                <button class="btn" @click="open(true)">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue'
export default {
    props:{
        msg: String
    },
    emits: ['change-confirm'],
    setup(props, context) {
        
        const open = (flag) => {
            context.emit('change-confirm', flag);
        }
		
		const MSG = ref('');
		
		onMounted(() => {
			MSG.value = props.msg;
		});

        return {
            open, MSG
        }
    }
}
</script>
<style lang="scss" scoped>
.confirm-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    .confirm-box{
        padding: 30px;
        background: #fff;
        border-radius: 10px;
        .confirm-head{
            height: 40px;
            line-height: 40px;
            text-align: center;
        }
        .confirm-foot{
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .btn{
                width: 120px;
            }
            .marginR30{
                margin-right: 30px;
                background: #999;
            }
        }
    }
}
</style>