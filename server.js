const app = require("express")();
const http = require("http");
const server = http.createServer(app);
socket = require("socket.io");
const io = socket(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
const balls = 30;
const canvas = { width: 1250, height: 620 };
var rooms = [];
var ball = { x: 500, y: 500, xv: 3, yv: -3, score1: 0, score2: 0,p: true };
var spunks = {x1: 550,x2: 550,socket1: null,socket2: null,roomNumber: null,};
io.on("connection", (socket) => {   
  console.log('client connected ',socket.id)
let roomIndex;
let room=socket.handshake.query.room
roomIndex = rooms.findIndex((p) => p.roomNumber === room);
if (roomIndex === -1){
rooms.push({
      ball:{ x: 500, y: 500, xv: 3, yv: -3, score1: 0, score2: 0,p: true},
      spunks:{x1: 550,x2: 550,socket1:socket.id,socket2: null },
      roomNumber: room
      ,count:1});
      roomIndex=rooms.findIndex((p) => p.roomNumber === room)
  } else {rooms[roomIndex].spunks.socket2=socket.id;
    rooms[roomIndex].count=2}
        socket.join(rooms[roomIndex].roomNumber);
  io.to(rooms[roomIndex].roomNumber).emit('punks',rooms[roomIndex].spunks)
  ////////////////////////////////////////////////////////////////////////////
  socket.on("punks",(key)=>{console.log(key,socket.id)
    switch (key) {
        case 37: // left arrow
          if (rooms[roomIndex].spunks.socket1 ===socket.id) {
            if (rooms[roomIndex].spunks.x1 > 0) rooms[roomIndex].spunks.x1 -= 10;
            break;
          } else {
            if (rooms[roomIndex].spunks.x2 > 0) rooms[roomIndex].spunks.x2 -= 10;
            break;
          }
        case 39: // right arrow
          if (rooms[roomIndex].spunks.socket1 === socket.id) {
            if (rooms[roomIndex].spunks.x1 < 1100) rooms[roomIndex].spunks.x1 += 10;
          
            break;
          } else {
            if (rooms[roomIndex].spunks.x2 < 1100) rooms[roomIndex].spunks.x2 += 10;
          
            break;
          }
        case 32:
          rooms[roomIndex].ball.p = !this.ball.p;
        
          break;
      }

    io.to(rooms[roomIndex].roomNumber).emit('punks',rooms[roomIndex].spunks
        )})
 ////////////////////////////////////////////////////////////////////////////////       
    socket.on("pause",(pauseball)=>{
      rooms[roomIndex].ball=pauseball
    })
  setInterval(() => {
if(rooms[roomIndex].ball.p){
  if(rooms[roomIndex].spunks.socket1!==null&&rooms[roomIndex].spunks.socket2!==null
  ){
    rooms[roomIndex].ball.x = rooms[roomIndex].ball.x + rooms[roomIndex].ball.xv;
    rooms[roomIndex].ball.y =rooms[roomIndex].ball.y + rooms[roomIndex].ball.yv;
  }
      if (rooms[roomIndex].ball.x - balls < 0 && rooms[roomIndex].ball.xv < 0&&rooms[roomIndex].ball.p===true) {
        rooms[roomIndex].ball.xv = -rooms[roomIndex].ball.xv;
      }
      if (rooms[roomIndex].ball.x + balls > canvas.width && rooms[roomIndex].ball.xv > 0) {
        rooms[roomIndex].ball.xv = -rooms[roomIndex].ball.xv;
      }
      if (rooms[roomIndex].ball.y - balls < 0 && rooms[roomIndex].ball.yv < 0) {
        rooms[roomIndex].ball.yv = -rooms[roomIndex].ball.yv;
      }
      if (rooms[roomIndex].ball.y + balls >canvas.height && rooms[roomIndex].ball.yv > 0) {
        rooms[roomIndex].ball.yv = -rooms[roomIndex].ball.yv;}
  
      if ( rooms[roomIndex].ball.y + balls > 580 && rooms[roomIndex].ball.yv > 0 &&rooms[roomIndex].ball.x + balls > rooms[roomIndex].spunks.x2 && rooms[roomIndex].ball.x - balls < rooms[roomIndex].spunks.x2 + 150) {
        rooms[roomIndex].ball.yv = -rooms[roomIndex].ball.yv;}
    
      if ( rooms[roomIndex].ball.y - balls < 40 && rooms[roomIndex].ball.yv < 0&&rooms[roomIndex].ball.x +balls > rooms[roomIndex].spunks.x1 && rooms[roomIndex].ball.x -balls < rooms[roomIndex].spunks.x1 + 150) {
        rooms[roomIndex].ball.yv = -rooms[roomIndex].ball.yv;}
  
  if (rooms[roomIndex].ball.y + balls>600 && rooms[roomIndex].ball.yv > 0&&rooms[roomIndex].ball.x>canvas.width/ 2 - 400 / 2&&rooms[roomIndex].ball.x<canvas.width / 2 - 400 / 2+400)
  {rooms[roomIndex].ball.score2=rooms[roomIndex].ball.score2+1/7}
  
  if (rooms[roomIndex].ball.y -balls<20 && rooms[roomIndex].ball.yv < 0&&rooms[roomIndex].ball.x>canvas.width/ 2 - 400 / 2&&rooms[roomIndex].ball.x<canvas.width / 2 - 400 / 2+400)
      {rooms[roomIndex].ball.score1=rooms[roomIndex].ball.score1+1/7}}
  io.to(rooms[roomIndex].roomNumber).emit('ball',rooms[roomIndex].ball)
      }, 25 );
          socket.on('disconnect',()=>{
              console.log('client disconnected',socket.id)
              if(rooms[roomIndex].spunks.socket1==socket.id){rooms[roomIndex].spunks.socket1=null}
              else{rooms[roomIndex].spunks.socket2=null}
              rooms[roomIndex].count--;
              let flag=rooms[roomIndex].count
   
              if(flag )socket.broadcast.emit('punks',rooms[roomIndex].spunks)
})});
server.listen(3001, () => { console.log("listening at 3001"); });
