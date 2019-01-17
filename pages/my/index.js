const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
Page({
    data: {
        scoreNumber: 0,
        serviceItems: []
    },
    onLoad() {
        let that = this;
        wx.showLoading();
        api.fetchRequest(`/api/service/offer/${app.globalData.userInfo.id}`)
            .then(function (res) {
                wx.hideLoading();
                that.setData({
                    serviceItems: res.data.data,
                })
            })
            .catch(()=>{
                wx.hideLoading();
            })

    },
    onShow() {
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.navigateTo({
                url: "/pages/start/start"
            })
        } else {
            that.setData({
                userInfo: userInfo,
                version: CONFIG.version
            })
        }
    },

    toApplyPage: function (e) {
        wx.navigateTo({url: "/pages/address-add/index"})
    },


})