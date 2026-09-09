// Scam Patterns, Lexicons, and Suspicious Indicators

export const URGENCY_PATTERNS = [
  { pattern: /\b(immediate(ly)?|urgent(ly)?|within \d+\s*(hours?|hrs?|mins?))\b/i, weight: 25, label: "Extreme Urgency Pressure", explanation: "The message creates artificial panic to force quick action before thinking." },
  { pattern: /\b(account (will be |is )?(blocked|suspended|deactivated|frozen|terminated))\b/i, weight: 35, label: "Account Freeze Threat", explanation: "Threatens punitive account suspension or deactivation to intimidate the recipient." },
  { pattern: /\b(final notice|last warning|action required|immediate attention)\b/i, weight: 20, label: "Ultimatum / Warning", explanation: "Uses authoritative pressure tactics mimicking legal or operational ultimatums." },
  { pattern: /\b(electricity (will be |is )?disconnected|power cut tonight)\b/i, weight: 35, label: "Utility Disconnection Threat", explanation: "Common utility extortion scam threatening immediate essential service shutdown." }
];

export const CREDENTIAL_PATTERNS = [
  { pattern: /\b(verify|update|complete)\s+(your\s+)?(kyc|pan|aadhaar|id proof)\b/i, weight: 35, label: "Unsolicited KYC / Identity Demand", explanation: "Requests personal identification documents or KYC updates via unverified channels." },
  { pattern: /\b(otp|one time password|verification code|pin|cvv|net\s*banking password|secret key)\b/i, weight: 40, label: "Sensitive Credential Request", explanation: "Directly or indirectly solicits confidential security tokens (OTP/PIN/CVV/Passwords)." },
  { pattern: /\b(click here to (login|verify|update|claim|unlock))\b/i, weight: 25, label: "Coercive Action Link", explanation: "Directs users to click an embedded or shortened link to verify identity." },
  { pattern: /\b(download (anydesk|teamviewer|rustdesk|quicksupport|apk))\b/i, weight: 45, label: "Remote Access / Malicious App Trap", explanation: "Attempts to lure victim into installing remote desktop software or unverified APKs." }
];

export const FINANCIAL_LURE_PATTERNS = [
  { pattern: /\b(won|winner|lottery|lucky draw|cash prize|jackpot)\b/i, weight: 30, label: "Lottery / Prize Bait", explanation: "Fabricates a prize or sweepstakes win requiring upfront engagement or fees." },
  { pattern: /\b(cashback of|credited (to|in) your account|claim refund|tax refund)\b/i, weight: 30, label: "Unsolicited Refund / Cashback Lure", explanation: "Falsely claims money is waiting to be received, often leading to UPI reverse-charge traps." },
  { pattern: /\b(part[ -]?time job|earn \d{3,6}\s*(per day|daily|monthly)|youtube like|telegram task)\b/i, weight: 40, label: "Work-From-Home / Task Scam", explanation: "Classic task-based fraud scheme promising unrealistic daily pay for simple online actions." },
  { pattern: /\b(guaranteed returns?|crypto investment|forex trading|double your money)\b/i, weight: 35, label: "Ponzi / Investment Fraud", explanation: "Promises guaranteed high returns on speculative assets, a hallmark of crypto/forex scams." }
];

export const IMPERSONATION_PATTERNS = [
  { pattern: /\b(sbi|hdfc|icici|axis bank|pnb|canara bank|bank of baroda|paypal|rbi)\b/i, weight: 20, brand: "Banking", label: "Financial Institution Impersonation" },
  { pattern: /\b(income tax department|cyber crime police|cbi|customs department|narcotics control|trai|court)\b/i, weight: 35, brand: "Government/Law", label: "Law Enforcement / Official Agency Impersonation" },
  { pattern: /\b(fedex|dhl|india post|blue dart|courier|delivery failed|customs duty)\b/i, weight: 25, brand: "Logistics", label: "Courier / Package Delivery Impersonation" },
  { pattern: /\b(netflix|amazon|apple id|microsoft support|google security)\b/i, weight: 20, brand: "Tech Provider", label: "Brand Service Impersonation" }
];

export const SUSPICIOUS_TLDS = [
  '.top', '.xyz', '.club', '.work', '.loan', '.click', '.live', '.cfd', '.rest',
  '.gq', '.tk', '.ml', '.ga', '.cf', '.buzz', '.fit', '.icu', '.sbs', '.monster',
  '.online', '.site', '.website', '.vip', '.info', '.cc', '.to'
];

export const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'cutt.ly', 'rb.gy', 'shorturl.at',
  'ow.ly', 'buff.ly', 'bl.ink', 'tiny.cc', 'bc.vc', 'qr.ae', 'v.gd', 'trib.al'
];

export const KNOWN_BRAND_DOMAINS = {
  sbi: ['onlinesbi.sbi', 'sbi.co.in'],
  hdfc: ['hdfcbank.com'],
  icici: ['icicibank.com'],
  axis: ['axisbank.com'],
  pnb: ['pnbindia.in'],
  paypal: ['paypal.com'],
  amazon: ['amazon.com', 'amazon.in'],
  apple: ['apple.com'],
  google: ['google.com'],
  microsoft: ['microsoft.com'],
  netflix: ['netflix.com'],
  fedex: ['fedex.com'],
  indiapost: ['indiapost.gov.in']
};

