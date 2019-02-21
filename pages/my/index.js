const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');

Page({
    data: {
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
        wx.navigateTo({url: "/pages/service-apply/index"})
    },

    toGoldExchange:function(e){
        wx.navigateTo({url: "/pages/score-exchange/index"})

    },

    toGoldExchangeRule:function (e) {
        wx.navigateTo({url: "/pages/score-rule/index"})

    },

    toGoldExchangeDetail:function (e) {
        wx.navigateTo({url: "/pages/score-record/index"})

    },

    gotoOrderList:function (e) {
        let type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url:`/pages/order-list/index?type=${type}`
        })
    },

    toShareRecord:function (e) {
        wx.navigateTo({url: "/pages/share-record/index"})

    },

    toShareRule:function (e) {
        wx.navigateTo({url: "/pages/share-rule/index"})
    },

    toSharePoster:function (e) {
        wx.navigateTo({url: "/pages/share-poster/index"})

    },

    onPullDownRefresh:function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});