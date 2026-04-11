// ProfileEditView.swift
// Pochak OTT Platform - Profile Edit Screen
// Design ref: [포착3.0] Mobile 디자인 1.pdf - Profile Edit screen

import SwiftUI

struct ProfileEditView: View {

    var onBackClick: () -> Void = {}

    private let user = SampleData.user

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // -- Top Bar --
                    topBar
                        .padding(.horizontal, 20)
                        .padding(.top, 8)

                    // -- Profile Header --
                    profileHeader
                        .padding(.horizontal, 20)
                        .padding(.top, 20)

                    // -- Divider --
                    Rectangle()
                        .fill(Color.pochakDivider)
                        .frame(height: 0.5)
                        .padding(.top, 20)

                    // -- Password Change Row --
                    passwordChangeRow
                        .padding(.top, 4)

                    Rectangle()
                        .fill(Color.pochakDivider)
                        .frame(height: 0.5)

                    // -- Personal Info Section --
                    personalInfoSection
                        .padding(.top, 8)

                    // -- Additional Info Section --
                    additionalInfoSection
                        .padding(.top, 8)

                    Spacer().frame(height: 100)
                }
            }
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Button(action: onBackClick) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("뒤로가기")

            Spacer()
        }
        .padding(.vertical, 8)
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle()
                    .fill(Color.pochakSurface)
                    .frame(width: 56, height: 56)

                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakPrimary.opacity(0.15))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text("P")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.pochakPrimary)
                    )
                    .clipShape(Circle())
            }
            .accessibilityHidden(true)

            // Nickname with edit icon
            HStack(spacing: 6) {
                Text(user.nickname)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                Image(systemName: "pencil")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.pochakTextSecondary)
            }

            // Email
            Text(user.email)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Password Change Row

    private var passwordChangeRow: some View {
        Button {} label: {
            HStack {
                Text("비밀번호 변경")
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .contentShape(Rectangle())
        }
        .accessibilityLabel("비밀번호 변경")
    }

    // MARK: - Personal Info Section

    private var personalInfoSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Section header
            Text("개인정보")
                .font(.pochakBody03)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextTertiary)
                .padding(.horizontal, 20)
                .padding(.vertical, 12)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)

            // Name
            infoRow(label: "이름", value: "홍길동", hasChevron: false)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.leading, 20)

            // Date of birth
            infoRow(label: "생년월일", value: "2000.01.01", hasChevron: false)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.leading, 20)

            // Phone number
            infoRow(label: "휴대폰번호", value: "010-0000-0000", hasChevron: false)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.leading, 20)

            // Email
            Button {} label: {
                infoRow(label: "이메일", value: "kimpochak@hogak.co.kr", hasChevron: true)
            }

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
        }
    }

    // MARK: - Additional Info Section

    private var additionalInfoSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Section header
            Text("추가정보")
                .font(.pochakBody03)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextTertiary)
                .padding(.horizontal, 20)
                .padding(.vertical, 12)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)

            // Interest regions
            Button {} label: {
                infoRowMultiValue(
                    label: "관심지역",
                    values: ["대한민국 서울시", "대한민국 성남시", "대한민국 용인시"],
                    hasChevron: true
                )
            }

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.leading, 20)

            // Interest sports
            Button {} label: {
                infoRowMultiValue(
                    label: "관심종목",
                    values: ["축구", "마라톤", "유도"],
                    hasChevron: true
                )
            }

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.leading, 20)

            // Service usage reason
            Button {} label: {
                infoRowMultiValue(
                    label: "서비스이용계기",
                    values: ["내 경기영상을 보고 싶어요 !"],
                    hasChevron: true
                )
            }

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
        }
    }

    // MARK: - Info Row Components

    private func infoRow(label: String, value: String, hasChevron: Bool) -> some View {
        HStack {
            Text(label)
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()

            Text(value)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextSecondary)
                .lineLimit(1)

            if hasChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
                    .padding(.leading, 4)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .contentShape(Rectangle())
    }

    private func infoRowMultiValue(label: String, values: [String], hasChevron: Bool) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextPrimary)
                .frame(width: 100, alignment: .leading)

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                ForEach(values, id: \.self) { value in
                    Text(value)
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextSecondary)
                        .lineLimit(1)
                }
            }

            if hasChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
                    .padding(.leading, 4)
                    .padding(.top, 2)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .contentShape(Rectangle())
    }
}

// MARK: - Preview

#Preview {
    ProfileEditView()
        .preferredColorScheme(.dark)
}
