var wxpay = require('../../utils/pay.js');
var app = getApp();
const api = require('../../utils/request.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLoading: true,
        summery: {
            credit: '',
            creditItems: []
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {creditItems} = this.data.summery;
        this.setData({
            summery: {credit: options.creditRemain, creditItems}
        });
        this.fetchData();
    },
    onPullDownRefresh: function () {
        this.fetchData();
    },

    fetchData: function () {
        const that = this;
        that.setData({
            isLoading: true
        });
        api.fetchRequest('/api/credit/summary', /*{status: 'DONE'}*/)
            .then(function (res) {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none'
                    });
                    return
                }
                //积分记录项字段
                // {
                //     credit: 10, //积分数量
                //     date:"2019-04-17 12:57:20", //积分变动时间
                //     desc:"E-ORDER-P", // 积分变动描述
                //     period:"NONE", //积分变动操作者
                //     reason:"E-ORDER-P", //
                //     status:"WAIT" //积分状态 WAIT:下发中， PENDING:扣除中， DONE:变动完成
                // }
                let summery = {
                    // credit: res.data.data.credit || 0,
                    credit: that.data.summery.credit,
                    creditItems: res.data.data.creditItems
                };
                that.setData({
                    summery
                });
            })
            .finally(() => {
                that.setData({
                    isLoading: false
                });
                wx.stopPullDownRefresh();
            })
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

});
