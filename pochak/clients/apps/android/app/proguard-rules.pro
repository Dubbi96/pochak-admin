# Pochak Android App ProGuard Rules
# Keep Compose
-dontwarn androidx.compose.**
-keep class androidx.compose.** { *; }

# Keep Coil
-dontwarn coil.**

# Keep Media3 / ExoPlayer
-dontwarn androidx.media3.**
