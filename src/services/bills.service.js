const { Bill } = require("../models");

exports.saveBill = async (data) => {
  try {
    return await Bill.create(data);
  } catch (error) {
    console.error("Service Error (saveBill):", error.message);
    throw error;
  }
};

exports.getBillById = async (id) => {
  try {
    return await Bill.findById(id);
  } catch (error) {
    console.error("Service Error (getBillById):", error.message);
    throw error;
  }
};

exports.getAllBills = async () => {
  try {
    const bills = await Bill.findAll();
    return bills.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Service Error (getAllBills):", error.message);
    throw error;
  }
};

exports.deleteBillById = async (id) => {
  try {
    return await Bill.remove(id);
  } catch (error) {
    console.error("Service Error (deleteBillById):", error.message);
    throw error;
  }
};

exports.updateBillById = async (id, updateData) => {
  try {
    const bill = await Bill.findById(id);
    if (!bill) throw new Error("Bill not found in DB");
    return await Bill.update(id, updateData);
  } catch (error) {
    console.error("Service Error (updateBillById):", error.message);
    throw error;
  }
};
