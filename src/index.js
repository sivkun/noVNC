import * as WebUtil from '../app/webutil.js';
// import RFB from '../core/rfb.js';
import Pagination from './pagination';
import RFBCustom from './RfbCustom';
import Promise from 'promise-polyfill';
import 'whatwg-fetch';
// To add to window
if (!window.Promise) {
    window.Promise = Promise;
}
//  WebUtil.init_logging(WebUtil.getConfigVar('logging', 'info')); //设置日志记录方式 debug,info等
// console.log(new RFBCustom())

/**
 * 1.网络请求数据
 * 2.根据数据生成RFBcustom对象
 * 3.显示虚拟机信息
 * 4.放大操作
 * 5.翻页操作
 */
const UI = {
    zoomCanvasCtnr: 'zoomCanvasCtnr',
    zoomCanvas: 'zoomCanvas',
    zoomClose: 'zoomClose',
    btnFocus: 'btnFocus',
    btnZoom: 'btnZoom',
    canvasCtnr: 'canvasCtnr',
    noVNC_canvas: 'noVNC_canvas',
    ctrlAltDel: 'ctrlAltDel',
    numPerPage: 4,
    rfbInfos: [],
    rfbArr: [],
    zoomRfb: null,
    pagination: Object.create(Pagination),
    init: function (param) {
        this.rfbArr.length = 4;
        if (param && Object.prototype.toString.call(param) !== '[object Object]') {
            throw new error('初始化参数为对象格式');
        }
        Object.assign(this, param);
        this.createCanvasModal();
        var param = {
            curPage: 1,
            perPage: 4,
            pageCtnr: 'pageCtnr',
            callback: this.createPageContent.bind(this)
        }
        this.pagination.init(param);
        this.pagination.turnPage(null, 1);
    },
    /**
     * 生成一个虚拟机面板
     * @param id 虚拟机面板id，用于控制面板
     */
    createPanel: function (id) {
        let vminfo = "id:" + this.rfbInfos[id]['id'] + "   name:" + this.rfbInfos[id]['name'];
        var panel = [];
        panel.push("<div class='panel panel-default' id='panel" + id + "' style='width:48.5%;float:left;margin-left:1%;margin-bottom:4px'>");
        panel.push("<div class='panel-heading' style='padding:1px'>");
        // panel.push("<div class='btn-group btn-group-sm' style='margin:0' role='group' aria-label='...'>");
        panel.push("&nbsp;<button type='button' id='" + this.btnFocus + id + "' class='btn btn-primary  btn-sm'>启用操作</button>")
        panel.push("&nbsp;<button type='button' id='" + this.btnZoom + id + "'class='btn btn-primary  btn-sm'>放大</button>")
        //  panel.push("<span>" + this.rfbInfos[id]['name'] + "</span>");
        panel.push('&nbsp;<a tabindex="0" role="button" class="btn btn-primary  btn-sm" ');
        panel.push(' data-toggle="popover"  data-trigger="focus" data-placement="bottom" ');
        panel.push(' data-content="' + vminfo + '"> ');
        panel.push('id:' + this.rfbInfos[id]['id'] + '  VMInfo</a>');
        panel.push("&nbsp;<button type='button' id='" + this.ctrlAltDel + id + "'class='btn btn-primary  btn-sm'>ctrlAltDel</button>")
        // panel.push("<span style='display:inline-block'>&nbsp;&nbsp;id:" + this.rfbInfos[id]['id'] + "</span>");
        panel.push("</div><div class='panel-body' id='" + this.canvasCtnr + id + "' style='width:100%;height: 400px;padding: 0 '>");
        panel.push(" <canvas id='" + this.noVNC_canvas + id + "'>")
        panel.push("Canvas not supported. </canvas>")
        panel.push("</div></div>");
        var dom = document.createElement('div');
        dom.innerHTML = panel.join('');
        return dom;
        //  return panel.join('');
    },
    /**
     * 生成放大的虚拟机视图模态框,如果存在不再生成。
     */
    createCanvasModal: function () {
        if (document.getElementById(this.zoomCanvasCtnr)) {
            //  console.log('zoomCanvasCtnr 存在');
            return;
        }
        var modal = [];
        modal.push('<div id="noVncModal"  class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" data-backdrop="static">');
        modal.push('<div class="modal-dialog modal-lg" role="document" >');
        modal.push(' <div class="modal-content" style="border:1px solid #1E90FF;" >');
        modal.push('<div id="' + this.zoomCanvasCtnr + '" class="modal-body" style="padding: 0 ">');
        modal.push('<canvas id="' + this.zoomCanvas + '"></canvas>');
        modal.push('</div>');
        modal.push(' <div class="modal-footer" style="margin-top:0">');
        modal.push('<button id="' + this.zoomClose + '" type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
        modal.push('</div></div></div></div>');
        //modal.push('');
        var div = document.createElement('div');
        div.innerHTML = modal.join('');
        document.body.appendChild(div);
        var zoomCloseDom = document.getElementById(this.zoomClose);
        zoomCloseDom.addEventListener('click', () => {
            this.zoomRfb.rfb.disconnect();
            $('noVncModal').modal('hide');
        });
    },
    screenSize: function () {
        return {
            w: document.body.clientWidth,
            h: document.body.clientHeight
        }
    },
    showViewByInfo: function (e) {
        this.createCanvasModal();
        var info = e.args;
        this.zoomRfb = new RFBCustom(this.zoomCanvasCtnr, this.zoomCanvas, true);
        this.zoomRfb.connect(info.host, info.port, info.password, info.path);
        this.zoomRfb.rfb.set_view_only(false)
        $('#noVncModal').modal('show');
    },
    setFocusHandler: function (id, rfbs) {
        //console.log(id, rfbs);
        var dom = document.getElementById('btnFocus' + id);
        dom.addEventListener('click', function () {
            rfbs[id].rfb.set_view_only(false);
            for (var i = 0, len = rfbs.length; i < len; i++) {
                // console.log(i, rfbs[i])
                if (i !== id)
                    rfbs[i].rfb.set_view_only(true)
            }
        })
    },
    setZoomHandler: function (id, rfbs) {
        var dom = document.getElementById(this.btnZoom + id);
        dom.addEventListener('click', () => {
            for (var i = 0, len = rfbs.length; i < len; i++) {
                rfbs[i].rfb.set_view_only(true)
            }
            let canvas = document.getElementById(this.zoomCanvas);
            let canvasCtnr = document.getElementById(this.zoomCanvasCtnr);
            let newCanvas = document.createElement('canvas');
            newCanvas.setAttribute("id", this.zoomCanvas);
            canvasCtnr.replaceChild(newCanvas, canvas);
            this.zoomRfb = new RFBCustom(this.zoomCanvasCtnr, this.zoomCanvas, true);
            var info = this.rfbInfos[id];
            this.zoomRfb.connect(info.host, info.port, info.password, info.path);
            this.zoomRfb.rfb.set_view_only(false)
            //  this.zoomRfb.rfb.get_display()._target.style.height = '800px'
            // var size = screenSize();
            // document.getElementById('zoomCanvasCtnr').style = "width:" + size.w * 0.8 + ";height:" + size.h
            $('#noVncModal').modal('show');

        })
    },
    setSendCtrlAltDelHandler: function (id, rfbs) {

        var dom = document.getElementById(this.ctrlAltDel + id);
        dom.addEventListener('click', () => {
            //  console.log('sendCtrlAltDel')
            rfbs[id].rfb.sendCtrlAltDel();
            return false;
        })
    },
    createPageContent: function (pageNum, page) {
        let noVncCtnr = document.getElementById('noVnc-container');
        noVncCtnr.innerHTML = "";
        for (var i = 0; i < this.rfbArr.length; i++) {
            if (this.rfbArr[i]) {
                this.rfbArr[i].rfb.disconnect();
            }
        }
        var that = this;
        this.fetchData(this.numPerPage, pageNum)
            .then(function (VmInfos) {
                that.rfbInfos = VmInfos.info;
                let returnNum = parseInt(VmInfos.returnNum);
                that.rfbArr.length = returnNum;
                page.itemToPage(VmInfos.totalItem)
                for (let i = 0; i < returnNum; i++) {
                    noVncCtnr.appendChild(that.createPanel(i));
                    that.rfbArr[i] = new RFBCustom(that.canvasCtnr + i, 'noVNC_canvas' + i);

                    let info = that.rfbInfos[i];
                    that.rfbArr[i].connect(info.host, info.port, info.password, info.path);

                    that.setFocusHandler(i, that.rfbArr);
                    that.setZoomHandler(i, that.rfbArr);
                    that.setSendCtrlAltDelHandler(i, that.rfbArr);
                }
                page.show();
                //使用到了弹出框popover.js,需要手动初始化。
                $(function () {
                    $('[data-toggle="popover"]').popover()
                })

                //return json;
                // console.log('parsed json', json)
                // page.itemToPage(json.totalItem);
                // //一般来说数据总条数不会发生很大的波动，如果发生波动，实时修改页码显示，如果当前页大于了总页数，应当获取最后一页的数据
                // page.show();
            })

    },
    fetchData: function (numPerPage, pageNum) {
      
        let url = "show_vmView.php?action=vmViewInfo&numPerPage=" + numPerPage + "&pageNum=" + pageNum;
        return fetch(url)
            .then(function (response) {
                return response.json();
            })

        // return fetch('/data.json')
        //     .then(function (response) {
        //         return response.json()
        //     })
        // .then(function(json) {
        //     return json;
        //     console.log('parsed json', json)
        //     page.itemToPage(json.totalItem);
        //     //一般来说数据总条数不会发生很大的波动，如果发生波动，实时修改页码显示，如果当前页大于了总页数，应当获取最后一页的数据
        //     page.show();
        // }).catch(function(ex) {
        //     console.log('parsing failed', ex)
        // })
    }
}


const vmView = document.getElementById('vmView');
vmView.addEventListener('click', () => {
    var tmp = ['<div id="noVnc-container"></div>'];
    tmp.push('<div id="pageCtnr" style="clear:both;text-align: center"></div><div style="height:200px;"></div>');
    document.getElementById("replace").innerHTML = tmp.join('');
    UI.init();
});
var showViewByInfo = UI.showViewByInfo.bind(UI)
Observer.register("openNoVncByInfo", showViewByInfo);
//  Observer.unregister("openNoVncByInfo", showViewByInfo);

export default UI;

