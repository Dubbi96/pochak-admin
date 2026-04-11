// TermsAgreementView.swift
// Pochak OTT Platform - Terms Agreement Screen
// Design ref: [포착3.0] Mobile 디자인 - 약관동의

import SwiftUI

// MARK: - Data Models

struct TermsAgreementResult {
    let thirdPartyConsent: Bool
    let marketingConsent: Bool
    let smsConsent: Bool
    let emailConsent: Bool
    let pushConsent: Bool
    let nightPushConsent: Bool
}

enum TermsType {
    case service, privacy, thirdParty, marketing
}

// MARK: - TermsAgreementView

struct TermsAgreementView: View {

    var onBackClick: () -> Void = {}
    var onNextClick: (TermsAgreementResult) -> Void = { _ in }
    var onViewTerms: (TermsType) -> Void = { _ in }
    var onForeignerClick: () -> Void = {}

    @State private var isOver14 = false
    @State private var serviceTerms = false
    @State private var privacyTerms = false
    @State private var thirdPartyTerms = false
    @State private var marketingTerms = false
    @State private var smsConsent = false
    @State private var emailConsent = false
    @State private var pushConsent = false
    @State private var nightPushConsent = false

    private var allRequired: Bool {
        isOver14 && serviceTerms && privacyTerms
    }

    private var allChecked: Bool {
        isOver14 && serviceTerms && privacyTerms &&
        thirdPartyTerms && marketingTerms &&
        smsConsent && emailConsent && pushConsent && nightPushConsent
    }

    var body: some View {
        VStack(spacing: 0) {
            // -- Top Bar --
            signUpTopBar(
                onBackClick: onBackClick,
                trailing: {
                    HStack(spacing: 4) {
                        Text("한국어")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextPrimary)
                        Text("\u{1F310}")
                            .font(.pochakBody02)
                    }
                }
            )

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 24)

                    // -- Title --
                    Text("서비스 약관동의")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer().frame(height: 32)

                    // -- Select All --
                    PochakCheckboxRow(
                        text: "전체동의",
                        checked: allChecked,
                        onCheckedChange: { toggleAll($0) },
                        textFont: .pochakButton,
                        outlined: true
                    )

                    Divider()
                        .background(Color.pochakBorder)
                        .padding(.vertical, 16)

                    // -- Individual Terms --
                    PochakCheckboxRow(
                        text: "만 14세 이상",
                        checked: isOver14,
                        onCheckedChange: { isOver14 = $0 }
                    )

                    Spacer().frame(height: 12)

                    PochakCheckboxRow(
                        text: "(필수) 서비스이용약관 동의",
                        checked: serviceTerms,
                        onCheckedChange: { serviceTerms = $0 },
                        trailingAction: "전문보기",
                        onTrailingClick: { onViewTerms(.service) }
                    )

                    Spacer().frame(height: 12)

                    PochakCheckboxRow(
                        text: "(필수) 개인정보 수집 및 이용 동의",
                        checked: privacyTerms,
                        onCheckedChange: { privacyTerms = $0 },
                        trailingAction: "전문보기",
                        onTrailingClick: { onViewTerms(.privacy) }
                    )

                    Spacer().frame(height: 12)

                    PochakCheckboxRow(
                        text: "(선택) 개인정보 제 3자 제공 동의",
                        checked: thirdPartyTerms,
                        onCheckedChange: { thirdPartyTerms = $0 },
                        trailingAction: "전문보기",
                        onTrailingClick: { onViewTerms(.thirdParty) }
                    )

                    Spacer().frame(height: 12)

                    PochakCheckboxRow(
                        text: "(선택) 마케팅 정보 수신 동의",
                        checked: marketingTerms,
                        onCheckedChange: { toggleMarketing($0) },
                        trailingAction: "전문보기",
                        onTrailingClick: { onViewTerms(.marketing) }
                    )

                    // -- Marketing Sub-options --
                    if marketingTerms {
                        VStack(alignment: .leading, spacing: 10) {
                            PochakCheckboxRow(
                                text: "SMS 수신",
                                checked: smsConsent,
                                onCheckedChange: { smsConsent = $0 },
                                compact: true
                            )
                            PochakCheckboxRow(
                                text: "이메일 수신",
                                checked: emailConsent,
                                onCheckedChange: { emailConsent = $0 },
                                compact: true
                            )
                            PochakCheckboxRow(
                                text: "푸시 알림 수신",
                                checked: pushConsent,
                                onCheckedChange: { pushConsent = $0 },
                                compact: true
                            )
                            PochakCheckboxRow(
                                text: "야간 서비스 알림 수신 (21시 ~ 08시)",
                                checked: nightPushConsent,
                                onCheckedChange: { nightPushConsent = $0 },
                                compact: true
                            )
                        }
                        .padding(.leading, 36)
                        .padding(.top, 12)
                        .transition(.opacity.combined(with: .move(edge: .top)))
                        .animation(.easeInOut(duration: 0.25), value: marketingTerms)
                    }

