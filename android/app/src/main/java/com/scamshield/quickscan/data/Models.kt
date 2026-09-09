package com.scamshield.quickscan.data

import com.google.gson.annotations.SerializedName

// Request Payloads
data class SmsAnalysisRequest(
    val text: String,
    val useAi: Boolean = true,
    val isDemo: Boolean = false
)

data class UrlAnalysisRequest(
    val url: String,
    val useAi: Boolean = true,
    val isDemo: Boolean = false
)

data class QrAnalysisRequest(
    val payload: String,
    val useAi: Boolean = true,
    val isDemo: Boolean = false
)

// Response Payloads
data class ScanResponse(
    val success: Boolean,
    val data: ScanData? = null,
    val error: String? = null,
    val details: String? = null
)

data class ScanData(
    val scanId: String = "",
    val type: String = "",
    val trustScore: Int = 0,
    val risk: RiskInfo = RiskInfo("UNKNOWN"),
    val detectedCategory: String? = null,
    val threats: List<ThreatIndicator> = emptyList(),
    val recommendations: List<Recommendation> = emptyList(),
    val intelligenceSources: IntelligenceSources? = null,
    val analyzedAt: String = ""
)

data class RiskInfo(
    val level: String = "UNKNOWN",
    val color: String? = null,
    val text: String? = null
)

data class ThreatIndicator(
    val name: String? = null,
    val severity: String? = null,
    val explanation: String? = null,
    val source: String? = null
)

data class Recommendation(
    val action: String? = null,
    val description: String? = null,
    val type: String? = null
)

data class IntelligenceSources(
    val localEngine: Boolean = true,
    val aiEngine: AiEngineInfo? = null,
    val threatIntel: Map<String, Any>? = null
)

data class AiEngineInfo(
    val available: Boolean = false,
    val provider: String? = null,
    val model: String? = null
)

// System Diagnostics
data class HealthResponse(
    val status: String = "",
    val database: String = "",
    val ai: AiStatusInfo? = null
)

data class AiStatusInfo(
    val configured: Boolean = false,
    val provider: String? = null,
    val model: String? = null
)

// QR Decode Result
data class QrDecodeResult(
    val success: Boolean,
    val payload: String? = null,
    val isUpi: Boolean = false,
    val upiDetails: Map<String, String>? = null,
    val errorMessage: String? = null
)
