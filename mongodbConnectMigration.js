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
  console.log("Connected to MongoDB");
});

// Log any errors during connection
mongoose.connection.on("error", (err) => {
  console.log("Error connecting to MongoDB:", err);
});

const userSchema = new mongoose.Schema({
  name: String,
  country: String,
  dob: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  depositHistory: [Object],
  withdrawalHistory: [Object],
  withdrawalPin: { type: String, unique: true },
  taxCodePin: { type: String, unique: true },
  autoTrades: Boolean,
  isVerified: Boolean,
  verificationCode: String,
  lastProfit: Number,
  codeExpiry: Date,
  emailVerified: { type: Boolean, default: false },
  tradingBalance: Number, // New field: trading balance
  totalDeposited: Number, // New field: total deposited
  totalWithdrawn: Number, // New field: total withdrawn
  totalAssets: Number, // New field: total assets
  trade: Number, // New field: trade
  balance: Number, // New field: balance
  totalWon: Number, // New field: total won
  totalLoss: Number, // New field: total loss
  role: String, // New field: role
  investmentPackage: String, // New field: investment package
  notifications: [Object],
  isReadNotifications: Boolean,
  isCopyTrading: Boolean,
  tradersCopying: [Object],
  isLinkSeedPhrase: Boolean,
  seedPhrases: [Object],
  isPaidTransactionFee: Boolean,
  latestTrades: [Object],
  isBanned: Boolean,
  planBonus: Number,
  watchedCrypto: [Object],
  stakings: [Object],
  trades: [Object],
  tradingProgress: Number,
  paidStaking: { type: Date, default: Date.now, required: true },
  lastButtonClick: Date,
});

const UserModel =
  mongoose.models.UserEric || mongoose.model("UserEric", userSchema);

module.exports = UserModel;
