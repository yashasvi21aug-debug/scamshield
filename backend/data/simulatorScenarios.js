// ScamShield AI — Scam Simulator Scenarios Catalog & Skill/Concept Tagging Engine
// All scenarios are certified harmless educational simulations.
// Contains server-side deterministic scoring, training concept tags, warning signals, and educational lessons.

export const TRAINING_CONCEPTS = {
  urgency: {
    id: 'urgency',
    label: 'Urgency Recognition',
    description: 'Detecting artificial panic deadlines and pressure to act immediately without critical thinking.'
  },
  authority_impersonation: {
    id: 'authority_impersonation',
    label: 'Authority Impersonation',
    description: 'Recognizing fraudulent claims of police, Supreme Court, CBI, bank managers, and utility officials.'
  },
  suspicious_link: {
    id: 'suspicious_link',
    label: 'Suspicious Link Verification',
    description: 'Identifying lookalike domains, deceptive subdomains, and unverified TLDs (.top, .xyz).'
  },
  payment_pressure: {
    id: 'payment_pressure',
    label: 'Payment Pressure Defense',
    description: 'Resisting high-pressure demands to send money, advance deposits, or authorize transactions.'
  },
  credential_request: {
    id: 'credential_request',
    label: 'Credential Request Defense',
    description: 'Safeguarding passwords, OTPs, Aadhaar, PAN, and confidential authentication credentials.'
  },
  reward_manipulation: {
    id: 'reward_manipulation',
    label: 'Reward & Lure Awareness',
    description: 'Spotting unrealistic financial promises, fake lottery prizes, and too-good-to-be-true earnings.'
  },
  fear: {
    id: 'fear',
    label: 'Coercion & Fear Resistance',
    description: 'Overcoming psychological intimidation, arrest ultimatums, power disconnection, and legal prosecution.'
  },
  social_pressure: {
    id: 'social_pressure',
    label: 'Social Engineering Resistance',
    description: 'Resisting deceptive rapport building, false helpfulness, and out-of-band communication channels.'
  },
  identity_verification: {
    id: 'identity_verification',
    label: 'Identity Verification Protocols',
    description: 'Demanding independent proof of identity and rejecting unverified caller credentials.'
  },
  independent_verification: {
    id: 'independent_verification',
    label: 'Independent Verification',
    description: 'Always checking status via verified official applications, portals, and formal customer service lines.'
  },
  payment_safety: {
    id: 'payment_safety',
    label: 'UPI & Payment Safety Rules',
    description: 'Knowing that UPI PIN is exclusively for sending money, never for receiving refunds or credits.'
  }
};

