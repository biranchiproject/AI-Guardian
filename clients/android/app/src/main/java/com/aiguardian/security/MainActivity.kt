package com.aiguardian.security

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.TextView
import android.widget.Switch

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnPermission = findViewById<Button>(R.id.btnPermission)
        val switchGuard = findViewById<Switch>(R.id.switchGuard)
        val statusText = findViewById<TextView>(R.id.statusText)

        btnPermission.setOnClickListener {
            // Open settings to enable notification listener
            startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
        }

        switchGuard.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                statusText.text = "Status: ACTIVE MONITORING"
                statusText.setTextColor(getColor(android.R.color.holo_green_light))
            } else {
                statusText.text = "Status: INACTIVE"
                statusText.setTextColor(getColor(android.R.color.holo_red_light))
            }
        }
    }
}
