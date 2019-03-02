const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');

Page({
    data: {
        serviceItems: [],
        empSummary:null,
        username:'', //电话号码
        name:'', //用户姓名,
        userInfo:{},
    },

    onLoad() {
        this.fetchData();
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
        this.fetchData();

    },

    fetchData:function(e){
        let that = this;
        wx.showLoading();
        api.fetchRequest(`/api/my/employee`,{},'GET')
            .then(function (res) {
                wx.hideLoading();
                that.setData({
                    serviceItems: res.data.data.serviceOfferRanges,
                    empSummary:res.data.data.empSummary,
                    name:res.data.data.name,
                    username:res.data.data.username,
                })
            })
            .catch(()=>{
                wx.hideLoading();
            })
            .finally(()=>{
                wx.stopPullDownRefresh();
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    }
});