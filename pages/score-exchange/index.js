var wxpay = require('../../utils/pay.js');
var app = getApp();
const api = require('../../utils/request.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {score: 300},
        exchangeNum: '',
        exchangeDisabled:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    bindCancel: function () {
        wx.navigateBack({})
    },
    bindSave: function (e) {
        if(this.data.exchangeDisabled){return}
        let that = this;
        this.setData({
            exchangeDisabled:true
        });
        api.fetchRequest('/api/credit/apply/exchange', {
            creditVal:this.data.exchangeNum,
            exchangeVal :this.data.exchangeNum,
            exchangeType:'MONEY'
        }, 'POST', 0, {'content-type': 'application/x-www-form-urlencoded'})
            .then(function (res) {
                if (res.data.status != 200) {
                    wx.showModal({
                        title: '失败',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
                else {
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
                that.setData({
                    exchangeDisabled:false
                });
            })
            .catch((res)=>{
                wx.showModal({
                    title: '失败',
                    content: res.msg,
                    showCancel: false
                });
                this.setData({
                    exchangeDisabled:false
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
    }


});