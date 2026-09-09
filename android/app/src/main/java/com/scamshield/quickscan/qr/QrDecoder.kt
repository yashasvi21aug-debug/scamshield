package com.scamshield.quickscan.qr

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import com.scamshield.quickscan.data.QrDecodeResult
import java.io.InputStream
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

object QrDecoder {

    private const val MAX_IMAGE_DIMENSION = 2048

    /**
     * Decodes a QR code from an Android Content Uri safely.
     * Prevents OutOfMemoryErrors by downsampling large camera photos.
     */
    fun decodeFromUri(contentResolver: ContentResolver, uri: Uri): QrDecodeResult {
        return try {
            // 1. Inspect image dimensions first without loading full bitmap into memory
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            } ?: return QrDecodeResult(success = false, errorMessage = "Could not open image stream.")

            // 2. Calculate safe downsample factor
            var sampleSize = 1
            while (options.outWidth / sampleSize > MAX_IMAGE_DIMENSION ||
                options.outHeight / sampleSize > MAX_IMAGE_DIMENSION
            ) {
                sampleSize *= 2
            }

            // 3. Load actual bitmap with calculated sampleSize
            val loadOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }

            val bitmap = contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, loadOptions)
            } ?: return QrDecodeResult(success = false, errorMessage = "Failed to decode image data.")

            decodeBitmap(bitmap)
        } catch (e: SecurityException) {
            QrDecodeResult(success = false, errorMessage = "Permission denied while accessing shared image.")
        } catch (e: OutOfMemoryError) {
            QrDecodeResult(success = false, errorMessage = "Shared image is too large to decode safely.")
        } catch (e: Exception) {
            QrDecodeResult(success = false, errorMessage = e.message ?: "Failed to process image.")
        }
    }

    /**
     * Decodes a QR code from an in-memory Bitmap using ZXing.
     */
    fun decodeBitmap(bitmap: Bitmap): QrDecodeResult {
        return try {
            val width = bitmap.width
            val height = bitmap.height
            val pixels = IntArray(width * height)
            bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

            val source = RGBLuminanceSource(width, height, pixels)
            val binaryBitmap = BinaryBitmap(HybridBinarizer(source))

            val hints = mapOf<DecodeHintType, Any>(
                DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE),
                DecodeHintType.TRY_HARDER to true,
                DecodeHintType.CHARACTER_SET to "UTF-8"
            )

            val result = MultiFormatReader().decode(binaryBitmap, hints)
            val payload = result.text?.trim() ?: ""

            if (payload.isEmpty()) {
                return QrDecodeResult(success = false, errorMessage = "Decoded QR code was empty.")
            }

            val isUpi = isUpiPayload(payload)
            val upiDetails = if (isUpi) parseUpiUri(payload) else null

            QrDecodeResult(
                success = true,
                payload = payload,
                isUpi = isUpi,
                upiDetails = upiDetails
            )
        } catch (e: NotFoundException) {
            QrDecodeResult(success = false, errorMessage = "No readable QR code was found in the image.")
        } catch (e: FormatException) {
            QrDecodeResult(success = false, errorMessage = "Corrupted or unreadable QR code data.")
        } catch (e: ChecksumException) {
            QrDecodeResult(success = false, errorMessage = "QR code checksum verification failed.")
        } catch (e: Exception) {
            QrDecodeResult(success = false, errorMessage = "QR decode failed: ${e.message}")
        }
    }

    fun isUpiPayload(payload: String): Boolean {
        val trimmed = payload.trim()
        return trimmed.startsWith("upi://pay", ignoreCase = true) ||
                trimmed.startsWith("upi://", ignoreCase = true)
    }

    fun parseUpiUri(uriString: String): Map<String, String> {
        val params = mutableMapOf<String, String>()
        try {
            val queryStart = uriString.indexOf('?')
            if (queryStart != -1 && queryStart < uriString.length - 1) {
                val queryString = uriString.substring(queryStart + 1)
                val pairs = queryString.split("&")
                for (pair in pairs) {
                    val idx = pair.indexOf("=")
                    if (idx > 0) {
                        val key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8.name())
                        val value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8.name())
                        params[key.lowercase()] = value
                    }
                }
            }
        } catch (_: Exception) {
            // Safely return partial or empty map on parse anomalies
        }
        return params
    }
}
