import Script from "next/script";
import Home from "../components/main/Home";
import SmartSupp from "../components/SmartSupp";
export default function HomePage() {
  return (
    <>
      {/* <Script
        src="//code.jivosite.com/widget/4euFNcNuJj"
        strategy="afterInteractive"
        async
      ></Script> */}
      <SmartSupp />
      <Home />
    </>
  );
}
