require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const billRoutes = require('./src/routes/bills.routes');
const paymentRoutes = require('./src/routes/payment.routes');

app.use(cors());
app.use(express.json());
app.use('/bills', billRoutes);
app.use('/payment', paymentRoutes);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
