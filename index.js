const express = require('express');
const postRoutes = require('./routes/postRoutes');


const server = express();

//add json middleware
server.use(express.json());

server.use('/api/posts', postRoutes);

server.listen(8000, () => console.log("server on 8000"));



