const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
Page({
    data: {
        userInfo:{},
        scoreNumber:0,
    },
    onLoad() {

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
        wx.navigateTo({url:"/pages/address-add/index"})
    },




})