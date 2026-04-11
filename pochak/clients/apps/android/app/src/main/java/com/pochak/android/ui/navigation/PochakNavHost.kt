package com.pochak.android.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import com.pochak.android.ui.screens.clips.ClipsScreen
import com.pochak.android.ui.screens.commerce.StoreScreen
import com.pochak.android.ui.screens.findaccount.FindAccountScreen
import com.pochak.android.ui.screens.findaccount.IDResultScreen
import com.pochak.android.ui.screens.findaccount.PasswordResetScreen
import com.pochak.android.ui.screens.home.HomeScreen
import com.pochak.android.ui.screens.intro.CountrySelectScreen
import com.pochak.android.ui.screens.intro.LocationScreen
import com.pochak.android.ui.screens.intro.PermissionScreen
import com.pochak.android.ui.screens.login.LoginScreen
import com.pochak.android.ui.screens.mypage.MyMenuHubScreen
import com.pochak.android.ui.screens.mypage.MyPageScreen
import com.pochak.android.ui.screens.mypage.ProfileEditScreen
import com.pochak.android.ui.screens.mypage.SettingsScreen
import com.pochak.android.ui.screens.player.PlayerScreen
import com.pochak.android.ui.screens.schedule.ScheduleScreen
import com.pochak.android.ui.screens.search.SearchScreen
import com.pochak.android.ui.screens.signup.*
import com.pochak.android.ui.screens.splash.SplashScreen
import com.pochak.android.ui.theme.*

/**
 * Top-level navigation host for the Pochak app.
 * Manages screen transitions and bottom navigation state.
 */

sealed class PochakScreen {
    data object Splash : PochakScreen()
    data object Permission : PochakScreen()
    data object CountrySelect : PochakScreen()
    data object LocationSelect : PochakScreen()
    data object Login : PochakScreen()
    data object SignUpTerms : PochakScreen()
    data object SignUpPhone : PochakScreen()
    data object SignUpGuardian : PochakScreen()
    data object SignUpForeignerEmail : PochakScreen()
    data object SignUpAccount : PochakScreen()
    data object SignUpSNSType : PochakScreen()
    data object SignUpAdditional1 : PochakScreen()
    data object SignUpAdditional2 : PochakScreen()
    data object SignUpAdditional3 : PochakScreen()
    data object SignUpComplete : PochakScreen()
    data object FindAccount : PochakScreen()
    data object IDResult : PochakScreen()
    data object PasswordReset : PochakScreen()
    data object Main : PochakScreen()
    data class Player(val contentId: Long) : PochakScreen()
    data object Search : PochakScreen()
    data object MyMenuHub : PochakScreen()
    data object ProfileEdit : PochakScreen()
    data object Settings : PochakScreen()
    data object Store : PochakScreen()
}

