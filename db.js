const knex = require('knex');

// 1. Initialize the connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './bills.db'
  },
  useNullAsDefault: true
});

// 2. The "Bone" Maker: Auto-create the bills table if it's missing
db.schema.hasTable('bills').then((exists) => {
  if (!exists) {
    console.log('--- Creating "bills" table ---');
    return db.schema.createTable('bills', (table) => {
      table.increments('id').primary();
      table.string('filename');
      table.string('filepath');
      table.string('vendor');
      table.decimal('amount');
      table.string('due_date');
      table.string('status').defaultTo('pending');
      table.timestamp('uploaded_at').defaultTo(db.fn.now());
    });
  } else {
    console.log('--- Database "bills" table is ready ---');
  }
}).catch(err => console.error('Error creating table:', err));

module.exports = db;