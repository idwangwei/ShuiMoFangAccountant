//index.js
// const api = require('../../utils/request.js');

//获取应用实例
const app = getApp();
Page({
    data: {
        goodsInfo: {
            name: '公司注册',
            cusCreditDesc: 50 //客户分享积分奖励
        },
        goodsDetail: [{}], //商品详情
        selectIdx: 0,
        hideShopPopup: true,
        canSubmit: false, //是否可以下单
    },

    onLoad: function(e) {
        let info = getApp().globalData.selectGoodsInfo.prodVariants;
        this.setData({
            goodsDetail: info
        });
    },
    /**
     * 弹出下单确认框
     */
    bindGuiGeTap: function() {
        wx.switchTab({
            url: '/pages/my/index'
        });
    },
    /**
     * 隐藏下单确认框
     */
    closePopupTap: function() {
        this.setData({
            hideShopPopup: true
        });
    },

    onShareAppMessage: function() {
        return getApp().shareMessage({
            title: this.data.goodsDetail.name,
            path:
                '/pages/start/start?goodsId=' +
                this.data.goodsDetail.id +
                '&shareUserId=' +
                app.globalData.userInfo.openId
        });
    },

    makePhoneCall: function(e) {
        wx.makePhoneCall({
            phoneNumber: '02886198523',
            success: function(res) {
                console.log('成功拨打电话');
            }
        });
    },
    selectService: function(e) {
        let target = e.target;
        if(target.dataset.index === undefined){
            return
        }
        this.setData({
            selectIdx: target.dataset.index
        });
    }
});
