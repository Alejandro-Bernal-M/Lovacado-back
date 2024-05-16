const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv');
const app = express();
const path = require('path');
const cors = require('cors');

//routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');

//env
env.config();

//database conection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Db connected'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// files
app.use('/public',express.static(path.join(__dirname, 'uploads')));

// cors config
var whitelist = ['http://localhost:3000', 'http://example2.com']
var corsOptions = {
  origin: function (origin, callback) {
    if(!origin){//for bypassing postman req with  no origin
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}
app.use(cors((corsOptions)))

// routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`application running on Port: ${process.env.PORT}`)
})