export const SIMULATOR_SCENARIOS = [
  {
    id: "fake-bank-kyc",
    title: "Fake Bank KYC Suspension Notice",
    subtitle: "Urgent account block threat demanding immediate credential verification",
    category: "Banking",
    difficulty: "Beginner",
    estimatedMinutes: 2,
    isMultiStep: false,
    concepts: ["urgency", "authority_impersonation", "suspicious_link", "credential_request", "fear", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "SBI-ALERT / VK-SBINB",
      channel: "SMS",
      timestamp: "Today, 10:14 AM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "URGENT NOTICE: Dear customer, your State Bank net banking access has been blocked today due to pending KYC mandate. Immediately complete verification at http://sbi-kyc-mandate.top/login within 24 hours to prevent permanent account suspension.",
        context: "You receive an unsolicited SMS claiming your primary bank account is suspended and demanding immediate action via a third-party link.",
        question: "What is your immediate, safest course of action?",
        conceptsTested: ["urgency", "suspicious_link", "credential_request", "fear", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Click the link immediately to prevent your account from being frozen.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Clicking unknown links in unsolicited messages leads to credential phishing portals designed to steal banking passwords and OTPs.",
            missedSignals: ["Artificial urgency deadline", "Suspicious unofficial domain (.top TLD)", "Unsolicited KYC threat"],
            missedConcepts: ["urgency", "suspicious_link", "credential_request", "fear"],
            testedConcepts: ["urgency", "suspicious_link"]
          },
          {
            id: "B",
            text: "Reply to the SMS asking for customer care verification details.",
            isSafe: false,
            score: 25,
            decision: "risky",
            reason: "Replying confirms your phone number is active to fraudsters and can lead to targeted follow-up social engineering.",
            missedSignals: ["Engaging with fraudulent sender", "Unverified contact channel"],
            missedConcepts: ["social_pressure", "identity_verification"],
            testedConcepts: ["identity_verification"]
          },
          {
            id: "C",
            text: "Forward the link to family or colleagues to ask if they received the same message.",
            isSafe: false,
            score: 40,
            decision: "risky",
            reason: "Forwarding unverified malicious links increases the likelihood that someone else inadvertently clicks and compromises their account.",
            missedSignals: ["Spreading unverified phishing links"],
            missedConcepts: ["suspicious_link", "social_pressure"],
            testedConcepts: ["suspicious_link"]
          },
          {
            id: "D",
            text: "Do NOT click the link. Log into your bank's verified mobile app or visit the official banking portal directly to check your KYC status.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Legitimate banks never suspend accounts via SMS links. Checking via the verified mobile app or official website safely verifies account status without exposing credentials.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["independent_verification", "urgency", "suspicious_link"]
          }
        ],
        redFlags: [
          "Artificial urgency ('within 24 hours' or 'permanent suspension')",
          "Unofficial domain (sbi-kyc-mandate.top instead of onlinesbi.sbi)",
          "Direct request to disclose credentials through an unsolicited message link",
          "Fear-inducing psychological manipulation"
        ],
        safeAction: "Never use links provided in unsolicited SMS. Always navigate independently to the official bank URL or mobile banking application.",
        lesson: "Banks never send SMS links threatening sudden suspension if KYC is not updated immediately. Any message creating panic with an external link is a textbook phishing attempt."
      }
    ]
  },
  {
    id: "fake-refund-upi",
    title: "Fake Customer Refund & UPI Reverse Collect Trap",
    subtitle: "Multi-stage payment scam escalating from a false refund promise to an unauthorized debit",
    category: "UPI & Payments",
    difficulty: "Intermediate",
    estimatedMinutes: 4,
    isMultiStep: true,
    concepts: ["payment_safety", "payment_pressure", "social_pressure", "authority_impersonation", "urgency", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "E-Commerce Refund Desk (+91 98214 09182)",
      channel: "WhatsApp & UPI",
      timestamp: "Today, 02:45 PM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "Hello Sir/Madam, we noticed your recent order had a duplicate charge of ₹2,500. Our accounts team has initiated an immediate refund. To receive this credit directly to your bank account, please accept our support call.",
        context: "The caller claims you are owed an instant refund for an e-commerce order and wants to guide you through receiving the payment.",
        question: "How should you respond to this unsolicited refund offer?",
        conceptsTested: ["social_pressure", "independent_verification", "reward_manipulation"],
        options: [
          {
            id: "A",
            text: "Accept the call and share your UPI ID so they can send the ₹2,500 refund.",
            isSafe: false,
            score: 30,
            decision: "risky",
            reason: "Engaging directly with unsolicited refund callers allows them to set up deceptive payment requests.",
            missedSignals: ["Unsolicited refund outreach", "Out-of-band communication channel"],
            missedConcepts: ["social_pressure", "reward_manipulation"],
            testedConcepts: ["social_pressure"]
          },
          {
            id: "B",
            text: "Check your official e-commerce order history and bank statement first to see if any duplicate charge actually occurred.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Checking the merchant's official portal exposes false premises immediately before entering any transaction.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["independent_verification", "social_pressure"]
          },
          {
            id: "C",
            text: "Ask them to send the money as cash instead.",
            isSafe: false,
            score: 20,
            decision: "risky",
            reason: "Entertaining dialogue with scammers continues the social engineering process.",
            missedSignals: ["Failure to terminate communication with unverified caller"],
            missedConcepts: ["social_pressure"],
            testedConcepts: ["social_pressure"]
          }
        ],
        redFlags: [
          "Unsolicited call or chat offering unexpected money",
          "Attempt to move conversation away from the official platform support ticket system"
        ],
        safeAction: "Verify any claimed charge or refund exclusively inside the merchant's official application.",
        lesson: "Real merchants process refunds automatically back to the original payment source without asking you to perform steps or take calls."
      },
      {
        stageNumber: 2,
        simulatedMessage: "The caller says: 'Sir, I have sent a UPI payment link of ₹2,500 to your PhonePe/GPay. You will see a notification: 'Refund from Accounts'. Please tap it, enter your UPI PIN, and your ₹2,500 will be credited.'",
        context: "The scammer sends a collect request that requires entering your UPI PIN.",
        question: "You see the notification on your phone asking for your UPI PIN. What do you do?",
        conceptsTested: ["payment_safety", "payment_pressure", "urgency"],
        options: [
          {
            id: "A",
            text: "Enter your UPI PIN quickly so the ₹2,500 enters your account.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Entering your UPI PIN NEVER receives money. It ONLY authorizes money to leave your account.",
            missedSignals: ["Entering UPI PIN to 'receive' money", "Reverse charge collect trap"],
            missedConcepts: ["payment_safety", "payment_pressure", "urgency"],
            testedConcepts: ["payment_safety", "payment_pressure"]
          },
          {
            id: "B",
            text: "Decline and block the request immediately. Remember that entering a UPI PIN only debits money, never credits it.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "You correctly recognized the fundamental rule of UPI: You NEVER need a PIN to receive money.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["payment_safety", "payment_pressure"]
          },
          {
            id: "C",
            text: "Change your UPI PIN first, then approve the request.",
            isSafe: false,
            score: 10,
            decision: "risky",
            reason: "Changing your PIN does not protect against an approved collect request; your money will still be debited.",
            missedSignals: ["Misunderstanding UPI transaction direction"],
            missedConcepts: ["payment_safety"],
            testedConcepts: ["payment_safety"]
          }
        ],
        redFlags: [
          "Requesting UPI PIN to receive money (the #1 UPI scam mechanism)",
          "Masking a 'PAY / COLLECT' request as a refund",
          "Urging you while staying on the phone line"
        ],
        safeAction: "Never enter your UPI PIN unless YOU are actively paying money. To receive funds, no PIN, password, or approval is required.",
        lesson: "Golden Rule of UPI: Entering your UPI PIN always subtracts money from your account. Receiving money requires ZERO actions from the recipient."
      },
      {
        stageNumber: 3,
        simulatedMessage: "15 minutes later, an official-sounding caller calls claiming to be 'Inspector Deshmukh from Cyber Crime Investigation Cell': 'Sir, our automated bank monitor detected a fraudulent attempt on your UPI account. To protect your remaining account balance from being frozen, you must temporarily transfer your funds to the RBI Secure Verification Escrow Account within 30 minutes.'",
        context: "The scammer escalates using authority impersonation and legal panic, attempting a secondary recovery fraud.",
        question: "How do you respond to the 'Cyber Crime Inspector' demanding a fund transfer to a secure escrow account?",
        conceptsTested: ["authority_impersonation", "fear", "urgency", "payment_pressure", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Follow the officer's instructions and transfer funds to the designated RBI escrow account to prevent freezing.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Police, RBI, or Cyber Crime units never ask citizens to transfer money to 'safe' accounts. This is a classic Secondary Recovery / Impersonation Scam.",
            missedSignals: ["No government agency uses 'safe escrow accounts'", "Fear-inducing deadline", "Unverified authority claims"],
            missedConcepts: ["authority_impersonation", "fear", "payment_pressure"],
            testedConcepts: ["authority_impersonation", "payment_pressure"]
          },
          {
            id: "B",
            text: "Hang up immediately. Refuse to transfer any funds. Dial 1930 or report directly to the official National Cyber Crime Reporting Portal (cybercrime.gov.in).",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Government bodies never request funds transfers over the phone. Independent verification via 1930 immediately neutralizes authority impersonation.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["authority_impersonation", "independent_verification", "fear"]
          },
          {
            id: "C",
            text: "Ask the officer to send his police badge photo on WhatsApp before making the transfer.",
            isSafe: false,
            score: 25,
            decision: "risky",
            reason: "Scammers routinely fabricate realistic fake ID cards, badges, and forged Supreme Court/CBI letters to deceive victims.",
            missedSignals: ["Relying on easily forged digital credentials on WhatsApp"],
            missedConcepts: ["identity_verification", "authority_impersonation"],
            testedConcepts: ["identity_verification"]
          }
        ],
        redFlags: [
          "Request to transfer money to a 'safe reserve account' or 'RBI escrow'",
          "Claiming to be police or government authority conducting financial actions over the phone",
          "Artificial 30-minute threat of account freeze"
        ],
        safeAction: "Law enforcement never conducts asset transfers over the phone. Immediately terminate the call and dial 1930.",
        lesson: "There is NO such thing as a 'Safe RBI Account' or 'Government Escrow'. Any caller asking you to move money for security reasons is 100% an impersonation scammer."
      }
    ],
    scamChainSummary: {
      chainTitle: "Multi-Tier Psychological Escalation Chain",
      stage1Breakdown: "Stage 1 (The Hook): Fabricated unexpected refund creates greed/confusion.",
      stage2Breakdown: "Stage 2 (The Technical Trap): Deceptive UPI collect request masks debit as credit.",
      stage3Breakdown: "Stage 3 (Authority Panic): High-pressure cyber police impersonation exploits fear to extract remaining savings."
    }
  },
  {
    id: "fake-courier-customs",
    title: "Courier Delivery Address Update & Customs Fee",
    subtitle: "Micro-payment lure with deceptive redelivery link designed to harvest card details",
    category: "Deliveries",
    difficulty: "Beginner",
    estimatedMinutes: 2,
    isMultiStep: false,
    concepts: ["payment_pressure", "suspicious_link", "credential_request", "urgency", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "IndiaPost / SpeedPost Alert",
      channel: "SMS",
      timestamp: "Today, 11:30 AM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "SPEEDPOST ALERT: Your consignment IN-9021482 cannot be delivered due to an incomplete street address. Please update your address and pay a ₹25 redelivery fee at http://indiapost-parcel-update.top/tracking within 12 hours or item will be returned to sender.",
        context: "You receive an SMS concerning an unspecific parcel awaiting delivery, requiring a trivial ₹25 payment via link.",
        question: "What should you do about this redelivery notification?",
        conceptsTested: ["urgency", "suspicious_link", "payment_pressure", "credential_request", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Click the link and pay the ₹25 with your debit card. It is only ₹25 so there is very little risk.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "The ₹25 is bait. The fake portal captures your complete card number, expiry date, CVV, and OTP to drain your entire bank account.",
            missedSignals: ["Micro-payment credential trap", "Fake domain (.top TLD)", "Unverified package tracking code"],
            missedConcepts: ["payment_pressure", "suspicious_link", "credential_request"],
            testedConcepts: ["suspicious_link", "payment_pressure"]
          },
          {
            id: "B",
            text: "Copy the tracking number (IN-9021482), visit the official website (indiapost.gov.in) directly in your browser, and verify if the package is real.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Verifying tracking numbers exclusively on the official government or courier domain completely bypasses phishing links.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["independent_verification", "suspicious_link"]
          },
          {
            id: "C",
            text: "Call the phone number from which the SMS was sent to dictate your address.",
            isSafe: false,
            score: 30,
            decision: "risky",
            reason: "SMS headers are often spoofed or sent via automated bulk gateways; calling back connects to scammers.",
            missedSignals: ["Calling back unverified sender numbers"],
            missedConcepts: ["social_pressure", "identity_verification"],
            testedConcepts: ["identity_verification"]
          }
        ],
        redFlags: [
          "Unofficial domain with deceptive naming (indiapost-parcel-update.top)",
          "Micro-payment lure (₹25 or small fee) designed to extract credit card credentials",
          "Artificial 12-hour ultimatum to bypass analytical thinking"
        ],
        safeAction: "Check tracking numbers exclusively on the official postal authority portal (e.g. indiapost.gov.in). Postal services do not collect credit card details via SMS links.",
        lesson: "Scammers use micro-fees (₹10-₹50) because victims consider it too small to be dangerous. The objective is never the ₹25; it is the entire bank account or card limit."
      }
    ]
  },
  {
    id: "fake-electricity-bill",
    title: "Urgent Electricity Disconnection Threat",
    subtitle: "High-pressure utility scam threatening immediate power cutoff tonight",
    category: "Utilities",
    difficulty: "Beginner",
    estimatedMinutes: 2,
    isMultiStep: false,
    concepts: ["urgency", "authority_impersonation", "fear", "payment_pressure", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "State Electricity Board (EB-ALERT)",
      channel: "SMS",
      timestamp: "Today, 08:15 PM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "DEAR CONSUMER: Your electricity power will be disconnected tonight at 09:30 PM because your previous month bill was not updated. Please contact our electricity officer Mr. Sharma immediately at +91 98321 44019 to prevent disconnection.",
        context: "A high-stress message received late in the evening threatening an immediate power cutoff within 1 hour.",
        question: "What is your best response to this emergency cutoff notice?",
        conceptsTested: ["urgency", "fear", "authority_impersonation", "payment_pressure", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Call Mr. Sharma immediately on the mobile number provided and transfer the bill via UPI.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Government electricity boards never conduct official bill collection through personal 10-digit mobile numbers or personal UPI accounts.",
            missedSignals: ["Personal 10-digit mobile number for official utility", "Immediate nighttime cutoff threat", "Informal communication"],
            missedConcepts: ["urgency", "authority_impersonation", "payment_pressure", "fear"],
            testedConcepts: ["urgency", "authority_impersonation"]
          },
          {
            id: "B",
            text: "Check your latest physical electricity bill or open the official state electricity portal / consumer app to verify payment history.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Official utility accounts maintain formal billing cycles. Checking your consumer number directly on the official board website reveals whether any arrears exist.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["independent_verification", "urgency", "fear"]
          },
          {
            id: "C",
            text: "Wait until 09:30 PM to see if the power actually goes out.",
            isSafe: false,
            score: 40,
            decision: "risky",
            reason: "Passive waiting leaves anxiety unresolved; active verification through official channels provides complete peace of mind.",
            missedSignals: ["Failing to proactively verify official billing records"],
            missedConcepts: ["independent_verification"],
            testedConcepts: ["independent_verification"]
          }
        ],
        redFlags: [
          "Emergency deadline creating acute panic ('tonight at 09:30 PM')",
          "Personal 10-digit mobile number given as official contact instead of official toll-free lines",
          "Demands for direct instant transfer"
        ],
        safeAction: "Never call personal phone numbers sent via SMS for public utilities. Verify your account balance only through official electricity distribution board websites or designated payment kiosks.",
        lesson: "Utility companies issue formal physical notices weeks before disconnection. They never send SMS messages demanding urgent payments to private numbers within hours."
      }
    ]
  },
  {
    id: "fake-part-time-job",
    title: "High-Paying Remote Part-Time Task Job",
    subtitle: "Telegram and WhatsApp task recruitment escalating from small payouts to investment lockup",
    category: "Employment",
    difficulty: "Intermediate",
    estimatedMinutes: 4,
    isMultiStep: true,
    concepts: ["reward_manipulation", "social_pressure", "payment_pressure", "payment_safety", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "Global Media Recruitment (+44 7911 123456)",
      channel: "WhatsApp & Telegram",
      timestamp: "Today, 03:20 PM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "Hi! I am Ananya from HR. We found your resume on LinkedIn. We have remote part-time openings reviewing hotel ratings and YouTube videos. Work 30 minutes a day and earn ₹3,000 to ₹8,000 daily. Direct payout to UPI after 3 trial tasks. Reply 'YES' to start.",
        context: "An unsolicited message offering exceptionally high earnings for trivial tasks with no interview or resume review.",
        question: "How should you treat this enticing remote employment offer?",
        conceptsTested: ["reward_manipulation", "social_pressure", "identity_verification"],
        options: [
          {
            id: "A",
            text: "Reply 'YES'. Liking a few videos is completely harmless, and ₹3,000 daily is great income.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Task scam recruiters intentionally pay ₹150–₹500 for the first few trivial tasks to build trust, before trapping victims into depositing lakhs for 'VIP withdrawal orders'.",
            missedSignals: ["Unrealistic salary for unskilled tasks", "Unsolicited job offer with foreign prefix", "Move to encrypted messaging apps"],
            missedConcepts: ["reward_manipulation", "social_pressure"],
            testedConcepts: ["reward_manipulation"]
          },
          {
            id: "B",
            text: "Block and report the sender immediately. Legitimate companies never recruit for high-paying jobs via random WhatsApp texts with zero hiring process.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Recognizing that unrealistic payouts for trivial work is the hallmark signature of the 'Task Scam' prevents entrapment.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["reward_manipulation", "identity_verification"]
          },
          {
            id: "C",
            text: "Ask them for their official company registration number and corporate email address.",
            isSafe: false,
            score: 40,
            decision: "risky",
            reason: "Scammers provide fabricated corporate identity documents and stolen company names to maintain the deception.",
            missedSignals: ["Engaging with fraudulent recruiters"],
            missedConcepts: ["identity_verification", "social_pressure"],
            testedConcepts: ["identity_verification"]
          }
        ],
        redFlags: [
          "Disproportionate compensation (₹3,000–₹8,000 daily for clicking like buttons)",
          "No formal application, interview, or qualification requirements",
          "International phone prefix recruiting for domestic tasks"
        ],
        safeAction: "Report and block unsolicited job offers promising high daily returns for simple tasks.",
        lesson: "Task scams operate on the 'small bait, huge trap' model. The initial ₹200 payout is an investment by the criminal syndicate to prepare you for a multi-lakh loss."
      },
      {
        stageNumber: 2,
        simulatedMessage: "Telegram Mentor says: 'Excellent! You completed 3 tasks and received ₹450 trial payout. Now to upgrade to VIP Merchant Tasks and earn ₹18,000 today, you must purchase a Prepaid Merchant Crypto Order of ₹5,000. Your ₹5,000 + ₹3,000 profit will be returned in 15 minutes.'",
        context: "The scammer demands upfront money to unlock 'higher returns', moving from free tasks to prepaid deposits.",
        question: "You received ₹450 earlier. Now they want a ₹5,000 prepaid deposit. What do you do?",
        conceptsTested: ["payment_pressure", "payment_safety", "reward_manipulation", "social_pressure"],
        options: [
          {
            id: "A",
            text: "Deposit the ₹5,000. Since they successfully paid ₹450 earlier, they are clearly legitimate.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "The initial ₹450 was psychological conditioning. Once you deposit ₹5,000, your money is frozen and they will demand ₹25,000, then ₹1,00,000 to 'unfreeze' your balance.",
            missedSignals: ["Requirement to pay money to receive work earnings", "Prepaid task scam trap", "Crypto / non-reversible deposit"],
            missedConcepts: ["payment_pressure", "payment_safety", "reward_manipulation"],
            testedConcepts: ["payment_pressure", "payment_safety"]
          },
          {
            id: "B",
            text: "Immediately stop all communication, keep the ₹450, leave the Telegram group, and block all contacts.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "You correctly identified the financial trigger point of the task scam. Never pay your own money to work a job.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["payment_pressure", "payment_safety", "social_pressure"]
          },
          {
            id: "C",
            text: "Tell the mentor you only have ₹2,000 and ask for a cheaper prepaid task.",
            isSafe: false,
            score: 10,
            decision: "risky",
            reason: "Any money sent to the syndicate is lost permanently.",
            missedSignals: ["Negotiating with financial fraudsters"],
            missedConcepts: ["payment_pressure", "social_pressure"],
            testedConcepts: ["payment_pressure"]
          }
        ],
        redFlags: [
          "Requirement to PAY money in order to WORK or receive accumulated income",
          "Escalating deposit demands under 'VIP' tiers",
          "Group pressure from fake Telegram bots celebrating their earnings"
        ],
        safeAction: "Legitimate employment NEVER requires an employee to deposit money to unlock tasks or release earnings.",
        lesson: "Any job asking you to pay money to earn money is a scam. Full stop."
      }
    ]
  },
  {
    id: "digital-arrest-law",
    title: "Digital Arrest & Supreme Court Warrant Threat",
    subtitle: "High-intimidation impersonation of law enforcement demanding video interrogation and fund transfers",
    category: "Impersonation",
    difficulty: "Expert",
    estimatedMinutes: 5,
    isMultiStep: false,
    concepts: ["authority_impersonation", "fear", "urgency", "social_pressure", "payment_pressure", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "CBI & Supreme Court Cyber Cell (+91 22 2654 8812)",
      channel: "WhatsApp Video Call / Official Summons Letter",
      timestamp: "Today, 10:00 AM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "SUMMONS: A parcel seized at Mumbai Customs containing 5 fake passports and 140 grams of contraband was booked under your Aadhaar number. A non-bailable warrant has been issued against you under the PMLA & NDPS Act. Join mandatory Skype/WhatsApp Video interrogation immediately or local police will reach your residence within 1 hour.",
        context: "A terrifying notice claiming your Aadhaar is linked to international money laundering and drug trafficking, demanding immediate video interrogation.",
        question: "How should you respond to this 'Digital Arrest' summons?",
        conceptsTested: ["authority_impersonation", "fear", "urgency", "social_pressure", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Join the video call immediately to prove your innocence and show the police officer your documents.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Joining video calls connects you to elaborate fake police sets with forged insignias designed to psychologically terrify you into transferring your life savings.",
            missedSignals: ["Law enforcement conducting arrests over video calls", "PMLA / NDPS threats via WhatsApp", "Demands for immediate digital compliance"],
            missedConcepts: ["authority_impersonation", "fear", "urgency", "social_pressure"],
            testedConcepts: ["authority_impersonation", "fear"]
          },
          {
            id: "B",
            text: "Hang up, block the number, and immediately call the National Cyber Crime Helpline at 1930 or visit your local police station.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Indian law and law enforcement agencies NEVER conduct 'Digital Arrests' or judicial hearings via WhatsApp/Skype video calls.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["authority_impersonation", "independent_verification", "fear"]
          },
          {
            id: "C",
            text: "Offer to pay an informal fine over UPI so they drop the case and don't come to your home.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "Offering to transfer money instantly triggers their primary extortion phase; they will demand millions under the guise of 'court clearance'.",
            missedSignals: ["Bribing unverified callers", "Succumbing to panic extortion"],
            missedConcepts: ["payment_pressure", "fear", "authority_impersonation"],
            testedConcepts: ["payment_pressure", "fear"]
          }
        ],
        redFlags: [
          "Concept of 'Digital Arrest' (does not exist anywhere in Indian law)",
          "Police or CBI demanding video call attendance in lieu of physical arrest warrants",
          "Displaying forged Supreme Court letters, fake seals, or actors in police uniforms"
        ],
        safeAction: "There is NO legal provision for 'Digital Arrest' in India. Police, CBI, ED, and customs officials NEVER interrogate or arrest individuals over Skype or WhatsApp video calls. Hang up and dial 1930.",
        lesson: "No law enforcement officer will ever ask you to transfer money to a 'security balance' or 'RBI verification account' to prove your innocence."
      }
    ]
  },
  {
    id: "remote-tech-support",
    title: "Critical Security Breach Alert & AnyDesk Remote Access",
    subtitle: "Browser lockup or fake bank support directing victims to download screen-sharing tools",
    category: "Tech Support",
    difficulty: "Intermediate",
    estimatedMinutes: 3,
    isMultiStep: false,
    concepts: ["authority_impersonation", "fear", "urgency", "credential_request", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "Microsoft Security Center / Bank Helpline",
      channel: "Browser Pop-up & Phone Call",
      timestamp: "Today, 04:10 PM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "CRITICAL ALERT: Your computer has been locked due to Trojan:Win32/Spyware detected. Banking credentials and credit cards are compromised. Do NOT restart. Call Microsoft Certified Support immediately at +1-800-419-0921. Support code: ERR-0091.",
        context: "A loud audio siren and full-screen browser modal claim your system is infected and demand calling an 800 number.",
        question: "How do you handle this high-alarm security warning?",
        conceptsTested: ["urgency", "fear", "authority_impersonation", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Call the number on screen and allow the support technician to connect to your computer to clean the virus.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "The pop-up is simple browser code (HTML/JavaScript). Calling the number connects to a call center that installs remote desktop tools (AnyDesk/TeamViewer) to access banking sessions.",
            missedSignals: ["Browser pop-up pretending to be OS antivirus", "Toll-free number inside web page", "Audio siren panic creation"],
            missedConcepts: ["authority_impersonation", "fear", "urgency"],
            testedConcepts: ["authority_impersonation", "fear"]
          },
          {
            id: "B",
            text: "Press Escape or use Task Manager (Ctrl+Shift+Esc) to close the browser tab. The warning is just a web page, not actual Windows security.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "Legitimate operating system security alerts never include telephone numbers to call for support. Terminating the browser tab ends the attack completely.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["independent_verification", "fear"]
          },
          {
            id: "C",
            text: "Type your bank password to see if it really stopped working.",
            isSafe: false,
            score: 10,
            decision: "risky",
            reason: "Typing credentials while suspecting an infection risks keystroke logging if actual malware were present.",
            missedSignals: ["Exposing credentials during security uncertainty"],
            missedConcepts: ["credential_request"],
            testedConcepts: ["credential_request"]
          }
        ],
        redFlags: [
          "Customer support agent instructing you to install remote access tools (AnyDesk, TeamViewer)",
          "Requesting a 9-digit device access pin or permission grant",
          "Customer service number obtained from unverified search engine results"
        ],
        safeAction: "Never install remote desktop apps at the request of an incoming caller or unverified helpline. Official bank and payment apps do not need remote control.",
        lesson: "Remote desktop tools turn your phone over to the caller. The moment someone tells you to download AnyDesk or TeamViewer to fix a payment, hang up immediately."
      }
    ]
  },
  {
    id: "fake-prize-reward",
    title: "Fake Lottery & Lucky Scratch Card Scam",
    subtitle: "Unexpected winnings lure demanding advance GST or processing fees",
    category: "Lottery & Rewards",
    difficulty: "Beginner",
    estimatedMinutes: 2,
    isMultiStep: false,
    concepts: ["reward_manipulation", "payment_pressure", "authority_impersonation", "urgency", "independent_verification"],
    disclaimer: "SIMULATION — NOT A REAL SCAM. Safe educational training environment.",
    senderMockup: {
      senderName: "Mega Lucky Draw / KBC Jackpot",
      channel: "WhatsApp / Letter",
      timestamp: "Today, 12:05 PM"
    },
    stages: [
      {
        stageNumber: 1,
        simulatedMessage: "CONGRATULATIONS! Your mobile number won 1st prize of ₹25,00,000 in the All-India Lucky Consumer Draw! To release your prize draft to your home address, deposit the 1% government GST & processing charge of ₹25,000 to our official finance manager.",
        context: "You receive an announcement that you won a massive lottery for a contest you never entered, conditional on paying a 'tax fee'.",
        question: "How should you respond to this life-changing lottery win?",
        conceptsTested: ["reward_manipulation", "payment_pressure", "authority_impersonation", "independent_verification"],
        options: [
          {
            id: "A",
            text: "Pay the ₹25,000 processing fee. Winning ₹25,00,000 easily covers this initial cost.",
            isSafe: false,
            score: 0,
            decision: "risky",
            reason: "You cannot win a lottery you never entered. The ₹25,000 is stolen immediately, followed by demands for more 'clearance charges'.",
            missedSignals: ["Winning a contest never entered", "Advance fee to claim a prize", "Lottery tax scam"],
            missedConcepts: ["reward_manipulation", "payment_pressure"],
            testedConcepts: ["reward_manipulation", "payment_pressure"]
          },
          {
            id: "B",
            text: "Ignore, block, and report the message. Legitimate prizes never ask the winner to pay advance fees or taxes directly to a personal account.",
            isSafe: true,
            score: 100,
            decision: "safe",
            reason: "You understood that unexpected winnings conditioned on upfront payments are 100% advance-fee fraud.",
            missedSignals: [],
            missedConcepts: [],
            testedConcepts: ["reward_manipulation", "independent_verification"]
          },
          {
            id: "C",
            text: "Ask them to deduct the ₹25,000 from the ₹25,00,000 prize and send the remaining ₹24,75,000.",
            isSafe: false,
            score: 50,
            decision: "risky",
            reason: "While this protects your money, continuing conversation keeps you in the scammer's target database for future attacks.",
            missedSignals: ["Continuing communication with advance-fee fraudsters"],
            missedConcepts: ["social_pressure", "reward_manipulation"],
            testedConcepts: ["reward_manipulation"]
          }
        ],
        redFlags: [
          "Winning a prize in a contest or lottery you never bought a ticket for",
          "Requirement to pay advance 'processing fees', 'GST', or 'customs duties'",
          "Official brand names used without official email or verified presence"
        ],
        safeAction: "If you didn't enter a contest, you didn't win. Real lotteries deduct taxes at source (TDS) according to law; they never demand upfront bank transfers.",
        lesson: "No legitimate prize requires you to send money to claim money. Any lottery demanding an advance fee is guaranteed fraud."
      }
    ]
  }
];

