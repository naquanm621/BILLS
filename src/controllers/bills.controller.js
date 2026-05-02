const billsService = require('../services/bills.service');
const { processBill } = require('../services/billProcessing.service'); 

// --- UPLOAD & PROCESS ---
exports.uploadBill = async (req, res) => {
  try {
    const { filename, path: filepath } = req.file;

    // 1. Save the initial bill record
    const newBill = await billsService.saveBill({
      filename,
      filepath,
      vendor: null,
      amount: null,
      due_date: null,
      status: "processing"
    });

    console.log(`--- Bill Created (ID: ${newBill.id}). Calling Gemini... ---`);

    // 2. WAIT for the AI to finish so Postman gets the data immediately
    await processBill(newBill.id, filepath); 

    // 3. Get the UPDATED bill from the DB (the one Gemini just filled out)
    const updatedBill = await billsService.getBillById(newBill.id);

    console.log("--- SUCCESS! Sending data to Postman. ---");

    return res.json({
      success: true,
      message: "Bill processed successfully",
      bill: updatedBill // THIS will now show "JY", "0", etc.
    });

  } catch (error) {
    console.error("Upload/AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not process bill",
      error: error.message
    });
  }
};

// --- GET ALL BILLS ---
exports.getBills = async (req, res) => {
  try {
    const bills = await billsService.getAllBills();
    return res.json({ success: true, bills });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// --- UPDATE BILL ---
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await billsService.updateBillById(id, req.body);
    return res.json({ success: true, bill: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// --- DELETE BILL ---
exports.deleteBill = async (req, res) => {
  try {
    const deleted = await billsService.deleteBillById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};