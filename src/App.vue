<script setup>

</script>

<template>
 
  <button @click="createPees" v-if="!Object.keys(connectedPeers).length>0">connect to network</button>
  <input v-model="username" v-if="!Object.keys(connectedPeers).length>0"/><br />

  <div style="color: hotpink; border: 1px solid hotpink; border-radius: 10px;">

Connected Nodes : 
<div v-for="(value, key) in connectedPeers" :key="key">
  {{ key }}
</div>
</div>
  <div style="border: 1px solid green;margin-top: 5px;border-radius: 10px;" v-if="Object.keys(connectedPeers).length>0" >
    <div>GET FILE</div>
    search name : <input v-model="searchname"/><button @click="getByName">get</button><br />
    search hash : <input v-model="searchHASH"  /><button>get</button><br />
  </div>
  <div style="border: 1px solid blue;margin-top: 5px;border-radius: 10px;">
    <div>UPLOAD FILE</div>

    <input v-if="Object.keys(connectedPeers).length>0"  @change="fileHandle" type="file" />
    <div v-if="Object.keys(connectedPeers).length>0">
      Encryption key :  <input v-model="encryptionUpload" /><br />
    </div>
  </div>
  
  <pre id="outgoing"></pre>
  <div v-if="Object.keys(connectedPeers).length>0"  class="card" v-for="(key,i) in filesP">
    <div>
      file hash:  {{filesP[i][0].fileHash}}
    </div>
    <div>
      Uploaded by:  {{filesP[i][0].username}}
    </div>
    <div>
      file name:  {{filesP[i][0].fileName}}
    </div>
    <div>
      file type:  {{filesP[i][0].type}}
    </div>
    <div>
      Avalible Parts:  {{filesP[i].length}} of {{filesP[i][0].partCount}}
    </div>
    Decryption key :  <input v-model="DecryptionDownload" />
    <button @click="download(filesP[i])">download</button>
   <!-- fileHash:  {{filesP[i]}} -->
  </div>
  <div>

<textarea id="textarea" rows="15" cols="50">
  
</textarea>
</div>
</template>

