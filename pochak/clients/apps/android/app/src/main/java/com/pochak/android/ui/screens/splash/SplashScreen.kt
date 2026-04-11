package com.pochak.android.ui.screens.splash

import android.os.Build
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import coil.ImageLoader
import coil.compose.rememberAsyncImagePainter
import coil.decode.GifDecoder
import coil.decode.ImageDecoderDecoder
import coil.request.ImageRequest
import coil.size.Size
import com.pochak.android.R
import kotlinx.coroutines.delay

/**
 * GIF-based splash screen.
 *
 * Displays `pochak_splash.gif` (portrait-converted from pochak_intro.mp4)
 * on a pochak-green (#00C700) background, filling the entire screen.
 * Auto-transitions via [onComplete] after the GIF duration (~4 seconds)
 * or a 5-second safety timeout.
 */

private val SplashGreen = Color(0xFF00C700)

@Composable
fun SplashScreen(
    onComplete: () -> Unit,
) {
    val context = LocalContext.current
    var hasCompleted by remember { mutableStateOf(false) }

    val completeOnce: () -> Unit = remember(onComplete) {
        {
            if (!hasCompleted) {
                hasCompleted = true
                onComplete()
            }
        }
    }

    // GIF-capable ImageLoader
    val imageLoader = remember {
        ImageLoader.Builder(context)
            .components {
                if (Build.VERSION.SDK_INT >= 28) {
                    add(ImageDecoderDecoder.Factory())
                } else {
                    add(GifDecoder.Factory())
                }
            }
            .build()
    }

    val painter = rememberAsyncImagePainter(
        model = ImageRequest.Builder(context)
            .data(R.raw.pochak_splash)
            .size(Size.ORIGINAL)
            .build(),
        imageLoader = imageLoader,
    )

    // Auto-transition after GIF plays (~4s) with safety margin
    LaunchedEffect(Unit) {
        delay(4_500L)
        completeOnce()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SplashGreen)
            .semantics { contentDescription = "Splash screen" },
        contentAlignment = Alignment.Center,
    ) {
        Image(
            painter = painter,
            contentDescription = "Pochak splash animation",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
        )
    }
}