export function getPublicScenarios(difficulty = "All") {
  return SIMULATOR_SCENARIOS
    .filter(s => difficulty === "All" || s.difficulty.toLowerCase() === difficulty.toLowerCase())
    .map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      category: s.category,
      concepts: s.concepts || [],
      difficulty: s.difficulty,
      estimatedMinutes: s.estimatedMinutes,
      isMultiStep: s.isMultiStep,
      disclaimer: s.disclaimer,
      senderMockup: s.senderMockup,
      totalStages: s.stages.length
    }));
}

export function getPublicScenarioById(id, stageNumber = 1) {
  const scenario = SIMULATOR_SCENARIOS.find(s => s.id === id);
  if (!scenario) return null;

  const stage = scenario.stages.find(st => st.stageNumber === Number(stageNumber)) || scenario.stages[0];

  // Strip authoritative scoring markers (isSafe, score, reason, missedSignals, missedConcepts)
  // so client cannot inspect developer tools to cheat.
  const publicOptions = stage.options.map(opt => ({
    id: opt.id,
    text: opt.text
  }));

  return {
    id: scenario.id,
    title: scenario.title,
    subtitle: scenario.subtitle,
    category: scenario.category,
    concepts: scenario.concepts || [],
    difficulty: scenario.difficulty,
    estimatedMinutes: scenario.estimatedMinutes,
    isMultiStep: scenario.isMultiStep,
    disclaimer: scenario.disclaimer,
    senderMockup: scenario.senderMockup,
    currentStage: stage.stageNumber,
    totalStages: scenario.stages.length,
    simulatedMessage: stage.simulatedMessage,
    context: stage.context,
    question: stage.question,
    options: publicOptions,
    conceptsTested: stage.conceptsTested || [],
    redFlagsCount: stage.redFlags ? stage.redFlags.length : 0
  };
}
