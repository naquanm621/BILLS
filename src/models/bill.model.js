const db = require("../../db");

const TABLE = "bills";

module.exports = {
  async create(data) {
    const [id] = await db(TABLE).insert(data);
    return this.findById(id);
  },

  async findById(id) {
    return db(TABLE).where({ id }).first();
  },

  async findAll() {
    return db(TABLE).select("*");
  },

  async update(id, data) {
    await db(TABLE).where({ id }).update(data);
    return this.findById(id);
  },

  async remove(id) {
    return db(TABLE).where({ id }).del();
  }
};

