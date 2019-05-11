const api = require('../../utils/request.js');
const defaultSrc = '/images/ico-add-addr.png';
//获取应用实例
const app = getApp();

Page({
    data: {
        hasPhone: false,
        isIdCardValidated: false, //身份证验证完成
        hasCertification: false, //上传有资质证书
        isIdCardVerification: false, //身份证验证中
        // multiIndex: [0, 0, 0],
        // multiArray: [],
        serviceItems: [], //服务项目
        selectedServiceItems: [], //勾选的服务项目
        btnStr: '申请',
        certificationImages: [],
        idcardImages: ['', ''],
        isAgree: false,
        locationPickerIndexArr: [[0,0,0]],
        locationPickerTextArr: [[[],[],[]]]
    },

    onLoad: function(e) {
        this.initCityData();
        this.fetchServiceItemInfo();
    },

    onShow: function() {
        this.fetchCertificationInfo();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return getApp().shareMessage();
    },

    fetchServiceItemInfo: function() {
        this.setData({
            serviceItems: wx.getStorageSync('serviceItems')
        });

        api.fetchRequest('/api/product/catalogs')
            .then(res => {
                let serviceItemInfo = res.data;
                if (serviceItemInfo.status !== 200) {
                    wx.showToast({ title: res.msg });
                    return;
                }
                wx.setStorage({
                    key: 'serviceItems',
                    data: serviceItemInfo.data
                });
                this.setData({
                    serviceItems: serviceItemInfo.data
                });
            })
            .catch(() => {});
    },

    fetchCertificationInfo: function() {
        let that = this;
        wx.showLoading({
            title: '数据加载中',
            mask: true
        });
        api.fetchRequest('/api/cert')
            .then(res => {
                wx.hideLoading();
                if (res.data.status !== 200) {
                    wx.showToast({ title: applyInfo.msg });
                    return;
                }
                let applyInfo = res.data.data;

                let hasCertification =
                    !!applyInfo.certificateImages &&
                    applyInfo.certificateImages.length !== 0;
                let certificationImages = applyInfo.certificateImages;
                let isIdCardValidated = false;
                let isIdCardVerification = false;
                let idcardImages = ['', ''];
                if (applyInfo.idcardCert) {
                    isIdCardValidated =
                        !!applyInfo.idcardCert &&
                        applyInfo.idcardCert.status === 'DONE';
                    isIdCardVerification =
                        !!applyInfo.idcardCert &&
                        applyInfo.idcardCert.status === 'PENDING';
                    idcardImages = [
                        applyInfo.idcardCert.idcardImages0,
                        applyInfo.idcardCert.idcardImages1
                    ];
                }

                that.setData({
                    hasPhone: !!applyInfo.phone,
                    isIdCardValidated,
                    isIdCardVerification,
                    hasCertification,
                    certificationImages,
                    idcardImages
                });
            })
            .catch(() => {
                wx.hideLoading();
            });
    },

    goValidatePhonePage: function(e) {
        wx.navigateTo({ url: '/pages/validate_phone/index' });
    },

    goValidateIdCardPage: function(e) {
        let images = this.data.idcardImages.join(',');
        // if (!this.data.isIdCardValidated) {
            wx.navigateTo({
                url: `/pages/validate_idcard/index?images=${images}`
            });
        // }
    },

    goValidateCertificationPage: function() {
        wx.navigateTo({
            url: `/pages/validate_certification/index?images=${this.data.certificationImages.join(
                ','
            )}`
        });
    },

    initCityData: function() {
        //默认地址为四川成都区域待选择
        let multiArray = [[], [], []];
        let multiIndex = [0, 0, 0];
        const citys = app.globalData.citys;

        for (let i = 0; i < citys.length; i++) {
            multiArray[0].push(citys[i].name);
            if (citys[i].id == 510000) {
                multiIndex[0] = i;
            }
        }
        let cityList = citys[multiIndex[0]].city;
        for (let j = 0; j < cityList.length; j++) {
            multiArray[1].push(cityList[j].name);
            if (cityList[j].id == 510100) {
                multiIndex[1] = j;
                multiArray[2].push(...cityList[j].area.map(item => item.name));
            }
        }
        let locationPickerIndexArr =  this.data.locationPickerIndexArr;
        let locationPickerTextArr = this.data.locationPickerTextArr;
        locationPickerIndexArr[0] = multiIndex;
        locationPickerTextArr[0] = multiArray;
        this.setData({
            locationPickerIndexArr,
            locationPickerTextArr
        });
    },

    bindMultiPickerChange(e) {
        let idx = e.target.dataset.idx;
        console.log('picker发送选择改变，携带值为', e.detail.value);
        let locationPickerIndexArr =  this.data.locationPickerIndexArr;
        locationPickerIndexArr[idx] = e.detail.value;
        this.setData({
            locationPickerIndexArr,
        });
    },

    bindMultiPickerColumnChange(e) {
        let idx = e.target.dataset.idx;
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        const data = {
            multiArray: this.data.locationPickerTextArr[idx],
            multiIndex: this.data.locationPickerIndexArr[idx]
        };
        const citys = app.globalData.citys;

        data.multiIndex[e.detail.column] = e.detail.value;
        switch (e.detail.column) {
            case 0:
                data.multiIndex[1] = 0;
                data.multiIndex[2] = 0;
                data.multiArray[1] = [
                    ...citys[data.multiIndex[0]].city.map(item => item.name)
                ];
                data.multiArray[2] = [
                    ...citys[data.multiIndex[0]].city[0].area.map(
                        item => item.name
                    )
                ];
                break;
            case 1:
                data.multiIndex[2] = 0;
                data.multiArray[2] = [
                    ...citys[data.multiIndex[0]].city[
                        data.multiIndex[1]
                    ].area.map(item => item.name)
                ];
                break;
        }
        console.log(data.multiIndex);
        this.setData({
            locationPickerTextArr: this.data.locationPickerTextArr,
            locationPickerIndexArr: this.data.locationPickerIndexArr
        });
    },

    getLocationStr: function() {
        const citys = app.globalData.citys;
        let str = ""
        for (let i = 0 , len = this.data.locationPickerIndexArr.length; i < len ; i++){
            let multiIndex = this.data.locationPickerIndexArr[i];
            let multiArray = this.data.locationPickerTextArr[i];
            let cityList = citys[multiIndex[0]].city;
            let provence = multiArray[0][multiIndex[0]];
            let city = multiArray[1].length == 0 ? '' : multiArray[1][multiIndex[1]];
            let district = multiArray[2].length == 0 ? '' : multiArray[2][multiIndex[2]];
            str += `${provence}-${city}-${district},`;
        }

        return str.replace(/,$/,'');
    },

    checkboxChange: function(e) {
        this.setData({
            selectedServiceItems: e.detail.value
        });
    },

    bindSave: function(e) {
        let that = this;
        let locations = this.getLocationStr(),
            offers = this.data.selectedServiceItems.join(',');
        if (!this.data.hasPhone) {
            wx.showModal({
                title: '提示',
                content: '请先完善基本信息',
                showCancel: false
            });
            return;
        }
        if (!locations) {
            wx.showModal({
                title: '提示',
                content: '请选择正确的辖区',
                showCancel: false
            });
            return;
        }
        if (!offers) {
            wx.showModal({
                title: '提示',
                content: '请至少选择一个服务项',
                showCancel: false
            });
            return;
        }
        if (!this.data.isAgree) {
            wx.showModal({
                title: '提示',
                content: '请阅读并勾选申请条款',
                showCancel: false
            });
            return;
        }
        wx.showLoading({
            title: '提交申请中',
            mask: true
        });
        let paramData = {
            locations: locations,
            offers: offers,
            status: 'APPLYING'
        };
        let requestPromise = this.newApply(paramData);
        requestPromise
            .then(function(res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '提交成功，等待审核',
                    showCancel: false
                });
            })
            .catch(function(res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提交失败',
                    content: res.msg,
                    showCancel: false
                });
            });
    },

    newApply: function(paramData) {
        return api.fetchRequest('/api/apply/offer', paramData, 'POST', 0, {
            'content-type': 'application/x-www-form-urlencoded'
        });
    },
    catchTap: function(){

    },
    notesToApplyCheckboxChange: function(e){
        this.setData({
            isAgree: !!e.detail.value.length
        });
    },
    handleAddOrSubPicker: function(e){
        let type = e.target.dataset.type;
        let idx = e.currentTarget.dataset.idx;
        
        if(type == 1){
            let len = this.data.locationPickerTextArr.length;
            if (len > 1) {
                wx.showModal({
                    content:'最多选择两个地区',
                    showCancel:false
                })
                return;
            }
            this.data.locationPickerTextArr.push([].concat(this.data.locationPickerTextArr[len-1]));
            this.data.locationPickerIndexArr.push([].concat(this.data.locationPickerIndexArr[len-1]));
        }else{
            this.data.locationPickerTextArr.splice(idx,1);
            this.data.locationPickerIndexArr.splice(idx,1);
        }
        this.setData({
            locationPickerTextArr: this.data.locationPickerTextArr,
            locationPickerIndexArr: this.data.locationPickerIndexArr
        })
    }

});
