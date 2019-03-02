const app = getApp();
const api = require('../../utils/request.js');

Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 75,
        orderCurrentStatusIndex: 0,

        orderDetail: {
            id: 2,
            prodName: '小规模报税（三月版）',
            location: '四川省-成都市-锦江区',
            status: 'SERVING',
            prodImageUri: '/images/goods-default-summary-pic.png',
            items: [],
        },
    },

    onLoad: function () {
        let orderDetail = app.globalData.selectOrderInfo;

        //获取订单服务详情
        api.fetchRequest(`/api/order/task/${orderDetail.id}`)
            .then((res) => {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none'
                    });
                    return;
                }
                orderDetail.items = res.data.data;
                this.setData({
                    orderDetail
                })
            })

            .catch((res) => {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                })
            })
    },

    sliderChange: function (e) {
        let idx = e.target.dataset.idx;
        let orderDetail = this.data.orderDetail;
        orderDetail.items[idx].progress = e.detail.value;
        this.setData({
            orderDetail
        })
    },

    clickItem: function (e) {
        let orderDetail = this.data.orderDetail;
        let idx = e.currentTarget.dataset.idx;
        let serverItem = orderDetail.items[idx];
        let that = this;
        if(serverItem.status == 'NOTSET'){
            wx.showModal({
                title:`确定添加【${serverItem.prodTaskName}】`,
                success:(res)=>{
                    if(res.confirm){
                        that.addOrderTask(e);
                    }
                }
            });
            return
        }
        serverItem.clicked = !serverItem.clicked;
        this.setData({
            orderDetail
        })
    },

    remarkChange:function(e){
        let idx = e.target.dataset.idx;
        let orderDetail = this.data.orderDetail;
        orderDetail.items[idx].remark = e.detail.value;
        this.setData({
            orderDetail
        })
    },

    updateOrderTask: function (e) {
        let orderId = this.data.orderDetail.id;
        let orderTask = this.data.orderDetail.items[e.target.dataset.idx];
        let orderTaskJson = encodeURIComponent(JSON.stringify(orderTask));

        let query = `?orderTaskJson=${orderTaskJson}`;
        api.fetchRequest(`/api/order/task/${orderId}/${orderTask.id}${query}`, {}, "PUT")
            .then((res) => {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none'
                    });
                    return;
                }
                wx.showToast({
                    title: '进度更新成功',
                    icon: 'none'
                });
            })
            .catch(() => {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                });

            })
    },

    addOrderTask:function(e){
        let orderDetail = this.data.orderDetail;
        let orderId = orderDetail.id;
        let orderTask = orderDetail.items[e.currentTarget.dataset.idx];
        let that = this;
        api.fetchRequest(`/api/order/task/${orderId}?prodTaskId=${orderTask.prodTaskId}`, {}, "POST")
            .then((res) => {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none'
                    });
                    return;
                }
                orderTask.id = res.data;
                orderTask.status = 'DOING';

                that.setData({
                    orderDetail
                });
                wx.showToast({
                    title: '新增成功',
                    icon: 'none'
                });
            })
            .catch(() => {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                });
            })

    },

    orderTaskDone:function (e) {
        
    },

    getOrderScore:function (e) {

    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }

});