package com.scamshield.quickscan.ui

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.scamshield.quickscan.R
import com.scamshield.quickscan.api.ScamShieldApiClient
import com.scamshield.quickscan.data.ScanData
import com.scamshield.quickscan.data.ThreatIndicator
import com.scamshield.quickscan.databinding.ActivityQuickScanBinding
import com.scamshield.quickscan.databinding.ItemThreatIndicatorBinding
import com.scamshield.quickscan.qr.QrDecoder
import com.scamshield.quickscan.util.NetworkUtils
import kotlinx.coroutines.launch

class QuickScanActivity : AppCompatActivity() {

    private lateinit var binding: ActivityQuickScanBinding
    private lateinit var apiClient: ScamShieldApiClient

    private var currentScanData: ScanData? = null
    private var lastSharedText: String? = null
    private var lastSharedImageUri: Uri? = null

    companion object {
        private const val MAX_TEXT_LENGTH = 25000
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQuickScanBinding.inflate(layoutInflater)
        setContentView(binding.root)

        apiClient = ScamShieldApiClient(this)

        setupListeners()
        handleIncomingIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener { finish() }
        binding.btnDone.setOnClickListener { finish() }
        binding.btnErrorDismiss.setOnClickListener { finish() }

        binding.btnTryAgain.setOnClickListener {
            if (lastSharedImageUri != null) {
                processSharedImage(lastSharedImageUri!!)
            } else if (!lastSharedText.isNullOrBlank()) {
                processSharedText(lastSharedText!!)
            } else {
                finish()
            }
        }

        binding.btnViewFullAnalysis.setOnClickListener {
            val scanId = currentScanData?.scanId
            val webBaseUrl = NetworkUtils.getWebBaseUrl(this)
            val targetUrl = if (!scanId.isNullOrBlank()) {
                "$webBaseUrl/?scanId=$scanId"
            } else {
                webBaseUrl
            }

            try {
                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl))
                startActivity(browserIntent)
            } catch (e: Exception) {
                // Ignore if no browser available
            }
        }
    }

    private fun handleIncomingIntent(intent: Intent) {
        when (intent.action) {
            Intent.ACTION_SEND -> {
                val mimeType = intent.type ?: ""
                if (mimeType.startsWith("image/")) {
                    val imageUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    if (imageUri != null) {
                        lastSharedImageUri = imageUri
                        lastSharedText = null
                        processSharedImage(imageUri)
                    } else {
                        showError(getString(R.string.empty_content))
                    }
                } else {
                    // Fallback to text
                    val text = intent.getStringExtra(Intent.EXTRA_TEXT)
                        ?: intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
                    if (!text.isNullOrBlank()) {
                        lastSharedText = text
                        lastSharedImageUri = null
                        processSharedText(text)
                    } else {
                        showError(getString(R.string.empty_content))
                    }
                }
            }
            else -> {
                showError("Unsupported intent action: ${intent.action}")
            }
        }
    }

    private fun processSharedText(rawText: String) {
        val trimmed = rawText.trim()
        if (trimmed.isEmpty()) {
            showError(getString(R.string.empty_content))
            return
        }

        if (trimmed.length > MAX_TEXT_LENGTH) {
            showError(getString(R.string.payload_too_large))
            return
        }

        showLoading(getString(R.string.scanning_title))

        lifecycleScope.launch {
            val isUrl = NetworkUtils.isPrimarilyUrl(trimmed)
            val result = if (isUrl) {
                val sanitizedUrl = NetworkUtils.sanitizeUrlInput(trimmed)
                apiClient.analyzeUrl(sanitizedUrl, useAi = true)
            } else {
                apiClient.analyzeSms(trimmed, useAi = true)
            }

            result.onSuccess { scanData ->
                displayScanResult(scanData)
            }.onFailure { error ->
                showError(
                    message = getString(R.string.backend_status_unreachable),
                    detail = error.message
                )
            }
        }
    }

    private fun processSharedImage(uri: Uri) {
        showLoading("Decoding and analyzing QR Code…")

        lifecycleScope.launch {
            // 1. Decode QR locally using ZXing
            val decodeResult = QrDecoder.decodeFromUri(contentResolver, uri)

            if (!decodeResult.success || decodeResult.payload.isNullOrBlank()) {
                showError(
                    message = getString(R.string.no_qr_found),
                    detail = decodeResult.errorMessage
                )
                return@launch
            }

            // 2. Submit decoded payload to ScamShield QR / UPI backend analysis engine
            val result = apiClient.analyzeQr(decodeResult.payload, useAi = true)

            result.onSuccess { scanData ->
                displayScanResult(scanData)
            }.onFailure { error ->
                showError(
                    message = getString(R.string.backend_status_unreachable),
                    detail = error.message
                )
            }
        }
    }

    private fun displayScanResult(data: ScanData) {
        currentScanData = data

        binding.layoutLoading.visibility = View.GONE
        binding.layoutError.visibility = View.GONE
        binding.layoutResult.visibility = View.VISIBLE

        // 1. Trust Score & Visual Severity Styling
        val score = data.trustScore
        binding.tvTrustScore.text = "$score / 100"

        val (scoreColor, riskBadgeBg, riskBadgeText) = when {
            score < 35 -> Triple(
                ContextCompat.getColor(this, R.color.risk_critical),
                ContextCompat.getColor(this, R.color.risk_critical_bg),
                ContextCompat.getColor(this, R.color.risk_critical)
            )
            score < 65 -> Triple(
                ContextCompat.getColor(this, R.color.risk_suspicious),
                ContextCompat.getColor(this, R.color.risk_suspicious_bg),
                ContextCompat.getColor(this, R.color.risk_suspicious)
            )
            score < 80 -> Triple(
                ContextCompat.getColor(this, R.color.risk_caution),
                ContextCompat.getColor(this, R.color.risk_caution_bg),
                ContextCompat.getColor(this, R.color.risk_caution)
            )
            else -> Triple(
                ContextCompat.getColor(this, R.color.risk_safe),
                ContextCompat.getColor(this, R.color.risk_safe_bg),
                ContextCompat.getColor(this, R.color.risk_safe)
            )
        }

        binding.tvTrustScore.setTextColor(scoreColor)
        binding.tvRiskLevel.text = data.risk.level.ifBlank { "ANALYZED" }
        binding.tvRiskLevel.setTextColor(riskBadgeText)

        // 2. Category
        binding.tvCategory.text = data.detectedCategory ?: "Digital Threat Analysis"

        // 3. Engine Attribution
        val aiEngine = data.intelligenceSources?.aiEngine
        if (aiEngine?.available == true) {
            val modelName = aiEngine.model ?: "Gemini"
            binding.tvEngineAttribution.text = "AI Analysis: Gemini ($modelName)"
            binding.tvEngineAttribution.setTextColor(ContextCompat.getColor(this, R.color.ai_gemini_badge))
        } else {
            binding.tvEngineAttribution.text = "Analysis: Local Safety Engine"
            binding.tvEngineAttribution.setTextColor(ContextCompat.getColor(this, R.color.local_badge))
        }

        // 4. "Why?" Threat Indicators List
        binding.llIndicatorsContainer.removeAllViews()
        val indicators = data.threats.ifEmpty {
            listOf(ThreatIndicator(
                name = "Baseline Security Passed",
                severity = "Low",
                explanation = "No overt phishing heuristics or malicious signatures detected."
            ))
        }

        val inflater = LayoutInflater.from(this)
        for (indicator in indicators) {
            val itemBinding = ItemThreatIndicatorBinding.inflate(inflater, binding.llIndicatorsContainer, false)
            itemBinding.tvIndicatorName.text = indicator.name ?: "Unknown Indicator"
            itemBinding.tvIndicatorExplanation.text = indicator.explanation ?: ""

            val bulletColor = when (indicator.severity?.lowercase()) {
                "critical", "high" -> ContextCompat.getColor(this, R.color.risk_critical)
                "medium" -> ContextCompat.getColor(this, R.color.risk_suspicious)
                else -> ContextCompat.getColor(this, R.color.risk_safe)
            }
            itemBinding.tvBullet.setTextColor(bulletColor)
            binding.llIndicatorsContainer.addView(itemBinding.root)
        }

        // 5. Recommended Action
        val primaryRecommendation = data.recommendations.firstOrNull()?.action
            ?: "Verify sender authenticity directly via official channels before proceeding."
        binding.tvRecommendation.text = primaryRecommendation
    }

    private fun showLoading(message: String) {
        binding.layoutResult.visibility = View.GONE
        binding.layoutError.visibility = View.GONE
        binding.layoutLoading.visibility = View.VISIBLE
        binding.tvScanningTitle.text = message
    }

    private fun showError(message: String, detail: String? = null) {
        binding.layoutResult.visibility = View.GONE
        binding.layoutLoading.visibility = View.GONE
        binding.layoutError.visibility = View.VISIBLE

        binding.tvErrorMessage.text = message
        if (!detail.isNullOrBlank()) {
            binding.tvErrorDetail.text = detail
            binding.tvErrorDetail.visibility = View.VISIBLE
        } else {
            binding.tvErrorDetail.visibility = View.GONE
        }
    }
}
