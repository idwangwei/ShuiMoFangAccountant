const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();
Page({
    data: {
        orderList: [],
        queryLimit: 1000,
        queryPageNum: 1,
        tabs: [
            {
                id: 0,
                desc: '全部',
                code: 'ALL'
            },
            {
                id: 1,
                desc: '服务中',
                code: 'SERVING'
            },
            {
                id: 2,
                desc: '已完成',
                code: 'DONE'
            },
        ],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0
    },
    orderDetail: function (e) {
        let index = e.currentTarget.dataset.index;
        app.globalData.selectOrderInfo = this.data.orderList[this.data.activeIndex][index];
        if(e.currentTarget.dataset.status === 'WAIT'){
            wx.showModal({
                title:'订单确认',
                content:'受理改订单？',
                cancelText:'拒绝',
                confirmText:'受理',
                success(res) {
                    let param = 'REFUSE';

                    if(res.confirm){
                        param = 'ACCEPT ';
                    }
                    api.fetchRequest(`/api/order/distribute/${app.globalData.selectOrderInfo.id}/confirm?status=${param}`,{},'PUT')
                        .then((res)=>{
                            if(res.data.status !== 200){
                                wx.showModal({
                                    title:'提示',
                                    content:res.data.msg,
                                    showCancel:false,
                                });
                                return
                            }
                            wx.showToast({
                                title:'受理成功',
                                icon:'none'
                            });
                            this.fetchOrderList();
                        })
                        .catch((res)=>{
                            wx.showModal({
                                title:'提示',
                                content:res.msg,
                                showCancel:false,
                            });
                        });
                }

            });
            return
        }



        wx.navigateTo({
            url: "/pages/order-details/index"
        })
    },

    onLoad: function (options) {
        let sliderWidth = app.globalData.screenWidth / this.data.tabs.length; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : 0;
        let that = this;
        that.setData({
            sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
            activeIndex
        });

        this.fetchOrderList(activeIndex);
    },

    fetchOrderList:function(activeIndex){
        let that = this;
        // 生命周期函数--监听页面初次渲染完成
        api.fetchRequest(
            `/api/order/serve/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum,
                // status: this.data.tabs.find((item)=>item.id == activeIndex).code
                status: 'ALL'
            }
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                });
                return;
            }

            let all = res.data.data.results;
            let serving = all.filter(item=>item.serveStatus === 'SERVING');
            let done = all.filter(item=>item.serveStatus === 'DONE');
            that.setData({
                orderList: [all,serving,done]
            })
        }).catch(() => {

        })
    },

    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        this.setData({
            queryPageNum:1
        });
        this.fetchOrderList(this.data.activeIndex)
    },

    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        console.log(1)

    },

    tabClick: function (e) {
        let activeIndex = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex
        });
        // this.fetchOrderList(activeIndex);

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});