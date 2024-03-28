require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


require('./mongo');


app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site"}
}));
const limiter = rateLimit({
  window: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
const stuffRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');


app.use('/api/auth', userRoutes);
app.use('/api/sauces', stuffRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
