import mongoose from "mongoose";

const mongoURI = process.env.CONNECTION_STRING;


// Create a cached connection variable
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    });
  }

  try {
    console.log("Connecting to MongoDB,", mongoURI);
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.log("Error connecting to MongoDB:", err);
    throw err;
  }

  return cached.conn;
}

// Ensure connection is established before defining models
const userSchema = new mongoose.Schema({
  name: String,
  country: String,
  dob: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  ssn: String,
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

// Initialize connection before exporting the model
dbConnect();

const UserModel =
  mongoose.models.UserEric || mongoose.model("UserEric", userSchema);

export default UserModel;
