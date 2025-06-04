const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://richfield:richfield12@mycluster.uzw30gm.mongodb.net/";

// Establish the connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Log when successfully connected
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB for address");
});

// Log any errors during connection
mongoose.connection.on("error", (err) => {
  console.log("Error connecting to MongoDB:", err);
});

const addressSchema = new mongoose.Schema({
  Bitcoin: String,
  Ethereum: String,
  Tether: String,
  Tron: String,
  Dogecoin: String,
  Binance: String,
});

const AddressModel =
  mongoose.models.AddressEric ||
  mongoose.model("AddressEric", addressSchema);

module.exports = AddressModel;
