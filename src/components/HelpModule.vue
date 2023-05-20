<template>
	<div class="help-wrap">
		<div class="help-head">
			<h3 class="title">快捷键</h3>
			<img class="close" src="../assets/close.svg" @click="close" alt="">
		</div>
		<div class="help-content">
			<p>Enter、空格键快捷键 => 向后插入拍摄</p>
			<p>F10快捷键 => 向前插入拍摄</p>
			<p>F12快捷键 => 覆盖拍摄</p>
			<p>向前、向上快捷键 => 向前翻看</p>
			<p>向后、向下快捷键 => 向后翻看</p>
			<p>S 快捷键 => 停止自动检查</p>
		</div>
	</div>
</template>

<script>
	import { ref, reactive, toRefs, watch, inject } from 'vue'
	export default {
		name: 'help',
		components: {
		    
		},
	    props:{
	        
	    },
		emits: ['close'],
	    setup(props, context) {
	        const close = () => {
				context.emit('close', false);
			}
			
	        return {
	            close, 
	        }
	    }
	}
</script>

<style lang="scss" scoped>
	.help-wrap{
		position: fixed;
		top: 60px;
		right: 0;
		padding: 0 20px 20px 20px;
		background: #fff;
		border-radius: 5px;
		min-width: 200px;
		text-align: center;
		.help-head{
			position: relative;
			height: 40px;
			display: flex;
			justify-content: center;
			align-items: center;
			.close{
				position: absolute;
				top: 50%;
				right: 0;
				transform: translateY(-50%);
				background: #000;
				cursor: pointer;
			}
		}
		.help-content{
			min-height: 100px;
			text-align: left;
		}
	}
</style>