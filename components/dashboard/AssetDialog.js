import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/themeContext";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUserData } from "../../contexts/userrContext";
import Link from "next/link";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import { DialogContent } from "../ui/dialog";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import QRCode from "qrcode.react";

export default function AssetDialog({
  stake,
  image,
  symbol,
  name,
  price,
  duration,
}) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { details, setDetails, setNotification, address } = useUserData();
  const [error, setError] = useState();
  const [showError, setShowError] = useState();
  const [amount, setAmount] = useState();
  const [percentage, setPercentage] = useState(0);
  const [month, setMonth] = useState(0);
  const [loading, isloading] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState();
  const [showDropzone, setShowDropzone] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const roi = amount + (percentage * month * amount) / 100;
  const amountperMonth = (roi / month).toFixed(8);
  
  // Get crypto payment address from the system
  const paymentAddress = address ? address[name] || address[symbol] : null;
  const [isCopied, setIsCopied] = useState(false);

  const handleChange = (value) => {
    setShowError(false);
    const numericValue = Number(value);

    if (numericValue < stake.cryptoMinimum) {
      setShowError(true);
      setError(`Staking amount is below minimum stake (${stake.cryptoMinimum} ${symbol})`);
      setAmount(numericValue);
    } else {
      setAmount(numericValue);
    }
  };

  const getPercentageByMonths = (data, months) => {
    const entry = data.find((item) => item.months === months);
    setPercentage(entry.percentage);
    setMonth(entry.months);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/jpg",
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);

      try {
        const uploadedImageUrls = await Promise.all(
          acceptedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "my_preset");
            try {
              const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dgqjunu7l/upload`,
                formData
              );
              setUploadedImageUrls(response.data.secure_url);
              return response.data.secure_url;
            } catch (error) {
              console.error("Error uploading image to Cloudinary:", error);
              throw error;
            }
          })
        );

        setFiles(
          acceptedFiles.map((file, index) => ({
            ...file,
            preview: URL.createObjectURL(file),
            cloudinaryUrl: uploadedImageUrls[index],
          }))
        );

        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
      } finally {
        setIsUploading(false);
      }
    },
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setIsCopied(true);
    toast.success("Address copied");
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const initiateStaking = () => {
    if (percentage === 0 || amount === 0 || showError) {
      return;
    }
    setShowPaymentStep(true);
  };

  const handleVerifyPayment = () => {
    setShowDropzone(true);
  };

  const handleStaking = async () => {
    const email = details.email;
    const stakings = {
      id: stake.id + crypto.randomUUID(),
      stakedAsset: stake.coinName,
      stakedAssetImagePath: stake.imagePath,
      stakedAssetSymbol: stake.coinSymbol,
      dateStaked: Date.now(),
      stakedAmount: amount,
      monthlyReturns: amountperMonth,
      totalReturns: roi,
      stakedDuration: month,
      status: "pending",
      paymentProofUrl: uploadedImageUrls,
      lastPaid: new Date(),
    };
    isloading(true);
    try {
      const response = await axios.post("/db/Staking/", {
        email,
        stakings,
        amount,
        cryptoPayment: true,
      });
      
      if (response.status === 200) {
        setDetails((prevDeets) => ({
          ...prevDeets,
          stakings: [...prevDeets.stakings, stakings],
        }));
        
        setNotification(
          `Your staking request of ${amount} ${symbol} has been submitted for verification`,
          "transaction",
          "pending"
        );
        
        toast.success(`${amount} ${symbol} staking request submitted`, {
          duration: 4000,
        });
        
        setAmount(0);
        router.push("/dashboard/stake/mystakings");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit staking request");
    } finally {
      isloading(false);
    }
  };

  return (
    <div className={`${isDarkMode ? "textwhite" : ""}`}>
      <div className="header-section flex gap-x-2 items-center justify-between">
        <div className="header-section flex gap-x-3 items-center">
          <div className="image rounded-full overflow-hidden">
            <Image
              alt=""
              src={image}
              width={1000}
              height={1000}
              className="w-11 h-11"
            />
          </div>
          <div className="description">
            <div className="bigtext text-lg font-semibold">{name}</div>
            <div className="smalltext font-bold opacity-60 text-sm">
              {symbol}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`demacator mt-3 rounded-full w-1/2 mx-auto h-0.5 px-10 ${
          isDarkMode ? "bg-[#222]" : "bg-black/10"
        }`}
      ></div>

      {!showPaymentStep ? (
        <div className="form-section mt-6">
          <div className="amount-form">
            <label htmlFor="amount" className="text-sm font-bold pb-4">
              Staking Amount ({symbol})
            </label>
            <Input
              id="amount"
              type="number"
              value={amount === 0 ? "" : amount}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter amount to stake"
              className={`mt-2 text-sm rounded-sm h-12 ${
                isDarkMode ? " bg-[#222] text-white border-white/5" : ""
              }`}
            />
          </div>
          <div
            className={`font-bold mt-3 text-sm /md:flex /items-center gap-x-2`}
          >
            <div>
              <span className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                Minimum: {stake.cryptoMinimum || 0} {symbol}
              </span>
            </div>
            {showError && <div className="text-red-500 mt-2">{error}</div>}
          </div>
          <div className="flex items-center gap-x-3 w-full">
            {" "}
            <div className="duration mt-4 w-full">
              <label htmlFor="duration" className="text-sm font-bold pb-4">
                Staking Duration
              </label>
              <Select
                onValueChange={(value) => getPercentageByMonths(duration, value)}
              >
                <SelectTrigger
                  className={`h-12 mt-2 rounded-sm  ${
                    isDarkMode ? "bg-[#222] border-white/5" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a duration" />
                </SelectTrigger>
                <SelectContent
                  className={`rounded-sm ${
                    isDarkMode ? "bg-[#222] text-white border-white/5" : ""
                  }`}
                >
                  {duration.map((d) => (
                    <SelectItem
                      key={d.months}
                      value={d.months}
                      className="font-bold py-2 capitalize"
                    >
                      {d.months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="monthly-form mt-4 w-full">
              <label htmlFor="monthly" className="text-sm font-bold pb-4">
                Return per cycle
              </label>
              <Input
                id="monthly"
                readOnly
                value={`${percentage ? amountperMonth : "0"} ${symbol} per month`}
                className={`mt-2 w-full text-sm rounded-sm h-12 ${
                  isDarkMode ? " bg-[#222] text-white border-white/5" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-x-3 w-full justify-stretch">
            <div className="roi-form mt-4 w-full">
              <label htmlFor="roi" className="text-sm font-bold pb-4">
                Total ROI ({symbol})
              </label>
              <Input
                id="amount"
                readOnly
                value={`${roi.toFixed(8)} ${symbol}`}
                className={`mt-2 w-full text-sm rounded-sm h-12 ${
                  isDarkMode ? " bg-[#222] text-white border-white/5" : ""
                }`}
              />
            </div>
          </div>

          <div
            className={` text-sm rounded-sm border p-2 mt-3 ${
              isDarkMode ? "text-white/60 border-white/5" : "text-black/60"
            }`}
          >
            <p>
              Staking results in an estimated{" "}
              <span
                className={`font-bold ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                {percentage}% RPC (Return Per Cycle)
              </span>{" "}
              for{" "}
              <span
                className={`font-bold ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                {symbol}
              </span>
            </p>
          </div>
          <div
            className={` text-sm rounded-sm border p-2 mt-3 ${
              isDarkMode ? "text-white/60 border-white/5" : "text-black/60"
            }`}
          >
            <p>
              Your staking period will end in{" "}
              <span
                className={`font-bold ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                {month} month(s)
              </span>{" "}
              . Your earnings will be sent to your live {symbol} account.
            </p>
          </div>

          <button
            onClick={initiateStaking}
            disabled={percentage === 0 || amount === 0 || showError}
            className={`btn font-bold disabled:cursor-not-allowed text-sm text-white py-3 rounded-sm w-full text-center mt-3 ${
              percentage === 0 || amount === 0 || showError
                ? "bg-muted-foreground"
                : "bg-[#0052FF]"
            }`}
          >
            Proceed to Stake {amount} {symbol}
          </button>
        </div>
      ) : (
        <div className="payment-section mt-6">
          <div className="text-center mb-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : ""}`}>
              Pay {amount} {symbol} to Start Staking
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Send exactly {amount} {symbol} to the address below
            </p>
          </div>
          
          {paymentAddress && (
            <>
              <div className="flex justify-center items-center mb-4">
                <QRCode value={paymentAddress} size={160} />
              </div>
              
              <div className="address mt-2 mb-4">
                <label htmlFor="address" className="text-sm font-semibold">
                  {symbol} Payment Address
                </label>
                <div className={`flex items-center px-2 py-1 my-2 rounded-lg ${
                  isDarkMode ? "bg-[#222] border-white/10" : "border"
                }`}>
                  <input
                    type="text"
                    value={paymentAddress}
                    readOnly
                    className={`w-full px-2 py-3 text-sm rounded-lg font-bold ${
                      isDarkMode ? "text-white/60 bg-[#222]" : "text-black/60 bg-transparent"
                    } border-none focus:outline-none`}
                  />
                  <button onClick={handleCopyAddress} className="ml-3">
                    {isCopied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className={`text-sm p-3 mb-4 rounded-md ${
                isDarkMode ? "bg-amber-900/20 text-amber-200" : "bg-amber-50 text-amber-800"
              }`}>
                <p className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Please send exactly {amount} {symbol}. Sending less may result in loss of funds, while sending more will be considered as the staking amount.
                </p>
              </div>
              
              {!showDropzone ? (
                <button
                  onClick={handleVerifyPayment}
                  className="btn font-bold text-sm text-white py-3 rounded-sm w-full text-center mt-2 bg-[#0052FF]"
                >
                  I&apos;ve Made the Payment
                </button>
              ) : (
                <>
                  <label className="text-sm font-semibold mb-2 block">
                    Upload Payment Proof (screenshot)
                  </label>
                  <div
                    {...getRootProps({ className: "dropzone" })}
                    className={`py-4 overflow-hidden px-2 rounded-lg cursor-pointer mb-4 ${
                      isDarkMode ? "bg-[#222] text-white/60 border border-white/10" : "border"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mx-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                      <div className="text-sm font-bold">
                        {isUploading
                          ? "Uploading screenshot, please wait..."
                          : files.length !== 0
                          ? files.map((file, index) => (
                              <div key={index}>{file.path}</div>
                            ))
                          : "Click to upload your payment proof"}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStaking}
                    disabled={!uploadSuccess || loading}
                    className={`btn font-bold disabled:cursor-not-allowed text-sm text-white ${
                      !loading ? "py-3" : ""
                    } rounded-sm w-full text-center mt-2 ${
                      !uploadSuccess
                        ? "bg-muted-foreground"
                        : "bg-[#0052FF]"
                    }`}
                  >
                    {loading ? (
                      <div className="w-full flex items-center justify-center">
                        <InfinitySpin color="white" width="100" />
                      </div>
                    ) : (
                      "Submit Staking Request"
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

{
  /* <div
            className={`p-0.5 ${
              isDarkMode ? "bg-[#333]" : "bg-black/20"
            } w-1 h-1 rounded-full`}
          ></div> */
}
{
  /* <div className="text-red-500 mt-2 ">
            Amount exceeds available balance
          </div> */
}
