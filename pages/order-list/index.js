const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();
Page({
    data: {
        orderList: [[], [], []],
        canLoadMore: [true, true, true],
        queryLimit: 10,
        queryPageNum: [1, 1, 1],
        tabs: [
            {
                id: 0,
                desc: '待确认',
                code: 'SERVE_WAIT',
                img: '../../images/my/daiqueren.png'
            },
            {
                id: 1,
                desc: '服务中',
                code: 'SERVING',
                img: '../../images/my/fuwuzhong.png'
            },
            {
                id: 2,
                desc: '已完成',
                code: 'DONE',
                img: '../../images/my/yiwancheng.png'
            },
        ],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 35
    },
    orderDetail: function (e) {
        let index = e.currentTarget.dataset.index;
        app.globalData.selectOrderInfo = this.data.orderList[this.data.activeIndex][index];
        // if(e.currentTarget.dataset.status !== 'SERVING'){
        //     return
        // }

        wx.navigateTo({
            url: "/pages/order-details/index"
        })
    },

    orderReceive: function (e) {
        let contentStr = e.target.dataset.isReceive === '1' ? '受理该订单？' : '连续忽略3次，账号将被禁用';
        let param = e.target.dataset.isReceive === '1' ? 'ACCEPT' : 'REFUSE';
        let orderId = e.target.dataset.orderId;
        let that = this;
        wx.showModal({
            title: '订单确认',
            content: contentStr,
            cancelText: '取消',
            confirmText: '确认',
            success(res) {
                if (!res.confirm) {
                    return
                }
                api.fetchRequest(`/api/order/distribute/${orderId}/confirm?status=${param}`, {}, 'PUT')
                    .then((res) => {
                        if (res.data.status !== 200) {
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                showCancel: false,
                            });
                            return
                        }
                        wx.showToast({
                            title: '处理成功',
                            icon: 'none'
                        });
                        that.fetchOrderList();
                    })
            }

        });
    },

    onLoad: function (options) {
        let sliderWidth = 35; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : 0;
        if(options.type === ''){
            this.setData({
                sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
                sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
                activeIndex,
                sliderWidth
            });
        }else{
            this.data.tabs = this.data.tabs.splice(activeIndex,1);
            this.setData({
                tabs:this.data.tabs,
                sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
                sliderOffset: 0,
                activeIndex,
                sliderWidth
            });
        }

        this.fetchOrderList(activeIndex);
    },

    fetchOrderList: function () {
        let that = this;
        let status = this.data.tabs.length>1 ? this.data.tabs[this.data.activeIndex].code:this.data.tabs[0].code;
        // 生命周期函数--监听页面初次渲染完成
        api.fetchRequest(
            `/api/order/serve/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum[this.data.activeIndex],
                status
            }
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                });
                return;
            }
            res.data.data.results.forEach((item) => {
                let season = item.order2Appliable;
                let checkApplyInfo = {
                    season: '',
                    title: '',
                    idx: 4,
                };
                if (item.creditStrategy === 'NONE') {
                    for (let prop in season) {
                        if (season[prop].checkStatus === 'CHECKED' && season[prop].credit > 0) {
                            item.canGetCredit = true;
                            item.creditApplyKey = season[prop].creditId;
                        }
                    }
                } else {
                    for (let prop in season) {
                        if (season[prop].checkStatus === 'CHECKED' && season[prop].credit > 0) {
                            item.canGetCredit = true;
                            item.creditApplyKey = season[prop].creditId;
                        }
                        if (season[prop].checkStatus !== 'CHECKED') {
                            let idx = prop.match(/\d$/)[0];
                            if (idx <= checkApplyInfo.idx) {
                                checkApplyInfo.season = prop;
                                checkApplyInfo.idx = idx;
                                checkApplyInfo.title = `第${idx}季度`;
                            }
                        }
                    }
                    item.checkApplyInfo = checkApplyInfo;
                }
            });

            let orderList = this.data.orderList;
            let canLoadMore = this.data.canLoadMore;
            orderList[this.data.activeIndex] = res.data.data.results;
            if (res.data.data.lastPage) {
                canLoadMore[this.data.activeIndex] = false;
            }
            that.setData({
                orderList,
                canLoadMore
            });
            wx.stopPullDownRefresh();
        })
    },

    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        let queryPageNum = this.data.queryPageNum;
        queryPageNum[this.data.activeIndex] = 1;
        this.setData({
            queryPageNum
        });
        this.fetchOrderList()
    },

    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        console.log(1)

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

    tabClick: function (e) {
        let activeIndex = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex
        });
        if (this.data.orderList[activeIndex].length === 0 && this.data.canLoadMore[activeIndex]) {
            this.fetchOrderList();
        }
    },

    applyCheck: function (e) {
        let serveStatus = e.currentTarget.dataset.serveStatus,
            orderId = e.currentTarget.dataset.orderId,
            checkStatus = e.currentTarget.dataset.checkStatus,
            creditStrategy = e.currentTarget.dataset.creditStrategy,
            season = e.currentTarget.dataset.season,
            title = e.currentTarget.dataset.title,
            that = this;
        if (serveStatus !== 'SERVING' || (checkStatus !== 'NOTSET' && checkStatus !== 'REFUSE')) {
            return
        }


        let contentStr = '填写必要的服务信息，否则校验申请不能通过，订单已完成，申请管理员校验，校验成功可领取积分奖励',
            param = creditStrategy;
        if (creditStrategy !== 'NONE') {
            contentStr = `填写必要的服务信息，否则校验申请不能通过，该订单为季度支付，确认申请${title}的校验？`;
            param = season;
        }

        wx.showModal({
            title: '申请订单校验',
            content: contentStr,
            confirmText: '去申请',
            success(res) {
                if (res.confirm) {
                    api.fetchRequest(`/api/order/check/apply/${orderId}`, {season: param}, 'POST')
                        .then((res) => {
                            if (res.data.status === 200) {
                                wx.showModal({
                                    content: '申请成功',
                                    showCancel: false
                                });
                                that.fetchOrderList();
                            }
                        })
                        .catch((res) => {
                            wx.showModal({
                                title: '申请失败',
                                content: res.errMsg,
                                showCancel: false
                            })
                        })
                        .finally(() => {
                        })
                }
            }
        });


    },

    applyCredit: function (e) {
        let serveStatus = e.currentTarget.dataset.serveStatus,
            orderId = e.currentTarget.dataset.orderId,
            checkStatus = e.currentTarget.dataset.checkStatus,
            creditApplyKey = e.currentTarget.dataset.creditApplyKey,
            that = this;
        wx.showModal({
            title: '领取',
            content: '领取订单积分奖励',
            confirmText: '去领取',
            success(res) {
                if (res.confirm) {
                    api.fetchRequest(`/api/credit/${creditApplyKey}/confirm/`, {}, 'PUT')
                        .then((res) => {
                            if (res.data.status === 200) {
                                wx.showModal({
                                    content: '领取成功',
                                    showCancel: false
                                });
                                that.fetchOrderList();
                            }
                        })
                        .catch((res) => {
                            wx.showModal({
                                title: '领取失败',
                                content: res.errMsg,
                                showCancel: false
                            })
                        })
                        .finally(() => {
                        })
                }
            }
        });
    },


});
