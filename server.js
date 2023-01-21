import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8585 });

let connections = {}

function parse(d){
  return JSON.parse(d)
}
function stringify(d){
  return JSON.stringify(d)
}
wss.on('listening',()=>{
  console.log("server is live!!")
})
wss.on('connection', function connection(ws) {
 // console.log("connected!")
  let idddd = ""
  ws.on('message', function message(data) {
 //   console.log('received: %s', data);
    const dataPRASED = parse(data)
    if(dataPRASED.type ==="register"){
      const username = dataPRASED.payload.username;
      connections[username] = ws;
      idddd = username
      let allpeers = []
      for(let key in connections){
        if(key != username){
          allpeers.push(key)
        }
      }
      ws.send(stringify({type:"allusers",allpeers}))
    }
    if(dataPRASED.type === "sendOffer"){
       const {sendSignalto,fromUserName,signal} = dataPRASED
       if(connections[sendSignalto]){
         connections[sendSignalto].send(stringify({type:"offerRecived",fromUserName,signal:signal}))
        // console.log(connections[sendSignalto])
       }
    }
    if(dataPRASED.type === "answer"){
       const {sendawnserto,fromUserName,awnser} = dataPRASED
       if(connections[sendawnserto]){
         connections[sendawnserto].send(stringify({type:"awnserRecived",fromUserName,awnser:awnser}))
        // console.log(connections[sendawnserto])
       }
    }
  });
  ws.onclose = ()=>{
    console.log("close",idddd)
    delete connections[idddd]

  }

  // ws.send('something');
});