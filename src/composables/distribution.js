import { ref, onMounted } from 'vue'
import { createMsg } from '../util/ADS';
import { surname } from '../util/api';

export default function distribution(sur){
    const colors = ["#FFE9D8", "#FFDFC7", "#FBCCA9", "#F7BA8C", "#FD9A50", "#F5832E", "#F16700", "#CE5800", "#A84800", "#7B3500"];
    const colorIndex = ref([]);
    const map = ref('');
    const province_active = ref('');
    const city_active = ref('');
    const place = ref('中国');
    const list = ref([]);
    const districtExplorer = ref('');
    const $tipMarkerContent = ref('');
    const tipMarker = ref('');
    const activeAdcode = ref();
    const adcode_active = ref('');
    const currentAreaNode = ref('');
    const initMap = () => {
        map.value = new AMap.Map('heatmap', {
            center: [116.397428, 32.90923],
            resizeEnable: true,
            zoom: 3,
            features: ['bg'],
            viewMode: '2D',
        });
        
        AMap.plugin([
            'AMap.ToolBar',
        ], function(){
            map.value.addControl(new AMap.ToolBar({position:'LB'}));
        });
        getSurnamePer(1,'','',100000);
    }

    const getSurnamePer = async (percentType,provinceCode,cityCode,adcode) => {
        if(percentType == 1){
            province_active.value = '';
            city_active.value = '';
            place.value = '中国';
        }
        if(provinceCode){
            city_active.value = '';
            place.value = provinceCode.name;
        }
        
        let data = await surname.getPercent(sur,percentType,provinceCode,cityCode);
        list.value = data.result;
        initPercent(list.value,adcode);
    }

    const initPercent = (data,adcode) =>{
        if(adcode == '820000' || adcode == '710000' || adcode == '810000'){
            map.value.setCity(adcode, () => {
                map.value.setZoom(adcode == '820000' ? 11 : adcode == '710000' ? 7 : 10);
            });
        }
        if(!data.length){createMsg('已经最后一层了');return}
        let l = data.length,max = data[0].percentage,min = data[l-1].percentage,range = 0,index=0,percentage=0;

        range=(max-min)/10;
        for(let i = 0;i< l;i++){
            percentage = data[i].percentage;
            index = Math.round((percentage-min)/range);
            index = index >= 10 ? 9 : index;
            colorIndex.value[data[i].areaCode] = {percentage:data[i].percentage,color:colors[index]};
        }

        if(districtExplorer.value){
            districtExplorer.value.clearFeaturePolygons();
            switch2AreaNode(adcode);
        }else{
            DistrictExplorer();
        }
    }

    const DistrictExplorer = () =>{
        AMapUI.load(['ui/geo/DistrictExplorer', 'lib/$'], (DistrictExplorer, $) => {
            districtExplorer.value = window.districtExplorer = new DistrictExplorer({
                eventSupport: true, //打开事件支持
                map: map.value
            });

            //鼠标hover提示内容
            $tipMarkerContent.value = $('<div class="tipMarker bottom"></div>');
            tipMarker.value = new AMap.Marker({
                content: $tipMarkerContent.value.get(0),
                offset: new AMap.Pixel(-38, -60),
                bubble: true
            });
            
            //根据Hover状态设置相关样式
            function toggleHoverFeature(feature, isHover, position) {
                tipMarker.value.setMap(isHover ? map.value : null);
                if (!feature) {
                    return;
                }
                var props = feature.properties;
                if (isHover) {
                    if(colorIndex.value[props.adcode]){
                        let title = '',nameW=(props.name).length,percentage = colorIndex.value[props.adcode].percentage,percentageW = ((percentage+'').length)*12+12;
                        title = "<div class='adai_map_title drop_shadow'><div class='adai_map_title_in'><span class='adai_map_name' style='width:"+nameW*20+"px'>"+props.name+"</span><span class='adai_map_percentage' style='width:"+percentageW+"px'>"+percentage+"%</span></div></div>"
                        $tipMarkerContent.value.html(title);
                    }else{
                        // self.$tipMarkerContent.html(props.name);
                    }
                    
                    //更新位置
                    tipMarker.value.setPosition(props.center);
                }
            }

            //监听feature的hover事件
            districtExplorer.value.on('featureMouseout featureMouseover', function(e, feature) {
                toggleHoverFeature(feature, e.type === 'featureMouseover',
                    e.originalEvent ? e.originalEvent.lnglat : null);
            });

            //监听鼠标在feature上滑动
            districtExplorer.value.on('featureMousemove', function(e, feature) {
                //更新提示位置
                tipMarker.value.setPosition(e.originalEvent.lnglat);
            });

            //feature被点击
            districtExplorer.value.on('featureClick', (e, feature) => {
                var props = feature.properties;
                console.log(props);
                //如果存在子节点
                if (props.childrenNum > 0) {
                    if(props.level == 'province'){
                        province_active.value = {'adcode':props.adcode+'','name':props.name};
                        place.value = props.name;
                        getSurnamePer('',props.adcode,'',props.adcode);
                    }else if(props.level == 'city'){
                        city_active.value = {'adcode':props.adcode+'','name':props.name};
                        place.value = props.name;
                        getSurnamePer('','',props.adcode,props.adcode);
                    }
                }else{
                    if(props.level == 'district'){
                        activeAdcode.value = props.adcode;
                        scrollIntoView(props.adcode);
                        createMsg('已经最后一层了');
                    }
                }
            });

            switch2AreaNode(100000);
        });
    }

    const switch2AreaNode = (adcode, callback) =>{
        loadAreaNode(adcode, (error, areaNode) => {
            if (error) {
                if (callback) {
                    callback(error);
                }
                return;
            }

            adcode_active.value = adcode;

            currentAreaNode.value = window.currentAreaNode = areaNode;

            //设置当前使用的定位用节点
            districtExplorer.value.setAreaNodesForLocating([currentAreaNode.value]);

            refreshAreaNode(areaNode);

            if (callback) {
                callback(null, areaNode);
            }
        });
    }

    const refreshAreaNode = (areaNode) =>{
        districtExplorer.value.setHoverFeature(null);

        renderAreaPolygons(areaNode);
    }

    const renderAreaPolygons = (areaNode) =>{
        //更新地图视野
        if(adcode_active.value != 100000){
            map.value.setBounds(areaNode.getBounds(), null, null, true);
        }else{
            map.value.setZoom(4);
        }
    
        //清除已有的绘制内容
        districtExplorer.value.clearFeaturePolygons();
        //绘制子区域
        districtExplorer.value.renderSubFeatures(areaNode, (feature, i) => {
            // console.log(feature.properties);
            return {
                cursor: 'default',
                bubble: true,
                strokeColor: '#aaa', //线颜色
                strokeOpacity: 1, //线透明度
                strokeWeight: 1, //线宽
                fillColor: (colorIndex.value[feature.properties.adcode] ? colorIndex.value[feature.properties.adcode]['color'] : colors.values[0]), //填充色
                fillOpacity: 1, //填充透明度
            };
        });
        //绘制父区域
        districtExplorer.value.renderParentFeature(areaNode, {
            cursor: 'default',
            bubble: true,
            strokeColor: '#bbb', //线颜色
            strokeOpacity: 1, //线透明度
            strokeWeight: 1, //线宽
            fillColor: null, //填充色
            fillOpacity: 0.35, //填充透明度
        });
    }

    const loadAreaNode = (adcode, callback) =>{
        districtExplorer.value.loadAreaNode(adcode, function(error, areaNode) {
            if (error) {
                if (callback) {
                    callback(error);
                }
                console.error(error);
                return;
            }

            if (callback) {
                callback(null, areaNode);
            }
        });
    }

    const scrollIntoView = (i) =>{
        setTimeout(()=>{
            document.getElementById(i).scrollIntoView({inline:'center'});    
        },500);
    }

    const insertUpCounty = (item) =>{
        // console.log(item);
        let adcode = item.areaCode,address='';
        if(item.level == 1){
            city_active.value = {adcode:adcode,name:item.areaName};
            place.value = item.areaName;
            getSurnamePer('','',adcode,adcode);
        }else if(item.level == 2){
            address=(province_active.value ? province_active.value.name : '')+(city_active.value ? city_active.value.name : '')+item.areaName
            getLocationByAddress(address,item);
            activeAdcode.value = item.areaCode;
            createMsg('已经最后一层了');
        }else{
            province_active.value = {adcode:adcode,name:item.areaName};
            place.value = item.areaName;
            getSurnamePer('',adcode,'',adcode);
        }
    }

    const getLocationByAddress = (address,item) =>{
        fetch('https://restapi.amap.com/v3/geocode/geo?address='+address+'&output=JSON&key=09133c37197fa78480373c8ac19ac853&batch=true').then(response => response.json())
        .then(data => {
            //   console.log(data);
            let location = data.geocodes && data.geocodes[0].location;
            map.value.panTo(location.split(','));

            tipMarker.value.setMap(map.value);
            let title = '',name=item.areaName,nameW=name.length,percentage = item.percentage,percentageW = ((percentage+'').length)*12+12;
            title = "<div class='adai_map_title drop_shadow'><div class='adai_map_title_in'><span class='adai_map_name' style='width:"+nameW*20+"px'>"+name+"</span><span class='adai_map_percentage' style='width:"+percentageW+"px'>"+percentage+"%</span></div></div>"
            $tipMarkerContent.value.html(title);
            tipMarker.value.setPosition(location.split(','));
        }).catch(e => console.log("Oops, error", e))
    }

    onMounted(() => {
        initMap();
    });

    return {
        list, province_active , city_active, insertUpCounty, activeAdcode, getSurnamePer
    }
}