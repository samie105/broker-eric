"use client";
import React from "react";
import { useTheme } from "../../contexts/themeContext";
import Auth from "../../components/main/AuthUi/Auth";
import { FormProvider } from "../../contexts/formContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import SmartSupp from "../../components/SmartSupp";

import GoogleTranslate from "../../components/Translator/GoogleTranslator";

export default function Page() {
  const { isDarkMode, baseColor } = useTheme();
  return (
    <>
      {/* <Script
        src="//code.jivosite.com/widget/4euFNcNuJj"
        strategy="afterInteractive"
        async
      ></Script> */}
      <SmartSupp />
      <GoogleTranslate isDarkMode={isDarkMode} />
      <FormProvider>
        <div
          className={`w-full h-screen flex justify-center items-center ${
            isDarkMode ? `${baseColor} text-white` : ""
          }`}
        >
          <Auth />
        </div>
        <Toaster />
      </FormProvider>
    </>
  );
}
