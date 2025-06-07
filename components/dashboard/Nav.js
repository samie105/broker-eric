"use client";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Sheeet from "./sheeet";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import axios from "axios";
import { useUserData } from "../../contexts/userrContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useTheme } from "../../contexts/themeContext";
import { ScrollArea } from "../ui/scroll-area";

export default function Nav() {
  const router = useRouter();
  const { isDarkMode, baseColor, toggleTheme } = useTheme();
  const { coinPrices, setCoinPrices } = useUserData();
  const [loading, isloading] = useState(false);
  const { details, email, setDetails } = useUserData();
  const deposits = [
    {
      coinName: "Bitcoin",
      short: "Bitcoin",
      image: "/assets/bitcoin.webp",
      address: "0xiohxhihfojdokhijkhnofwefodsdhfodhod",
    },
    {
      coinName: "Ethereum",
      short: "Ethereum",
      image: "/assets/ethereum.webp",
      address: "0xiohxhihfojhijkhnowefodsdhfodhod",
    },
    {
      coinName: "Tether USDT",
      short: "Tether",
      image: "/assets/Tether.webp",
      address: "0Xxiohxhihfookhijkhnofwefodsdhfodhod",
    },
  ];
  const handleReadNotif = async () => {
    if (!details.isReadNotifications) {
      try {
        // Send a POST request to mark notifications as read
        const response = await axios.post(`/notifs/readNotifs/api`, { email });

        if (response.status === 200) {
          // Notifications marked as read successfully
          // Now, you can update the user's details to set isReadNotifications to true
          setDetails((prevDetails) => ({
            ...prevDetails,
            isReadNotifications: true,
          }));
        } else {
          // Handle any errors or display an error message to the user
          console.error("Failed to mark notifications as read:", response.data);
        }
      } catch (error) {
        // Handle network errors or other unexpected errors
        console.error("Error marking notifications as read:", error);
      }
    }
  };
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (details.notifications && details.notifications.length > 0) {
      setNotifications(details.notifications);
    }
  }, [details]);

  // ...

  const formatRelativeTime = (dateString) => {
    try {
      // Parse the date string into a Date object
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Calculate the relative time to now
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Map over notifications and format the date as relative time for each
  const formattedNotifications = notifications
    ? notifications.map((notification) => ({
        ...notification,
        date: formatRelativeTime(notification.date), // Format as relative time
      }))
    : [];
  const sortedNotifications = formattedNotifications.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Compare dates in descending order (newest first)
  });

  const handleNotificationClick = (id) => {
    isloading(true);
    // Send a DELETE request to the backend API to delete the notification
    axios
      .delete(`/notifs/deleteNotifs/api/${id}/${email}`)
      .then((response) => {
        if (response.status === 200) {
          const updatedNotifications = notifications.filter(
            (notification) => notification.id !== id
          );
          setNotifications(updatedNotifications);
          isloading(false);
        } else {
          // Handle any errors or display an error message to the user
          console.error("Failed to delete notification:", response.data);
          isloading(false);
        }
      })
      .catch((error) => {
        // Handle network errors or other unexpected errors
        console.error("Error deleting notification:", error);
        isloading(false);
      });
  };

  // Handle investment notification actions
  const handleInvestmentAction = async (notification, action) => {
    isloading(true);
    try {
      if (notification.action === "investment_invitation") {
        const response = await axios.post("/investment/respond/api", {
          email,
          investmentId: notification.investmentId,
          response: action
        });

        if (response.data.success) {
          // Remove the notification
          const updatedNotifications = notifications.filter(
            (n) => n.id !== notification.id
          );
          setNotifications(updatedNotifications);
          
          // Show success message
          if (action === "accept") {
            setDetails((prev) => ({
              ...prev,
              notifications: prev.notifications.filter((n) => n.id !== notification.id)
            }));
          } else {
            setDetails((prev) => ({
              ...prev,
              notifications: prev.notifications.filter((n) => n.id !== notification.id)
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error handling investment action:", error);
    } finally {
      isloading(false);
    }
  };

  useEffect(() => {
    const fetchCoinPrices = async () => {
      try {
        // Create an array of coin symbols for API request
        const coinSymbols = deposits.map((coin) => coin.short.toLowerCase());

        // API request to fetch coin prices
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinSymbols.join(
            ","
          )}&vs_currencies=usd`
        );

        // Update coinPrices state with fetched prices
        setCoinPrices(response.data);
      } catch (error) {
        console.error("Error fetching coin prices:", error);
      }
    };

    fetchCoinPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    // Remove the "token" cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to the logout page or any other desired action
    router.replace("/auth"); // Replace "/logout" with your actual logout route
  };

  // Handle investment notification click
  const handleInvestmentNotificationClick = (notification) => {
    if (notification.action === "investment_invitation") {
      // Remove the notification
      handleNotificationClick(notification.id);
      
      // Redirect to the investment requests tab
      router.push("/dashboard/investment?tab=requests");
    }
  };

  return (
    <>
      <div
        className={`nav-container flex justify-between ${
          isDarkMode
            ? `${baseColor} text-white border border-white/5`
            : "text-slate-900 border-b bg-white"
        } duration-300  items-center py-3 px-5 transition-colors  `}
      >
        <div className="burger md:hidden cursor-pointer">
          <Sheet className="p-0">
            <SheetTrigger>
              <div className="burger-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={`px-4 ${
                isDarkMode ? `${baseColor} text-gray-200 border-0` : ""
              }`}
            >
              <Sheeet />
            </SheetContent>
          </Sheet>
        </div>
        <div className="title hidden md:flex">
          <h2 className="font-bold">
            <svg
              width="198"
              height="32"
              viewBox="0 0 198 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.608 21.92C7.656 21.92 5.96 21.488 4.52 20.624C3.08 19.776 1.968 18.576 1.184 17.024C0.4 15.472 0.00800008 13.64 0.00800008 11.528C0.00800008 10.728 0.104 9.84 0.296 8.864C0.504 7.872 0.832 6.888 1.28 5.912C1.728 4.92 2.328 4.016 3.08 3.2C3.832 2.384 4.752 1.728 5.84 1.232C6.928 0.719999 8.208 0.464 9.68 0.464C10.944 0.464 12.048 0.624 12.992 0.943999C13.936 1.248 14.752 1.64 15.44 2.12C16.128 2.584 16.696 3.072 17.144 3.584C17.608 4.096 17.976 4.568 18.248 5C18.52 5.416 18.72 5.72 18.848 5.912L15.368 8.576C15.016 7.92 14.6 7.28 14.12 6.656C13.64 6.016 13.048 5.488 12.344 5.072C11.64 4.656 10.768 4.448 9.728 4.448C8.656 4.448 7.768 4.688 7.064 5.168C6.36 5.648 5.8 6.256 5.384 6.992C4.984 7.728 4.704 8.512 4.544 9.344C4.384 10.16 4.304 10.92 4.304 11.624C4.304 12.376 4.384 13.12 4.544 13.856C4.704 14.592 4.976 15.264 5.36 15.872C5.76 16.48 6.288 16.968 6.944 17.336C7.616 17.688 8.456 17.864 9.464 17.864C10.584 17.864 11.496 17.664 12.2 17.264C12.92 16.864 13.52 16.304 14 15.584C14.48 14.848 14.928 13.992 15.344 13.016L19.28 14.792C18.576 16.248 17.784 17.512 16.904 18.584C16.024 19.656 14.992 20.48 13.808 21.056C12.624 21.632 11.224 21.92 9.608 21.92ZM27.5744 21.896C26.3744 21.896 25.2864 21.584 24.3104 20.96C23.3344 20.352 22.5584 19.528 21.9824 18.488C21.4224 17.432 21.1424 16.256 21.1424 14.96C21.1424 13.744 21.3664 12.648 21.8144 11.672C22.2624 10.68 22.8704 9.832 23.6384 9.128C24.4224 8.424 25.3104 7.888 26.3024 7.52C27.2944 7.136 28.3344 6.944 29.4224 6.944C30.3344 6.944 31.2304 7.072 32.1104 7.328C32.1744 6.992 32.2304 6.656 32.2784 6.32L36.3824 7.016C36.2704 7.32 36.1584 7.776 36.0464 8.384C35.9344 8.992 35.8384 9.672 35.7584 10.424C35.6944 11.176 35.6384 11.928 35.5904 12.68C35.5424 13.432 35.5184 14.112 35.5184 14.72C35.5184 15.216 35.5504 15.704 35.6144 16.184C35.6944 16.648 35.8544 17.032 36.0944 17.336C36.3344 17.624 36.7024 17.768 37.1984 17.768H37.5344L36.9344 21.944C35.8784 21.944 35.0064 21.76 34.3184 21.392C33.6304 21.04 33.0784 20.56 32.6624 19.952C31.9744 20.72 31.1904 21.232 30.3104 21.488C29.4304 21.76 28.5184 21.896 27.5744 21.896ZM25.0784 15.44C25.1584 16.208 25.4704 16.824 26.0144 17.288C26.5744 17.736 27.2784 17.96 28.1264 17.96C28.9424 17.96 29.6224 17.744 30.1664 17.312C30.7104 16.864 31.1584 16.256 31.5104 15.488C31.4944 15.232 31.4864 14.968 31.4864 14.696C31.4864 14.136 31.5024 13.56 31.5344 12.968C31.5664 12.376 31.6064 11.792 31.6544 11.216C30.9824 10.96 30.2784 10.832 29.5424 10.832C28.6784 10.832 27.9024 11.008 27.2144 11.36C26.5424 11.696 26.0144 12.168 25.6304 12.776C25.2464 13.384 25.0544 14.088 25.0544 14.888C25.0544 14.984 25.0544 15.08 25.0544 15.176C25.0544 15.272 25.0624 15.36 25.0784 15.44ZM39.2268 26.816C39.1148 25.536 39.0348 24.248 38.9868 22.952C38.9388 21.656 38.9148 20.16 38.9148 18.464C38.9148 16.4 38.9468 14.344 39.0108 12.296C39.0748 10.248 39.1708 8.376 39.2988 6.68L43.4268 6.8C43.3788 7.168 43.3388 7.56 43.3068 7.976C43.8828 7.592 44.4988 7.312 45.1548 7.136C45.8268 6.96 46.5068 6.872 47.1948 6.872C48.0748 6.872 48.9308 7.016 49.7628 7.304C50.5948 7.576 51.3468 8.016 52.0188 8.624C52.6908 9.216 53.2188 9.984 53.6028 10.928C54.0028 11.872 54.2028 13.008 54.2028 14.336C54.2028 15.648 54.0028 16.792 53.6028 17.768C53.2028 18.744 52.6668 19.544 51.9948 20.168C51.3228 20.808 50.5708 21.28 49.7388 21.584C48.9068 21.904 48.0508 22.064 47.1708 22.064C45.5548 22.064 44.1308 21.584 42.8988 20.624C42.9308 21.648 42.9788 22.632 43.0428 23.576C43.1068 24.536 43.1868 25.512 43.2828 26.504L39.2268 26.816ZM46.5468 10.856C44.9628 10.856 43.7708 11.632 42.9708 13.184C42.9228 14.144 42.8908 15.12 42.8748 16.112C43.2588 16.624 43.7548 17.072 44.3628 17.456C44.9708 17.824 45.7468 18.008 46.6908 18.008C48.9468 18.008 50.0748 16.72 50.0748 14.144C50.0748 13.456 49.9468 12.896 49.6908 12.464C49.4348 12.032 49.1148 11.704 48.7308 11.48C48.3468 11.24 47.9548 11.08 47.5548 11C47.1548 10.904 46.8188 10.856 46.5468 10.856ZM55.8847 4.496C55.8847 4.352 55.8767 4.208 55.8607 4.064C55.8607 3.904 55.8607 3.728 55.8607 3.536C55.8607 3.024 55.8767 2.48 55.9087 1.904C55.9407 1.328 55.9727 0.839999 56.0047 0.439999L60.2767 0.511999C60.2287 1.056 60.1727 1.672 60.1087 2.36C60.0607 3.048 60.0287 3.76 60.0127 4.496H55.8847ZM55.7887 21.68C55.7407 20.688 55.7087 19.632 55.6927 18.512C55.6767 17.376 55.6687 16.24 55.6687 15.104C55.6687 13.616 55.6847 12.168 55.7167 10.76C55.7487 9.352 55.7887 8.072 55.8367 6.92L59.9647 6.896C59.9007 7.632 59.8607 8.544 59.8447 9.632C59.8287 10.704 59.8207 11.832 59.8207 13.016C59.8207 14.184 59.8287 15.336 59.8447 16.472C59.8607 17.608 59.8767 18.64 59.8927 19.568C59.9247 20.48 59.9487 21.184 59.9647 21.68H55.7887ZM69.4848 21.896C68.5248 21.896 67.7648 21.688 67.2048 21.272C66.6448 20.872 66.2368 20.312 65.9808 19.592C65.7248 18.872 65.5568 18.048 65.4768 17.12C65.4128 16.192 65.3808 15.216 65.3808 14.192C65.3808 13.136 65.4208 12.04 65.5008 10.904C64.4288 11.048 63.3968 11.232 62.4048 11.456L61.6608 7.688C62.9888 7.336 64.4048 7.08 65.9088 6.92C66.0208 6.104 66.1408 5.248 66.2688 4.352C66.3968 3.44 66.5408 2.48 66.7008 1.472L70.8288 1.832C70.6368 2.664 70.4688 3.496 70.3248 4.328C70.1808 5.144 70.0528 5.936 69.9408 6.704C70.8368 6.704 71.6768 6.728 72.4608 6.776C73.2608 6.808 73.9968 6.872 74.6688 6.968L74.1888 10.736C73.6288 10.672 73.0448 10.632 72.4368 10.616C71.8448 10.584 71.2448 10.568 70.6368 10.568C70.2688 10.568 69.9008 10.576 69.5328 10.592C69.4368 11.76 69.3728 12.76 69.3408 13.592C69.3248 14.424 69.3168 15.016 69.3168 15.368C69.3168 16.248 69.3648 16.88 69.4608 17.264C69.5728 17.648 69.7488 17.84 69.9888 17.84C70.2608 17.84 70.5648 17.752 70.9008 17.576C71.2368 17.384 71.5648 17.128 71.8848 16.808C72.2208 16.488 72.5008 16.144 72.7248 15.776L74.5728 19.64C72.9888 21.144 71.2928 21.896 69.4848 21.896ZM82.3948 21.896C81.1948 21.896 80.1068 21.584 79.1308 20.96C78.1548 20.352 77.3788 19.528 76.8027 18.488C76.2428 17.432 75.9628 16.256 75.9628 14.96C75.9628 13.744 76.1868 12.648 76.6348 11.672C77.0828 10.68 77.6908 9.832 78.4588 9.128C79.2428 8.424 80.1308 7.888 81.1228 7.52C82.1148 7.136 83.1548 6.944 84.2428 6.944C85.1548 6.944 86.0508 7.072 86.9308 7.328C86.9948 6.992 87.0508 6.656 87.0988 6.32L91.2028 7.016C91.0908 7.32 90.9788 7.776 90.8668 8.384C90.7548 8.992 90.6588 9.672 90.5788 10.424C90.5148 11.176 90.4588 11.928 90.4108 12.68C90.3628 13.432 90.3388 14.112 90.3388 14.72C90.3388 15.216 90.3708 15.704 90.4348 16.184C90.5148 16.648 90.6748 17.032 90.9148 17.336C91.1548 17.624 91.5228 17.768 92.0188 17.768H92.3548L91.7548 21.944C90.6988 21.944 89.8268 21.76 89.1388 21.392C88.4508 21.04 87.8988 20.56 87.4828 19.952C86.7948 20.72 86.0108 21.232 85.1308 21.488C84.2508 21.76 83.3388 21.896 82.3948 21.896ZM79.8988 15.44C79.9788 16.208 80.2908 16.824 80.8348 17.288C81.3948 17.736 82.0988 17.96 82.9468 17.96C83.7628 17.96 84.4428 17.744 84.9868 17.312C85.5308 16.864 85.9788 16.256 86.3308 15.488C86.3148 15.232 86.3068 14.968 86.3068 14.696C86.3068 14.136 86.3228 13.56 86.3548 12.968C86.3868 12.376 86.4268 11.792 86.4748 11.216C85.8028 10.96 85.0988 10.832 84.3628 10.832C83.4988 10.832 82.7228 11.008 82.0348 11.36C81.3628 11.696 80.8348 12.168 80.4508 12.776C80.0668 13.384 79.8748 14.088 79.8748 14.888C79.8748 14.984 79.8748 15.08 79.8748 15.176C79.8748 15.272 79.8828 15.36 79.8988 15.44ZM98.5351 21.896C97.6551 21.896 96.9271 21.704 96.3511 21.32C95.7911 20.952 95.3431 20.44 95.0071 19.784C94.6871 19.128 94.4471 18.376 94.2871 17.528C94.1431 16.68 94.0471 15.776 93.9991 14.816C93.9671 13.84 93.9511 12.864 93.9511 11.888C93.9511 11.04 93.9751 10.112 94.0231 9.104C94.0711 8.08 94.1271 7.048 94.1911 6.008C94.2711 4.952 94.3511 3.96 94.4311 3.032C94.5271 2.104 94.6151 1.296 94.6951 0.607999L99.0391 0.655999C98.9111 1.472 98.7911 2.4 98.6791 3.44C98.5671 4.464 98.4711 5.504 98.3911 6.56C98.3271 7.616 98.2711 8.592 98.2231 9.488C98.1911 10.384 98.1751 11.096 98.1751 11.624C98.1751 13.08 98.1991 14.224 98.2471 15.056C98.3111 15.888 98.3991 16.48 98.5111 16.832C98.6391 17.168 98.8071 17.336 99.0151 17.336C99.2871 17.336 99.5831 17.168 99.9031 16.832C100.223 16.48 100.535 16.088 100.839 15.656L102.879 19.712C102.383 20.256 101.791 20.752 101.103 21.2C100.415 21.664 99.5591 21.896 98.5351 21.896ZM139.634 21.92C138.098 21.92 136.746 21.616 135.578 21.008C134.426 20.416 133.522 19.584 132.866 18.512C132.226 17.44 131.906 16.2 131.906 14.792C131.906 13.944 132.05 13.056 132.338 12.128C132.626 11.184 133.09 10.304 133.73 9.488C134.37 8.672 135.21 8.008 136.25 7.496C137.306 6.984 138.586 6.728 140.09 6.728C141.178 6.728 142.09 6.848 142.826 7.088C143.578 7.328 144.186 7.64 144.65 8.024C145.13 8.408 145.49 8.816 145.73 9.248C145.986 9.68 146.154 10.096 146.234 10.496C146.33 10.88 146.378 11.2 146.378 11.456C146.378 13.008 145.722 14.208 144.41 15.056C143.114 15.888 141.274 16.304 138.89 16.304C138.346 16.304 137.826 16.28 137.33 16.232C136.85 16.184 136.402 16.128 135.986 16.064C136.29 16.864 136.794 17.456 137.498 17.84C138.202 18.208 138.93 18.392 139.682 18.392C140.77 18.392 141.73 18.2 142.562 17.816C143.394 17.416 144.178 16.808 144.914 15.992L147.05 19.064C146.538 19.48 145.962 19.912 145.322 20.36C144.698 20.808 143.93 21.176 143.018 21.464C142.106 21.768 140.978 21.92 139.634 21.92ZM140.162 10.328C139.218 10.328 138.386 10.568 137.666 11.048C136.946 11.528 136.418 12.16 136.082 12.944C136.482 13.008 136.874 13.064 137.258 13.112C137.658 13.144 138.05 13.16 138.434 13.16C138.786 13.16 139.186 13.128 139.634 13.064C140.098 13 140.546 12.904 140.978 12.776C141.426 12.648 141.794 12.488 142.082 12.296C142.37 12.088 142.514 11.848 142.514 11.576C142.514 11.448 142.45 11.288 142.322 11.096C142.194 10.904 141.962 10.728 141.626 10.568C141.29 10.408 140.802 10.328 140.162 10.328ZM151.718 22.04L148.694 19.424C149.462 18.528 150.286 17.624 151.166 16.712C152.046 15.784 152.95 14.864 153.878 13.952C152.758 12.976 151.71 12.104 150.734 11.336C149.774 10.552 149.03 10 148.502 9.68L150.902 6.512C151.766 7.136 152.702 7.848 153.71 8.648C154.718 9.448 155.734 10.296 156.758 11.192C157.702 10.328 158.63 9.488 159.542 8.672C160.454 7.84 161.326 7.056 162.158 6.32L164.942 9.2C164.43 9.568 163.702 10.176 162.758 11.024C161.814 11.856 160.79 12.784 159.686 13.808C160.742 14.768 161.734 15.72 162.662 16.664C163.606 17.592 164.438 18.456 165.158 19.256L162.23 21.92C161.942 21.568 161.526 21.112 160.982 20.552C160.438 19.992 159.806 19.368 159.086 18.68C158.382 17.992 157.63 17.288 156.83 16.568C156.062 17.32 155.334 18.048 154.646 18.752C153.974 19.456 153.382 20.088 152.87 20.648C152.358 21.224 151.974 21.688 151.718 22.04ZM172.378 21.968C171.354 21.968 170.506 21.784 169.834 21.416C169.178 21.064 168.65 20.576 168.25 19.952C167.866 19.328 167.578 18.632 167.386 17.864C167.21 17.08 167.09 16.272 167.026 15.44C166.978 14.592 166.954 13.776 166.954 12.992C166.954 12.096 166.978 11.184 167.026 10.256C167.09 9.328 167.154 8.312 167.218 7.208L171.61 6.944C171.562 7.28 171.49 7.784 171.394 8.456C171.298 9.128 171.21 9.896 171.13 10.76C171.05 11.624 171.01 12.528 171.01 13.472C171.01 15.024 171.146 16.176 171.418 16.928C171.69 17.664 172.098 18.032 172.642 18.032C173.73 18.032 174.53 17.24 175.042 15.656C175.554 14.072 175.81 11.568 175.81 8.144V7.04L177.85 6.992L180.322 6.944C180.098 8.448 179.93 9.832 179.818 11.096C179.706 12.36 179.634 13.424 179.602 14.288C179.57 15.136 179.554 15.704 179.554 15.992C179.554 16.728 179.618 17.256 179.746 17.576C179.874 17.88 180.098 18.032 180.418 18.032C180.578 18.032 180.754 18 180.946 17.936C181.138 17.872 181.362 17.76 181.618 17.6L181.45 21.728C180.842 21.824 180.314 21.872 179.866 21.872C179.098 21.872 178.466 21.728 177.97 21.44C177.49 21.152 177.106 20.768 176.818 20.288C176.322 20.816 175.706 21.224 174.97 21.512C174.25 21.816 173.386 21.968 172.378 21.968ZM190.653 21.992C189.565 21.992 188.557 21.864 187.629 21.608C186.701 21.352 185.861 21.024 185.109 20.624C184.357 20.224 183.685 19.8 183.093 19.352L185.253 15.872C185.925 16.496 186.573 16.976 187.197 17.312C187.821 17.648 188.469 17.88 189.141 18.008C189.829 18.136 190.573 18.2 191.373 18.2C192.061 18.2 192.613 18.112 193.029 17.936C193.445 17.744 193.653 17.504 193.653 17.216C193.653 16.976 193.453 16.792 193.053 16.664C192.653 16.52 192.141 16.4 191.517 16.304C190.893 16.192 190.237 16.056 189.549 15.896C188.573 15.64 187.661 15.344 186.813 15.008C185.965 14.672 185.277 14.216 184.749 13.64C184.237 13.064 183.981 12.296 183.981 11.336C183.981 10.568 184.165 9.896 184.533 9.32C184.901 8.728 185.389 8.24 185.997 7.856C186.621 7.456 187.325 7.16 188.109 6.968C188.893 6.776 189.701 6.68 190.533 6.68C191.973 6.68 193.213 6.856 194.253 7.208C195.309 7.544 196.317 7.992 197.277 8.552L195.093 11.864C194.613 11.528 194.061 11.24 193.437 11C192.829 10.744 192.213 10.552 191.589 10.424C190.981 10.28 190.413 10.208 189.885 10.208C189.309 10.208 188.853 10.296 188.517 10.472C188.197 10.648 188.037 10.896 188.037 11.216C188.037 11.408 188.237 11.592 188.637 11.768C189.053 11.928 189.837 12.144 190.989 12.416C191.677 12.576 192.405 12.744 193.173 12.92C193.941 13.08 194.661 13.312 195.333 13.616C196.021 13.904 196.573 14.328 196.989 14.888C197.421 15.432 197.637 16.16 197.637 17.072C197.637 18.608 197.021 19.808 195.789 20.672C194.557 21.552 192.845 21.992 190.653 21.992Z"
                fill={` ${isDarkMode ? "white" : "#111"}`}
              />
              <path
                d="M111.001 21.752C111.001 19.256 111.033 17.008 111.097 15.008C111.177 12.992 111.273 11.16 111.385 9.512C111.513 7.848 111.649 6.304 111.793 4.88C111.953 3.44 112.105 2.064 112.249 0.751999L116.377 0.92C116.313 1.416 116.241 1.952 116.161 2.528C116.705 3.264 117.297 4.104 117.937 5.048C118.593 5.992 119.257 6.992 119.929 8.048C120.617 9.088 121.289 10.136 121.945 11.192C122.601 12.232 123.225 13.232 123.817 14.192C124.409 15.136 124.929 15.984 125.377 16.736C125.489 15.632 125.545 14.08 125.545 12.08C125.545 11.056 125.529 10 125.497 8.912C125.465 7.824 125.425 6.784 125.377 5.792C125.329 4.784 125.265 3.888 125.185 3.104C125.105 2.304 125.017 1.68 124.921 1.232L129.433 0.679998C129.465 1.464 129.481 2.496 129.481 3.776C129.497 5.04 129.505 6.384 129.505 7.808C129.505 9.072 129.497 10.344 129.481 11.624C129.465 12.888 129.433 14.056 129.385 15.128C129.337 16.2 129.265 17.088 129.169 17.792C128.993 19.168 128.641 20.184 128.113 20.84C127.585 21.496 126.841 21.824 125.881 21.824C125.097 21.824 124.377 21.552 123.721 21.008C123.081 20.464 122.385 19.568 121.633 18.32C121.121 17.456 120.521 16.464 119.833 15.344C119.161 14.208 118.457 13.048 117.721 11.864C117.001 10.68 116.305 9.552 115.633 8.48C115.505 10.352 115.409 12.224 115.345 14.096C115.281 15.952 115.249 17.632 115.249 19.136C115.249 19.616 115.249 20.064 115.249 20.48C115.249 20.912 115.257 21.312 115.273 21.68L111.001 21.752Z"
                fill="#0052FF"
              />
              <path
                d="M76 20L38.689 30.6787C35.5949 31.5586 32.996 32 30.8944 32C28.5144 32 26.7867 31.4401 25.7157 30.3188C25.0421 29.5989 24.8445 28.6861 25.1207 27.5791C25.397 26.4721 26.1322 25.2937 27.3222 24.0395C28.3146 23.0254 29.9403 21.6927 32.2034 20.04C31.4358 20.8523 30.8729 21.7442 30.5374 22.6797C29.9424 24.3866 30.4779 25.6393 32.1439 26.4392C32.9365 26.812 34.0267 26.9992 35.4164 26.9992C36.5257 26.9992 37.7752 26.8792 39.165 26.6392L76 20Z"
                fill="#0052FF"
              />
            </svg>
          </h2>
        </div>{" "}
        {details === 0 ? (
          <div className="flex items-center gap-x-3">
            {" "}
            <Skeleton
              className={`md:w-52 md:h-10 rounded-md  ${
                isDarkMode ? "bg-[#333]" : "bg-gray-200/80"
              }  w-24 h-10`}
            />
            <Skeleton
              className={`md:w-52 md:h-10 md:rounded-sm  ${
                isDarkMode ? "bg-[#333]" : "bg-gray-200/80"
              } w-10 h-10 rounded-full`}
            />
            <Skeleton
              className={`md:w-10 md:h-10 rounded-full ${
                isDarkMode ? "bg-[#333]" : "bg-gray-200/80"
              } w-10 h-10`}
            />
          </div>
        ) : (
          <div className="nav-tools text-sm flex items-center">
            <Select defaultValue="Balance">
              <SelectTrigger
                className={`${isDarkMode ? "border border-[#222]" : "border"}`}
              >
                <SelectValue className="outline-none " />
              </SelectTrigger>
              <SelectContent
                className={`outline-none focus:outline-none ${
                  isDarkMode ? `${baseColor} text-white border-0` : ""
                }`}
              >
                <SelectItem value="Balance">
                  <div className="flex items-center py-2">
                    <div className="w-5 h-5 ">
                      {" "}
                      <Image
                        alt=""
                        src="/assets/dollar.png"
                        width={1000}
                        height={10000}
                      />
                    </div>
                    <div className="text-sm font-bold mx-2">
                      <code>{details.tradingBalance.toLocaleString()}</code>
                    </div>
                  </div>
                </SelectItem>
                {deposits.map((deps, index) => (
                  <div key={deps.coinName}>
                    <SelectItem key={deps.coinName} value={deps.coinName}>
                      <div className="flex items-center py-2">
                        <div className="image">
                          <Image
                            src={deps.image}
                            alt=""
                            width={20}
                            height={15}
                          />
                        </div>
                        <div className="price text-sm mx-2 font-bold">
                          {details !== 0 && details !== null ? (
                            <code>
                              {coinPrices[deps.short.toLowerCase()]
                                ? (
                                    details.tradingBalance /
                                    coinPrices[deps.short.toLowerCase()].usd
                                  ).toFixed(5)
                                : "0.00"}
                            </code>
                          ) : (
                            <span>calculating...</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger onClick={handleReadNotif}>
                <div className="notif-cont  ml-3 relative">
                  <div
                    className={` flex font-bold ${
                      isDarkMode
                        ? `md:bg-[#0052FF10] text-[#0052FF]`
                        : "md:bg-[#0052FF10] text-[#0052FF]"
                    } rounded-full md:rounded-lg md:px-3 md:py-3`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="md:w-5 md:h-5 w-5 h-5 md:mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 8a6 6 0 1112 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 01-.515 1.076 32.903 32.903 0 01-3.256.508 3.5 3.5 0 01-6.972 0 32.91 32.91 0 01-3.256-.508.75.75 0 01-.515-1.076A11.448 11.448 0 004 8zm6 7c-.655 0-1.305-.02-1.95-.057a2 2 0 003.9 0c-.645.038-1.295.057-1.95.057zM8.75 6a.75.75 0 000 1.5h1.043L8.14 9.814A.75.75 0 008.75 11h2.5a.75.75 0 000-1.5h-1.043l1.653-2.314A.75.75 0 0011.25 6h-2.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div
                      className={`hidden md:block  ${
                        isDarkMode ? "text-[#0052FF]" : "text-[#0052FF]"
                      }`}
                    >
                      Notifications
                    </div>
                  </div>

                  {!details.isReadNotifications && (
                    <div className="notifier-dot absolute md:-right-1 right-0  top-0">
                      <div className="dot bg-red-500 md:w-3 md:h-3 animate__rubberBand animate__animated animate__infinite rounded-full w-2 h-2"></div>
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className={`w-[350px] md:w-[400px] mx-3 pb-0 pt-4 px-1 relative overflow-hidden ${
                  isDarkMode ? "bg-[#222] border-white/5 text-gray-200" : ""
                }`}
              >
                <div className="tit px-3">
                  <div className="flex w-full justify-between items-center pb-4">
                    <div
                      className={`title-name font-bold ${
                        isDarkMode ? "text-white" : "text-black/90"
                      }`}
                    >
                      Notifications
                    </div>
                    <div className="titcount fleex">
                      <div className=" ">
                        <div
                          className={`py-1 px-2 rounded-full text-xs font-bold ${
                            isDarkMode ? "bg-[#333]" : "bg-black/5"
                          }`}
                        >
                          {notifications.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`line w-1/2 mx-auto mb-2 h-0.5  rounded-full ${
                      isDarkMode ? "bg-white/5" : "bg-black/5"
                    }`}
                  ></div>
                </div>
                <div className="cont ">
                  {notifications.length === 0 && (
                    <>
                      {" "}
                      <div className="message text-center text-sm py-4">
                        No notifications yet
                      </div>
                    </>
                  )}
                  {loading && (
                    <div
                      className={`loader-overlay absolute w-full h-full ${
                        isDarkMode ? "bg-black" : "bg-white"
                      } opacity-60 left-0 top-0 blur-2xl z-50`}
                    ></div>
                  )}
                  {notifications.length !== 0 && (
                    <>
                      <div>
                        <div className=" max-h-[300px] overflow-scroll overflow-x-hidden w-full px-3 py-3">
                          {sortedNotifications.reverse().map((notif, index) => (
                            <>
                              <div
                                className={`flex justify-between w-full items-start cursor-pointer transition-all`}
                                key={crypto.randomUUID()}
                              >
                                <div className="icon flex items-center flex-col">
                                  <div
                                    className={`${
                                      notif.method === "success"
                                        ? isDarkMode
                                          ? "bg-green-500/10 text-green-500"
                                          : "bg-green-500/20 text-green-500"
                                        : notif.method === "failure"
                                        ? isDarkMode
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-red-500/20 text-red-500"
                                        : notif.method === "pending"
                                        ? isDarkMode
                                          ? "bg-orange-500/10 text-orange-500"
                                          : "bg-orange-500/20 text-orange-500"
                                        : isDarkMode
                                        ? "bg-[#333] text-white"
                                        : "bg-[#33333320] text-white"
                                    } rounded-full p-3`}
                                  >
                                    {notif.type === "trade" ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : notif.type === "transaction" ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M13.2 2.24a.75.75 0 00.04 1.06l2.1 1.95H6.75a.75.75 0 000 1.5h8.59l-2.1 1.95a.75.75 0 101.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 00-1.06.04zm-6.4 8a.75.75 0 00-1.06-.04l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 101.02-1.1l-2.1-1.95h8.59a.75.75 0 000-1.5H4.66l2.1-1.95a.75.75 0 00.04-1.06z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : notif.type === "intro" ? (
                                      <>🤝</>
                                    ) : notif.type === "verification" ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : notif.type === "investment" ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                      >
                                        <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4 text-sm"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div
                                    className={`linedwon   ${
                                      notif.method === "success"
                                        ? isDarkMode
                                          ? "bg-green-500/10 text-green-500"
                                          : "bg-green-500/20 text-green-500"
                                        : notif.method === "failure"
                                        ? isDarkMode
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-red-500/20 text-red-500"
                                        : notif.method === "pending"
                                        ? isDarkMode
                                          ? "bg-orange-500/10 text-orange-500"
                                          : "bg-orange-500/20 text-orange-500"
                                        : isDarkMode
                                        ? "bg-[#333] text-white"
                                        : "bg-[#33333320] text-white"
                                    } ${
                                      index !== notifications.length - 1
                                        ? "h-11 border border-dashed border-white/5"
                                        : ""
                                    }`}
                                    key={crypto.randomUUID()}
                                  ></div>
                                </div>
                                <div className="message w-full text-sm mx-2">
                                  <div
                                    className={`pb-1 pt-1 ${
                                      isDarkMode
                                        ? "text-white"
                                        : "text-black/90 font-bold"
                                    }`}
                                  >
                                    {" "}
                                    {notif.message}
                                  </div>
                                  <div
                                    className={`date text-xs capitalize ${
                                      isDarkMode ? "opacity-40" : "opacity-80"
                                    }`}
                                  >
                                    {notif.date}
                                  </div>
                                  
                                  {/* Add action buttons for investment invitations */}
                                  {notif.action === "investment_invitation" && (
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInvestmentNotificationClick(notif);
                                        }}
                                        className={`px-3 py-1 text-xs rounded-md w-full ${
                                          isDarkMode
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-500 text-white"
                                        }`}
                                      >
                                        View Request
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="actiom pt-3 h-full /w-full"
                                  onClick={() =>
                                    handleNotificationClick(notif.id)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className={`w-4 h-4 ${
                                      isDarkMode
                                        ? "text-white/50 hover:text-white/80"
                                        : "text-black/30 hover:text-black/50"
                                    }`}
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <button
              className={`theme-toggler  md:p-3  ${
                isDarkMode
                  ? "md:bg-[#0052FF20] text-[#0052FF] "
                  : "md:bg-[#0052FF10] text-[#0052FF]"
              } rounded-full mx-5 md:mx-2`}
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-5 h-5 
                          }`}
                >
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-5 h-5 
                          }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <Popover>
              <PopoverTrigger>
                <div
                  className={`flex font-bold text-[#0052FF] rounded-full md:p-3 ${
                    isDarkMode ? "md:bg-[#0052FF20]" : "md:bg-[#0052FF10]"
                  } md:mr-5 text-sm`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className={`w-[300px] mx-3  p-1   ${
                  isDarkMode ? "bg-[#111] text-white border border-white/5" : ""
                }`}
              >
                {/* <div className="header-title py-4 px-4 font-bold">
                  <h1 className="bgname text-lg">Menus</h1>
                </div> */}
                <div className="content1 grid grid-cols-3 gap-y-4 py-3 pt-5 gap-x-3 px-3">
                  <Link href="/dashboard/account" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3  ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <Image
                        alt=""
                        src="/assets/profile.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />

                      <p className="pt-2">Profile</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/deposits" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3  ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <Image
                        alt=""
                        src="/assets/wallet.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />
                      <p className="pt-2">Deposit</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/withdrawals" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3  ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <Image
                        alt=""
                        src="/assets/withdraw.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />
                      <p className="pt-2">Withdraw</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/markets" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3 relative ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <div className="identifier absolute -top-1 -right-2">
                        <div className="px-2  font-normal bg-green-500 rounded-md text-white  text-[10px]">
                          Live
                        </div>
                      </div>
                      <Image
                        alt=""
                        src="/assets/increase.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />

                      <p className="pt-2">Tradings</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/investments" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3  ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <Image
                        alt=""
                        src="/assets/money.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />

                      <p className="pt-2">Subscription</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/verify" passHref>
                    <div
                      className={`deposit flex flex-col items-center text-xs justify-center rounded-md font-bold p-3  relative ${
                        isDarkMode
                          ? "bg-white/5 hite/5 hover:bg-white/10"
                          : "bg-gray-300/20 text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <div className="verification-identifier absolute -top-1 -right-2">
                        {details.isVerified ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5 text-green-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5 text-red-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <Image
                        alt=""
                        src="/assets/veraccount.png"
                        className="w-8 h-8"
                        width={1000}
                        height={1000}
                      />

                      <p className="pt-2">Verification</p>
                    </div>
                  </Link>
                </div>{" "}
                <div className="relative w-full flex items-center justify-center pt-4">
                  <div
                    className={` line h-0.5 w-1/2 mx-auto top-0 left-0 ${
                      isDarkMode ? "bg-white/5" : "bg-black/10"
                    } rounded-full`}
                  ></div>
                </div>
                <div
                  className={`logout flex items-center text-sm py-3 mb-4 mx-3 rounded-md text-red-600 mt-4 ${
                    isDarkMode
                      ? "bg-red-500/10 /border /border-red-600 font-bold"
                      : "bg-red-50"
                  } px-2 font-bold cursor-pointer`}
                  onClick={handleLogout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p>Logout</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </>
  );
}
