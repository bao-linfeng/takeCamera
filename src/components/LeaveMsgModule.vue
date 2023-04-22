<template>
	<div class="leave-msg">
		<div class="head-box">
			<h3>拍机备注</h3>
		</div>
		<div class="content-box">
			<textarea class="msg" v-model="msg" @keyup.stop=""></textarea>
		</div>
		<div class="foot-box">
			<button class="btn" @click="saveData">确定</button>
		</div>
	</div>
</template>

<script>
	import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs, camelize } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { useState, changePropertyValue } from '../store';
	export default {
	    components: {
	        
	    },
	    name: 'leave-msg',
	    props: ['id'],
		emits: ['close', 'save-data'],
	    setup(props, context) {
	        const { token, origin, userKey, siteKey, userName } = useState();
	        const router = useRouter();
	        const id = props.id;
			
			const msg = ref(userName);
			
			const close = (data) => {
			    context.emit('close', data);
			}
			
			const saveData = () => {
				context.emit('save-data', msg.value);
			}
	
	        onMounted(() => {
	            
	        });
	
	        return {
	            close, msg, saveData, 
	        }
	    }
	}
</script>

<style lang="scss" scoped>
	.leave-msg{
		position: absolute;
		bottom: 30px;
		right: 0;
		background: #fff;
		border-radius: 5px;
		padding: 10px;
		.head-box{
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.content-box{
			position: relative;
			margin: 10px 0;
			.msg{
				width: 140px;
				height: 50px;
				outline: none;
				border: 1px solid #ddd;
				border-radius: 3px;
				padding: 5px;
				display: block;
				font-size: 10px;
			}
		}
		.foot-box{
			position: relative;
			.btn{
				width: 150px;
				height: 30px;
				line-height: 30px;
				border-radius: 5px;
				border: 1px solid #85B83E;
			}
		}
	}
</style>