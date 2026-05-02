const express = require('express');
const cors = require('cors');
const app = express();
const billRoutes = require('./src/routes/bills.routes');

app.use(cors());
app.use(express.json());
app.use('/bills', billRoutes);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
