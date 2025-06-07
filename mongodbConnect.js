import mongoose from "mongoose";

const mongoURI = process.env.CONNECTION_STRING;


// Create a cached connection variable
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // Check if existing connection is still active
    if (mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return cached.conn;
    } else {
      console.log("Connection lost, reconnecting...");
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log("Connected to MongoDB successfully");
      return mongoose;
    });
  }

  try {
    console.log("Connecting to MongoDB:", mongoURI.substring(0, 20) + "..."); // Only show part of the URI for security
    cached.conn = await cached.promise;
    
    // Add connection error handler
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cached.conn = null;
      cached.promise = null;
    });
    
    // Add disconnection handler
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, will reconnect on next operation");
      cached.conn = null;
      cached.promise = null;
    });
  } catch (err) {
    cached.promise = null;
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }

  return cached.conn;
}

// Define investment schema for better structure
const investmentSchema = new mongoose.Schema({
  id: String,
  type: String,
  status: String,
  totalAmount: Number,
  initiatorAmount: Number,
  partnerAmount: Number,
  initiatorEmail: String,
  partnerEmail: String,
  initiatorPercentage: Number,
  partnerPercentage: Number,
  duration: String,
  roi: Number,
  startDate: Date,
  endDate: Date
}, { _id: false });

// Define notification schema
const notificationSchema = new mongoose.Schema({
  id: String,
  method: String,
  type: String,
  message: String,
  date: Date
}, { _id: false });

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
  investments: [investmentSchema], // Use defined schema for better structure
  notifications: [notificationSchema], // Use defined schema for better structure
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
  stakingInvitations: [Object],
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
