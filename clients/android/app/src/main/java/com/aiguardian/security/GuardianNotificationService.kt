package com.aiguardian.security

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class GuardianNotificationService : NotificationListenerService() {

    private val client = OkHttpClient()
    private val API_URL = "http://YOUR_PC_IP:5000/analyze" // To be replaced with actual IP

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        
        // Filter for chat apps
        if (packageName == "com.whatsapp" || packageName == "org.telegram.messenger" || packageName == "com.google.android.apps.messaging") {
            val extras = sbn.notification.extras
            val title = extras.getString(Notification.EXTRA_TITLE)
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

            if (text != null && text.isNotEmpty()) {
                analyzeMessage(text, packageName)
            }
        }
    }

    private fun analyzeMessage(message: String, source: String) {
        val json = JSONObject()
        json.put("text", message)

        val body = json.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(API_URL)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("GuardianService", "Scan failed: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                if (responseData != null) {
                    val result = JSONObject(responseData)
                    val riskLevel = result.getString("risk_level")
                    
                    if (riskLevel == "High") {
                        showSecurityAlert(result.getString("alert"), source)
                    }
                }
            }
        })
    }

    private fun showSecurityAlert(message: String, source: String) {
        // Logic to show a system-level alert or high-priority notification
        Log.d("GuardianService", "SECURITY ALERT [$source]: $message")
        // In a real app, this would trigger an Intent to an AlertActivity
    }
}
