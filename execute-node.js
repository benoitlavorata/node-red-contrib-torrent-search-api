module.exports = function(RED) {
    this.isRequesting = false;

    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({ fill: "red", shape: "dot", text: err.message });
        node.error(err.message);
    };

    function MyExecuteNode(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        node.client = require('torrent-search-api');

        const requiredArgs = ['method', 'args'];
        node.on('input', function(msg) {
            node.status({ fill: "blue", shape: "dot", text: `Try ${msg.payload.method}...` });

            var validation = requiredArgs.reduce((p, v) => {
                if (!msg.payload[v]) {
                    handle_error(new Error(`No msg.payload.${v} provided, cancel`), node);
                    return false;
                }
                return p;
            }, true);

            // validation
            if (!validation)
                return false;

            if (!node.client[msg.payload.method]) {
                return handle_error(new Error(`Method ${msg.payload.method} is invalid, check documentation, cancel`), node);
            }

            msg['_original'] = msg.payload;
            const isAsync = (node.client[msg.payload.method]).constructor.name === "AsyncFunction";
            if(isAsync){
                node.client[msg.payload.method](...msg.payload.args)
                .then(function(data) {
                    node.status({ fill: "green", shape: "dot", text: `Success async ${msg.payload.method} !` });
                    msg.payload = data;
                    node.send(msg);
                })
                .catch(function(err) {
                    handle_error(err, node);
                    msg.payload = false;
                    node.send(msg);
                })
            }else{
                var data = node.client[msg.payload.method](...msg.payload.args);
                if(data){
                    if(!(data instanceof Promise) && !data['then']){
                        console.log('is not Promise');
                        node.status({ fill: "green", shape: "dot", text: `Success sync ${msg.payload.method} !` });
                        msg.payload = data;
                        return node.send(msg);
                    }
                    else{
                        var asyncResult = data;
                        asyncResult
                        .then(function(data) {
                            node.status({ fill: "green", shape: "dot", text: `Success async ${msg.payload.method} !` });
                            msg.payload = data;
                            node.send(msg);
                        })
                        .catch(function(err) {
                            handle_error(err, node);
                            msg.payload = false;
                            node.send(msg);
                        })
                    }
                }else{
                    node.status({ fill: "green", shape: "dot", text: `Success async ${msg.payload.method} !` });
                    msg.payload = data;
                    node.send(msg);
                }
            }
        });
    }
    RED.nodes.registerType("torrent-search-api-execute", MyExecuteNode);
};
