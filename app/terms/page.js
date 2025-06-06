"use client";
import { useTheme } from "../../contexts/themeContext";

export default function TermsAndConditions() {
  const { isDarkMode } = useTheme();

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

  return (
    <div className={`min-h-screen py-8 px-4 md:px-8 lg:px-16 ${isDarkMode ? "bg-[#090909] text-gray-200" : "bg-white text-gray-800"}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-2xl md:text-3xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          CAPITAL NEXUS – Terms and Conditions
        </h1>
        
        <p className="text-sm italic mb-8">
          Note: These terms reflect Capital {"Nexus'"} compliance with U.S. crypto laws (e.g., SEC, IRS, FinCEN), global regulations (e.g., FATF), 
          and internal policies designed to protect investor assets, ensure transparent yield programs, and prevent legal and operational risks.
        </p>
        
        <div className="space-y-6">
          {allTerms.map((term, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-[#111] border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
              <h3 className={`font-bold mb-2 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                {term.title}
              </h3>
              <p className="text-sm">
                {term.content}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm">
          <p>
            These 101 terms serve as the comprehensive legal and operational framework for all users of Capital Nexus investment services.
          </p>
          <p className="mt-2">
            For questions or legal clarification, clients should contact Capital Nexus Support via our verified channels.
          </p>
        </div>
      </div>
    </div>
  );
} 