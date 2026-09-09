package com.scamshield.quickscan

import com.scamshield.quickscan.qr.QrDecoder
import com.scamshield.quickscan.util.NetworkUtils
import org.junit.Assert.*
import org.junit.Test

class QuickScanLogicTest {

    @Test
    fun testIsPrimarilyUrl_identifiesStrictUrls() {
        assertTrue(NetworkUtils.isPrimarilyUrl("https://scam-sbi-portal.xyz"))
        assertTrue(NetworkUtils.isPrimarilyUrl("http://phish-hdfc.top/verify"))
        assertTrue(NetworkUtils.isPrimarilyUrl("secure-login.bank-update.site"))
    }

    @Test
    fun testIsPrimarilyUrl_rejectsNaturalMessages() {
        assertFalse(NetworkUtils.isPrimarilyUrl("URGENT: Your account is blocked today. Visit http://scam.xyz"))
        assertFalse(NetworkUtils.isPrimarilyUrl("Dear customer your OTP is 492819. Do not share."))
        assertFalse(NetworkUtils.isPrimarilyUrl("Electricity bill pending!\nCall 9876543210 immediately."))
    }

    @Test
    fun testSanitizeUrlInput_addsHttpsSchemeWhenMissing() {
        assertEquals("https://test.com", NetworkUtils.sanitizeUrlInput("test.com"))
        assertEquals("http://test.com", NetworkUtils.sanitizeUrlInput("http://test.com"))
        assertEquals("https://test.com", NetworkUtils.sanitizeUrlInput("https://test.com"))
    }

    @Test
    fun testUpiPayloadDetectionAndParsing() {
        val upiUri = "upi://pay?pa=fraudster@okhdfcbank&pn=SBI_REFUND_PORTAL&am=1500.00&tn=KYC+Refund&mc=0000"
        
        assertTrue(QrDecoder.isUpiPayload(upiUri))
        assertFalse(QrDecoder.isUpiPayload("https://example.com/qr"))
        assertFalse(QrDecoder.isUpiPayload("plain text payload"))

        val details = QrDecoder.parseUpiUri(upiUri)
        assertEquals("fraudster@okhdfcbank", details["pa"])
        assertEquals("SBI_REFUND_PORTAL", details["pn"])
        assertEquals("1500.00", details["am"])
        assertEquals("KYC Refund", details["tn"])
        assertEquals("0000", details["mc"])
    }

    @Test
    fun testUpiPayload_handlesMissingOptionalFieldsGracefully() {
        val minimalUpi = "upi://pay?pa=recipient@upi"
        assertTrue(QrDecoder.isUpiPayload(minimalUpi))
        val details = QrDecoder.parseUpiUri(minimalUpi)
        assertEquals("recipient@upi", details["pa"])
        assertNull(details["am"])
    }
}
