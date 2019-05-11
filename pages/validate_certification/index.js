const api = require('../../utils/request.js');
const defaultSrc = '/images/ico-add-addr.png';
import {debounce} from '../../utils/util.js';
//获取应用实例
const app = getApp();
Page({
    data: {
        certificateArr: [],
        serverImageNames:[],
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
                certificateArr: imagesUrlArr,
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
                    let data = null;
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

                    let dataIdx = e.currentTarget.dataset.idx;
                    let imageName = data.data.fileName;
                    let arr = that.data.certificateArr;
                    let serverImages = that.data.serverImageNames;
                    if (dataIdx !== undefined) {
                        arr.splice(dataIdx, 1, picSrc);
                        serverImages.splice(dataIdx, 1, imageName);

                    } else {
                        arr.push(picSrc);
                        serverImages.push(imageName);
                    }
                    that.setData({
                        certificateArr: arr,
                        serverImageNames: serverImages
                    });


                },
                fail: function (err) {
                    wx.showToast({
                        title: '图片更新失败，请重新选择',
                        icon: 'none'
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
                uploadPic(type, picSrc);
            }
        })
    },

    bindSave: debounce(function () {
        if(this.data.serverImageNames.length === 0){
            wx.showModal({
                content:'请上传会计师从业资格证',
                showCancel:false,
            });

            return
        }
        let images = this.data.serverImageNames.join(',');
        wx.showLoading({
            title: '上传中',
            mask: true
        })
        api.fetchRequest(`/api/cert/apply/certificate?images=${images}`,{},'PUT')
            .then((res)=>{
                wx.hideLoading();
                wx.showModal({
                    title:'提示信息',
                    content:'上传完成，等待认证',
                    showCancel:false,
                    success(res) {
                        wx.navigateBack();
                    }
                })
            })
    }),

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },


});