@Composable
fun PochakApp() {
    var currentScreen by remember { mutableStateOf<PochakScreen>(PochakScreen.Splash) }
    var selectedTab by remember { mutableStateOf(PochakTab.HOME) }

    PochakTheme {
        when (val screen = currentScreen) {
            is PochakScreen.Splash -> {
                SplashScreen(
                    onComplete = { currentScreen = PochakScreen.Permission },
                )
            }

            is PochakScreen.Permission -> {
                PermissionScreen(
                    onConfirm = { currentScreen = PochakScreen.CountrySelect },
                )
            }

            is PochakScreen.CountrySelect -> {
                CountrySelectScreen(
                    onStart = { _ -> currentScreen = PochakScreen.Main },
                    onLoginClick = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.LocationSelect -> {
                LocationScreen(
                    onBackClick = { currentScreen = PochakScreen.CountrySelect },
                    onLocationSelected = { _ -> currentScreen = PochakScreen.Main },
                    onUseCurrentLocation = { currentScreen = PochakScreen.Main },
                )
            }

            is PochakScreen.Login -> {
                LoginScreen(
                    onLogin = { _, _ -> currentScreen = PochakScreen.Main },
                    onBackClick = { currentScreen = PochakScreen.CountrySelect },
                    onSignUp = { currentScreen = PochakScreen.SignUpTerms },
                    onFindAccount = { currentScreen = PochakScreen.FindAccount },
                )
            }

            is PochakScreen.SignUpTerms -> {
                TermsAgreementScreen(
                    onBackClick = { currentScreen = PochakScreen.Login },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpPhone },
                )
            }

            is PochakScreen.SignUpPhone -> {
                PhoneVerificationScreen(
                    onBackClick = { currentScreen = PochakScreen.SignUpTerms },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAccount },
                )
            }

            is PochakScreen.SignUpGuardian -> {
                GuardianVerificationScreen(
                    onBackClick = { currentScreen = PochakScreen.SignUpPhone },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAccount },
                )
            }

            is PochakScreen.SignUpForeignerEmail -> {
                ForeignerEmailVerifyScreen(
                    onBackClick = { currentScreen = PochakScreen.SignUpTerms },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAdditional1 },
                    onBackToHome = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.SignUpAccount -> {
                AccountInfoScreen(
                    onBackClick = { currentScreen = PochakScreen.SignUpPhone },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAdditional1 },
                )
            }

            is PochakScreen.SignUpSNSType -> {
                SNSTypeSelectScreen(
                    snsType = "카카오",
                    onAgeGroupSelected = { ageGroup ->
                        currentScreen = when (ageGroup) {
                            AgeGroup.UNDER_14 -> PochakScreen.SignUpGuardian
                            AgeGroup.OVER_14 -> PochakScreen.SignUpTerms
                        }
                    },
                    onForeignerClick = { currentScreen = PochakScreen.SignUpForeignerEmail },
                )
            }

            is PochakScreen.SignUpAdditional1 -> {
                AdditionalInfo1Screen(
                    onBackClick = { currentScreen = PochakScreen.SignUpAccount },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAdditional2 },
                    onSkipClick = { currentScreen = PochakScreen.SignUpAdditional2 },
                )
            }

            is PochakScreen.SignUpAdditional2 -> {
                AdditionalInfo2Screen(
                    onBackClick = { currentScreen = PochakScreen.SignUpAdditional1 },
                    onNextClick = { _ -> currentScreen = PochakScreen.SignUpAdditional3 },
                    onSkipClick = { currentScreen = PochakScreen.SignUpAdditional3 },
                )
            }

            is PochakScreen.SignUpAdditional3 -> {
                AdditionalInfo3Screen(
                    onBackClick = { currentScreen = PochakScreen.SignUpAdditional2 },
                    onCompleteClick = { _ -> currentScreen = PochakScreen.SignUpComplete },
                    onSkipClick = { currentScreen = PochakScreen.SignUpComplete },
                )
            }

            is PochakScreen.SignUpComplete -> {
                SignUpCompleteScreen(
                    onSubscribe = { currentScreen = PochakScreen.Store },
                    onSkip = { currentScreen = PochakScreen.Main },
                )
            }

            is PochakScreen.FindAccount -> {
                FindAccountScreen(
                    onBackClick = { currentScreen = PochakScreen.Login },
                    onLoginClick = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.IDResult -> {
                IDResultScreen(
                    onBackClick = { currentScreen = PochakScreen.FindAccount },
                    onSelectAccount = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.PasswordReset -> {
                PasswordResetScreen(
                    onBackClick = { currentScreen = PochakScreen.FindAccount },
                    onResetComplete = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.Main -> {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics { contentDescription = "Main app scaffold" },
                    containerColor = PochakColors.Background,
                    bottomBar = {
                        PochakBottomNavBar(
                            selectedTab = selectedTab,
                            onTabSelected = { selectedTab = it },
                        )
                    },
                ) { paddingValues ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                    ) {
                        Crossfade(
                            targetState = selectedTab,
                            animationSpec = tween(300),
                            label = "tab_crossfade",
                        ) { tab ->
                            when (tab) {
                                PochakTab.HOME -> HomeScreen(
                                    onContentClick = { id ->
                                        currentScreen = PochakScreen.Player(id)
                                    },
                                    onSearchClick = {
                                        currentScreen = PochakScreen.Search
                                    },
                                )

                                PochakTab.SCHEDULE -> ScheduleScreen(
                                    onContentClick = { id ->
                                        currentScreen = PochakScreen.Player(id)
                                    },
                                    onSearchClick = {
                                        currentScreen = PochakScreen.Search
                                    },
                                )

                                PochakTab.CLIPS -> ClipsScreen(
                                    onClipClick = { id ->
                                        currentScreen = PochakScreen.Player(id)
                                    },
                                )

                                PochakTab.MY -> MyPageScreen(
                                    onSearchClick = {
                                        currentScreen = PochakScreen.Search
                                    },
                                    onContentClick = { id ->
                                        currentScreen = PochakScreen.Player(id)
                                    },
                                    onLogout = {
                                        currentScreen = PochakScreen.Login
                                    },
                                    onMenuHub = {
                                        currentScreen = PochakScreen.MyMenuHub
                                    },
                                )
                            }
                        }
                    }
                }
            }

            is PochakScreen.Player -> {
                PlayerScreen(
                    contentId = screen.contentId,
                    onBackClick = { currentScreen = PochakScreen.Main },
                    onClipClick = { id -> currentScreen = PochakScreen.Player(id) },
                )
            }

            is PochakScreen.Search -> {
                SearchScreen(
                    onBackClick = { currentScreen = PochakScreen.Main },
                    onContentClick = { id -> currentScreen = PochakScreen.Player(id) },
                )
            }

            is PochakScreen.MyMenuHub -> {
                MyMenuHubScreen(
                    onBackClick = { currentScreen = PochakScreen.Main },
                    onNavigate = { route ->
                        when (route) {
                            "profile_edit" -> currentScreen = PochakScreen.ProfileEdit
                            "settings" -> currentScreen = PochakScreen.Settings
                            "store" -> currentScreen = PochakScreen.Store
                            else -> {}
                        }
                    },
                    onLogout = { currentScreen = PochakScreen.Login },
                )
            }

            is PochakScreen.ProfileEdit -> {
                ProfileEditScreen(
                    onBackClick = { currentScreen = PochakScreen.MyMenuHub },
                )
            }

            is PochakScreen.Settings -> {
                SettingsScreen(
                    onBackClick = { currentScreen = PochakScreen.MyMenuHub },
                )
            }

            is PochakScreen.Store -> {
                StoreScreen(
                    onBackClick = { currentScreen = PochakScreen.Main },
                )
            }
        }
    }
}

@Composable
private fun PlaceholderTab(title: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background),
        contentAlignment = androidx.compose.ui.Alignment.Center,
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Title03,
            color = PochakColors.TextTertiary,
        )
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewPochakApp() {
    PochakApp()
}
