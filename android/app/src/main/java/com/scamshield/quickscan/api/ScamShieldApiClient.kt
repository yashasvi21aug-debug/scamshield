package com.scamshield.quickscan.api

import android.content.Context
import com.google.gson.Gson
import com.scamshield.quickscan.data.*
import com.scamshield.quickscan.util.NetworkUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class ScamShieldApiClient(private val context: Context) {

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(35, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val baseUrl: String
        get() = NetworkUtils.getApiBaseUrl(context)

    suspend fun analyzeSms(text: String, useAi: Boolean = true): Result<ScanData> =
        withContext(Dispatchers.IO) {
            val payload = gson.toJson(SmsAnalysisRequest(text = text, useAi = useAi))
            executeScanPost("/api/analyze/sms", payload)
        }

    suspend fun analyzeUrl(url: String, useAi: Boolean = true): Result<ScanData> =
        withContext(Dispatchers.IO) {
            val payload = gson.toJson(UrlAnalysisRequest(url = url, useAi = useAi))
            executeScanPost("/api/analyze/url", payload)
        }

    suspend fun analyzeQr(qrPayload: String, useAi: Boolean = true): Result<ScanData> =
        withContext(Dispatchers.IO) {
            val payload = gson.toJson(QrAnalysisRequest(payload = qrPayload, useAi = useAi))
            executeScanPost("/api/analyze/qr", payload)
        }

    suspend fun checkHealth(): Result<HealthResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/api/health")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(
                        IOException("Health check failed with HTTP ${response.code}")
                    )
                }
                val health = gson.fromJson(body, HealthResponse::class.java)
                Result.success(health)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun executeScanPost(endpoint: String, jsonBody: String): Result<ScanData> {
        return try {
            val request = Request.Builder()
                .url("$baseUrl$endpoint")
                .post(jsonBody.toRequestBody(jsonMediaType))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyString = response.body?.string() ?: ""

                if (!response.isSuccessful) {
                    val errMsg = try {
                        val parsed = gson.fromJson(bodyString, ScanResponse::class.java)
                        parsed.error ?: parsed.details ?: "Server returned HTTP ${response.code}"
                    } catch (_: Exception) {
                        "Server returned HTTP ${response.code}"
                    }
                    return Result.failure(IOException(errMsg))
                }

                val scanResponse = gson.fromJson(bodyString, ScanResponse::class.java)
                if (scanResponse != null && scanResponse.success && scanResponse.data != null) {
                    Result.success(scanResponse.data)
                } else {
                    Result.failure(IOException(scanResponse?.error ?: "Invalid response from FraudLens server."))
                }
            }
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(IOException("Unexpected communication error: ${e.message}", e))
        }
    }
}
