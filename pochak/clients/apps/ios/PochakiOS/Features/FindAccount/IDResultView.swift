// IDResultView.swift
// Pochak OTT Platform - ID Search Result Screen
// Design ref: [포착3.0] Mobile 디자인 - 아이디 조회 결과

import SwiftUI

// MARK: - Data Model

struct FoundAccount: Identifiable {
    let id: String
    let userId: String
    let email: String

    init(userId: String, email: String) {
        self.id = userId
        self.userId = userId
        self.email = email
    }
}

// MARK: - IDResultView

struct IDResultView: View {

    var onBackClick: () -> Void = {}
    var onSelectAccount: (String) -> Void = { _ in }
    var accounts: [FoundAccount] = IDResultView.sampleAccounts

    var body: some View {
        VStack(spacing: 0) {
            // -- Top bar --
            HStack {
                Button(action: onBackClick) {
                    Image(systemName: "chevron.left")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("뒤로 가기")

                Spacer()
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 8)

            // -- Title --
            Text("아이디 조회 결과")
                .font(.pochakTitle03)
                .foregroundStyle(Color.pochakTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

            Spacer().frame(height: 24)

            // -- Account list --
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    ForEach(accounts) { account in
                        AccountRow(
                            account: account,
                            onTap: { onSelectAccount(account.userId) }
                        )

                        Divider()
                            .background(Color.pochakBorder)
                    }
                }
                .padding(.horizontal, 24)
            }

            Spacer()

            // -- Bottom: "메인으로" button --
            Button(action: onBackClick) {
                Text("메인으로")
                    .font(.pochakButton)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.pochakSurfaceVar)
                    .clipShape(Capsule())
            }
            .padding(.vertical, 24)
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Sample Data

    static let sampleAccounts = [
        FoundAccount(userId: "pochak2024", email: "kimpochak@hogak.co.kr"),
        FoundAccount(userId: "pochak2025", email: "parkpochak@hogak.co.kr"),
    ]
}

// MARK: - AccountRow

private struct AccountRow: View {

    let account: FoundAccount
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Green Pochak icon circle
                ZStack {
                    Circle()
                        .fill(Color.pochakPrimary)
                        .frame(width: 44, height: 44)

                    Text("P")
                        .font(.pochakBody01)
                        .fontWeight(.bold)
                        .foregroundStyle(Color.pochakTextOnPrimary)
                }

                // Account info
                VStack(alignment: .leading, spacing: 2) {
                    Text(account.userId)
                        .font(.pochakBody01)
                        .fontWeight(.bold)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .lineLimit(1)

                    Text(account.email)
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                        .lineLimit(1)
                }

                Spacer()

                // Chevron right
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .padding(.vertical, 16)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("계정 \(account.userId)")
    }
}

// MARK: - Preview

#Preview {
    IDResultView()
        .preferredColorScheme(.dark)
}
