<template>
	<div class="log-wrap">
		<div class="log-head">
			<h3 class="title">更新日志</h3>
			<img class="close" src="../assets/close.svg" @click="close(0)" />
		</div>
		<div class="log-content style1">
			<div class="log-list" v-for="(item,index) in logList" :key="index">
				<h3 v-if="item.title">{{item.name}}</h3>
				<p v-else>{{item.name}}</p>
			</div>
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
	    name: 'log',
	    props: ['id'],
		emits: ['close'],
	    setup(props, context) {
	        const { token, origin, userKey, siteKey } = useState();
	        const router = useRouter();
	        const id = props.id;
			
			const logList = ref([
			    {'name': '2023.4.22更新', 'title': true},
				{'name': '拍机-任务池-新增-直拍谱模块'},
				{'name': '2023.3.31更新', 'title': true},
				{'name': '拍机-任务池-按钮文字-优化'},
				{'name': '拍机-拍摄界面-翻页图标-优化'},
				{'name': '拍机-谱目编辑一页显示-优化'},
				{'name': '拍机-任务池-谱ID检索-优化'},
				{'name': '2023.3.14更新', 'title': true},
				{'name': '拍机-拍机程序只启动一次-拍摄异常-优化'},
				{'name': '2023.3.13更新', 'title': true},
				{'name': '拍机-任务池-已认领、未认领、全部检索'},
				{'name': '拍机-上传模块-异常优化'},
				{'name': '拍机-相机启动一次-优化'},
				{'name': '拍机-补拍-向后插入、向前插入、覆盖'},
				{'name': '2023.2.3更新', 'title': true},
				{'name': '拍机-影像中心-留言 改成 拍机备注，且 默认增加备注人'},
				{'name': '2023.1.10更新', 'title': true},
				{'name': '拍机-卷册-新增、编辑-新增字段DorProjectID, DorMediaID'},
				{'name': '拍机-任务池-先编辑卷册然后删除卷册-卷册排序api异常-优化'},
				{'name': '2022.12.30更新', 'title': true},
				{'name': '拍机-规范化命名'},
				{'name': '拍机-卷册-影像来源'},
				{'name': '拍机-作废列表'},
				{'name': '2022.10.28更新', 'title': true},
				{'name': '拍机-拖动'},
				{'name': '拍机-提交审阅-不跳转'},
				{'name': '拍机-卷册列表-打开文件夹'},
				{'name': '拍机-输入框偶发性不能输入-优化'},
				{'name': '拍机-卷册列表-状态筛选'},
				{'name': '拍机-提示框优化'},
				{'name': '拍机-任务池检索速度-优化'},
				{'name': '拍机-拍摄-倒计时功能'},
				{'name': '拍机-关闭程序-提示功能'},
				{'name': '拍机-缩略图缩放功能'},
				{'name': '拍机-自动检查-标记'},
				{'name': '拍机-原图查看'},
				{'name': '拍机-放大镜功能'},
				{'name': '2022.9.26更新', 'title': true},
				{'name': '拍机程序-卷册-内部序号-自定义'},
				{'name': '拍机程序-一键删除-优化'},
				{'name': '拍机程序-原图在fileok-后显示'},
				{'name': '2022.9.16更新', 'title': true},
				{'name': '拍机程序-卷册-单双页'},
				{'name': '拍机程序-影像中心-大图高度-优化'},
				{'name': '拍机程序-强制刷新-无法关闭'},
				{'name': '2022.9.15更新', 'title': true},
				{'name': '微站-审核-tiff预览'},
				{'name': '2022.9.14更新', 'title': true},
				{'name': '开始自检-自动播放影像'},
				{'name': '任务中心-任务池检索'},
				{'name': '任务审阅成功'},
				{'name': '卷册是否导入影像'},
				{'name': '2022.9.13更新', 'title': true},
				{'name': '帮助中心-快捷键模块'},
				{'name': '2022.9.9更新', 'title': true},
				{'name': '拍机程序-驱动设置'},
				{'name': '拍机程序-图片旋转设置'},
				{'name': '拍机程序-光线判断'},
				{'name': '查重后图片无法删除-已解决'},
				{'name': '2022.9.8更新', 'title': true},
				{'name': '查重检索添加新字段'},
				{'name': '家谱查重-数据装载-检索添加起始时间、机构序号'},
				{'name': '家谱查重-谱目审核-检索添加起始时间、机构序号'},
				{'name': '家谱查重-影像审核-检索添加起始时间、机构序号'},
				{'name': '家谱查重-机构模块-检索添机构序号'},
				{'name': '卷册模块优化（卷册名自定义，序号数字）'},
				{'name': '2022.9.7更新', 'title': true},
				{'name': '已有图片导入模块'},
				{'name': '部分UI优化'},
				{'name': 'F12 => 覆盖；enter、space => 拍摄；I => 向前插入'},
				{'name': '2022.9.1更新', 'title': true},
				{'name': '申诉模块(微站审核员、机构管理员)'},
				{'name': '留言模块'},
				{'name': '2022.8.31更新', 'title': true},
				{'name': '裁剪范围有误差，优化'},
				{'name': '整卷打回模块'},
				{'name': '2022.8.30更新', 'title': true},
				{'name': '业务模块逻辑改成按卷册流程'},
				{'name': '2022.8.29更新', 'title': true},
				{'name': '新增更新日志模块'},
				{'name': 'Nikon相机D810-验证是否可用'},
				{'name': '任务池，分为公共任务、机构任务'},
				{'name': '拍照光线太暗提示框优化'},
				{'name': '拍照无相机时，左上角返回按钮可用'},
				{'name': '卷册-内部序号-统一用一二三'},
				{'name': '任务中心，菜单栏优化（自检完成=>自检中，同步完成=>同步中）'},
				{'name': '拍机程序添加最小化、最大化、关闭功能'},
			]);
			
			const close = (data) => {
			    context.emit('close', data);
			}
	
	        onMounted(() => {
	            
	        });
	
	        return {
	            logList, close, 
	        }
	    }
	}
</script>

<style lang="scss" scoped>
	.log-wrap{
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 500px;
		background: #fff;
		border-radius: 10px;
		border: 1px solid #ddd;
		box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
		padding: 0 20px 20px 20px;
		z-index: 100;
		.log-head{
			position: relative;
			width: 100%;
			height: 40px;
			display: flex;
			justify-content: center;
			align-items: center;
			.title{
				align-items: center;
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
		.log-content{
			position: relative;
			width: 100%;
			height: 300px;
			overflow-y: auto;
			.log-list{
				display: flex;
				justify-content: space-between;
				align-items: center;
				height: 30px;
			}
		}
	}
</style>