                    Spacer().frame(height: 32)

                    // -- Foreigner link --
                    Button(action: onForeignerClick) {
                        Text("Not Korean?")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextSecondary)
                            .underline()
                    }
                    .padding(.vertical, 4)

                    Spacer().frame(height: 24)
                }
                .padding(.horizontal, 24)
            }

            // -- Bottom Button --
            VStack {
                Button(action: {
                    onNextClick(TermsAgreementResult(
                        thirdPartyConsent: thirdPartyTerms,
                        marketingConsent: marketingTerms,
                        smsConsent: smsConsent,
                        emailConsent: emailConsent,
                        pushConsent: pushConsent,
                        nightPushConsent: nightPushConsent
                    ))
                }) {
                    Text("다음")
                }
                .buttonStyle(PochakPrimaryButtonStyle(isEnabled: allRequired))
                .disabled(!allRequired)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color.pochakBg)
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Helpers

    private func toggleAll(_ checked: Bool) {
        isOver14 = checked
        serviceTerms = checked
        privacyTerms = checked
        thirdPartyTerms = checked
        marketingTerms = checked
        smsConsent = checked
        emailConsent = checked
        pushConsent = checked
        nightPushConsent = checked
    }

    private func toggleMarketing(_ checked: Bool) {
        marketingTerms = checked
        if !checked {
            smsConsent = false
            emailConsent = false
            pushConsent = false
            nightPushConsent = false
        }
    }
}

// MARK: - Shared SignUp Top Bar

@ViewBuilder
func signUpTopBar<Trailing: View>(
    onBackClick: @escaping () -> Void,
    @ViewBuilder trailing: () -> Trailing
) -> some View {
    HStack {
        Button(action: onBackClick) {
            Image(systemName: "chevron.left")
                .font(.title3.weight(.medium))
                .foregroundStyle(Color.pochakTextPrimary)
        }
        .accessibilityLabel("뒤로 가기")

        Spacer()

        trailing()
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 8)
}

@ViewBuilder
func signUpTopBar(onBackClick: @escaping () -> Void) -> some View {
    signUpTopBar(onBackClick: onBackClick) {
        Spacer().frame(width: 48, height: 48)
    }
}

// MARK: - PochakCheckboxRow

struct PochakCheckboxRow: View {

    let text: String
    let checked: Bool
    let onCheckedChange: (Bool) -> Void
    var textFont: Font = .pochakBody02
    var trailingAction: String? = nil
    var onTrailingClick: (() -> Void)? = nil
    var outlined: Bool = false
    var compact: Bool = false

    private var checkboxSize: CGFloat { compact ? 18 : 22 }
    private var checkIconSize: CGFloat { compact ? 12 : 14 }

    var body: some View {
        Button(action: { onCheckedChange(!checked) }) {
            HStack(spacing: 12) {
                // Custom checkbox
                ZStack {
                    if checked {
                        RoundedRectangle(cornerRadius: 4, style: .continuous)
                            .fill(Color.pochakPrimary)
                            .frame(width: checkboxSize, height: checkboxSize)
                        Image(systemName: "checkmark")
                            .font(.system(size: checkIconSize, weight: .bold))
                            .foregroundStyle(.white)
                    } else {
                        RoundedRectangle(cornerRadius: 4, style: .continuous)
                            .stroke(Color.pochakBorder, lineWidth: 1.5)
                            .frame(width: checkboxSize, height: checkboxSize)
                    }
                }

                Text(text)
                    .font(textFont)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                Spacer()

                if let trailingAction, let onTrailingClick {
                    Button(action: onTrailingClick) {
                        Text(trailingAction)
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakPrimary)
                    }
                    .padding(.leading, 8)
                }
            }
            .padding(outlined ? EdgeInsets(top: 14, leading: 12, bottom: 14, trailing: 12) : EdgeInsets())
            .overlay(
                Group {
                    if outlined {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(checked ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4), lineWidth: 1)
                    }
                }
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(text) \(checked ? "선택됨" : "선택 안됨")")
    }
}

// MARK: - AdditionalInfoBottomBar

struct AdditionalInfoBottomBar: View {

    let stepLabel: String
    let buttonText: String
    let onButtonClick: () -> Void
    var buttonEnabled: Bool = true

    var body: some View {
        HStack {
            Text(stepLabel)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)

            Spacer()

            Button(action: onButtonClick) {
                Text(buttonText)
                    .font(.pochakButton)
                    .foregroundStyle(buttonEnabled ? Color.pochakTextOnPrimary : Color.pochakTextTertiary)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(
                        buttonEnabled
                            ? Color.pochakPrimary
                            : Color.pochakSurfaceVar
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .disabled(!buttonEnabled)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(Color.pochakSurface)
    }
}

// MARK: - Preview

#Preview {
    TermsAgreementView()
        .preferredColorScheme(.dark)
}
