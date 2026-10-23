import {defineConfig} from 'vite';
import {attachRooms} from './server/rooms.js';

export default defineConfig({
  server:{host:'0.0.0.0'},
  plugins:[{
    name:'echo-multiplayer',
    configureServer(server){attachRooms(server.httpServer)}
  }]
});
