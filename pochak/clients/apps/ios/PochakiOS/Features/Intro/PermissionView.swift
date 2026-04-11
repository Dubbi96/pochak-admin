// PermissionView.swift
// Pochak OTT Platform - App Permission Introduction
// Mirrors Android PermissionScreen.kt

import SwiftUI

// MARK: - Data

private enum PermissionCategory {
    case required, optional

    var label: String {
        switch self {
        case .required: return "필수"
        case .optional: return "선택"
        }
    }

    var color: Color {
        switch self {
        case .required: return .pochakPrimary
        case .optional: return .pochakTextTertiary
        }
    }
}

private struct PermissionItem: Identifiable {
    let id = UUID()
    let icon: String          // SF Symbol name
    let name: String
    let category: PermissionCategory
    let description: String
}

private let permissions: [PermissionItem] = [
    PermissionItem(
        icon: "wifi",
        name: "네트워크",
        category: .required,
        description: "콘텐츠 스트리밍 및 데이터 동기화에 필요합니다."
    ),
    PermissionItem(
        icon: "location.fill",
        name: "GPS",
        category: .required,
        description: "내 주변 시설 및 경기 정보를 찾는 데 사용됩니다."
    ),
    PermissionItem(
        icon: "camera.fill",
        name: "카메라",
        category: .required,
        description: "클립 촬영 및 QR 코드 인식에 사용됩니다."
    ),
    PermissionItem(
        icon: "bell.fill",
        name: "알림",
        category: .optional,
        description: "경기 알림 및 이벤트 소식을 받을 수 있습니다."
    ),
    PermissionItem(
        icon: "internaldrive.fill",
        name: "저장공간",
        category: .required,
        description: "영상 다운로드 및 캐시 저장에 필요합니다."
    ),
    PermissionItem(
        icon: "photo.on.rectangle",
        name: "갤러리",
        category: .optional,
        description: "프로필 사진 및 커뮤니티 이미지 첨부에 사용됩니다."
    ),
    PermissionItem(
        icon: "person.crop.rectangle.stack.fill",
        name: "연락처",
        category: .optional,
        description: "친구 초대 기능에 사용됩니다."
    ),
    PermissionItem(
        icon: "pip.fill",
        name: "다른 앱 위에 표시",
        category: .optional,
        description: "PIP(화면 속 화면) 재생에 사용됩니다."
    ),
]

// MARK: - Screen

struct PermissionView: View {

    var onConfirm: () -> Void

    private var requiredPermissions: [PermissionItem] {
        permissions.filter { $0.category == .required }
    }

    private var optionalPermissions: [PermissionItem] {
        permissions.filter { $0.category == .optional }
    }

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("앱 접근 권한 안내")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Text("서비스 이용을 위해 아래 권한이 필요합니다.\n선택 권한은 허용하지 않아도 서비스 이용이 가능합니다.")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.top, 40)
                .padding(.bottom, 8)

                Spacer().frame(height: 16)

                // Permission list
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 0) {
                        // Required section
                        sectionLabel("필수 접근 권한")

                        ForEach(requiredPermissions) { item in
                            permissionRow(item: item)
                        }

                        Spacer().frame(height: 24)

                        // Optional section
                        sectionLabel("선택 접근 권한")

                        ForEach(optionalPermissions) { item in
                            permissionRow(item: item)
                        }

                        Spacer().frame(height: 24)
                    }
                    .padding(.horizontal, 24)
                }

                // Bottom button
                VStack {
                    Button {
                        onConfirm()
                    } label: {
                        Text("확인")
                    }
                    .buttonStyle(PochakPrimaryButtonStyle())
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
                .background(Color.pochakBg)
            }
        }
        .accessibilityLabel("Permission screen")
    }

    // MARK: - Components

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.pochakBody03)
            .fontWeight(.semibold)
            .foregroundStyle(Color.pochakPrimary)
            .padding(.bottom, 8)
    }

    private func permissionRow(item: PermissionItem) -> some View {
        HStack(alignment: .center, spacing: 16) {
            // Icon circle
            ZStack {
                Circle()
                    .fill(Color.pochakSurfaceVar)
                    .frame(width: 44, height: 44)

                Image(systemName: item.icon)
                    .font(.system(size: 18))
                    .foregroundStyle(Color.pochakTextPrimary)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(item.name)
                        .font(.pochakBody02)
                        .fontWeight(.medium)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Text(item.category.label)
                        .font(.pochakBody04)
                        .foregroundStyle(item.category.color)
                }

                Text(item.description)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextSecondary)
            }

            Spacer()
        }
        .padding(.vertical, 12)
    }
}

// MARK: - Preview

#Preview {
    PermissionView(onConfirm: {})
        .preferredColorScheme(.dark)
}
