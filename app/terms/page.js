"use client";
import { useTheme } from "../../contexts/themeContext";
import Link from "next/link";

export default function TermsAndConditions() {
  const { isDarkMode } = useTheme();

  // Organize terms by categories for better visual structure
  const categories = [
    {
      name: "Account & Eligibility",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      ),
      terms: [1, 23, 24, 38, 51, 80, 85, 98]
    },
    {
      name: "Regulatory Compliance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      ),
      terms: [2, 5, 6, 19, 20, 21, 69, 70, 92, 101]
    },
    {
      name: "Investments & Staking",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a3.833 3.833 0 001.719-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a3.833 3.833 0 00-1.718-.756V8.334c.597.1 1.129.402 1.559.865a.75.75 0 001.142-.972A4.858 4.858 0 0012.75 6.819V6z" clipRule="evenodd" />
        </svg>
      ),
      terms: [3, 4, 12, 13, 14, 15, 16, 17, 33, 43, 47, 54, 58, 59, 60, 61, 67, 90]
    },
    {
      name: "Security & Data Privacy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
      ),
      terms: [10, 35, 41, 44, 75, 82, 84, 96]
    },
    {
      name: "Withdrawals & Transactions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
          <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
          <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
        </svg>
      ),
      terms: [7, 8, 11, 18, 26, 34, 36, 49, 62, 68, 89]
    },
    {
      name: "Risk & Liability",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      ),
      terms: [32, 50, 52, 56, 57, 63, 91, 100]
    },
    {
      name: "Other Terms",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5H6z" clipRule="evenodd" />
        </svg>
      ),
      terms: [9, 22, 25, 27, 28, 29, 30, 31, 37, 39, 40, 42, 45, 46, 48, 53, 55, 64, 65, 66, 71, 72, 73, 74, 76, 77, 78, 79, 81, 83, 86, 87, 88, 93, 94, 95, 97, 99]
    },
  ];

  const terms = [
    {
      title: "1. Investment Participation Eligibility",
      content: "Clients must be at least 18 years old, submit government-issued identification, and agree to full identity verification (KYC) before participating."
    },
    {
      title: "2. Regulatory Compliance Commitment",
      content: "Capital Nexus strictly adheres to applicable U.S. and international laws regarding cryptocurrency investment. We report to or comply with directives from SEC, IRS, and FinCEN where applicable."
    },
    {
      title: "3. Staking and Investment Differentiation",
      content: "All staking arrangements are governed under separate legal terms. Staking is not treated as a traditional investment vehicle but as a decentralized financial agreement."
    },
    {
      title: "4. ROI Capping Policy",
      content: "Each investment plan has a maximum ROI limit. Once that limit is achieved, the investment contract concludes, and clients are required to initiate a withdrawal."
    },
    {
      title: "5. SEC Yield Product Guidance Compliance",
      content: "To avoid being classified as an unregistered security or unlawful yield-bearing investment product, Capital Nexus imposes ROI caps and defined contract durations."
    },
    {
      title: "6. FinCEN Anti-Money Laundering Obligations",
      content: "All client transactions undergo automated AML screening. Suspicious activities are flagged, and reports may be submitted to U.S. authorities."
    },
    {
      title: "7. Taxation and Withdrawal Fees Responsibility",
      content: "Clients are solely responsible for payment of their personal taxes and withdrawal fees as required by their local tax authority, including the U.S. Internal Revenue Service (IRS). We do not withhold taxes from profits."
    },
    {
      title: "8. Independent Wallet Requirement",
      content: "Clients must provide a non-custodial wallet (not an exchange wallet) to receive profits. Capital Nexus is not liable for incorrect or inaccessible wallets."
    },
    {
      title: "9. Investment Plan Termination Clause",
      content: "Capital Nexus may terminate an investment plan early if market volatility poses a systemic risk, with remaining ROI distributed proportionately."
    },
    {
      title: "10. Data Privacy and Confidentiality",
      content: "Capital Nexus collects sensitive client information (e.g., SSN, bank details) solely for regulatory verification and withdrawal compliance. All data is encrypted and stored securely, in accordance with GDPR and U.S. privacy laws."
    },
    // Add the rest of the terms (11-101) similarly
  ];

  // Adding the remaining terms (11-101)
  const remainingTerms = [
    {
      title: "11. Withdrawal Verification Process",
      content: "Before releasing funds, clients may be asked to submit documents to verify account ownership and tax status."
    },
    {
      title: "12. Use of Joint Staking Investment Structure",
      content: "Where two or more clients contribute to a staking pool, the ROI is split based on agreed contribution ratios (minimum 30% required per investor). Capital Nexus is not responsible for off-platform arrangements."
    },
    {
      title: "13. ROI Delay and Payout Timeline",
      content: "Capital Nexus disburses ROIs within the timeline stated in the plan. Unavoidable delays may occur due to blockchain congestion or wallet issues."
    },
    {
      title: "14. Investment Plan Availability and Discontinuation",
      content: "Capital Nexus may discontinue a plan without prior notice if legally or financially required. Active investors will be notified and protected."
    },
    {
      title: "15. Crypto Volatility Acknowledgment",
      content: "Clients acknowledge that cryptocurrency assets are volatile. Capital is not guaranteed."
    },
    {
      title: "16. No Guarantee of Future ROI",
      content: "Past ROI performance is not an indicator or guarantee of future returns. Market behavior and legal changes can affect profitability."
    },
    {
      title: "17. Plan Cycle Completion Policy",
      content: "Clients must complete the full investment cycle before requesting capital or ROI return, unless under emergency terms."
    },
    {
      title: "18. Emergency Withdrawal Clause",
      content: "Clients may request an emergency withdrawal in writing. Approval is discretionary and may result in ROI forfeiture."
    },
    {
      title: "19. Country-Specific Regulatory Alignment",
      content: "Capital Nexus adjusts legal compliance and KYC protocols based on the client's country of residence and local laws."
    },
    {
      title: "20. SEC & IRS Cooperation Agreement",
      content: "We comply with subpoenas and regulatory demands from U.S. tax or securities agencies regarding client activities."
    },
    {
      title: "21. Blacklist and Sanctions Policy",
      content: "Clients from countries sanctioned by OFAC or listed by FATF as high-risk jurisdictions may be denied service."
    },
    {
      title: "22. Email and WhatsApp/TG Communication Clause",
      content: "All investment notices, policy updates, and account alerts will be sent via email or our verified WhatsApp and Telegram channels."
    },
    {
      title: "23. Identity Change Procedure",
      content: "Any updates to your legal name, identification, or wallet address must be verified through official documentation."
    },
    {
      title: "24. Unauthorized Use Ban",
      content: "Clients may not share their accounts or investment plans with unauthorized users or third parties."
    },
    {
      title: "25. Account Inactivity Monitoring",
      content: "Inactive accounts (6+ months) may be flagged. If funds are present, we will attempt contact before account freeze."
    },
    // Continuing with terms 26-101...
    {
      title: "26. Transparency in Fees",
      content: "All fees will be disclosed before investment begins. There are no hidden charges or deductions without disclosure."
    },
    {
      title: "27. Profit Reporting for IRS",
      content: "We provide transaction reports that clients can use to file crypto gains with the IRS or their country's tax agency."
    },
    {
      title: "28. No Third-Party Investment Authority",
      content: "Clients must not authorize external traders or third parties to invest through Capital Nexus unless legally permitted and verified."
    },
    {
      title: "29. Dispute Resolution Protocol",
      content: "Any disputes must first be handled via internal mediation. If unresolved, they will be governed by Delaware state law."
    },
    {
      title: "30. NFT/Crypto Asset Holding Disclaimer",
      content: "Capital Nexus does not offer investment plans involving NFTs, meme coins, or unregulated token launches."
    },
    {
      title: "31. Real-Time Account Monitoring",
      content: "Clients can request status updates and live logs of transactions and ROI calculations."
    },
    {
      title: "32. Risk Disclosure Agreement",
      content: "Clients must sign a risk agreement at signup acknowledging they may lose part or all of their investment."
    },
    {
      title: "33. Minimum Investment Thresholds",
      content: "All plans have stated minimums (e.g., 30% minimum for joint staking) and must be fully met for activation."
    },
    {
      title: "34. ROI Cap Enforcement Procedure",
      content: "Once ROI cap is reached, the client will be notified via WhatsApp and prompted to initiate withdrawal."
    },
    {
      title: "35. Wallet Ownership Verification",
      content: "Capital Nexus verifies wallet ownership before final ROI disbursement to reduce fraud."
    },
    {
      title: "36. No Custodial Services Clause",
      content: "We do not store or hold client funds long term. Funds are automatically disbursed upon contract completion."
    },
    {
      title: "37. No Loan Services Offered",
      content: "Capital Nexus does not offer collateralized loans, margin borrowing, or interest-bearing account features."
    },
    {
      title: "38. Annual KYC Update Requirement",
      content: "Clients must re-submit updated KYC every 12 months to comply with financial transparency laws."
    },
    {
      title: "39. Plan Transfer Restrictions",
      content: "Clients may not transfer investment plans to another individual or institution."
    },
    {
      title: "40. Transaction Audit Rights",
      content: "Capital Nexus retains the right to audit client portfolios if suspicious activity is detected."
    },
    {
      title: "41. Prohibited Behavior Clause",
      content: "Scamming, phishing, abusive language, or threats toward staff or platform results in account suspension."
    },
    {
      title: "42. Social Media Disclosure Rules",
      content: "Clients may not disclose personal ROI, dashboard screenshots, or referral commissions on public forums without permission."
    },
    {
      title: "43. Multi-Tier Investment Rules",
      content: "Clients may enroll in multiple plans only if funds are verifiably sourced and not reused."
    },
    {
      title: "44. Crypto Address Whitelisting",
      content: "Clients must provide and confirm wallet addresses prior to each withdrawal. New wallets require reconfirmation."
    },
    {
      title: "45. Account Freeze Under Investigation",
      content: "If we receive legal orders or internal triggers, client accounts may be frozen for up to 30 days pending investigation."
    },
    {
      title: "46. Platform Maintenance Interruptions",
      content: "System maintenance may affect access to dashboards temporarily. Clients will be notified in advance."
    },
    {
      title: "47. ROI Distribution Method",
      content: "ROIs are paid in the cryptocurrency of your original investment unless otherwise arranged."
    },
    {
      title: "48. Account Termination Rights",
      content: "Capital Nexus reserves the right to terminate accounts that violate our terms, with or without notice."
    },
    {
      title: "49. Use of Coinbase NFT App for Disbursement",
      content: "Due to our platform security policies, Capital Nexus disburses profits exclusively to wallets on the Coinbase NFT app. We do not process final ROI payouts to any other exchange."
    },
    {
      title: "50. No Financial Advisory Services",
      content: "Capital Nexus does not act as a registered financial advisor. All investment decisions are the client's own responsibility."
    },
    {
      title: "51. Terms Acceptance Required",
      content: "Clients must accept these Terms and Conditions before any funds are received or investments activated."
    },
    {
      title: "52. Platform Account Locking Protocol",
      content: "Capital Nexus may temporarily lock user accounts if suspicious behavior is detected or if documents are incomplete, pending re-verification."
    },
    {
      title: "53. Custodial Responsibility Disclaimer",
      content: "Capital Nexus does not serve as a custodial bank. Clients retain ownership of their crypto and acknowledge inherent wallet risks."
    },
    {
      title: "54. Plan Upgrade Policy",
      content: "Clients must complete their current investment cycle before upgrading or switching to a new plan."
    },
    {
      title: "55. Referral Program Conditions",
      content: "Referral earnings are valid only if referred clients pass KYC and maintain investment for at least 30 days."
    },
    {
      title: "56. False Information Penalty",
      content: "Submitting false documents or identities results in immediate account ban and possible legal reporting."
    },
    {
      title: "57. No Trading Advice Liability",
      content: "All investment decisions are made at clients' risk. Capital Nexus is not responsible for losses from trades, even if suggested by public updates."
    },
    {
      title: "58. Capital Preservation Not Guaranteed",
      content: "Clients agree that crypto values may fluctuate significantly, and original capital may not be preserved."
    },
    {
      title: "59. Risk Tolerance Declaration",
      content: "Clients must declare they understand the risk level of crypto investments before fund deployment."
    },
    {
      title: "60. Plan Expiry Notice Period",
      content: "Capital Nexus will notify clients 7 days before an investment cycle ends to allow preparation for withdrawal."
    },
    {
      title: "61. Asset Rebalancing Rights",
      content: "Capital Nexus reserves the right to rebalance internally staked assets for liquidity management, with no effect on client ROI."
    },
    {
      title: "62. Delay in Profit Payout Clause",
      content: "Payouts may be delayed due to blockchain congestion, wallet verification issues, or regulatory reviews."
    },
    {
      title: "63. Investment Diversification Advisory",
      content: "Capital Nexus advises clients to diversify and not invest all funds in a single tier or staking plan."
    },
    {
      title: "64. Client Duty to Update Contact Information",
      content: "Clients are responsible for keeping their contact details current. Undelivered notices are not our responsibility."
    },
    {
      title: "65. Notification Acceptance by Platform",
      content: "All notifications sent via WhatsApp or Telegram from official Capital Nexus accounts will be deemed received."
    },
    {
      title: "66. Conflict of Interest Declaration",
      content: "Capital Nexus does not act on behalf of any outside trading desk and operates independently to avoid conflicts."
    },
    {
      title: "67. Staking Capital Lock Period",
      content: "Staked capital cannot be withdrawn before the contract term unless under emergency withdrawal terms."
    },
    {
      title: "68. Emergency Withdrawal Clause",
      content: "Clients may request emergency withdrawal with formal documentation; fees may apply, and ROI may be forfeited."
    },
    {
      title: "69. Multi-Jurisdictional Compliance",
      content: "Capital Nexus adjusts its procedures for clients in different countries to comply with local financial laws."
    },
    {
      title: "70. Regulatory Freeze Policy",
      content: "If a local or international regulatory body issues a freeze order, client funds may be temporarily held."
    },
    {
      title: "71. Independent Audit Compliance",
      content: "Capital Nexus undergoes voluntary third-party audits and clients agree to periodic account reviews."
    },
    {
      title: "72. Public Claims and Testimonials Policy",
      content: "Users may not make public investment claims or testimonials without company review to ensure truthfulness."
    },
    {
      title: "73. Legal Jurisdiction Clause",
      content: "All disputes will be governed by applicable laws of the United States, specifically those in Delaware."
    },
    {
      title: "74. Crypto-Asset Type Restrictions",
      content: "We only accept approved cryptocurrencies for investment (e.g., BTC, ETH, USDT). Unlisted coins are rejected."
    },
    {
      title: "75. Security Best Practice Agreement",
      content: "Clients agree to follow basic wallet safety rules (e.g., 2FA, wallet backups) as part of platform use."
    },
    {
      title: "76. No Gambling or Ponzi Association",
      content: "Capital Nexus strictly distances itself from gambling schemes, Ponzi operations, or HYIPs."
    },
    {
      title: "77. Independent Wallet Backup Liability",
      content: "Clients are responsible for securing their external wallets and backup phrases."
    },
    {
      title: "78. Dynamic ROI Adjustments Clause",
      content: "Capital Nexus may adjust ROI projections based on market activity, with prior notice to clients."
    },
    {
      title: "79. Transaction History Access",
      content: "Clients can request detailed transaction logs for auditing or tax filing purposes."
    },
    {
      title: "80. Client Identity Reconfirmation",
      content: "Capital Nexus may periodically request clients to reconfirm their identity to continue withdrawals."
    },
    {
      title: "81. Non-Refundable Investment Policy",
      content: "Once an investment is made, it is non-refundable except under approved emergency exit clauses."
    },
    {
      title: "82. Suspicious Transaction Flagging Protocol",
      content: "We reserve the right to hold or cancel any transaction deemed suspicious by blockchain analysis tools."
    },
    {
      title: "83. Crypto-to-Crypto Conversion Not Offered",
      content: "Capital Nexus does not convert client assets between cryptocurrencies."
    },
    {
      title: "84. Multi-Factor Authentication Requirement",
      content: "Clients must enable MFA for full account access and withdrawals."
    },
    {
      title: "85. Legal Name Disclosure Requirement",
      content: "All accounts must be under legal names only. Pseudonyms or shell names will be rejected."
    },
    {
      title: "86. Annual Review of Terms Clause",
      content: "These terms may be updated annually or sooner to reflect regulatory changes."
    },
    {
      title: "87. Marketing Communication Opt-In Policy",
      content: "Clients can opt-in to receive product updates, but unsubscribing will not affect account functions."
    },
    {
      title: "88. Non-Solicitation of Staff Clause",
      content: "Clients may not attempt to solicit, hire, or impersonate Capital Nexus staff."
    },
    {
      title: "89. Structured Payout Agreement",
      content: "Larger ROI disbursements may be split into tranches to protect both the client and system liquidity."
    },
    {
      title: "90. Staking Rollover Restriction",
      content: "Auto-rollover of staking plans is not permitted. A fresh agreement is required."
    },
    {
      title: "91. Crypto Market Downtime Liability Disclaimer",
      content: "Capital Nexus is not liable for price slippage, exchange outages, or sudden token delistings."
    },
    {
      title: "92. FATF Recommendation Compliance",
      content: "We adhere to FATF travel rule recommendations in applicable jurisdictions."
    },
    {
      title: "93. Content Ownership and Usage Rights",
      content: "All educational content is the intellectual property of Capital Nexus and may not be reused."
    },
    {
      title: "94. Verified Partner Network Clause",
      content: "Clients referred from or interacting with our partner network must meet same compliance standards."
    },
    {
      title: "95. Payment Method Restrictions",
      content: "We do not accept credit cards, PayPal, or gift cards—only verified crypto payments."
    },
    {
      title: "96. Wallet Whitelisting Policy",
      content: "Clients must whitelist their withdrawal wallet addresses in advance to prevent fraud."
    },
    {
      title: "97. Post-Investment Disengagement Clause",
      content: "Once a plan ends and funds are withdrawn, client's access to that plan's history may be archived."
    },
    {
      title: "98. Minor Investor Policy",
      content: "Under no circumstances do we serve minors, regardless of parental consent."
    },
    {
      title: "99. Token Launch or ICO Exclusion Clause",
      content: "Capital Nexus does not support or promote ICOs or token launches to avoid SEC classification."
    },
    {
      title: "100. Capital Loss Protection Policy (Minimum 70% ROI Guarantee)",
      content: "Capital Nexus offers a limited capital protection policy which ensures that in the event of unforeseeable disruptions, such as critical system failure, platform closure due to regulatory orders, or verified security breaches, clients will receive no less than 70% of their originally promised returns. This protection is backed by internal liquidity reserves, applicable only to verified clients, and not considered insurance."
    },
    {
      title: "101. Final Clause – Regulatory Continuity Assurance",
      content: "Capital Nexus shall always operate within the regulatory framework of the jurisdictions it serves and update all clients on new policies, compliance duties, or legal shifts that affect investment integrity."
    },
  ];

  // Combine all terms
  const allTerms = [...terms, ...remainingTerms];

  // Function to find a term by number
  const findTerm = (number) => {
    return allTerms.find((term, index) => index + 1 === number);
  };

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? "bg-[#090909] text-gray-200" : "bg-white text-gray-800"}`}>
      {/* Hero section */}
      <div className={`py-16 ${isDarkMode ? "bg-[#111]" : "bg-blue-50"}`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            CAPITAL NEXUS – Terms and Conditions
          </h1>
          
          <p className={`text-sm md:text-base italic ${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-3xl`}>
            These terms reflect Capital {"Nexus'"} compliance with U.S. crypto laws (e.g., SEC, IRS, FinCEN), global regulations (e.g., FATF), 
            and internal policies designed to protect investor assets, ensure transparent yield programs, and prevent legal and operational risks.
          </p>
        </div>
      </div>

      {/* Table of contents */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className={`p-6 rounded-lg mb-8 ${isDarkMode ? "bg-[#111] border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Link key={index} href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className={`flex items-center p-3 rounded-md transition-colors ${isDarkMode ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-100"}`}>
                  <div className={`mr-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                    {category.icon}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories and terms */}
        {categories.map((category, categoryIndex) => (
          <div 
            key={categoryIndex} 
            id={category.name.toLowerCase().replace(/\s+/g, '-')} 
            className="mb-12 scroll-mt-24"
          >
            <div className={`flex items-center gap-3 mb-6 pb-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className={`${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                {category.icon}
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {category.name}
              </h2>
            </div>
            
            <div className="space-y-4">
              {category.terms.map((termNumber, index) => {
                const term = findTerm(termNumber);
                if (!term) return null;
                
                return (
                  <div 
                    key={index}
                    className={`p-5 rounded-lg transition-all hover:shadow-md ${
                      isDarkMode 
                        ? "bg-[#111] border border-white/10 hover:border-blue-500/30" 
                        : "bg-gray-50 border border-gray-200 hover:border-blue-500/30"
                    }`}
                  >
                    <h3 className={`font-bold mb-3 text-lg ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                      {term.title}
                    </h3>
                    <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {term.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Footer */}
        <div className={`mt-16 p-6 rounded-lg ${isDarkMode ? "bg-[#111] border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
          <div className="text-center">
            <p className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              These 101 terms serve as the comprehensive legal and operational framework for all users of Capital Nexus investment services.
            </p>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              For questions or legal clarification, clients should contact Capital Nexus Support via our verified channels.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link href="/" className={`px-4 py-2 rounded-md ${isDarkMode ? "bg-[#0052FF] text-white" : "bg-blue-600 text-white"} hover:opacity-90 transition-opacity`}>
                Return to Home
              </Link>
              <Link href="/auth" className={`px-4 py-2 rounded-md ${isDarkMode ? "bg-[#222] text-white/90" : "bg-gray-200 text-gray-800"} hover:opacity-90 transition-opacity`}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 