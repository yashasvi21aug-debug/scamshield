import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const DEMO_PRESETS = {
  sms: [
    {
      id: "safe-sms",
      level: "Safe",
      label: "Safe Order Confirmation",
      icon: ShieldCheck,
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: "Your order #78219 has been delivered by Swiggy. Total bill ₹480. We hope you enjoyed your meal! Rate your delivery partner in the official app."
    },
    {
      id: "suspicious-sms",
      level: "Suspicious",
      label: "Suspicious Delivery Fee",
      icon: AlertTriangle,
      color: "amber",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      content: "SpeedPost: Your parcel #IN88921 is on hold due to missing address digits. Please confirm your details within 12 hours: https://bit.ly/ind-post-fee"
    },
    {
      id: "high-risk-sms",
      level: "High-Risk",
      label: "Urgent Bank / KYC Trap",
      icon: ShieldAlert,
      color: "red",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      content: "URGENT NOTICE: Dear Customer, your SBI net banking account will be suspended today. Verify your KYC immediately at http://sbi-kyc-update.top to prevent account freeze."
    }
  ],
  url: [
    {
      id: "safe-url",
      level: "Safe",
      label: "Official Bank Portal",
      icon: ShieldCheck,
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: "https://onlinesbi.sbi/personal/welcome.html"
    },
    {
      id: "suspicious-url",
      level: "Suspicious",
      label: "Masked Shortener Link",
      icon: AlertTriangle,
      color: "amber",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      content: "https://bit.ly/claim-special-cashback-bonus"
    },
    {
      id: "high-risk-url",
      level: "High-Risk",
      label: "HDFC Phishing Clone",
      icon: ShieldAlert,
      color: "red",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      content: "http://secure-hdfc-kyc-portal.top/login/update-pan.php"
    }
  ],
  qr: [
    {
      id: "safe-qr",
      level: "Safe",
      label: "Official Website QR",
      icon: ShieldCheck,
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: "https://cybercrime.gov.in"
    },
    {
      id: "suspicious-qr",
      level: "Suspicious",
      label: "Personal UPI Collect",
      icon: AlertTriangle,
      color: "amber",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      content: "upi://pay?pa=olx_fast_deal@okhdfcbank&pn=OLX_DEPOSIT&am=2500"
    },
    {
      id: "high-risk-qr",
      level: "High-Risk",
      label: "Fake Bank Refund Trap",
      icon: ShieldAlert,
      color: "red",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      content: "upi://pay?pa=sbi_refund_desk99@okaxis&pn=SBI_REFUND_OFFICER&am=14500&tn=ScanToReceiveRefund"
    }
  ]
};

export default function DemoPresetSelector({ mode = 'sms', onSelectPreset }) {
  const presets = DEMO_PRESETS[mode] || DEMO_PRESETS.sms;

  return (
    <div className="p-4 bg-[#F9F9F6] rounded-xl border border-[#E2E2D9] mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-4 h-4 text-[#118AB2]" />
        <span className="text-xs uppercase font-bold tracking-wider text-[#464B71]">
          Hackathon Demo Presets
        </span>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          — Click to test live scenarios instantly:
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.content)}
              className="p-2.5 rounded-lg bg-white border border-[#E2E2D9] hover:border-[#118AB2]/50 hover:bg-[#F2F2ED]/50 text-left transition-all flex items-center gap-2.5 group shadow-sm"
            >
              <div className={`p-1.5 rounded-md border shrink-0 ${preset.badgeClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#2A2E45] group-hover:text-[#118AB2] block truncate">
                  {preset.label}
                </span>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  {preset.level} Example
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
