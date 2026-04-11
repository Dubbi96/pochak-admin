// PochakApp.swift
// Pochak OTT Platform - App Entry Point
// Full navigation flow matching Android PochakNavHost

import SwiftUI

// MARK: - Navigation State

enum PochakScreen: Equatable {
    case splash
    case permission
    case countrySelect
    case locationSelect
    case login
    case signUpTerms
    case signUpPhone
    case signUpGuardian
    case signUpForeignerEmail
    case signUpAccount
    case signUpSNSType
    case signUpAdditional1
    case signUpAdditional2
    case signUpAdditional3
    case signUpComplete
    case findAccount
    case idResult
    case passwordReset
    case main
    case myMenuHub
    case profileEdit
    case settings
    case store
}

@main
struct PochakApp: App {

    @State private var currentScreen: PochakScreen = .splash

    init() {
        PochakFont.registerFonts()
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                switch currentScreen {
                // MARK: - Splash & Intro
                case .splash:
                    SplashView {
                        navigate(to: .permission)
                    }
                    .transition(.opacity)

                case .permission:
                    PermissionView {
                        navigate(to: .countrySelect)
                    }
                    .transition(slideTransition)

                case .countrySelect:
                    CountrySelectView(
                        onStart: { _ in navigate(to: .main) },
                        onLoginClick: { navigate(to: .login) }
                    )
                    .transition(slideTransition)

                case .locationSelect:
                    LocationView(
                        onBackClick: { navigate(to: .countrySelect) },
                        onLocationSelected: { _ in navigate(to: .main) },
                        onUseCurrentLocation: { navigate(to: .main) }
                    )
                    .transition(slideTransition)

                // MARK: - Auth
                case .login:
                    LoginView(
                        onLogin: { _, _ in navigate(to: .main) },
                        onBackClick: { navigate(to: .countrySelect) },
                        onSignUp: { navigate(to: .signUpTerms) },
                        onFindAccount: { navigate(to: .findAccount) }
                    )
                    .transition(slideTransition)

                // MARK: - Sign Up Flow
                case .signUpTerms:
                    TermsAgreementView(
                        onBackClick: { navigate(to: .login) },
                        onNextClick: { navigate(to: .signUpPhone) }
                    )
                    .transition(slideTransition)

                case .signUpPhone:
                    PhoneVerificationView(
                        onBackClick: { navigate(to: .signUpTerms) },
                        onNextClick: { navigate(to: .signUpAccount) }
                    )
                    .transition(slideTransition)

                case .signUpGuardian:
                    GuardianVerificationView(
                        onBackClick: { navigate(to: .signUpPhone) },
                        onNextClick: { navigate(to: .signUpAccount) }
                    )
                    .transition(slideTransition)

                case .signUpForeignerEmail:
                    ForeignerEmailVerifyView(
                        onBackClick: { navigate(to: .signUpTerms) },
                        onNextClick: { navigate(to: .signUpAdditional1) },
                        onBackToHome: { navigate(to: .login) }
                    )
                    .transition(slideTransition)

                case .signUpAccount:
                    AccountInfoView(
                        onBackClick: { navigate(to: .signUpPhone) },
                        onNextClick: { navigate(to: .signUpAdditional1) }
                    )
                    .transition(slideTransition)

                case .signUpSNSType:
                    SNSTypeSelectView(
                        snsType: "카카오",
                        onUnder14: { navigate(to: .signUpGuardian) },
                        onOver14: { navigate(to: .signUpTerms) },
                        onForeigner: { navigate(to: .signUpForeignerEmail) }
                    )
                    .transition(slideTransition)

                case .signUpAdditional1:
                    AdditionalInfo1View(
                        onBackClick: { navigate(to: .signUpAccount) },
                        onNextClick: { navigate(to: .signUpAdditional2) },
                        onSkipClick: { navigate(to: .signUpAdditional2) }
                    )
                    .transition(slideTransition)

                case .signUpAdditional2:
                    AdditionalInfo2View(
                        onBackClick: { navigate(to: .signUpAdditional1) },
                        onNextClick: { navigate(to: .signUpAdditional3) },
                        onSkipClick: { navigate(to: .signUpAdditional3) }
                    )
                    .transition(slideTransition)

                case .signUpAdditional3:
                    AdditionalInfo3View(
                        onBackClick: { navigate(to: .signUpAdditional2) },
                        onCompleteClick: { navigate(to: .signUpComplete) },
                        onSkipClick: { navigate(to: .signUpComplete) }
                    )
                    .transition(slideTransition)

                case .signUpComplete:
                    SignUpCompleteView(
                        onSubscribe: { navigate(to: .store) },
                        onSkip: { navigate(to: .main) }
                    )
                    .transition(slideTransition)

                // MARK: - Find Account
                case .findAccount:
                    FindAccountView(
                        onBackClick: { navigate(to: .login) },
                        onLoginClick: { navigate(to: .login) }
                    )
                    .transition(slideTransition)

                case .idResult:
                    IDResultView(
                        onBackClick: { navigate(to: .findAccount) },
                        onSelectAccount: { _ in navigate(to: .login) }
                    )
                    .transition(slideTransition)

                case .passwordReset:
                    PasswordResetView(
                        onBackClick: { navigate(to: .findAccount) },
                        onResetComplete: { navigate(to: .login) }
                    )
                    .transition(slideTransition)

                // MARK: - Main App
                case .main:
                    MainTabView()
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .opacity
                        ))

                // MARK: - My Page Sub-screens
                case .myMenuHub:
                    MyMenuHubView(
                        onBackClick: { navigate(to: .main) },
                        onNavigate: { route in
                            switch route {
                            case "profile_edit": navigate(to: .profileEdit)
                            case "settings": navigate(to: .settings)
                            case "store": navigate(to: .store)
                            default: break
                            }
                        },
                        onLogout: { navigate(to: .login) }
                    )
                    .transition(slideTransition)

                case .profileEdit:
                    ProfileEditView(
                        onBackClick: { navigate(to: .myMenuHub) }
                    )
                    .transition(slideTransition)

                case .settings:
                    SettingsView(
                        onBackClick: { navigate(to: .myMenuHub) }
                    )
                    .transition(slideTransition)

                case .store:
                    StoreView(
                        onBackClick: { navigate(to: .main) }
                    )
                    .transition(slideTransition)
                }
            }
            .preferredColorScheme(.dark)
            .animation(.easeInOut(duration: 0.4), value: currentScreen)
        }
    }

    // MARK: - Helpers

    private func navigate(to screen: PochakScreen) {
        withAnimation(.easeInOut(duration: 0.4)) {
            currentScreen = screen
        }
    }

    private var slideTransition: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        )
    }

    private func configureAppearance() {
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(Color.pochakTabBg)
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        UITabBar.appearance().isHidden = true

        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithTransparentBackground()
        navAppearance.titleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 17, weight: .bold)
        ]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
    }
}
