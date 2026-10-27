import {createServer} from 'node:http';
import {attachRooms} from './rooms.js';

const port=Number(process.env.PORT)||3001;
const server=createServer((request,response)=>{
  if(request.url==='/'||request.url==='/health'){
    response.writeHead(200,{'content-type':'application/json; charset=utf-8'});
    response.end(JSON.stringify({ok:true,service:'jejak-yang-hilang-room'}));
    return;
  }
  response.writeHead(404,{'content-type':'application/json; charset=utf-8'});
  response.end(JSON.stringify({error:'Not found'}));
});

attachRooms(server);
server.listen(port,'0.0.0.0',()=>console.log(`Room server ready on port ${port}`));
