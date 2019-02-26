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
        let that = this;
        wx.startPullDownRefresh({
            success: (res) => {

            },
            fail: (res) => {

            },
            complete: (res) => {
                that.fetchData();
            }
        });
    },
    onPullDownRefresh: function () {
        this.fetchData();
    },

    fetchData: function () {
        const that = this;
        that.setData({
            isLoading: true
        });
        api.fetchRequest('/api/credit/summary')
            .then(function (res) {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none'
                    });
                    that.setData({
                        isLoading: false
                    });
                    return
                }

                let summery = {
                    credit: res.data.data.credit,
                    // creditItems: res.data.data.creditItems
                    creditItems: [
                        {
                            msg: '订单奖励',
                            date: '2019-10-22',
                            credit: 200,
                            type: 1
                        },
                        {
                            msg: '积分提现',
                            date: '2019-10-25',
                            credit: 100,
                            type: 0
                        },
                    ]
                };

                that.setData({
                    isLoading: false,
                    summery
                });
            })
            .catch((res) => {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                });
                that.setData({
                    isLoading: false
                });
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});