"use client";
import React from "react";
import { useTheme } from "../../../contexts/themeContext";
import AuthUi from "./AuthUi";
import { Dialog, DialogTrigger } from "../../ui/dialog";
import Link from "next/link";

export default function Auth() {
  const { isDarkMode, baseColor } = useTheme();
  return (
    <div>
      <div
        className={`auth-container w-[80vw] md:w-[40vw] p-4 rounded-md ${
          isDarkMode ? "bg-[#111] border-white/10 border" : "border"
        }`}
      >
        <div className={`cont w-full `}>
          <div className={`icon-cont flex justify-center items-center w-full`}>
            <div
              className={`cont rounded-full p-5 ${
                isDarkMode
                  ? "bg-[#222] text-white/80"
                  : "bg-[#0052FF10] text-[#0052FF]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-9 h-9"
              >
                <path
                  fillRule="evenodd"
                  d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                  clipRule="evenodd"
                />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
            </div>
          </div>
          <div
            className={`text-cont mt-5 mb-4 rounded-md /p-3 ${
              isDarkMode ? "text-white/90 /bg-[#222]" : ""
            }`}
          >
            <div className="text text- font-bold  text-center">
              Login or Create an account with us
            </div>
          </div>
          <div className={`form-cont flex items-center justify-center`}>
            {" "}
            <Dialog defaultOpen>
              <DialogTrigger className="w-full px-2">
                <div className="btn w-full">
                  <div className="px-4 py-3 bg-[#0052FF] text-white font-semibold text-sm items-center justify-center rounded-md flex">
                    <p>Proceed Authentication</p>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 ml-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg> */}
                  </div>
                </div>
              </DialogTrigger>
              <AuthUi />
            </Dialog>
          </div>
          <Link href="/" passHref>
            {" "}
            <div className="btn w-full p-2 mt-1">
              <div
                className={`px-4 py-3 w-full flex items-center justify-center text-center ${
                  isDarkMode
                    ? "bg-[#222] text-white/80"
                    : "bg-[#0052FF10] text-[#0052FF]"
                }   font-semibold text-sm rounded-xl`}
              >
                <p>Back to home</p>
              </div>
            </div>
          </Link>
          <Link href="/terms" passHref>
            <div className="btn w-full mt-2">
              <div
                className={`px-4 py-2 flex items-center justify-center text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } text-xs`}
              >
                <p>View Terms and Conditions</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
