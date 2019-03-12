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

    toGoldExchange: function (e) {
        wx.navigateTo({url: "/pages/score-exchange/index"})

    },

    toGoldExchangeRule: function (e) {
        wx.navigateTo({url: "/pages/score-rule/index"})

    },

    toGoldExchangeDetail: function (e) {
        wx.navigateTo({url: "/pages/score-record/index"})

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
                    empSummary: res.data.data.empSummary,
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    },



    reLogin:async function() {  // 确保有用户信息
        await new Promise(resolve => { // ⚠️注意开头有await！！！
            wx.getSetting({
                success: (res) => {        // 如果用户没有授权或者没有必要的用户信息
                    if (!res.authSetting['scope.userInfo'] || !_.isRealTrue(wx.getStorageSync('userInfoRes').userInfo)) {
                        navToLogin(resolve) // 去提示用户点击登录按钮，⚠️注意：并把当前的resolve带过去
                    } else {
                        resolve() // 静默登录
                    }
                }
            })
        });
        return new Promise((resolve) => {
            wx.login({
                success: res => {
                    login(res.code).then((jwt) => {
                        resolve(jwt) // resolve jwt
                    }) // 通过code进行登录
                },
                fail(err) {
                    wx.showToast({
                        title: err.errMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        })
    },
    navToLogin:function (resolve){  /* eslint-disable no-undef */
        const pages = getCurrentPages();
        const page = pages[pages.length - 1];// 当前page
        page.openLoginModal(resolve)// 打开登录按钮弹框，并把当前的resolve带过去
    },

});