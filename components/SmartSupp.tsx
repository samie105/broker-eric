"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    smartsupp: any;
    _smartsupp: any;
  }
}

export default function SmartSupp() {
  // useEffect(() => {
  //   window._smartsupp = window._smartsupp || {};
  //   window._smartsupp.key = "a38d213cd564b01abc95113ea19843d71ad204d5";
  //   window.smartsupp =
  //     window.smartsupp ||
  //     function () {
  //       (window.smartsupp._ = window.smartsupp._ || []).push(arguments);
  //     };
  //   window.smartsupp._ = window.smartsupp._ || [];

  //   const script = document.createElement("script");
  //   script.type = "text/javascript";
  //   script.async = true;
  //   script.src = "https://www.smartsuppchat.com/loader.js?";
  //   document.head.appendChild(script);

  //   return () => {
  //     document.head.removeChild(script);
  //   };
  // }, []);

  return <> <Script src="//code.jivosite.com/widget/txlKTXRP4m" strategy="afterInteractive"></Script>
</>;
}
