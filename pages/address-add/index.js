const citys = require('../../utils/city.js');
const api = require('../../utils/request.js');
const defaultSrc = '/images/ico-add-addr.png';
//获取应用实例
const app = getApp();
Page({
    data: {
        multiIndex: [0, 0, 0],
        multiArray: [],
        telNumber: '',
        userName: '',
        codeNumber: '',
        idCardNum: '',
        idCardSrc: ['', ''],
        certificateSrc: '', //资格证图片
        positionalSrc: defaultSrc, //职称图片
        BigExampleSrc: '',
        serviceItems: [], //服务项目
        selectedServiceItems: [], //勾选的服务项目
        serverPicName: {
            idcard: [], //成功保存到服务器的身份证图片名称（正反两张）
            certificate: [], //成功保存到服务器的资格证图片名称
        },
        formDisabled: false,
        btnStr: '申请',
        getCodeBtnDisabled:false,
        applyStatus:'',
        getCodeStr:'获取验证码',
        applyId:''
    },

    onLoad: function (e) {
        wx.showLoading({
            title: '获取最近申请',
            mask: true
        });
        this.initCityData();
        api.fetchRequestAll([
            api.fetchRequest('/api/apply/offer/latest'),
            api.fetchRequest('/api/product/catalogs')
        ])
            .then((res) => {
                wx.hideLoading();
                let applyInfo = res[0].data,
                    serviceItemInfo = res[1].data;
                if (applyInfo.status != 200) {
                    wx.showToast({title: applyInfo.msg});
                    return;
                }
                if (serviceItemInfo.status != 200) {
                    wx.showToast({title: applyInfo.msg});
                    return;
                }

                // "name": "孙悟空",
                // "phone": "18280377867",
                // "idcardImagesStr": "2c2ac0e1-6e39-44d8-8b90-3f64bcbec9cf.jpg,9512a3e8-c767-4588-b7b3-5b8af39fa35c.jpeg",
                // "idNumber": "513877678887878989",
                // "certificateImagesStr": "42bc1272-d132-4f95-8337-45cc300e0ebc.jpg",
                // "locationsStr": "四川省-成都市-锦江区",
                // "offersStr": "1,2,3",
                // "status": "APPLYING"
                let lastApplyInfo = {
                    certificateImages: applyInfo.data.certificateImagesStr.split(','),
                    idNumber: applyInfo.data.idNumber,
                    idcardImages: applyInfo.data.idcardImagesStr.split(','),
                    locations: applyInfo.data.locationsStr.split(','),
                    name: applyInfo.data.name,
                    offers: applyInfo.data.offersStr.split(','),
                    phone: applyInfo.data.phone,
                    status: applyInfo.data.status,
                    applyId:applyInfo.data.applyId
                };

                let {multiIndex, multiArray} = this.parseLocation(lastApplyInfo.locations[0]);
                for (let item of lastApplyInfo.offers) {
                    serviceItemInfo.data.find(obj => obj.id == item).checked = true;
                }

                this.setData({
                    applyId:lastApplyInfo.applyId,
                    serviceItems: serviceItemInfo.data,
                    telNumber: lastApplyInfo.phone,
                    idCardNum: lastApplyInfo.idNumber,
                    userName: lastApplyInfo.name,  //applyInfo.name,
                    serverPicName: {
                        idcard: lastApplyInfo.idcardImages,
                        certificate: lastApplyInfo.certificateImages
                    },
                    selectedServiceItems: lastApplyInfo.offers,  //applyInfo.offersStr.split(','),
                    formDisabled: lastApplyInfo.status == 'APPLYING',  //applyInfo.status
                    applyStatus:lastApplyInfo.status,
                    btnStr:lastApplyInfo.status == 'APPLYING'?'审核中':'修改申请',
                    multiIndex,
                    multiArray,
                });
                if(lastApplyInfo.status == 'REFUSE'){
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    parseLocation: function (locationStr) {
        let multiIndex = [0, 0, 0];
        let multiArray = [[], [], []];
        let locationArr = locationStr.split('-');

        for (let i = 0; i < citys.cityData.length; i++) {
            multiArray[0].push(citys.cityData[i].name);
            if (citys.cityData[i].name === locationArr[0]) {
                multiIndex[0] = i;
            }
        }
        let cityList = citys.cityData[multiIndex[0]].cityList;
        for (let j = 0; j < cityList.length; j++) {
            multiArray[1].push(cityList[j].name);
            if (cityList[j].name === locationArr[1]) {
                multiIndex[1] = j;
            }
        }
        let districtList = citys.cityData[multiIndex[0]].cityList[multiIndex[1]].districtList
        for (let k = 0; k < districtList.length; k++) {
            multiArray[2].push(districtList[k].name);
            if (districtList[k].name === locationArr[2]) {
                multiIndex[2] = k;
            }
        }

        return {multiIndex, multiArray}
    },

    bindSave: function (e) {
        let that = this;
        let linkMan = e.detail.value.linkMan;
        let mobile = e.detail.value.mobile;
        let code = e.detail.value.code;
        let idcard = e.detail.value.idcard;

        if (linkMan == "") {
            wx.showModal({
                title: '提示',
                content: '请填写联系人姓名',
                showCancel: false
            });
            return
        }
        if (!mobile.match(/^1\d{10}$/)) {
            wx.showToast({
                title: '请输入11位有电话号码',
                icon:'none'
            });
            return;
        }
        if (!code.match(/^\d{6}$/)) {
            wx.showToast({
                title: '请输入6位有效验证码',
                icon:'none'
            });
            return;
        }
        if (!idcard.match(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([\d|x|X]{1})$/)){
            wx.showToast({
                title: '请输入有效身份证号',
                icon:'none'
            });
            return;
        }

        let locations = this.getLocationStr();
        if(!locations){
            wx.showModal({
                title:'提示',
                content:'请选择正确的辖区',
                showCancel:false
            });
            return
        }
        wx.showLoading({
            title: '提交申请中',
            mask: true
        });

        let paramData = {
            certificateImages: this.data.serverPicName.certificate.join(','),
            idNumber: idcard,
            idcardImages: this.data.serverPicName.idcard.join(','),
            locations: locations,
            name: linkMan,
            offers: this.data.selectedServiceItems.join(','),
            phone: mobile,
            status: 'APPLYING'
        };
        // let requestPromise = this.data.applyStatus !== 'DONE'?this.newApply(paramData):this.updateApply(paramData,this.data.applyId);
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

    newApply:function(paramData){
        return api.fetchRequest('/api/apply/offer'
            , paramData
            , 'POST'
            , 0
            , {'content-type': 'application/x-www-form-urlencoded'}
            )
    },
    updateApply:function(paramData,applyId){
        let query = "?";
        for(let item in paramData){
            query+=`${item}=${encodeURIComponent(paramData[item])}&`
        }
        return api.fetchRequest(`/api/apply/offer/${applyId}${query}`
            , {}
            , 'PUT'
            // , {'content-type': 'application/x-www-form-urlencoded'}
        )
    },

    getLocationStr:function(){
        let cityList = citys.cityData[this.data.multiIndex[0]].cityList;
        let districtList = cityList.length == 0? []:cityList[this.data.multiIndex[1]].districtList;

        if(this.data.multiIndex[2] == 0 && districtList.length!=0){
            return ''
        }
        let provence = this.data.multiArray[0][this.data.multiIndex[0]];
        let city = this.data.multiArray[1].length ==0 ?'':this.data.multiArray[1][this.data.multiIndex[1]];
        let district = this.data.multiArray[2].length ==0 ?'':this.data.multiArray[2][this.data.multiIndex[2]];
        return `${provence}-${city}-${district}`;
    },
    getPhoneCode: function (e) {
        const that = this;
        if (!this.data.telNumber.match(/1[0-9]{10}$/)) {
            wx.showModal({
                title: '提示',
                content: '请输入正确的手机号码',
                showCancel: false
            });
            return
        }
        if (this.data.getCodeBtnDisabled) {
            return
        }
        this.setData({
            getCodeBtnDisabled: true,
        });
        api.fetchRequest('/api/sms', {
            phone: this.data.telNumber
        }).then(function (res) {
            if (res.data.status == 200) {
                wx.showToast({
                    title: '短信验证码已下发，请查收',
                    icon: 'none',
                    duration: 2000
                });
                let timeLimit = 30;
                let intervalId = setInterval(() => {
                    if (timeLimit <= 0) {
                        clearInterval(intervalId);
                        that.setData({
                            getCodeStr: '获取验证码',
                            getCodeBtnDisabled: false
                        });
                        return
                    }
                    that.setData({
                        getCodeStr: `${timeLimit}s`,
                    });
                    timeLimit--;
                }, 1000);
                return
            }
            wx.showToast({
                title: res.data.msg,
                icon: 'fail',
                duration: 2000
            });
            let timeId = setTimeout(()=>{
                clearTimeout(timeId);
                that.setData({
                    getCodeBtnDisabled: false,
                });

            },2000);
        }).catch((res) => {
            wx.showToast({
                title: res.msg,
                icon:'fail',
                duration: 2000
            });
            let timeId = setTimeout(()=>{
                clearTimeout(timeId);
                that.setData({
                    getCodeBtnDisabled: false,
                });

            },2000);
        })

    },
    bindCodeInput: function (e) {
        this.setData({
            codeNumber: e.detail.value
        })
    },
    validateCode: function (e) {
        return new Promise((resolve, reject) => {
            api.fetchRequest(`/api/sms?captcha=${this.data.codeNumber}&phone=${this.data.telNumber}`, {}, "DELETE")
                .then((res) => {
                    if (res.data.status == 200) {
                        resolve();
                        return
                    }
                    reject();
                    wx.showToast({
                        title: res.data.msg,
                        icon:'none'
                    });
                })
                .catch((res) => {
                    reject();
                    wx.showToast({
                        title: res.msg,
                        icon:'none'
                    });

                })
        });

    },

    setApplyInfo: function () {

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

    chooseAndSavePic: function (e) {
        if (this.data.formDisabled) {
            return
        }
        let that = this;
        let uploadPic = (type, picSrc) => {
            wx.uploadFile({
                url: api.API_BASE_URL + `/api/upload/img/${type}`,
                filePath: picSrc,
                name: 'file',
                formData: {},
                success: function (res) {
                    if(res.status!=200){
                        wx.showToast({
                            title: '图片上传失败，请重试',
                            icon:'none',
                        });
                        return;
                    }
                    let fileName = '';
                    try {
                        fileName = JSON.parse(res.data).data.fileName;
                    } catch (e) {
                        wx.showToast({
                            title: '图片上传失败，请重试',
                            icon:'none',
                        });
                        return
                    }

                    let picType = e.target.dataset.type;
                    let [idcard_0, idcard_1] = that.data.idCardSrc;
                    let serverPicName = that.data.serverPicName;
                    if (picType == 'idcard_0') {
                        serverPicName.idcard[0] = fileName;
                        that.setData({
                            idCardSrc: [picSrc, idcard_1],
                            serverPicName
                        });

                    }
                    if (picType == 'idcard_1') {
                        serverPicName.idcard[1] = fileName;
                        that.setData({
                            idCardSrc: [idcard_0, picSrc],
                            serverPicName

                        });
                    }
                    if (picType == 'certificate') {
                        serverPicName.certificate = [fileName];
                        that.setData({
                            certificateSrc: picSrc,
                            serverPicName
                        });
                    }

                },
                fail: function (err) {
                    wx.showToast({
                        title: '图片上传失败',
                        icon:'none'
                    });
                }
            });
        };
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                let picSrc = res.tempFilePaths[0];
                let type = e.currentTarget.dataset.type;
                if (type.indexOf('idcard') != -1) {
                    type = 'idcard'
                }
                uploadPic(type, picSrc);
            }
        })

    },

    checkboxChange: function (e) {

        this.setData({
            selectedServiceItems: e.detail.value
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
});
