const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv');
const app = express();
const path = require('path');
const cors = require('cors');
const { handleWebhook } = require('./controllers/stripe');
const bodyParser = require('body-parser');

//routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const homeSectionsRoutes = require('./routes/homeSection');
const stripeRoutes = require('./routes/stripe');

//env
env.config();

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

//stripe webhook
app.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

//database conection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Db connected'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// files
app.use('/public',express.static(path.join(__dirname, 'uploads')));


// routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', homeSectionsRoutes);
app.use('/api', stripeRoutes);

app.listen(process.env.PORT, () => {
  console.log(`application running on Port: ${process.env.PORT}`)
})