const api = require('../../utils/request.js');
const defaultSrc = '/images/ico-add-addr.png';
//获取应用实例
Page({
    data: {
        idCardSrc: ['', ''],
        BigExampleSrc: '',
        serverImageNames:['',''],

    },

    onLoad: function (option) {
        let images = option.images;
        if(images){
            let imagesUrlArr = images.split(','); 
            let imagesNameArr = imagesUrlArr.map((v)=>{
                let result = v.match(/([^\.\/\\]+)\.([a-z]+)$/i);
                return result ? result[0]:'';
            }); 
            this.setData({
                idCardSrc: imagesUrlArr,
                serverImageNames: imagesNameArr
            });
        }
    },

    chooseAndSavePic: function (e) {
        let that = this;
        let uploadPic = (type, picSrc) => {
            wx.uploadFile({
                url: api.API_BASE_URL + `/api/upload/img/${type}`,
                filePath: picSrc,
                name: 'file',
                formData: {},
                success: function (res) {
                    let data = res.data;
                    try{
                        data = JSON.parse(res.data);
                    }catch (e) {
                        wx.showToast({
                            title: '图片更新失败，请重新选择',
                            icon: 'none',
                        });
                        return;
                    }
                    if (data.status !== 200) {
                        wx.showToast({
                            title: '图片更新失败，请重新选择',
                            icon: 'none',
                        });
                        return;
                    }

                    let picType = e.currentTarget.dataset.type;
                    let imageName = data.data.fileName;
                    let [idcard_0, idcard_1] = that.data.idCardSrc;
                    let [serverImage_0,serverImage_1] = that.data.serverImageNames;

                    if (picType === 'idcard_0') {
                        that.setData({
                            idCardSrc: [picSrc, idcard_1],
                            serverImageNames:[imageName, serverImage_1]
                        });
                    }
                    if (picType === 'idcard_1') {
                        that.setData({
                            idCardSrc: [idcard_0, picSrc],
                            serverImageNames:[serverImage_0, imageName]
                        });
                    }
                },

                fail: function (err) {

                    wx.showModal({
                        title: '图片更新失败，请重新选择',
                        content:JSON.stringify(err),
                        showCancel:false,
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

    bindSave: function () {
        if(this.data.serverImageNames[0] === ''||this.data.serverImageNames[1] === ''){
            wx.showModal({
                content:'请上传身份证正反面',
                showCancel:false,
            });
            return
        }
        let images = this.data.serverImageNames.join(',');
        api.fetchRequest(`/api/cert/apply/idcard?images=${images}`,{},'PUT')
            .then((res)=>{
                if(res.data.status !== 200){
                    wx.showModal({
                        content:res.msg,
                        showCancel:false,
                    });

                    return
                }
                wx.showModal({
                    title:'提示信息',
                    content:'上传完成,等待认证',
                    showCancel:false,
                    success(res) {
                        wx.navigateBack();
                    }
                })
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

});
