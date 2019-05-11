var wxpay = require('../../utils/pay.js');
var app = getApp();
const api = require('../../utils/request.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {score: 0},
        exchangeNum: '',
        exchangeDisabled: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let exchangeDisabled = true;
        if (options.creditRemain > 100) {
            exchangeDisabled = false;
        }
        this.setData({
            userInfo: {
                score: options.creditRemain,
            },
            exchangeDisabled,

        });
    },

    bindCancel: function () {
        wx.navigateBack({})
    },

    bindSave: function (e) {
        if (this.data.exchangeDisabled) {
            return
        }
        if(this.data.exchangeNum < 100 || this.data.exchangeNum%100 !== 0){
            wx.showModal({
                content: '请填入整百的数字',
                showCancel: false
            });
            return
        }
        if(this.data.exchangeNum > this.data.userInfo.score){
            wx.showModal({
                content: '可领取的积分不够',
                showCancel: false
            });
            return
        }

        let that = this;
        this.setData({
            exchangeDisabled: true
        });

        api.fetchRequest('/api/credit/apply/exchange', {
            creditVal: this.data.exchangeNum,
            exchangeVal: this.data.exchangeNum,
            exchangeType: 'MONEY'
        }, 'POST', 0, {'content-type': 'application/x-www-form-urlencoded'})
            .then(function (res) {
                if (res.data.status != 200) {
                    wx.showModal({
                        title: '失败',
                        content: res.data.msg,
                        showCancel: false
                    })
                } else {
                    wx.showModal({
                        title: '成功',
                        content: '审核通过后客服会与你沟通打款账户，当月15号之前会打到你的账户',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                that.bindCancel();
                            }
                        }
                    });
                }
            })
            .catch((res) => {
                wx.showModal({
                    title: '失败',
                    content: res.msg,
                    showCancel: false
                });

            })
            .finally(() => {
                this.setData({
                    exchangeDisabled: false
                });

            })
    },

    bindInput: function (e) {
        this.setData({
            exchangeNum: e.detail.value
        })
    },

    exchangeAll: function () {
        this.setData({
            exchangeNum: this.data.userInfo.score
        })
    },

    showScoreExchangeRule: function () {
        wx.showModal({
            title: '兑换规则',
            content: '积分大于100可提，只能在每月的2至4号提交提现申请，且每月只能提现1次。',
            showCancel: false
        })
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

});
