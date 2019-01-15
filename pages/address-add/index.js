const citys = require('../../utils/city.js');
const api = require('../../utils/request.js');
const defaultSrc = '/images/ico-add-addr.png';
//获取应用实例
const app = getApp();
Page({
    data: {
        multiIndex: [0, 0, 0],
        multiArray: [],
        telNumber:'',
        userName:'',
        codeNumber:'',
        idCardNum:'',
        idCardSrc:[defaultSrc,defaultSrc],
        certificateSrc:defaultSrc, //资格证图片
        positionalSrc:defaultSrc, //职称图片
        BigExampleSrc:'',
        serviceItems:[], //服务项目
        selectedServiceItems:[], //勾选的服务项目
        serverPicName:{
            idcard:[], //成功保存到服务器的身份证图片名称（正反两张）
            certificate:[], //成功保存到服务器的资格证图片名称
        }

    },
    bindCancel: function () {
        wx.navigateBack({})
    },

    saveInfoToLocal:function(e){

    },

    bindSave: function (e) {
        let that = this;
        let linkMan = e.detail.value.linkMan;
        let mobile = e.detail.value.mobile;
        let code = e.detail.value.code;
        let idcard = e.detail.value.idcard;

        wx.showLoading({
            title:'提交申请中',
            mask:true
        });
        //todo 校验手机验证码


        if (linkMan == "") {
            wx.showModal({
                title: '提示',
                content: '请填写联系人姓名',
                showCancel: false
            });
            return
        }
        if (mobile == "") {
            wx.showModal({
                title: '提示',
                content: '请填写手机号码',
                showCancel: false
            });
            return
        }
        let locations = `${this.data.multiArray[0][this.data.multiIndex[0]]}-${this.data.multiArray[1][this.data.multiIndex[1]]}-${this.data.multiArray[2][this.data.multiIndex[2]]}`;
        api.fetchRequest(`/api/apply/offer`,{
            certificateImages:this.data.serverPicName.certificate.join(','),
            idNumber:idcard,
            idcardImages:this.data.serverPicName.idcard.join(','),
            locations:locations,
            name:linkMan,
            offers:this.data.selectedServiceItems.join(','),
            phone:mobile,
            status:'APPLYING'
        }).then(function (res) {
            wx.hideLoading();
            if (res.data.status != 200) {
                wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                });
            }else {
                wx.showModal({
                    title: '提示',
                    content: '提交成功，等待审核',
                    showCancel: false
                });
            }

        }).catch(function(res){
            wx.showModal({
                title: '提交失败',
                content: res.data.msg,
                showCancel: false
            });
        })
    },

    onLoad: function (e) {
        const that = this;
        this.initCityData(1);
        this.getServiceItems();

    },

    getServiceItems:function(){
        let that = this;
        api.fetchRequest('/api/product/catalogs').then(function (res) {
            if (res.data.status != 200) {
                // 登录错误
                wx.hideLoading();
                wx.showModal({
                    title: '服务项目获取失败',
                    content: res.data.msg,
                    showCancel: false
                });
                return;
            }
            that.setData({
                serviceItems:res.data.data
            })
        })
    },

    initCityData:function () {
        //默认地址为四川成都区域待选择
        let multiArray = [[],[],[]];
        let multiIndex = [0,0,0];
        for(let i = 0; i < citys.cityData.length;i++){
            multiArray[0].push(citys.cityData[i].name);
            if(citys.cityData[i].id === 510000){
                multiIndex[0] = i;
                for(let j = 0; j<citys.cityData[i].cityList.length;j++){
                    multiArray[1].push(citys.cityData[i].cityList[j].name);
                    if(citys.cityData[i].cityList[j].id === 510100){
                        multiIndex[1] = j;
                        multiArray[2].push(...citys.cityData[i].cityList[j].districtList.map((item)=>item.name))
                    }
                }
            }
        }
        this.setData({
            multiArray,
            multiIndex
        });
    },

    chooseAndSavePic:function(e){
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                let picSrc = res.tempFilePaths[0];
                let type = e.target.dataset.type;
                if (type.indexOf('idcard')!=-1){
                    type = 'idcard'
                }
                wx.uploadFile({
                    url: api.API_BASE_URL + `/api/upload/img/${type}`,
                    filePath: picSrc,
                    name: 'file',
                    formData: {},
                    success: function (res) {
                        let type = e.target.dataset.type;
                        let [idcard_0,idcard_1] = that.data.idCardSrc;
                        if (type == 'idcard_0'){
                            that.setData({
                                idCardSrc:[picSrc,idcard_1]
                            });
                        }
                        if (type == 'idcard_1'){
                            that.setData({
                                idCardSrc:[idcard_0,picSrc]
                            });
                        }
                        if (type == 'certificate'){
                            that.setData({
                                certificateSrc:picSrc
                            });
                        }
                    },
                    fail: function (err) {
                        wx.showToast({
                            title: '图片上传失败',
                            content: err.errMsg,
                            showCancel: false
                        });
                    }
                });
            }
        })
    },

    checkboxChange:function(e){

        this.setData({
            selectedServiceItems:e.detail.value
        })
    },

    bindMultiPickerChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        this.setData({
            multiIndex: e.detail.value
        })
    },

    bindMultiPickerColumnChange(e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        const data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        switch (e.detail.column) {
            case 0:
                data.multiIndex[1] = 0;
                data.multiIndex[2] = 0;
                data.multiArray[1] = [...citys.cityData[data.multiIndex[0]].cityList.map((item)=>item.name)];
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[0].districtList.map((item)=>item.name)];
                break;
            case 1:
                data.multiIndex[2] = 0;
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[data.multiIndex[1]].districtList.map((item)=>item.name)];
                break
        }
        console.log(data.multiIndex);
        this.setData({
            multiArray:data.multiArray
        })
    },
});
