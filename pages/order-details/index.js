var app = getApp();
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
            items: [
                {
                    desc: '第1-3月',
                    serverItems: [
                        {desc: '第1-3月记账', status: 2, range: 3},
                        {desc: '第1-3月个税申报', status: 2, range: 3},
                        {desc: '第1-3月附加税申报', status: 2, range: 3},
                        {desc: '第1-3月增值税申报', status: 2, range: 3},
                        {desc: '第1-3月企业所得税申报', status: 2, range: 3},
                        {desc: '工商年报', status: 0, range: 1},
                        {desc: '企业所得税年报', status: 0, range: 1},
                    ],

                },{
                    desc: '第4-6月',
                    serverItems: [
                        {desc: '第4-6月记账', status: 0, range: 3},
                        {desc: '第4-6月个税申报', status: 0, range: 3},
                        {desc: '第4-6月附加税申报', status: 0, range: 3},
                        {desc: '第4-6月增值税申报', status: 0, range: 3},
                        {desc: '第4-6月企业所得税申报', status: 0, range: 3},
                        {desc: '工商年报', status: 0, range: 1},
                        {desc: '企业所得税年报', status: 0, range: 1},
                    ],

                },{
                    desc: '第7-9月',
                    serverItems: [
                        {desc: '第7-9月记账', status: 0, range: 3},
                        {desc: '第7-9月个税申报', status: 0, range: 3},
                        {desc: '第7-9月附加税申报', status: 0, range: 3},
                        {desc: '第7-9月增值税申报', status: 0, range: 3},
                        {desc: '第7-9月企业所得税申报', status: 0, range: 3},
                        {desc: '工商年报', status: 0, range: 1},
                        {desc: '企业所得税年报', status: 0, range: 1},
                    ],

                },{
                    desc: '第10-12月',
                    serverItems: [
                        {desc: '第10-12月记账', status: 0, range: 3},
                        {desc: '第10-12月个税申报', status: 0, range: 3},
                        {desc: '第10-12月附加税申报', status: 0, range: 3},
                        {desc: '第10-12月增值税申报', status: 0, range: 3},
                        {desc: '第10-12月企业所得税申报', status: 0, range: 3},
                        {desc: '工商年报', status: 0, range: 1},
                        {desc: '企业所得税年报', status: 0, range: 1},
                    ],

                },

            ],
            /*items:[{
                desc: '第1-3月',
                serverItems: [
                    {desc: '第1-3月记账', status: 2, range: 3},
                    {desc: '第1-3月个税申报', status: 2, range: 3},
                    {desc: '第1-3月附加税申报', status: 2, range: 3},
                    {desc: '第1-3月增值税申报', status: 2, range: 3},
                    {desc: '第1-3月企业所得税申报', status: 2, range: 3},
                    {desc: '工商年报', status: 0, range: 1},
                    {desc: '企业所得税年报', status: 0, range: 1},
                ],
            }]*/
        },
    },
    onLoad: function () {
        let activeIndex = this.data.activeIndex;
        let tabs = this.data.orderDetail.items;
        let sliderWidth = app.globalData.screenWidth / tabs.length;// 需要设置slider的宽度，用于计算中间位置
        this.setData({

            sliderLeft: (app.globalData.screenWidth / tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / tabs.length * activeIndex,
            sliderWidth: 2 * sliderWidth,
        });


        //获取订单服务详情
        api.fetchRequest('/api/order/details')
            .then((res) => {

            })
            .catch((res) => {

            })
    },
    tabClick: function (e) {

        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });

    },
    sliderChange:function (e) {
        let idx = e.target.dataset.idx;
        let orderDetail = this.data.orderDetail;
        orderDetail.items[this.data.activeIndex].serverItems[idx].status = e.detail.value;
        this.setData({
            orderDetail
        })
    }
});