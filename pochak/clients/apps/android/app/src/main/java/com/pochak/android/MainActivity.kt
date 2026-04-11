package com.pochak.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.pochak.android.ui.navigation.PochakApp

/**
 * Main entry point for the Pochak Android app.
 * Uses edge-to-edge rendering with Compose.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PochakApp()
        }
    }
}
