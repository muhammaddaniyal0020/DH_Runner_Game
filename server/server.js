const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

const rooms = {}; // roomCode -> { seed, players: { id -> { socket, info } } }
const disconnectedGrace = {}; // id -> { roomCode, timeout }

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code;
  do {
    code = '';
    for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (rooms[code]);
  return code;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  let myId = null;
  let myRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'CREATE_ROOM') {
        let code = data.roomCode;
        // If code is not provided, invalid, or already taken, generate a random one
        if (!code || code.length !== 4 || rooms[code]) {
            code = generateRoomCode();
        }
        myId = data.id;
        myRoom = code;
        
        rooms[code] = {
          seed: Math.floor(Math.random() * 1000000),
          players: {
            [myId]: { socket: ws, info: { id: myId, name: data.name, charIdx: data.charIdx, ready: false, lane: 1, jumping: false, ducking: false, dead: false, score: 0, pos: {x:0,y:0,z:0} } }
          }
        };
        
        console.log(`[CREATE] Player ${myId} created room ${code} (Requested: ${data.roomCode || 'None'})`);
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomCode: code }));
        broadcastLobby(code);
      } 
      else if (data.type === 'JOIN') {
        const code = data.roomCode;
        myId = data.id;
        
        console.log(`[JOIN] Player ${myId} attempting to join room ${code}`);
        
        if (!rooms[code]) {
          console.log(`[JOIN] Room ${code} not found! Current rooms: ${Object.keys(rooms).join(', ')}`);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found.' }));
          return;
        }

        if (disconnectedGrace[myId] && disconnectedGrace[myId].roomCode === code) {
           console.log(`[JOIN] Player ${myId} reconnected to room ${code}`);
           clearTimeout(disconnectedGrace[myId].timeout);
           delete disconnectedGrace[myId];
           myRoom = code;
           rooms[code].players[myId] = {
              socket: ws,
              info: rooms[code].players[myId] ? rooms[code].players[myId].info : { id: myId, name: data.name, charIdx: data.charIdx, ready: false, lane: 1, jumping: false, ducking: false, dead: false, score: 0, pos: {x:0,y:0,z:0} }
           };
           broadcastLobby(code);
           return;
        }

        if (Object.keys(rooms[code].players).length >= 3 && !rooms[code].players[myId]) {
          console.log(`[JOIN] Room ${code} is full`);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room Full' }));
          return;
        }

        console.log(`[JOIN] Player ${myId} joined room ${code}`);
        myRoom = code;
        if (!rooms[code].players[myId]) {
           rooms[code].players[myId] = {
              socket: ws,
              info: { id: myId, name: data.name, charIdx: data.charIdx, ready: false, lane: 1, jumping: false, ducking: false, dead: false, score: 0, pos: {x:0,y:0,z:0} }
           };
        } else {
           rooms[code].players[myId].socket = ws; // Just update socket
        }
        broadcastLobby(code);
      }
      else if (data.type === 'READY') {
         if (myRoom && rooms[myRoom] && rooms[myRoom].players[myId]) {
            rooms[myRoom].players[myId].info.ready = data.ready;
            broadcastLobby(myRoom);
            checkStart(myRoom);
         }
      }
      else if (data.type === 'UPDATE') {
         if (myRoom && rooms[myRoom] && rooms[myRoom].players[myId]) {
            const p = rooms[myRoom].players[myId].info;
            p.lane = data.lane; p.jumping = data.jumping; p.ducking = data.ducking; p.dead = data.dead; p.score = data.score; p.pos = data.pos;
         }
      }
      else if (data.type === 'CRASH') {
         if (myRoom && rooms[myRoom] && rooms[myRoom].players[myId]) {
            rooms[myRoom].players[myId].info.dead = true;
         }
      }

    } catch(e) {
      console.error(e);
    }
  });

  ws.on('close', () => {
    if (myRoom && rooms[myRoom]) {
      if (rooms[myRoom].players[myId]) {
        disconnectedGrace[myId] = {
           roomCode: myRoom,
           timeout: setTimeout(() => {
              if (rooms[myRoom] && rooms[myRoom].players[myId]) {
                 delete rooms[myRoom].players[myId];
                 broadcastLobby(myRoom);
                 delete disconnectedGrace[myId];
                 if (Object.keys(rooms[myRoom].players).length === 0) {
                    delete rooms[myRoom];
                 }
              }
           }, 10000)
        };
      }
    }
  });
});

setInterval(() => {
   Object.keys(rooms).forEach(code => {
      const room = rooms[code];
      const pList = Object.values(room.players).map(p => p.info);
      Object.values(room.players).forEach(p => {
         if(p.socket.readyState === 1) { 
            p.socket.send(JSON.stringify({ type: 'GAME_STATE', players: pList }));
         }
      });
   });
}, 100);

function broadcastLobby(code) {
  if(!rooms[code]) return;
  const room = rooms[code];
  const pList = Object.values(room.players).map(p => p.info);
  Object.values(room.players).forEach(p => {
     if(p.socket.readyState === 1) {
        p.socket.send(JSON.stringify({ type: 'LOBBY_STATE', roomCode: code, players: pList }));
     }
  });
}

function checkStart(code) {
  if(!rooms[code]) return;
  const room = rooms[code];
  const pList = Object.values(room.players).map(p => p.info);
  if (pList.length >= 2 && pList.every(p => p.ready)) {
     Object.values(room.players).forEach(p => {
        if(p.socket.readyState === 1) {
           p.socket.send(JSON.stringify({ type: 'START_GAME', seed: room.seed }));
        }
     });
  }
}

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 5000);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
