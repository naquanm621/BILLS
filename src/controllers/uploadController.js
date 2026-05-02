exports.uploadBill = async (req, res) => { ... }

exports.getBills = async (req, res) => {
  try {
    const bills = await getAllBills();
    return res.json({ success: true, bills });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch bills" });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteBillById(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    return res.json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not delete bill" });
  }
};

