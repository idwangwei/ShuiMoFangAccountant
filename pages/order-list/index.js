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
                desc: '待确认',
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
        if(e.currentTarget.dataset.status !== 'SERVING'){
            return
        }

        wx.navigateTo({
            url: "/pages/order-details/index"
        })
    },

    orderReceive:function(e){
        let contentStr = e.target.dataset.isReceive === '1' ? '受理该订单？':'连续忽略3次，账号将被禁用';
        let param = e.target.dataset.isReceive === '1' ? 'ACCEPT':'REFUSE';
        wx.showModal({
            title:'订单确认',
            content:contentStr,
            cancelText:'取消',
            confirmText:'确认',
            success(res) {
                if(!res.confirm){
                    return
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
                            title:'处理成功',
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
            res.data.data.results.forEach((item)=>{
                if(item.checkStatus === 'NOTSET' && item.serveStatus === 'SERVING'){
                    item.checkStatusDesc = '去申请';
                }
                if(item.checkStatus === 'PENDING'){
                    item.checkStatusDesc = '申请中';
                }
                if(item.checkStatus === 'REFUSE'){
                    item.checkStatusDesc = '去申请';
                }
                if(item.checkStatus === 'DONE'){
                    item.checkStatusDesc = '申请通过';
                    item.creditStatusDesc = '去申请';
                }
            });
            let all = res.data.data.results;
            let wait = all.filter(item=>item.serveStatus === 'WAIT');
            let serving = all.filter(item=>item.serveStatus === 'SERVING');
            let done = all.filter(item=>item.serveStatus === 'DONE');
            that.setData({
                orderList: [wait,serving,done]
            });
            wx.stopPullDownRefresh();
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

    applyCheck:function(e){
        let serveStatus = e.currentTarget.dataset.serveStatus,
            orderId = e.currentTarget.dataset.orderId,
            checkStatus = e.currentTarget.dataset.checkStatus,
            that = this;
        if(serveStatus !== 'SERVING' || (checkStatus !== 'NOTSET'&&checkStatus !== 'REFUSE')){
            return
        }

        wx.showModal({
            title:'申请订单完成校验',
            content:'订单已完成，申请管理员校验，校验成功可获得积分奖励',
            confirmText:'去申请',
            success(res) {
                if(res.confirm){
                    api.fetchRequest(`/api/order/check/apply/${orderId}`,{},'POST')
                        .then((res)=>{
                            if(res.data.status === 200){
                                that.fetchOrderList();
                            }
                        })
                        .catch((res)=>{
                            wx.showModal({
                                title:'申请失败',
                                content:res.errMsg,
                                showCancel:false
                            })
                        })
                        .finally(()=>{})
                }
            }
        });


    },

    applyCredit:function(e){
        let serveStatus = e.currentTarget.dataset.serveStatus,
            orderId = e.currentTarget.dataset.orderId,
            checkStatus = e.currentTarget.dataset.checkStatus,
            that = this;
        if(serveStatus !== 'DONE' || (checkStatus !== 'DONE')){
            return
        }

        wx.showModal({
            title:'申请订单积分奖励',
            content:'订单已完成，申请积分奖励',
            confirmText:'去申请',
            success(res) {
                if(res.confirm){
                    api.fetchRequest(`/api/order/apply/credit/${orderId}`,{},'POST')
                        .then((res)=>{
                            if(res.data.status === 200){
                                that.fetchOrderList();
                            }
                        })
                        .catch((res)=>{
                            wx.showModal({
                                title:'申请失败',
                                content:res.errMsg,
                                showCancel:false
                            })
                        })
                        .finally(()=>{})
                }
            }
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});