//index.js
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
const ONLINE = 'ONLINE'; //商品上线
//获取应用实例
Page({
    data: {
        indicatorDots: true, //swiper是否显示面板指示点
        autoplay: true, //swiper是否自动切换
        interval: 3000, //swiper自动切换时间间隔
        duration: 1000, //swiper滑动动画时长
        circular: false, //是否采用衔接滑动
        loadingHidden: false, // loading
        banners: [{
            picUrl: '/images/ad/banner01.png',
            businessId: '1'
        }, {
            picUrl: '/images/ad/banner02.png',
            businessId: '2'
        },
        ],
        userInfo: {},
        categories: [],
        activeCategoryId: 0,
        goods: [],
        searchInput: '',
        curPage: 1,
        pageSize: 20
    },

    toDetailsTap: function (e) {
        getApp().globalData.selectGoodsInfo = this.data.goods[e.currentTarget.dataset.index];
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    tapBanner: function (e) {
        getApp().globalData.selectGoodsInfo = this.data.goods.find(item => item.id == e.currentTarget.dataset.id);
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    onLoad: function () {
        const that = this;
        //根据设备分辨率动态设置swiper高度，以便完全展示长宽比为5*2的banner图片
        this.setData({
            swiperHeight: getApp().globalData.screenWidth * CONFIG.swiperBannerScale
        });
        /**
         * 示例：
         * 调用接口封装方法
         */
    },
    onShow: function () {
        this.getGoodsList();
    },
    getGoodsList: function () {
        const that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        api.fetchRequest('/api/products')
            .then(function (res) {
                if (res.data.status !== 200) {
                    return
                }
                res.data.data.forEach((v)=>{
                    v.isShow = v.status === ONLINE && v.prodVariants && v.prodVariants.length > 0;
                    v.titleImage= v.titleImage ? v.titleImage : '/images/goods-default-summary-pic.png';
                    v.descImage= v.descImage ? v.descImage : '/images/goods-default-details-pic.png';
                });
                that.setData({
                    goods: [...res.data.data],
                });
            })
            .finally(() => {
                wx.hideLoading();
                wx.stopPullDownRefresh();
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },
    listenerSearchInput: function (e) {
        this.setData({
            searchInput: e.detail.value
        })
    },
    toSearch: function (e) {
        let nameLike = e.detail.value;
        let goods = this.data.goods;
        for (let item of goods) {
            item.isShow = item.status === ONLINE && item.name.indexOf(nameLike) !== -1
        }
        this.setData({
            goods
        })
    },
    onReachBottom: function () {
        // this.setData({
        //     curPage: this.data.curPage + 1
        // });
        // this.getGoodsList(this.data.activeCategoryId, true)
    },
    handleContact: function (e) {
        console.log(e.path);
        console.log(e.query)
    },
    makePhoneCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: "02886198523",
            success: function (res) {
                console.log("成功拨打电话")
            }
        })
    },
    showCompanyInfo: function (e) {
        wx.navigateTo({
            url: "/pages/company/index"
        })

    },
    onPullDownRefresh: function (e) {
        this.getGoodsList();
    }

});
