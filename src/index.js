const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv');
const app = express();

//routes
const authRoutes = require('./routes/auth');

//env
env.config();

//database conection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Db connected'));
app.use(express.json());


app.use('/api', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`application running on Port: ${process.env.PORT}`)
})