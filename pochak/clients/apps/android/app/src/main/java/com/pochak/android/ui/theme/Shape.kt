package com.pochak.android.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Pochak Shape System
 * Based on design tokens: sm=4dp, base=8dp, md=12dp, lg=16dp, xl=24dp
 */
object PochakShapes {
    val None = RoundedCornerShape(0.dp)
    val Small = RoundedCornerShape(4.dp)
    val Base = RoundedCornerShape(8.dp)
    val Medium = RoundedCornerShape(12.dp)
    val Large = RoundedCornerShape(16.dp)
    val ExtraLarge = RoundedCornerShape(24.dp)
    val Full = RoundedCornerShape(50)

    // Specific component shapes
    val Card = Medium
    val Button = Medium
    val TextField = Medium
    val BottomSheet = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    val Badge = RoundedCornerShape(4.dp)
    val Chip = Full
    val SearchBar = Large
    val SnsButton = Medium
}

val PochakMaterialShapes = Shapes(
    extraSmall = PochakShapes.Small,
    small = PochakShapes.Base,
    medium = PochakShapes.Medium,
    large = PochakShapes.Large,
    extraLarge = PochakShapes.ExtraLarge,
)
