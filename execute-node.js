module.exports = function(RED) {
    this.isRequesting = false;

    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({ fill: "red", shape: "dot", text: err.message });
        node.error(err.message);
    };

    function ClearbitExecuteNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        this.client = require('clearbit')(this.host.api_key);


        const node = this;
        const requiredArgs = ['resource', 'method', 'args'];
        node.on('input', function(msg) {
            node.status({ fill: "blue", shape: "dot", text: `Try ${msg.payload.resource}.${msg.payload.method}...` });

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

            if (!node.client[msg.payload.resource]) {
                return handle_error(new Error(`Resource ${msg.payload.resource} is invalid, check documentation, cancel`), node);
            }

            if (!node.client[msg.payload.resource][msg.payload.method]) {
                return handle_error(new Error(`Resource ${msg.payload.resource}.${msg.payload.method} is invalid, check documentation, cancel`), node);
            }

            msg['_original'] = msg.payload;
            node.client[msg.payload.resource][msg.payload.method](msg.payload.args)
                .then(function(data) {
                    node.status({ fill: "green", shape: "dot", text: `Success ${msg.payload.resource}.${msg.payload.method} !` });
                    msg.payload = data;
                    node.send(msg);
                })
                .catch(function(err) {
                    // Email address could not be found
                    handle_error(err, node);
                    msg.payload = false;
                    node.send(msg);
                })
        });
    }
    RED.nodes.registerType("clearbit-execute", ClearbitExecuteNode);
};
