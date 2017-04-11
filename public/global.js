var Observer = (function() {
    var listener = {};
    var register = function(type, fn) {
        listener[type] || (listener[type] = []);
        listener[type].push(fn);
    };
    var unregister = function(type, fn) {
        if (!listener[type]) return;
        for (var i = listener[type].length - 1; i >= 0; i--) {
            if (listener[type][i] == fn) {
                listener[type].splice(i, 1);
            }
        }
    }
    var fire = function(type, args) {
        if (!listener[type]) {
            console.log(type + " not regist");
            return;
        }
        var event = {
            type: type,
            args: args
        }
        for (var i in listener[type]) {
            listener[type][i](event);
        }
    };
    return {
        unregister: unregister,
        register: register,
        fire: fire
    }
})();
// Observer.fire('openNoVncByInfo', {
//     "host": "172.20.16.16",
//     "port": "6080",
//     "password": "123456",
//     "path": "websockify/?token=win7"
// })