// pages/company/index.js

const app = getApp();
const api = require('../../utils/request.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLoading: true,
        tabs: [
            {
                id: 0,
                desc: '我的推广',
                code: 'ALL'
            },
            {
                id: 1,
                desc: '推广海报',
                code: 'SERVING'
            },
            {
                id: 2,
                desc: '推广规则',
                code: 'DONE'
            }
        ],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        shareData: [
            {popularizedName:'马云', score:10, date:'2019-3-1'},
            {popularizedName:'马化腾', score:20, date:'2019-3-2'},
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let sliderWidth = 50; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : 0;
        let that = this;
        that.setData({
            sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - 50) / 2,
            sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
            activeIndex
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        const that = this;
        that.setData({
            isLoading: true
        });
        api.fetchRequest('/api/popularize', {limit: 100, pageNum: 1, status: 'ENABLE'})
            .then(function (res) {
                if (res.data.status !== 200) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    });
                    return
                }
/*              res.data.data.results = {
                    "date": "string", //邀请时间
                    "id": 0,
                    "popularizeId": 0,
                    "popularizeName": "string",
                    "popularizedId": 0,
                    "popularizedName": "string", //受邀人姓名
                    "status": "string"
                }
*/
                that.setData({
                    shareData: res.data.data.results,
                });
            })
            .finally(() => {
                that.setData({
                    isLoading: false
                });
            })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    tabClick: function (e) {
        let activeIndex = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex
        });
    },
});