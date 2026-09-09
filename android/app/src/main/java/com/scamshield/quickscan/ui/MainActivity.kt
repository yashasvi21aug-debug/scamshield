package com.scamshield.quickscan.ui

import android.os.Bundle
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.scamshield.quickscan.R
import com.scamshield.quickscan.api.ScamShieldApiClient
import com.scamshield.quickscan.databinding.ActivityMainBinding
import com.scamshield.quickscan.util.NetworkUtils
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var apiClient: ScamShieldApiClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        apiClient = ScamShieldApiClient(this)

        updateConfiguredUrlDisplay()
        setupListeners()
        checkBackendHealth()
    }

    override fun onResume() {
        super.onResume()
        checkBackendHealth()
    }

    private fun setupListeners() {
        binding.btnConfigureServer.setOnClickListener {
            showConfigureServerDialog()
        }

        binding.serverStatusLayout.setOnClickListener {
            checkBackendHealth()
        }
    }

    private fun updateConfiguredUrlDisplay() {
        val currentApiUrl = NetworkUtils.getApiBaseUrl(this)
        val currentWebUrl = NetworkUtils.getWebBaseUrl(this)
        binding.tvConfiguredUrl.text = "API: $currentApiUrl | Web: $currentWebUrl"
    }

    private fun checkBackendHealth() {
        binding.tvServerStatus.text = getString(R.string.backend_status_checking)
        binding.statusDot.setBackgroundColor(ContextCompat.getColor(this, R.color.risk_caution))

        lifecycleScope.launch {
            val result = apiClient.checkHealth()
            result.onSuccess { health ->
                val dbStatus = health.database
                val aiModel = health.ai?.model ?: "Local"
                binding.tvServerStatus.text = "Connected ($dbStatus • $aiModel)"
                binding.statusDot.setBackgroundColor(ContextCompat.getColor(this@MainActivity, R.color.risk_safe))
            }.onFailure { error ->
                binding.tvServerStatus.text = getString(R.string.backend_status_unreachable)
                binding.statusDot.setBackgroundColor(ContextCompat.getColor(this@MainActivity, R.color.risk_critical))
            }
        }
    }

    private fun showConfigureServerDialog() {
        val currentUrl = NetworkUtils.getApiBaseUrl(this)
        val input = EditText(this).apply {
            setText(currentUrl)
            setSelection(text.length)
            hint = getString(R.string.server_url_hint)
            setPadding(48, 32, 48, 32)
        }

        AlertDialog.Builder(this)
            .setTitle(R.string.configure_server)
            .setMessage("Set the ScamShield backend API endpoint. For Android Emulator use 10.0.2.2. For physical devices use your computer's local Wi-Fi IP address.")
            .setView(input)
            .setPositiveButton(R.string.save) { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotEmpty()) {
                    NetworkUtils.setApiBaseUrl(this, newUrl)
                    updateConfiguredUrlDisplay()
                    checkBackendHealth()
                }
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }
}
