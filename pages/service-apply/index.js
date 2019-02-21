const citys = require('../../utils/city.js');
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
        multiIndex: [0, 0, 0],
        multiArray: [],
        serviceItems: [], //服务项目
        selectedServiceItems: [], //勾选的服务项目
        btnStr: '申请',
        certificationImages:[],
        idcardImages:['',''],
    },

    onLoad: function (e) {
        this.initCityData();
        this.fetchServiceItemInfo();
    },

    onShow: function () {
        this.fetchCertificationInfo();

    },
    fetchServiceItemInfo: function () {
        this.setData({
            serviceItems: wx.getStorageSync('serviceItems'),
        });

        api.fetchRequest('/api/product/catalogs')
            .then((res) => {
                let serviceItemInfo = res.data;
                if (serviceItemInfo.status !== 200) {
                    wx.showToast({title: res.msg});
                    return;
                }
                wx.setStorage({key: 'serviceItems', data: serviceItemInfo.data});
                this.setData({
                    serviceItems: serviceItemInfo.data,
                })
            })
            .catch(() => {


            });

    },
    fetchCertificationInfo: function () {
        let that = this;
        wx.showLoading({
            title: '数据加载中',
            mask: true
        });
        api.fetchRequest('/api/cert')
            .then((res) => {
                wx.hideLoading();
                if (res.data.status !== 200) {
                    wx.showToast({title: applyInfo.msg});
                    return;
                }
                let applyInfo = res.data.data;

                let hasCertification = !!applyInfo.certificateImages && applyInfo.certificateImages.length !== 0;
                let certificationImages = applyInfo.certificateImages;
                let isIdCardValidated = false;
                let isIdCardVerification = false;
                let idcardImages = ['',''];
                if(applyInfo.idcardCert){
                    isIdCardValidated = !!applyInfo.idcardCert && applyInfo.idcardCert.status === 'DONE';
                    isIdCardVerification = !!applyInfo.idcardCert && applyInfo.idcardCert.status === 'PENDING';
                    idcardImages = [applyInfo.idcardCert.idcardImages0,applyInfo.idcardCert.idcardImages1];

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
    goValidatePhonePage: function (e) {
        wx.navigateTo({url: '/pages/validate_phone/index'})
    },
    goValidateIdCardPage: function (e) {
        let images = this.data.idcardImages.join(',');
        if (!this.data.isIdCardValidated) {
            wx.navigateTo({url: `/pages/validate_idcard/index?images=${images}`})
        }
    },
    goValidateCertificationPage: function () {
        wx.navigateTo({url: `/pages/validate_certification/index?images=${this.data.certificationImages.join(',')}`})

    },


    initCityData: function () {
        //默认地址为四川成都区域待选择
        let multiArray = [[], [], []];
        let multiIndex = [0, 0, 0];
        for (let i = 0; i < citys.cityData.length; i++) {
            multiArray[0].push(citys.cityData[i].name);
            if (citys.cityData[i].id === 510000) {
                multiIndex[0] = i;
            }
        }
        let cityList = citys.cityData[multiIndex[0]].cityList;
        for (let j = 0; j < cityList.length; j++) {
            multiArray[1].push(cityList[j].name);
            if (cityList[j].id === 510100) {
                multiIndex[1] = j;
                multiArray[2].push(...cityList[j].districtList.map((item) => item.name))
            }
        }


        this.setData({
            multiArray,
            multiIndex
        });
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
                data.multiArray[1] = [...citys.cityData[data.multiIndex[0]].cityList.map((item) => item.name)];
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[0].districtList.map((item) => item.name)];
                break;
            case 1:
                data.multiIndex[2] = 0;
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[data.multiIndex[1]].districtList.map((item) => item.name)];
                break
        }
        console.log(data.multiIndex);
        this.setData({
            multiArray: data.multiArray
        })
    },


    getLocationStr: function () {
        let cityList = citys.cityData[this.data.multiIndex[0]].cityList;
        let districtList = cityList.length == 0 ? [] : cityList[this.data.multiIndex[1]].districtList;

        if (this.data.multiIndex[2] == 0 && districtList.length != 0) {
            return ''
        }
        let provence = this.data.multiArray[0][this.data.multiIndex[0]];
        let city = this.data.multiArray[1].length == 0 ? '' : this.data.multiArray[1][this.data.multiIndex[1]];
        let district = this.data.multiArray[2].length == 0 ? '' : this.data.multiArray[2][this.data.multiIndex[2]];
        return `${provence}-${city}-${district}`;
    },


    checkboxChange: function (e) {

        this.setData({
            selectedServiceItems: e.detail.value
        })
    },


    bindSave: function (e) {
        let that = this;

        let locations = this.getLocationStr(),
            offers = this.data.selectedServiceItems.join(',');
        if (!locations) {
            wx.showModal({
                title: '提示',
                content: '请选择正确的辖区',
                showCancel: false
            });
            return
        }
        if(!offers){
            wx.showModal({
                title: '提示',
                content: '请至少选择一个服务项',
                showCancel: false
            });
            return
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
        requestPromise.then(function (res) {
            wx.hideLoading();
            if (res.data.status != 200) {
                wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                });
            } else {
                wx.showModal({
                    title: '提示',
                    content: '提交成功，等待审核',
                    showCancel: false
                });
            }
        })
            .catch(function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提交失败',
                    content: res.msg,
                    showCancel: false
                });
            })

    },

    newApply: function (paramData) {
        return api.fetchRequest('/api/apply/offer'
            , paramData
            , 'POST'
            , 0
            , {'content-type': 'application/x-www-form-urlencoded'}
        )
    },

});
