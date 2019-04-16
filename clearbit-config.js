module.exports = function(RED) {
    function ClearbitConfigNode(n) {
        RED.nodes.createNode(this, n);

        //config
        this.name = n.name;
        this.api_key = n.api_key;
    }
    RED.nodes.registerType("clearbit-config", ClearbitConfigNode);
}