<script>
import sha256 from 'sha256'
export default {
  async mounted() {
  
    
    // ws.onclose = ()=> {
    //   console.log('disconnected');
    // };

    // ws.onmessage = (data)=>{
    //   console.log(`Round-trip time: ${Date.now() - data} ms`);

    //   setTimeout(function timeout() {
    //     ws.send(Date.now());
    //   }, 500);
    // };
    // const p = new SimplePeer({
    //   initiator: location.hash === '#1',
    //   trickle: false
    // })
    //console.log(this.$.appContext.app.version)
    // p.on('error', err => console.log('error', err))

    // p.on('signal', data => {
    //   console.log('SIGNAL', JSON.stringify(data))
    //   document.querySelector('#outgoing').textContent = JSON.stringify(data)
    // })

    // document.querySelector('#form').addEventListener('submit', ev => {
    //   ev.preventDefault()
    //   p.signal(JSON.parse(document.querySelector('#incoming').value))
    // })

    // p.on('connect', () => {

    //   console.log('CONNECT')
    //   p.send('whatever' + Math.random())
    // })

    // p.on('data', data => {
    //   console.log('data: ' + data)
    // })
  },
  data() {
    return {
      username: "amirkian",
      offersentList: {},
      awnserSent: {},
      connectedPeers: {},
      searchname :'',
      searchHASH :'',
      filesP : {},
      DecryptionDownload:"",
      encryptionUpload:""
    }
  },
  methods: {
    download(files){
      const yop = files.sort(function(a, b) {
    return parseFloat(a.index) - parseFloat(b.index);
})
let data = ""
for(var i=0;i<yop.length;i++){
  data += yop[i].part
}

var bytes  = CryptoJS.AES.decrypt(data, this.DecryptionDownload);
var originalText = bytes.toString(CryptoJS.enc.Utf8);

      var a = document.createElement("a"); //Create <a>
a.href = originalText; //Image Base64 Goes here
a.download = "Image.png"; //File name Here
a.click(); //Downloaded file
this.DecryptionDownload = ""
    },
    getByName(){
      const data = {
        type : 'getfileByName',
        fileName : this.searchname,
        username : this.username
      }
      for(let key in this.connectedPeers){
        this.connectedPeers[key].send(JSON.stringify(data))
      }
      const files = JSON.parse(localStorage.getItem('savess'))
      for(let hash in files){
        if(files[hash].name === this.searchname){
          // const x = {
          //   type : 'searchResult',
          //   part : files[hash]
          // }
          // this.connectedPeers[username].send(JSON.stringify(x))
          this.filesP[files[hash].fileHash] ?  null :this.filesP[files[hash].fileHash] = []
          this.filesP[files[hash].fileHash].push(files[hash])
        }
      }
    },
   async fileHandle(src) {
      this.getBase64(src.target.files[0])
    },
    saveHandel(part){
      console.log(part)
      const storage = JSON.parse(localStorage.getItem('savess')) || {}
      storage[part.partHash] = part
      console.log(storage)
      const dar = JSON.stringify(storage)
      localStorage.setItem('savess',dar)
    },
    sendChunks(arr){
      const doop = [...arr]
      console.log(arr)
      while(doop.length > 0){
        for(let key in this.connectedPeers){
          const data = JSON.stringify({
            type:'savefile',
            payload : doop[0]
          })
          console.log( this.connectedPeers[key])
          this.connectedPeers[key].send(data)
          doop.shift()
        }
      }
    },
    getBase64(file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      let dep =(ress)=>{
        var ciphertext = CryptoJS.AES.encrypt(ress, this.encryptionUpload).toString();
        this.sendChunks(this.chunkSubstr(ciphertext,240000,file))
      }
      reader.onload = function () {
          reader.result ;
          dep(reader.result )
      };
      return dep
    },
    handelMessage(msg) {

    },
    chunkSubstr(str, size,file) {
      console.log(str,size)
      const numChunks = Math.ceil(str.length / size)
      const chunks = new Array(numChunks)

      for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size)
      }

      //return chunks
      return chunks.map((item,i)=>{
        return {
          part:item,
          index:i,
          username : this.username,
          partHash : sha256(item),
          fileHash :sha256(str) ,
          partCount: chunks.length,
          name :file.name ,
          type : file.type,
          fileName : file.name
        }
      })
    },
    createPees(ev) {
      ev.preventDefault()
      const ws = new WebSocket('ws://localhost:8585');
      ws.onopen = () => {
        console.log('connected',ws);
        let data = {
          type: "register", payload: {
            username: this.username
          }
        }
        ws.send(JSON.stringify(data));
      };
      ws.onmessage = (data) => {
        const rawData = JSON.parse(data.data)
        console.log("server sent : ", rawData)
        if (rawData.type === "allusers") {
          const { allpeers } = rawData
          for (let peerKey in allpeers) {
            let sendSignalto = allpeers[peerKey]
            const p = new SimplePeer({
              initiator: true,
            })
            p.on('close', () => {
              console.log("disconnected : ", sendSignalto)
              delete this.connectedPeers[sendSignalto]
            })
            const self  = this
            p.on('data', function (chunk) {
              const json = new TextDecoder().decode(chunk)
              console.log(json)
              const l = JSON.parse(json)
              if(l.type === "savefile"){
              self.saveHandel(l.payload)
            }
              if(l.type === "getfileByName"){
              self.getfileByName(l.fileName,l.username)
            }
              if(l.type === "searchResult"){
              self.searchResult(l.part)
            }
              //this.handelMessage(json)
            })
            p.on('connect', () => {
              this.ontabClose(p.destroy)
              window.addEventListener("beforeunload", () => {
                ws.close()
                p.destroy()
              });
              console.log('CONNECT to ', sendSignalto)
              this.connectedPeers[sendSignalto] = this.offersentList[sendSignalto]
              delete this.offersentList[sendSignalto]
            })
            console.log(p)
            p.on('signal', data => {
              const ydata = {
                type: "sendOffer",
                sendSignalto,
                fromUserName: this.username,
                signal: data
              }
              console.log("signal sent to")
             document.getElementById('textarea').value = document.getElementById('textarea').value +  JSON.stringify(data)

              ws.send(JSON.stringify(ydata))
              this.offersentList[sendSignalto] = p
            })
          }
        }
        if (rawData.type === "offerRecived") {
          const p = new SimplePeer()
          p.signal(rawData.signal)
          p.on('close', () => {
            console.log("disconnected : ", rawData.fromUserName)
            delete this.connectedPeers[rawData.fromUserName]
          })
          const self  = this
          p.on('data', function (chunk) {
            const json = new TextDecoder().decode(chunk)
            console.log(JSON.parse(json))
            const l = JSON.parse(json)
            if(l.type === "savefile"){
              self.saveHandel(l.payload)
            }
            if(l.type === "getfileByName"){
              self.getfileByName(l.fileName,l.username)
            }
            if(l.type === "searchResult"){
              self.searchResult(l.part)
            }
            //this.handelMessage(json)
          })
          p.on('connect', () => {
            this.ontabClose(p.destroy)
            window.addEventListener("beforeunload", () => {
              ws.close()
              p.destroy()
            });
            this.connectedPeers[rawData.fromUserName] = this.awnserSent[rawData.fromUserName]
            delete this.awnserSent[rawData.fromUserName]
            console.log('CONNECT to ', rawData.fromUserName)
          })
          p.on('signal', data => {
            const ydata = {
              type: "answer",
              sendawnserto: rawData.fromUserName,
              fromUserName: this.username,
              awnser: data
            }
            document.getElementById('textarea').value = document.getElementById('textarea').value +  JSON.stringify(data)
            ws.send(JSON.stringify(ydata))
            this.awnserSent[rawData.fromUserName] = p
            // send this signaling data to peer1 somehow
          })
          console.log(p)
        }
        if (rawData.type === "awnserRecived") {
          this.offersentList[rawData.fromUserName].signal(rawData.awnser)
        }
      }
      // const p = new SimpluseePeer({
      //   initiator: true,
      // })
      // console.log("createPers", p)
      //destroy
    },
    ontabClose(callback) {
      window.addEventListener("beforeunload", () => {
        callback()
      });
    },
    searchResult(part){
      this.filesP[part.fileHash] ?  null :this.filesP[part.fileHash] = []
      this.filesP[part.fileHash].push(part)
      
    },
    getfileByName(name,username){
      const files = JSON.parse(localStorage.getItem('savess'))
      for(let hash in files){
        if(files[hash].name === name){
          const x = {
            type : 'searchResult',
            part : files[hash]
          }
          this.connectedPeers[username].send(JSON.stringify(x))
        }
      }
    }
  }
}

</script>