package com.scamshield.quickscan.util

import android.content.Context
import com.scamshield.quickscan.BuildConfig
import java.net.URI
import java.util.regex.Pattern

object NetworkUtils {

    private const val PREFS_NAME = "scamshield_prefs"
    private const val KEY_BASE_URL = "api_base_url"
    private const val KEY_WEB_URL = "web_base_url"

    private val URL_PATTERN = Pattern.compile(
        "^(https?://)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/\\S*)?$",
        Pattern.CASE_INSENSITIVE
    )

    fun getApiBaseUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_BASE_URL, null)
        val url = if (!saved.isNullOrBlank()) saved else BuildConfig.DEFAULT_API_BASE_URL
        return normalizeUrl(url)
    }

    fun setApiBaseUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_BASE_URL, normalizeUrl(url)).apply()
    }

    fun getWebBaseUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_WEB_URL, null)
        val url = if (!saved.isNullOrBlank()) saved else BuildConfig.DEFAULT_WEB_BASE_URL
        return normalizeUrl(url)
    }

    fun setWebBaseUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_WEB_URL, normalizeUrl(url)).apply()
    }

    private fun normalizeUrl(raw: String): String {
        return raw.trim().removeSuffix("/")
    }

    /**
     * Determines whether input is strictly a URL (e.g. shared from Chrome)
     * or a natural language message with or without links (e.g. SMS, WhatsApp).
     */
    fun isPrimarilyUrl(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.contains("\n") || trimmed.contains(" ")) {
            // Contains whitespace or linebreaks -> SMS / natural text message
            return false
        }
        if (trimmed.startsWith("http://", ignoreCase = true) ||
            trimmed.startsWith("https://", ignoreCase = true)
        ) {
            return true
        }
        return URL_PATTERN.matcher(trimmed).matches()
    }

    /**
     * Ensures URL has a scheme (defaults to https:// if missing).
     */
    fun sanitizeUrlInput(raw: String): String {
        val trimmed = raw.trim()
        return if (!trimmed.startsWith("http://", ignoreCase = true) &&
            !trimmed.startsWith("https://", ignoreCase = true)
        ) {
            "https://$trimmed"
        } else {
            trimmed
        }
    }
}
