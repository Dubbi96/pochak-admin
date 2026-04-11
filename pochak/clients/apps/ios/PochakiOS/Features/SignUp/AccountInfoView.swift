// AccountInfoView.swift
// Pochak OTT Platform - Account Info Input Screen
// Design ref: [포착3.0] Mobile 디자인 - 계정정보 입력 / Create account

import SwiftUI

struct AccountInfoResult {
    let userId: String
    let password: String
    let email: String?
    let birthYear: String?
    let birthMonth: String?
    let birthDay: String?
}

struct AccountInfoView: View {

    var isForeigner: Bool = false
    var onBackClick: () -> Void = {}
    var onNextClick: (AccountInfoResult) -> Void = { _ in }
    var onCheckDuplicate: (String, @escaping (Bool) -> Void) -> Void = { _, cb in cb(true) }

    @State private var userId = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var email = ""
    @State private var selectedEmailDomain = "@address.com"
    @State private var idChecked = false
    @State private var idAvailable: Bool? = nil
    @State private var isCheckingId = false

    // Birthday (foreigner)
    @State private var birthYear = ""
    @State private var birthMonth = ""
    @State private var birthDay = ""

    private let emailDomains = [
        "@address.com", "@gmail.com", "@naver.com", "@daum.net", "@yahoo.com",
    ]

    private var passwordsMatch: Bool {
        !password.isEmpty && password == confirmPassword
    }

    private var isFormValid: Bool {
        if isForeigner {
            return idChecked && idAvailable == true && passwordsMatch &&
                !birthYear.isEmpty && !birthMonth.isEmpty && !birthDay.isEmpty
        } else {
            return idChecked && idAvailable == true && passwordsMatch && !email.isEmpty
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            signUpTopBar(onBackClick: onBackClick)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 24)

                    Text(isForeigner ? "Create account." : "계정정보 입력")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer().frame(height: 32)

                    // -- User ID --
                    fieldLabel(isForeigner ? "User ID" : "아이디")
                    Spacer().frame(height: 8)
                    userIdRow

                    if idChecked, let available = idAvailable {
                        Spacer().frame(height: 4)
                        Text(available
                             ? (isForeigner ? "Available!" : "사용 가능한 아이디입니다.")
                             : (isForeigner ? "Already taken." : "이미 사용 중인 아이디입니다."))
                            .font(.pochakBody04)
                            .foregroundStyle(available ? Color.pochakPrimary : Color.pochakLive)
                    }

                    Spacer().frame(height: 20)

                    // -- Password --
                    fieldLabel(isForeigner ? "Password" : "비밀번호")
                    Spacer().frame(height: 8)
                    pochakSecureField(
                        text: $password,
                        placeholder: isForeigner ? "Password" : "비밀번호"
                    )

                    Spacer().frame(height: 16)

                    // -- Confirm Password --
                    fieldLabel(isForeigner ? "Confirm Password" : "비밀번호 확인")
                    Spacer().frame(height: 8)
                    pochakSecureField(
                        text: $confirmPassword,
                        placeholder: isForeigner ? "Confirm Password" : "비밀번호 확인"
                    )

                    if !confirmPassword.isEmpty && !passwordsMatch {
                        Spacer().frame(height: 4)
                        Text(isForeigner ? "Passwords do not match." : "비밀번호가 일치하지 않습니다.")
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakLive)
                    }

                    Spacer().frame(height: 20)

                    if isForeigner {
                        birthdaySection
                    } else {
                        emailSection
                    }

