import { aiService } from '../services/aiService.js';

export async function handleAdvisorChat(req, res) {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: "Message prompt is required." });
    }

    const cleanMsg = message.trim();
    const lower = cleanMsg.toLowerCase();

    // 1. Attempt real AI consultation if configured
    if (aiService.isConfigured()) {
      const aiResponse = await aiService.askAdvisor(cleanMsg, history);
      if (aiResponse.available && aiResponse.reply) {
        return res.json({
          success: true,
          reply: aiResponse.reply,
          advisorMode: "ai-advisor",
          isAiGenerated: true,
          provider: aiResponse.provider,
          model: aiResponse.model
        });
      }
    }

    // 2. Real Local Safety Knowledge Fallback (Cleanly labeled as Local Safety Advisor)
    let reply = "";

    if (lower.includes("clicked") && (lower.includes("link") || lower.includes("phishing") || lower.includes("site"))) {
      reply = `### 🚨 Immediate Containment Protocol: Clicked Phishing Link

1. **Disconnect Network Instantly**:
   - Turn off Wi-Fi and Mobile Data immediately to stop background session token hijacking or data sync.

2. **If You Disclosed Banking or Account Credentials**:
   - From a **different, uncompromised device**, immediately change your netbanking passwords, primary email password, and security PINs.
   - Use your bank's official mobile application to **freeze/lock all debit and credit cards** and block international transactions.

3. **If You Downloaded an App or File (.apk / .exe)**:
   - Do NOT open it. Place your phone in Airplane Mode, go to **Settings → Apps**, find the downloaded application, revoke permissions, and uninstall it immediately.

4. **Official Emergency Contacts**:
   - In India, immediately call the **National Cyber Crime Helpline at 1930** or register the incident at [cybercrime.gov.in](https://cybercrime.gov.in). The first 2–3 hours are critical to freeze illicit fund transfers.`;
    }
    else if (lower.includes("upi") || lower.includes("pin") || lower.includes("qr") || lower.includes("receive money")) {
      reply = `### 💳 Critical UPI Safety Rule: "PIN is ONLY for SENDING"

1. **Fundamental Rule of UPI**:
   - **You NEVER need to enter your UPI PIN, scan a QR code, or approve a collect request to RECEIVE money.**
   - Incoming funds are credited directly to your bank account using your mobile number or VPA without requiring authorization.

2. **Common Trap Patterns**:
   - **Reverse-Charge QR Codes**: A buyer sends a QR image claiming "Scan this QR to receive advance token money". Scanning this code debits funds **from** your account.
   - **Collect Requests**: Pop-ups on Google Pay / PhonePe claiming "Refund Processing - Enter PIN". Entering your PIN approves an outgoing payment.

3. **If You Authorized a Scam Transaction**:
   - Immediately open your UPI application → Settings → **Change UPI PIN**.
   - Call your bank's 24/7 fraud desk to dispute the UTR / transaction reference number.`;
    }
    else if (lower.includes("anydesk") || lower.includes("teamviewer") || lower.includes("quicksupport") || lower.includes("screen share")) {
      reply = `### ⚠️ Extreme Danger: Remote Access Application Trap

1. **Do NOT Install**:
   - Legitimate customer support representatives from banks, telecom providers (Jio, Airtel), or tech platforms **NEVER** ask users to install AnyDesk, TeamViewer, RustDesk, or QuickSupport.

2. **How Attackers Exploit This**:
   - Once installed, the attacker has live visual visibility and remote control over your screen. When you open banking apps or receive an OTP, they intercept it in real time.

3. **Immediate Remediation**:
   - **Enable Airplane Mode immediately.**
   - Uninstall the remote access application from device Settings.
   - Restart your phone and check for any remaining unfamiliar apps.`;
    }
    else if (lower.includes("verify") || lower.includes("bank message") || lower.includes("legitimate") || lower.includes("sender")) {
      reply = `### 🔍 How to Verify Legitimate Bank Messages vs Phishing

1. **Sender Header Verification**:
   - **Legitimate Bank SMS**: Arrives from an authorized 6-to-8 character alphanumeric sender header (e.g. \`VK-HDFCBK\`, \`AX-SBIBNK\`, \`VM-ICICIB\`).
   - **Fraudulent SMS**: Originates from standard 10-digit individual phone numbers or international dialing codes (+92, +84, +234).

2. **Link Inspection**:
   - Banks do not host KYC portals on unvetted TLDs like \`.top\`, \`.xyz\`, \`.live\`, or shortened \`bit.ly\` URLs.
   - Genuine domains: \`onlinesbi.sbi\`, \`hdfcbank.com\`, \`icicibank.com\`.

3. **Urgency Tactics**:
   - Legitimate banks never abruptly block active accounts with an arbitrary "within 24 hours" ultimatum over SMS without formal registered communications.`;
    }
    else {
      reply = `### 🛡️ FraudLens Safety Guidance

Digital fraud predominantly exploits emotional urgency, authority impersonation, and panic.

**Core Defensive Rules**:
- **Pause Before Acting**: Any communication threatening immediate account freeze, power disconnection, or arrest warrants is designed to prevent rational verification.
- **Never Share Confidential Credentials**: True service representatives will never demand OTPs, PINs, CVVs, or netbanking passwords over phone, SMS, or form.
- **Verify Through Primary Channels**: Always navigate to the official app or website directly instead of tapping links provided in messages.
- **Report Suspicions**: Submit the indicator to FraudLens Community Intelligence and report financial fraud immediately to your local authorities.`;
    }

    return res.json({
      success: true,
      reply,
      advisorMode: "local-safety-advisor",
      isAiGenerated: false,
      note: "Generated by rule-based Local Safety Advisor (AI Provider not configured)."
    });

  } catch (err) {
    return res.status(500).json({ error: "Advisor service error", details: err.message });
  }
}
