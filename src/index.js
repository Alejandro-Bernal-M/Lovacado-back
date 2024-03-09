const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

//env
dotenv.config();

//database conection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Db connected'));

console.log(process.env.PORT)
app.listen(process.env.PORT, () => {
  console.log(`application running on Port: ${process.env.PORT}`)
})