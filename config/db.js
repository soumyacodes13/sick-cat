const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS to prevent querySrv ECONNREFUSED on Windows / ISP DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
