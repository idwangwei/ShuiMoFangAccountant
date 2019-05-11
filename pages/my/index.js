const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');

Page({
    data: {
        serviceItems: [],
        empSummary: null,
        username: '', //电话号码
        name: '', //用户姓名,
        userInfo: {},
    },

    onLoad() {},

    onShow() {
        let that = this;
        let userInfo = app.globalData.userInfo;
        this.fetchData();
        if (!userInfo.avatarUrl) {
            wx.navigateTo({
                url: "/pages/start/start"
            })
        } else {
            that.setData({
                userInfo: userInfo
            })
        }
    },

        /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

    toApplyPage: function (e) {
        wx.navigateTo({url: "/pages/service-apply/index"})
    },

    toGoldExchange: function (e) {
        wx.navigateTo({url: `/pages/score-exchange/index?creditRemain=${this.data.empSummary.creditRemain}`})
        // wx.navigateTo({url: `/pages/score-exchange/index?creditRemain=${110}`})

    },

    toGoldExchangeRule: function (e) {
        wx.navigateTo({url: "/pages/score-rule/index"})

    },

    toGoldExchangeDetail: function (e) {
        wx.navigateTo({url: `/pages/score-record/index?creditRemain=${this.data.empSummary.creditRemain}`})

    },

    gotoOrderList: function (e) {
        let type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/order-list/index?type=${type}`
        })
    },

    toShareRecord: function (e) {
        wx.navigateTo({url: "/pages/share-record/index"})

    },

    toShareRule: function (e) {
        wx.navigateTo({url: "/pages/share-rule/index"})
    },

    toSharePoster: function (e) {
        wx.navigateTo({url: "/pages/share-poster/index"})

    },

    onPullDownRefresh: function () {
        this.fetchData();

    },

    fetchData: function (e) {
        let that = this;
        wx.showLoading();
        api.fetchRequest(`/api/my/employee`, {}, 'GET')
            .then(function (res) {
                wx.hideLoading();
                that.setData({
                    serviceItems: res.data.data.serviceOfferRanges,
                    empSummary: res.data.data.ecSummary,
                    orderSummary: res.data.data.orderSummary,
                    name: res.data.data.name,
                    username: res.data.data.username,
                })
            })
            .catch(() => {
                wx.hideLoading();
            })
            .finally(() => {
                wx.stopPullDownRefresh();
            })
    },


    cancelServiceItem:function(e){
        let item = e.currentTarget.dataset.item;
        let idx = e.currentTarget.dataset.idx;
        wx.showLoading();
        api.fetchRequest(`/api/apply/offer?location=${encodeURIComponent(item.location)}&prodCatalogId=${item.catalogId}`, {}, 'DELETE')
            .then((res)=> {
                this.data.serviceItems.splice(idx,1);
                this.setData({
                    serviceItems:this.data.serviceItems 
                })
            })
            .finally(() => {
                wx.hideLoading();
            })
    },


});