export const COMMON_SCAM_CATEGORIES = [
  {
    id: "banking-fraud",
    name: "Banking Fraud",
    description: "Phishing messages claiming unauthorized transactions, blocked cards, or net-banking login resets.",
    riskLevel: "Critical",
    commonTactics: ["Urgent account lock threats", "Fake net-banking portals", "OTP interception calls"],
    redFlags: ["Sender phone number instead of official 6-digit Bank SMS header", "Suspicious link asking for netbanking credentials", "Request for debit card CVV/expiry"]
  },
  {
    id: "upi-payment",
    name: "UPI / Payment Scam",
    description: "Fraudsters send payment collect requests or malicious QR codes claiming you are receiving money.",
    riskLevel: "High",
    commonTactics: ["Fake payment screenshots", "Reverse-charge UPI QR codes", "OLX buyer advance token fraud"],
    redFlags: ["Entering your UPI PIN to 'receive' money (PIN is ONLY needed to SEND)", "Generic QR codes with personal VPA addresses", "Unsolicited Google Pay / PhonePe collect requests"]
  },
  {
    id: "fake-kyc",
    name: "Fake KYC Scam",
    description: "Impersonation of telecom operators (Jio, Airtel) or banks threatening SIM/Account deactivation without KYC.",
    riskLevel: "Critical",
    commonTactics: ["SMS with non-standard contact numbers", "Direct download links to malicious APKs", "Screen-sharing app installation requests"],
    redFlags: ["Message from personal mobile number instead of telecom sender ID", "Ask to install AnyDesk/TeamViewer", "Urgency to verify within 24 hours"]
  },
  {
    id: "job-scam",
    name: "Job / Task Scam",
    description: "Prepaid tasks, YouTube video liking, or Google review jobs promising ₹3,000–₹10,000 per day.",
    riskLevel: "High",
    commonTactics: ["Initial small payouts to build trust", "Transition to high-value crypto/prepaid 'merchant tasks'", "Telegram group peer pressure"],
    redFlags: ["Recruitment via WhatsApp/Telegram from unknown foreign codes (+84, +62, +234)", "Requiring advance deposit to 'unlock' earnings", "Absence of real employment contract"]
  },
  {
    id: "government-impersonation",
    name: "Government / Police Impersonation",
    description: "Fabricated claims of arrest warrants, customs parcel drug seizures, or income tax penalty notifications.",
    riskLevel: "Critical",
    commonTactics: ["Fake digital arrest video calls", "Forged police letterheads", "Demands for RTGS transfers to 'RBI verification accounts'"],
    redFlags: ["Law enforcement never conducts arrests or interrogations via Skype/WhatsApp", "Demands for immediate fund transfer to avoid arrest", "Threats of immediate arrest if call is disconnected"]
  },
  {
    id: "delivery-scam",
    name: "Delivery / Courier Scam",
    description: "Notices claiming an undelivered parcel due to an incomplete address requiring a ₹5–₹25 fee.",
    riskLevel: "Medium-High",
    commonTactics: ["Phishing gateway harvesting credit card details", "Fake tracking portals", "Lookalike domain names (e.g. indiapost-track.top)"],
    redFlags: ["Links using unofficial domains (.top, .xyz, .site)", "Asking for payment of small token amounts via credit card", "No tracking ID or tracking ID that doesn't match official carrier format"]
  },
  {
    id: "investment-scam",
    name: "Investment / Crypto Scam",
    description: "Deceptive investment platforms, WhatsApp stock tip groups, or automated high-frequency crypto trading bots.",
    riskLevel: "Critical",
    commonTactics: ["Rigged trading dashboards showing massive fake profits", "Demands for withdrawal taxes or fees to release capital", "Celebrity deepfake endorsement videos"],
    redFlags: ["Guaranteed return promises above market benchmarks", "Pressure to transfer funds to personal individual bank accounts", "Inability to withdraw deposited capital without paying extra fees"]
  },
  {
    id: "lottery-prize",
    name: "Lottery / Prize Scam",
    description: "Notifications claiming you won KBC lottery, Amazon gift card, or car contest you never entered.",
    riskLevel: "High",
    commonTactics: ["Bogus certificate of winning", "Demands for registration fee, TDS, or processing charges", "Audio message lures from fake executives"],
    redFlags: ["Winning a contest you never registered for", "Requirement to pay money in order to receive your prize", "Unprofessional grammar, all-caps, and excessive exclamation marks"]
  },
  {
    id: "phishing-link",
    name: "Phishing / Credential Harvesting",
    description: "Fake login interfaces mirroring Google, Microsoft 365, Facebook, or banking portals to steal passwords and session tokens.",
    riskLevel: "Critical",
    commonTactics: ["Homoglyph/lookalike domains", "Session cookie hijacking via reverse proxies", "Password reset lure emails"],
    redFlags: ["Mismatched address bar URL", "Missing or invalid TLS/SSL certificate", "Form fields asking for two-factor authentication codes immediately"]
  },
  {
    id: "malicious-qr",
    name: "Malicious QR Code (Quishing)",
    description: "QR codes embedded in emails, parking meters, or merchant stands redirecting to malware or draining payment VPAs.",
    riskLevel: "High",
    commonTactics: ["Physical sticker placed over legitimate merchant QR", "QR code in email bypassing text email filters", "UPI pay string with pre-filled amount and recipient"],
    redFlags: ["Physical stickers visibly placed over existing shop QR codes", "Email asking you to scan QR code on phone to verify identity", "QR asking for UPI PIN authorization"]
  }
];
