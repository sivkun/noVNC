import RFB from '../core/rfb.js';
import * as WebUtil from '../app/webutil.js';
const RFBCustom = function(container, target, autoScale) {
    this.container = document.getElementById(container);
    this.target = document.getElementById(target);
    this.autoScale = autoScale;
    try {
        this.rfb = new RFB({
            'target': this.target,
            'encrypt': WebUtil.getConfigVar('encrypt',
                (window.location.protocol === "https:")),
            'true_color': WebUtil.getConfigVar('true_color', true),
            'local_cursor': WebUtil.getConfigVar('cursor', true),
            'view_only': WebUtil.getConfigVar('view_only', true),
            'onUpdateState': this.updateState.bind(this),
        });
    } catch (exc) {
        console.log('RFBCustom', exc);
        return; // don't continue trying to connect
    }
    this.connect = function(host, port, password, path) {
        this.rfb.connect(host, port, password, path);
    }
}
RFBCustom.prototype.updateState = function updateState(rfb, state, oldstate) {
    switch (state) {
        case 'connecting':
            // status("Connecting", "normal");
            break;
        case 'connected': //建立连接后的回调
            var display = this.rfb.get_display();
            //   display.viewportChangeSize(this.container.clientWidth, this.container.clientHeight);
            // setTimeout(() => console.log(this.container, window.getComputedStyle(document.getElementById('noVncModal'), null).width, this.container.clientHeight), 500);
            // console.log(this.container, window.getComputedStyle(document.getElementById('noVncModal'), null).width, this.container.clientHeight)

            if (!this.autoScale) {
                display.autoscale(this.container.clientWidth, this.container.clientHeight, false); //链接后
                display._target.style.height = '400px'
                display._target.style.width = '100%'
            } else {
                setTimeout(() => display.autoscale(this.container.clientWidth, 10000, false), 150) //模态框显示有动画
            }
            window.addEventListener('resize', function() {
                    if (!this.autoScale) {
                        display.autoscale(this.container.clientWidth, this.container.clientHeight, false);
                        display._target.style.height = '400px'
                        display._target.style.width = '100%'
                    } else {
                        display.autoscale(this.container.clientWidth, 10000, false);
                    }
                }.bind(this))
                // display.resize(this.container.clientWidth, this.container.ClientHeight) //
                //  console.log('test4:' + display.get_width(), display.get_height(), display._target.style.width)
                // if (rfb && rfb.get_encrypt()) {
                //     status("Connected (encrypted) to " +
                //         desktopName, "normal");
                // } else {
                //     status("Connected (unencrypted) to " +
                //         desktopName, "normal");
                // }
            break;
        case 'disconnecting':
            //  status("Disconnecting", "normal");
            break;
        case 'disconnected':
            //  status("Disconnected", "normal");
            break;
        default:
            //  status(state, "warn");
            break;
    }

    // if (state === 'connected') {
    //    cad.disabled = false;
    // } else {
    //     cad.disabled = true;
    //     xvpInit(0);
    // }

}
export default RFBCustom;