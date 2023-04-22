
import { ref, onMounted } from 'vue'
import { createMsg, getRandomNum } from '../util/ADS';
import { getSimpleCatalogApi } from '../composables/request'

export default function genealogyCollection(sur, py){
    const place = ref('中国');
    const map = ref('');
    const infoWindow = ref('');
    const layer = ref('');
    const provinceIndex = ref(-1);
    const province_active = ref('');
    const city_active = ref('');
    const cityIndex = ref(-1);
    const jiapuIndex = ref(-1);
    const cityArr = ref([]);
    const genealogyPlaces = ref([]);
    const cityObj = ref({});
    const provinceO = ref({
        650000:"新疆维吾尔自治区",
        630000:"青海省",
        540000:"西藏自治区",
        620000:"甘肃省",
        150000:"内蒙古自治区",
        230000:"黑龙江省",
        210000:"辽宁省",
        130000:"河北省",
        110000:"北京市",
        220000:"吉林省",
        420000:"湖北省",
        450000:"广西壮族自治区",
        500000:"重庆市",
        510000:"四川省",
        410000:"河南省",
        430000:"湖南省",
        530000:"云南省",
        140000:"山西省",
        640000:"宁夏回族自治区",
        520000:"贵州省",
        610000:"陕西省",
        440000:"广东省",
        350000:"福建省",
        810000:"香港特别行政区",
        330000:"浙江省",
        370000:"山东省",
        120000:"天津市",
        710000:"台湾省",
        340000:"安徽省",
        360000:"江西省",
        320000:"江苏省",
        310000:"上海市",
        820000:"澳门特别行政区",
    });

    const initMap = () =>{
        var disCountry = new AMap.DistrictLayer.Country({
            zIndex:10,
            SOC:'CHN',
            depth:2,
            styles:{
                'nation-stroke':'rgba(255,255,255,1)',
                'coastline-stroke':'rgba(255,255,255,1)',
                'province-stroke':'rgba(0,0,0,1)',
                'city-stroke': 'rgba(255,255,255,0.3)',//中国特有字段
                'fill':(props) => {//中国特有字段
                    return '#FD9A50';
                }
            }
        })

        map.value = new AMap.Map('amap', {
            center: [104.341211,35.086148],
            resizeEnable: true,
            zoom:5,
            features: ['bg'],
            viewMode: '2D',
            layers:[
                disCountry
            ],
        });
        infoWindow.value = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});//信息窗口初始化
        layer.value = new AMap.LabelsLayer({collision: false,animation: true,zIndex: 11});

        map.value.on('click',  (ev) => {
            var props = disCountry.getDistrictByContainerPos(ev.pixel),index=-1,count=0;// 拾取所在位置的行政区
            console.log(props);
            if(province_active.value){
                cityArr.value.map((item,key)=>{
                    if(item.city == props.NAME_CHN){
                        count = item.count;
                        index = key;
                    }
                });
                index > -1 ? getProvinceJiaPu({'count':count,'city':props.NAME_CHN},index,'city') : createMsg(props.NAME_CHN+'暂无家谱');
            }else{
                genealogyPlaces.value.map((item,key)=>{
                    if(item.province == provinceO.value[props.adcode_pro]){
                        count = item.count;
                        index = key;
                    }
                });
                index > -1 ? getProvinceJiaPu({'count':count,'province': provinceO.value[props.adcode_pro]},index,'province') : createMsg(provinceO.value[props.adcode_pro]+'暂无家谱');
            }
        });

        AMap.plugin([
            'AMap.ToolBar',
        ], function(){
            map.value.addControl(new AMap.ToolBar({position:'LB'}));
        });

        initDistrictSearch(place.value);
        getSimpleCatalogApi(sur, place.value);
    }

    const getChinaJiaPu = () =>{
        provinceIndex.value = -1;
        province_active.value = '';
        city_active.value = '';
        cityIndex.value = -1;
        jiapuIndex.value = -1;
        place.value = '中国';
        map.value.panTo([104.341211,35.086148]);
        map.value.setZoom(5);
        initDistrictSearch(place.value);
        getSimpleCatalogApi(sur ,place.value);
    }

    const getProvinceJiaPu = (item,index,type) =>{
        place.value = item[type];
        map.value.setCity(place.value);
        getSimpleCatalogApi(sur ,place.value);
        if(type == 'province'){
            provinceIndex.value = index;
            province_active.value = item;
            cityIndex.value = -1;
            city_active.value = '';
            initDistrictSearch(place.value);
            initJiapuCity(item[type]);
        }else{
            cityIndex.value = index;
            city_active.value = item;
        }
    }

    const initJiapuProvince = (genealogyList) =>{
        let genealogyObj={},CObj={},GPlaces=[];
        genealogyList.map((item)=>{
            if(item.province){
                if(genealogyObj[item.province]){
                    genealogyObj[item.province] = genealogyObj[item.province] + 1;
                }else{
                    genealogyObj[item.province] = 1;
                }
            }
            if(item.city && item.city != '无'){
                if(CObj[item.province+item.city]){
                    CObj[item.province+item.city] = CObj[item.province+item.city] + 1;
                }else{
                    CObj[item.province+item.city] = 1;
                }
            }
        });
        for(let key in genealogyObj){
            GPlaces.push({province:key,count:genealogyObj[key]});
        }
        
        GPlaces.sort(function(a,b){return b.count - a.count});
        genealogyPlaces.value = GPlaces;
        cityObj.value = CObj;
    }

    const initJiapuCity = (type) =>{
        let cityArrs = [];
        for(let key in cityObj.value){
            if(key.indexOf(type) > -1){
                cityArrs.push({city:key.replace(type,''),count: cityObj.value[key]});
            }
        }
        cityArrs.sort(function(a,b){return b.count - a.count});
        cityArr.value = cityArrs;
    }

    const initDistrictSearch = (place) =>{//行政区划查询
        layer.value ? layer.value.clear() : null;
        var opts = {
            subdistrict: 1,   //返回下一级行政区
            showbiz:false  //最后一级返回街道信息
        };
        let district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
        district.search(place, (status, result) => {
            if(status=='complete'){
                initLabelsLayer(result.districtList[0].districtList)
            }
        });
    }

    const initLabelsLayer = (districts) =>{//添加标签
        var labelsMarker,district,config;
        for (let i = 0; i < districts.length; i++) {
            config = {
                name: '',
                position: [116.12, 39.11],
                zooms: [4, 13],
                zIndex: 1,
                opacity: 1,
                text: {
                    content: '',
                    direction: 'center',
                    offset: [0, 0],
                    zooms: [3, 20],
                    style: {
                        fontSize: 10,
                        fontWeight: 'normal',
                        fillColor: '#333',
                        strokeColor: '#fff',
                        strokeWidth: 0,
                    }
                }
            };
            district = districts[i];
            config.text.content = district.name;
            config.position = [district.center.lng,district.center.lat];
            labelsMarker = new AMap.LabelMarker(config);
            layer.value.add(labelsMarker);
        }
        map.value.add(layer.value);
    }

    const moveTo = (item) =>{
        let div="<div class='adai_map_content'><div class='adai_map_content_cover'><i>"+item.genealogyName+"</i></div><div class='adai_map_content_desc fontSize26'><h3 class='fontSize30'>"+(item.genealogyName)+"</h3><p>版本年："+(item.publish ? item.publish : '不详')+"</p><p>谱籍地："+(item.place ? item.place : '不详')+"</p><p>修撰者："+(item.author || '不详')+"</p><a href='/genealogySummary?s="+sur+"&py="+py+"&id="+item._key+"'>查看详情</a></div></div>";
        map.value.panTo(item.location);
        infoWindow.value.setContent(div);
        infoWindow.value.open(map.value, item.location);
    }

    const addMarker = (data,isCluster) =>{//添加点
        map.value ? map.value.clearMap() : null;
        let marker,markers=[],cluster;
        if(data && data.length){//绘制点
            for(let i=0;i<data.length;i++){
                if(data[i].location && data[i].location[0] && data[i].location[1]){
                    let div='';
                    // data[i].location[0] = parseFloat(data[i].location[0])+getRandomNum(1,100)*0.00001;
                    // data[i].location[1] = parseFloat(data[i].location[1])+getRandomNum(1,100)*0.0000001;
                    div="<div class='adai_map_content'><div class='adai_map_content_cover'><i>"+data[i].genealogyName+"</i></div><div class='adai_map_content_desc fontSize26'><h3 class='fontSize30'>"+(data[i].genealogyName)+"</h3><p>版本年："+(data[i].publish ? data[i].publish : '不详')+"</p><p>谱籍地："+(data[i].place ? data[i].place : '不详')+"</p><p>修撰者："+(data[i].author || '不详')+"</p><a href='/genealogySummary?s="+sur+"&py="+py+"&id="+data[i]._key+"' target='_top'>查看详情</a></div></div>";
                    
                    marker = new AMap.Marker({
                        position: data[i].location,
                        title: data[i].genealogyName,
                        map: map.value
                    });
                    //给marker绑定事件
                    marker.content=div;

                    marker.on('click', function(e){
                        infoWindow.value.setContent(e.target.content);
                        infoWindow.value.open(map.value, e.target.getPosition());
                    });
                    markers.push(marker);
                }
            }  
            
            // 点聚合
            if(isCluster){
                if (cluster) {
                    cluster.setMap(null);
                }
                cluster = new AMap.MarkerClusterer(map.value, markers,{gridSize:80});
            }else{
                map.value.add(markers);
            }
        }
    }

    onMounted(() => {
        initMap();
    });

    return {
        getChinaJiaPu, province_active, provinceIndex, getProvinceJiaPu, city_active, cityIndex, genealogyPlaces, cityArr, moveTo, addMarker, initJiapuProvince
    }
}