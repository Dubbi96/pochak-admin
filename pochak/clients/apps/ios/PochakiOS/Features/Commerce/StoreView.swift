// StoreView.swift
// Pochak OTT Platform - Store / Commerce Screen
// Design ref: [포착3.0] Mobile 디자인 1.pdf - Store screens

import SwiftUI

struct StoreView: View {

    var onBackClick: () -> Void = {}

    @State private var selectedTab: StoreTab = .all
    @State private var selectedSportFilter: String = "전체"

    private let sportFilters = ["전체", "축구", "야구", "배구", "핸드볼", "농구"]

    enum StoreTab: String, CaseIterable {
        case all = "전체"
        case partnership = "제휴"
        case subscription = "구독"
        case sport = "종목"
        case competition = "대회"
    }

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            VStack(spacing: 0) {

                // -- Top Bar --
                topBar
                    .padding(.horizontal, 20)
                    .padding(.top, 8)

                // -- Tab Selector --
                tabSelector
                    .padding(.top, 8)

                // -- Tab Content --
                ScrollView(showsIndicators: false) {
                    tabContent
                        .padding(.top, 16)
                        .padding(.bottom, 100)
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

            Text("스토어")
                .font(.pochakNavTitle)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()

            // Invisible spacer to center title
            Color.clear.frame(width: 24, height: 24)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Tab Selector

    private var tabSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 20) {
                ForEach(StoreTab.allCases, id: \.self) { tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedTab = tab
                        }
                    } label: {
                        VStack(spacing: 6) {
                            Text(tab.rawValue)
                                .font(.pochakBody02)
                                .fontWeight(selectedTab == tab ? .semibold : .regular)
                                .foregroundStyle(selectedTab == tab ? Color.pochakTextPrimary : Color.pochakTextTertiary)

                            Rectangle()
                                .fill(selectedTab == tab ? Color.pochakPrimary : Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .accessibilityLabel(tab.rawValue)
                    .accessibilityAddTraits(selectedTab == tab ? .isSelected : [])
                }
            }
            .padding(.horizontal, 20)
        }
        .overlay(
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5),
            alignment: .bottom
        )
    }

    // MARK: - Tab Content

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .all:
            allTabContent
        case .partnership:
            partnershipTabContent
        case .subscription:
            subscriptionTabContent
        case .sport:
            sportTabContent
        case .competition:
            competitionTabContent
        }
    }

    // MARK: - All Tab

    private var allTabContent: some View {
        VStack(alignment: .leading, spacing: 32) {

            // Subscription products section
            productSection(title: "구독상품", route: "subscription") {
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 12) {
                        ForEach(0..<4, id: \.self) { index in
                            subscriptionProductCard(
                                name: sampleProductNames[index % sampleProductNames.count],
                                description: sampleProductDescriptions[index % sampleProductDescriptions.count],
                                monthlyPrice: "월 10,010원",
                                yearlyPrice: "연 101,010원",
                                discount: "-17%",
                                iconName: "p.circle.fill"
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }

            // Sport ticket section
            productSection(title: "종목별 이용권", route: "sport") {
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 12) {
                        ForEach(0..<4, id: \.self) { index in
                            sportProductCard(
                                sport: sportLabels[index % sportLabels.count],
                                sportIcon: sportIcons[index % sportIcons.count],
                                name: "'\(sportLabels[index % sportLabels.count])' 종목 이용권",
                                description: "모든 \(sportLabels[index % sportLabels.count]) 경기를\n무제한으로 시청하세요",
                                price: "월 5,500원"
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }

            // Competition ticket section
            productSection(title: "대회 이용권", route: "competition") {
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 12) {
                        ForEach(SampleData.competitions) { comp in
                            competitionProductCard(competition: comp)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }

    // MARK: - Partnership Tab

    private var partnershipTabContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("제휴 상품")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVStack(spacing: 12) {
                ForEach(0..<3, id: \.self) { index in
                    partnershipCard(index: index)
                        .padding(.horizontal, 20)
                        .staggeredAppear(index: index)
                }
            }
        }
    }

    // MARK: - Subscription Tab

    private var subscriptionTabContent: some View {
        LazyVStack(spacing: 16) {
            ForEach(0..<4, id: \.self) { index in
                subscriptionFullCard(index: index)
                    .padding(.horizontal, 20)
                    .staggeredAppear(index: index)
            }
        }
    }

    // MARK: - Sport Tab

    private var sportTabContent: some View {
        VStack(spacing: 16) {

            // Filter chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(sportFilters, id: \.self) { filter in
                        Button {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                selectedSportFilter = filter
                            }
                        } label: {
                            Text(filter)
                                .font(.pochakTag)
                                .foregroundStyle(selectedSportFilter == filter ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedSportFilter == filter ? Color.pochakPrimary : Color.pochakSurface)
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule()
                                        .stroke(selectedSportFilter == filter ? Color.clear : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                                )
                        }
                        .accessibilityLabel("\(filter) 필터")
                        .accessibilityAddTraits(selectedSportFilter == filter ? .isSelected : [])
                    }
                }
                .padding(.horizontal, 20)
            }

            // Product cards
            LazyVStack(spacing: 12) {
                ForEach(0..<6, id: \.self) { index in
                    sportProductFullCard(index: index)
                        .padding(.horizontal, 20)
                        .staggeredAppear(index: index)
                }
            }
        }
    }

    // MARK: - Competition Tab

    private var competitionTabContent: some View {
        VStack(spacing: 16) {

            // Filter chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(sportFilters, id: \.self) { filter in
                        Button {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                selectedSportFilter = filter
                            }
                        } label: {
                            Text(filter)
                                .font(.pochakTag)
                                .foregroundStyle(selectedSportFilter == filter ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedSportFilter == filter ? Color.pochakPrimary : Color.pochakSurface)
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule()
                                        .stroke(selectedSportFilter == filter ? Color.clear : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(.horizontal, 20)
            }

            // Competition product cards
            LazyVStack(spacing: 12) {
                ForEach(Array(SampleData.competitions.enumerated()), id: \.element.id) { index, comp in
                    competitionProductFullCard(competition: comp)
                        .padding(.horizontal, 20)
                        .staggeredAppear(index: index)
                }

                // Additional placeholder cards
                ForEach(0..<3, id: \.self) { index in
                    competitionProductFullCard(
                        competition: Competition(
                            id: "extra_\(index)",
                            name: "전국 유소년 \(sportLabels[index % sportLabels.count]) 대회",
                            logoURL: "comp_logo",
                            dateRange: "2026 | 0\(index + 3).01 ~ 0\(index + 4).01",
                            category: sportLabels[index % sportLabels.count]
                        )
                    )
                    .padding(.horizontal, 20)
                    .staggeredAppear(index: index + 2)
                }
            }
        }
    }

    // MARK: - Product Card Components

    private func productSection<Content: View>(title: String, route: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {} label: {
                HStack(spacing: 4) {
                    Text(title)
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.pochakTextTertiary)
                }
            }
            .padding(.horizontal, 20)

            content()
        }
    }

    private func subscriptionProductCard(name: String, description: String, monthlyPrice: String, yearlyPrice: String, discount: String, iconName: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Icon
            Image(systemName: iconName)
                .font(.system(size: 28))
                .foregroundStyle(Color.pochakPrimary)

            // Product name
            Text(name)
                .font(.pochakBody01)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            // Description
            Text(description)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)

            Spacer()

            // Price
            VStack(alignment: .leading, spacing: 4) {
                Text(monthlyPrice)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                HStack(spacing: 6) {
                    Text(yearlyPrice)
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .strikethrough(true, color: Color.pochakTextTertiary)

                    Text(discount)
                        .font(.pochakBody03)
                        .fontWeight(.bold)
                        .foregroundStyle(Color.pochakLive)
                }
            }

            // Buy button
            Button {} label: {
                Text("구매/선물")
                    .font(.pochakTag)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakPrimary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(Color.pochakPrimary, lineWidth: 1.5)
                    )
            }
        }
        .padding(16)
        .frame(width: 200, height: 300)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    private func sportProductCard(sport: String, sportIcon: String, name: String, description: String, price: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Sport ball icon
            Image(systemName: sportIcon)
                .font(.system(size: 28))
                .foregroundStyle(Color.pochakPrimary)

            Text(name)
                .font(.pochakBody01)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            Text(description)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)

            Spacer()

            Text(price)
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)

            Button {} label: {
                Text("구매/선물")
                    .font(.pochakTag)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakPrimary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(Color.pochakPrimary, lineWidth: 1.5)
                    )
            }
        }
        .padding(16)
        .frame(width: 200, height: 280)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    private func competitionProductCard(competition: Competition) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Competition banner
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.pochakSurface)
                .frame(height: 80)
                .overlay(
                    VStack(spacing: 4) {
                        Image(systemName: "trophy.fill")
                            .font(.title3)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                        Text(competition.name)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextSecondary)
                            .lineLimit(1)
                    }
                )

            Text("'\(competition.name)' 시청권")
                .font(.pochakBody02)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)

            Text(competition.dateRange)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)

            Spacer()

            VStack(alignment: .leading, spacing: 4) {
                Text("월 3,300원")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                HStack(spacing: 6) {
                    Text("5,500원")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .strikethrough(true, color: Color.pochakTextTertiary)

                    Text("-40%")
                        .font(.pochakBody03)
                        .fontWeight(.bold)
                        .foregroundStyle(Color.pochakLive)
                }
            }

            Button {} label: {
                Text("구매/선물")
                    .font(.pochakTag)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakPrimary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(Color.pochakPrimary, lineWidth: 1.5)
                    )
            }
        }
        .padding(16)
        .frame(width: 220, height: 340)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Full Width Cards

    private func subscriptionFullCard(index: Int) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                Image(systemName: "p.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(Color.pochakPrimary)

                VStack(alignment: .leading, spacing: 2) {
                    Text(sampleProductNames[index % sampleProductNames.count])
                        .font(.pochakBody01)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .lineLimit(2)

                    Text(sampleProductDescriptions[index % sampleProductDescriptions.count])
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                        .lineLimit(2)
                }
            }

            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("월 10,010원")
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextPrimary)

                    HStack(spacing: 6) {
                        Text("연 101,010원")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextTertiary)
                            .strikethrough(true, color: Color.pochakTextTertiary)

                        Text("-17%")
                            .font(.pochakBody03)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.pochakLive)
                    }
                }

                Spacer()

                Button {} label: {
                    Text("구매/선물")
                        .font(.pochakTag)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakPrimary)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .stroke(Color.pochakPrimary, lineWidth: 1.5)
                        )
                }
            }
        }
        .padding(16)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    private func sportProductFullCard(index: Int) -> some View {
        let sportIdx = index % sportLabels.count
        return HStack(spacing: 14) {
            Image(systemName: sportIcons[sportIdx])
                .font(.system(size: 28))
                .foregroundStyle(Color.pochakPrimary)
                .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text("'\(sportLabels[sportIdx])' 종목 이용권")
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text("모든 \(sportLabels[sportIdx]) 경기를 무제한으로 시청하세요")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("월 5,500원")
                    .font(.pochakBody02)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Button {} label: {
                    Text("구매")
                        .font(.pochakBody04)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakPrimary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .stroke(Color.pochakPrimary, lineWidth: 1)
                        )
                }
            }
        }
        .padding(14)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    private func competitionProductFullCard(competition: Competition) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Banner area
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.pochakSurface)
                .frame(height: 100)
                .overlay(
                    VStack(spacing: 6) {
                        Image(systemName: "trophy.fill")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                        Text(competition.name)
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextSecondary)
                            .lineLimit(1)
                        Text(competition.dateRange)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                )

            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("'\(competition.name)' 시청권")
                        .font(.pochakBody01)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Text("\(competition.category) | 유료 | 해설")
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)

                    HStack(spacing: 4) {
                        Text("월 3,300원")
                            .font(.pochakTitle04)
                            .foregroundStyle(Color.pochakTextPrimary)

                        Text("5,500원")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextTertiary)
                            .strikethrough(true, color: Color.pochakTextTertiary)

                        Text("-40%")
                            .font(.pochakBody03)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.pochakLive)
                    }
                }

                Spacer()

                Button {} label: {
                    Text("구매/선물")
                        .font(.pochakTag)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakPrimary)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .stroke(Color.pochakPrimary, lineWidth: 1.5)
                        )
                }
            }
        }
        .padding(16)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    private func partnershipCard(index: Int) -> some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.pochakSurface)
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "building.2.fill")
                        .font(.title2)
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                )

            VStack(alignment: .leading, spacing: 4) {
                Text("제휴 파트너 \(index + 1)")
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text("특별 할인 구독 상품")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)

                HStack(spacing: 6) {
                    Text("월 8,800원")
                        .font(.pochakBody02)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.pochakPrimary)

                    Text("11,000원")
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .strikethrough(true, color: Color.pochakTextTertiary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.pochakTextTertiary)
        }
        .padding(14)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Sample Data

    private let sampleProductNames = [
        "'6회 MLB컵 리틀야구 U10' 시청권",
        "대가족 무제한 시청권",
        "프리미엄 올스포츠 패스",
        "라이트 시청권",
    ]

    private let sampleProductDescriptions = [
        "전국리틀야구대회를\n라이브로 시청하세요\n모든 경기 무제한 시청",
        "가족 모두 함께 즐기는\n무제한 스포츠 시청권\n최대 5인 동시 시청",
        "모든 종목, 모든 대회를\n프리미엄으로 즐기세요\nVOD 다시보기 포함",
        "나에게 맞는 종목만\n선택해서 시청하세요\n월 단위 이용",
    ]

    private let sportLabels = ["축구", "야구", "배구", "핸드볼", "농구", "유도"]

    private let sportIcons = [
        "soccerball",
        "baseball.fill",
        "volleyball.fill",
        "figure.handball",
        "basketball.fill",
        "figure.martial.arts",
    ]
}

// MARK: - Preview

#Preview {
    StoreView()
        .preferredColorScheme(.dark)
}
