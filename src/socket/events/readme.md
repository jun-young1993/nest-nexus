```js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
app.use(cors());

app.use(express.static(path.join(__dirname, '/')));

server.listen(8000, () => {
  console.log('Server is listening on port 8000');
});
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.IO chat</title>
    <script src="https://cdn.socket.io/4.3.2/socket.io.min.js" integrity="sha384-KAZ4DtjNhLChOB/hxXuKqhMLYvx3b5MlT55xPEiNmREKRzeEm+RVPlTnAn0ajQNs" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const socket = io('http://127.0.0.1:8080',{
          transports: ['websocket'],
        });

        socket.on('ServerToClient', (msg) => {
          const item = document.createElement('li');
          item.textContent = msg;
          document.getElementById('messages').appendChild(item);
        });

        document.getElementById('form').addEventListener('submit', (e) => {
          e.preventDefault();
          const input = document.getElementById('input');
          socket.emit('ClientToServer', input.value);
          input.value = '';
        });
      });
    </script>
  </head>
  <body>
    <ul id="messages"></ul>
    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Send</button>
    </form>
  </body>
</html>

```
