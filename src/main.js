import { createApp} from 'vue'
import './style.css'
import App from './App.vue'

//console.log(createApp)
// const ws = new WebSocket('wss://localhost:5173/.com/');

// ws.on('open', function open() {
//   console.log('connected');
//   ws.send(Date.now());
// });

// ws.on('close', function close() {
//   console.log('disconnected');
// });

// ws.on('message', function message(data) {
//   console.log(`Round-trip time: ${Date.now() - data} ms`);

//   setTimeout(function timeout() {
//     ws.send(Date.now());
//   }, 500);
// });

createApp(App).mount('#app')
