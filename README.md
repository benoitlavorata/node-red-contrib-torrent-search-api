# node-red-contrib-torrent-search-api
Provide a node to call torrent-search-api methods, see here https://www.npmjs.com/package/torrent-search-api
The node is "persistent", meaning you can configure it with multiple successive messages (enable providers, then make a search...)

## torrent-search-api node
You only need to provde 2 parameters in the payload of your messages:
- method : any function of the torrent-search-api module
- args : an array of parameters to be passed to the method (first element is the first parameter of the function, etc...)


## Examples
```js
//this will enable provider 1337x for the node
{
    payload: {
        method: 'enableProvider',
        args: ['1337x']
    }
}


//if sent to the same node, this will then fetch 10 torrents in category "Movies" from provider "1337x" with search term "Avengers"
{
    payload: {
        method: 'search',
        args: ['Avengers','Movies',10]
    }
}


//Once you have torrents results from your search, you can get the magnet url
{
    payload: {
        method: 'getMagnet',
        args: [torrent]
    }
}
```

An example of flow in node-red which does a search based on terms and provideres list, then return torrents WITH their magnets url. 
Results:
```json
array[20]
    0: object
    title: "Fear the Walking Dead S04E16 HDTV x264-SVA [eztv]"
    time: "Oct. 1st '18"
    seeds: 784
    peers: 67
    size: "319.5 MB"
    desc: "http://www.1337x.to/torrent/3262961/Fear-the-Walking-Dead-S04E16-HDTV-x264-SVA-eztv/"
    provider: "1337x"
    magnet: "magnet:?xt=urn:btih:D197D3853944F59303FDA26F7D6D10804650BAAF&dn=Fear+the+Walking+Dead+S04E16+HDTV+x264-SVA+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftorrent.gresille.org%3A80%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce"
...
```

Flow:
In node-red, first install the module, copy the code below, then import the flow below (Import > from clipboard, then paste, click import).
```json
[{"id":"bab9641e.6d3038","type":"subflow","name":"torrent.search","info":"","category":"","in":[{"x":60,"y":80,"wires":[{"id":"1bbde5aa.07eb2a"}]}],"out":[{"x":1880,"y":80,"wires":[{"id":"e422065.9d516f8","port":0}]}],"env":[]},{"id":"1cdf99ff.a4b3c6","type":"torrent-search-api-execute","z":"bab9641e.6d3038","name":"torrent-search-api - Execute","x":640,"y":80,"wires":[["842b7164.f606f"]]},{"id":"1bbde5aa.07eb2a","type":"function","z":"bab9641e.6d3038","name":"methods","func":"msg.payload = [\n    {\n        method: 'enableProvider',\n        args: msg.payload.providers ? msg.payload.providers.split(',') : ['1337x']\n    },\n    {\n        method: 'search',\n        args: [msg.payload.search]\n    },\n    \n];\nreturn msg;","outputs":1,"noerr":0,"x":200,"y":80,"wires":[["ec0efa58.27f5f8"]]},{"id":"ec0efa58.27f5f8","type":"split","z":"bab9641e.6d3038","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":330,"y":80,"wires":[["6f866188.934c9"]]},{"id":"6f866188.934c9","type":"function","z":"bab9641e.6d3038","name":"topic","func":"msg.topic = msg.payload.method;\nreturn msg;","outputs":1,"noerr":0,"x":450,"y":80,"wires":[["1cdf99ff.a4b3c6"]]},{"id":"842b7164.f606f","type":"join","z":"bab9641e.6d3038","name":"","mode":"custom","build":"object","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":false,"timeout":"","count":"","reduceRight":false,"reduceExp":"","reduceInit":"","reduceInitType":"","reduceFixup":"","x":830,"y":80,"wires":[["32f27c41.17bf34"]]},{"id":"32f27c41.17bf34","type":"function","z":"bab9641e.6d3038","name":"getMagnet","func":"msg.search = msg.payload.search;\nmsg.payload = msg.search.map((torrent,i) => {\n    return {\n        method: 'getMagnet',\n        args: [torrent],\n        index: i\n    }\n});\nreturn msg;","outputs":1,"noerr":0,"x":970,"y":80,"wires":[["dfd2f690.793da8"]]},{"id":"dfd2f690.793da8","type":"split","z":"bab9641e.6d3038","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":1110,"y":80,"wires":[["635dbeb7.9402c"]]},{"id":"28f1e3f9.764e5c","type":"torrent-search-api-execute","z":"bab9641e.6d3038","name":"torrent-search-api - Execute","x":1420,"y":80,"wires":[["4297ae4a.3164e"]]},{"id":"e422065.9d516f8","type":"join","z":"bab9641e.6d3038","name":"","mode":"custom","build":"array","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":false,"timeout":"","count":"","reduceRight":false,"reduceExp":"","reduceInit":"","reduceInitType":"num","reduceFixup":"","x":1750,"y":80,"wires":[[]]},{"id":"635dbeb7.9402c","type":"function","z":"bab9641e.6d3038","name":"topic","func":"msg.topic = msg.payload.index;\nreturn msg;","outputs":1,"noerr":0,"x":1230,"y":80,"wires":[["28f1e3f9.764e5c"]]},{"id":"4297ae4a.3164e","type":"function","z":"bab9641e.6d3038","name":"format","func":"var torrent = msg.search[msg.topic];\ntorrent.magnet = msg.payload;\nmsg.payload = torrent;\nreturn msg;","outputs":1,"noerr":0,"x":1630,"y":80,"wires":[["e422065.9d516f8"]]},{"id":"89638f49.1bb25","type":"inject","z":"44bf2220.94f1ac","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":280,"wires":[["c9c89295.4302f"]]},{"id":"c9c89295.4302f","type":"function","z":"44bf2220.94f1ac","name":"search","func":"msg.payload = {\n    // search terms\n    search: 'Fear the walking dead',\n    \n    // comma separated list of providers\n    providers: '1337x'\n}\nreturn msg;","outputs":1,"noerr":0,"x":330,"y":280,"wires":[["d11442fb.67c6b"]]},{"id":"d11442fb.67c6b","type":"subflow:bab9641e.6d3038","z":"44bf2220.94f1ac","name":"","env":[],"x":480,"y":280,"wires":[["1230fc51.57c424"]]},{"id":"1230fc51.57c424","type":"debug","z":"44bf2220.94f1ac","name":"torrents.res","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":650,"y":280,"wires":[]}]
```