                    Spacer().frame(height: 24)
                }
                .padding(.horizontal, 24)
            }

            // -- Bottom Button --
            VStack {
                Button(action: {
                    onNextClick(AccountInfoResult(
                        userId: userId,
                        password: password,
                        email: isForeigner ? nil : "\(email)\(selectedEmailDomain)",
                        birthYear: isForeigner ? birthYear : nil,
                        birthMonth: isForeigner ? birthMonth : nil,
                        birthDay: isForeigner ? birthDay : nil
                    ))
                }) {
                    Text(isForeigner ? "Next" : "다음")
                }
                .buttonStyle(PochakPrimaryButtonStyle(isEnabled: isFormValid))
                .disabled(!isFormValid)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color.pochakBg)
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
        .onChange(of: userId) { _ in
            idChecked = false
            idAvailable = nil
        }
    }

    // MARK: - Sub-Views

    private var userIdRow: some View {
        HStack(spacing: 8) {
            TextField("", text: $userId, prompt: Text(isForeigner ? "User ID" : "아이디").foregroundStyle(Color.pochakTextTertiary))
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextPrimary)
                .autocapitalization(.none)
                .textContentType(.username)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )

            Button(action: {
                isCheckingId = true
                onCheckDuplicate(userId) { available in
                    isCheckingId = false
                    idChecked = true
                    idAvailable = available
                }
            }) {
                if isCheckingId {
                    ProgressView()
                        .tint(Color.pochakTextOnPrimary)
                } else {
                    Text(isForeigner ? "ID Check" : "중복체크")
                        .font(.pochakBody03)
                        .fontWeight(.semibold)
                }
            }
            .foregroundStyle(Color.pochakTextOnPrimary)
            .padding(.horizontal, 12)
            .padding(.vertical, 14)
            .background(userId.isEmpty ? Color.pochakSurfaceVar : Color.pochakPrimary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .disabled(userId.isEmpty || isCheckingId)
        }
    }

    private var emailSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            fieldLabel("이메일")
            Spacer().frame(height: 8)

            HStack(spacing: 4) {
                TextField("", text: $email, prompt: Text("이메일").foregroundStyle(Color.pochakTextTertiary))
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(Color.pochakSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                    )

                Menu {
                    ForEach(emailDomains, id: \.self) { domain in
                        Button(action: { selectedEmailDomain = domain }) {
                            HStack {
                                Text(domain)
                                if domain == selectedEmailDomain {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(selectedEmailDomain)
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .lineLimit(1)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.pochakTextPrimary)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 14)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                    )
                }
            }
        }
    }

    private var birthdaySection: some View {
        VStack(alignment: .leading, spacing: 0) {
            fieldLabel("Date of Birth")
            Spacer().frame(height: 8)

            HStack(spacing: 8) {
                birthdayDropdown(
                    label: birthYear.isEmpty ? "Year" : birthYear,
                    items: (1930...2025).reversed().map { String($0) },
                    selection: $birthYear
                )
                birthdayDropdown(
                    label: birthMonth.isEmpty ? "Month" : birthMonth,
                    items: (1...12).map { String(format: "%02d", $0) },
                    selection: $birthMonth
                )
                birthdayDropdown(
                    label: birthDay.isEmpty ? "Day" : birthDay,
                    items: (1...31).map { String(format: "%02d", $0) },
                    selection: $birthDay
                )
            }
        }
    }

    // MARK: - Helpers

    @ViewBuilder
    private func fieldLabel(_ text: String) -> some View {
        Text(text)
            .font(.pochakBody03)
            .foregroundStyle(Color.pochakTextSecondary)
    }

    @ViewBuilder
    private func pochakSecureField(text: Binding<String>, placeholder: String) -> some View {
        SecureField("", text: text, prompt: Text(placeholder).foregroundStyle(Color.pochakTextTertiary))
            .font(.pochakBody01)
            .foregroundStyle(Color.pochakTextPrimary)
            .textContentType(.password)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color.pochakSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
            )
    }

    @ViewBuilder
    private func birthdayDropdown(label: String, items: [String], selection: Binding<String>) -> some View {
        Menu {
            ForEach(items, id: \.self) { item in
                Button(item) { selection.wrappedValue = item }
            }
        } label: {
            HStack {
                Text(label)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(1)
                Spacer()
                Image(systemName: "chevron.down")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 14)
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
            )
        }
    }
}

// MARK: - Previews

#Preview("Korean") {
    AccountInfoView(isForeigner: false)
        .preferredColorScheme(.dark)
}

#Preview("Foreigner") {
    AccountInfoView(isForeigner: true)
        .preferredColorScheme(.dark)
}
