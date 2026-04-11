#!/usr/bin/env python3
"""Pochak API Specification PDF Generator"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from datetime import datetime
import os

# ─── Colors ───
PRIMARY = HexColor('#1a1a2e')
SECONDARY = HexColor('#16213e')
ACCENT = HexColor('#0f3460')
HIGHLIGHT = HexColor('#e94560')
LIGHT_BG = HexColor('#f8f9fa')
BORDER = HexColor('#dee2e6')
SUCCESS = HexColor('#28a745')
WARNING = HexColor('#ffc107')
INFO = HexColor('#17a2b8')
LIGHT_ACCENT = HexColor('#e8f4f8')

# ─── Styles ───
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'CoverTitle', parent=styles['Title'],
    fontSize=32, textColor=PRIMARY, spaceAfter=10,
    fontName='Helvetica-Bold', alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'CoverSubtitle', parent=styles['Normal'],
    fontSize=14, textColor=ACCENT, spaceAfter=30,
    fontName='Helvetica', alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'SectionTitle', parent=styles['Heading1'],
    fontSize=20, textColor=PRIMARY, spaceBefore=20, spaceAfter=12,
    fontName='Helvetica-Bold', borderWidth=2, borderColor=HIGHLIGHT,
    borderPadding=5
))
styles.add(ParagraphStyle(
    'SubSection', parent=styles['Heading2'],
    fontSize=15, textColor=ACCENT, spaceBefore=14, spaceAfter=8,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'SubSubSection', parent=styles['Heading3'],
    fontSize=12, textColor=SECONDARY, spaceBefore=10, spaceAfter=6,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'BodyText2', parent=styles['Normal'],
    fontSize=9, leading=13, textColor=HexColor('#333333'),
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'SmallText', parent=styles['Normal'],
    fontSize=8, leading=11, textColor=HexColor('#555555'),
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontSize=8, textColor=white, fontName='Helvetica-Bold',
    alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontSize=7.5, leading=10, textColor=HexColor('#333333'),
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'TableCellBold', parent=styles['Normal'],
    fontSize=7.5, leading=10, textColor=HexColor('#333333'),
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'DepLabel', parent=styles['Normal'],
    fontSize=8, textColor=ACCENT, fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'CodeStyle', parent=styles['Normal'],
    fontSize=7.5, leading=10, fontName='Courier',
    textColor=HexColor('#d63384'), backColor=LIGHT_BG
))

def make_method_badge(method):
    color_map = {
        'GET': '#28a745', 'POST': '#007bff', 'PUT': '#ffc107',
        'PATCH': '#17a2b8', 'DELETE': '#dc3545'
    }
    c = color_map.get(method, '#6c757d')
    return f'<font color="{c}"><b>{method}</b></font>'

def make_api_table(endpoints, col_widths=None):
    """Create a styled API endpoint table."""
    if not col_widths:
        col_widths = [45, 160, 180, 120]

    header = [
        Paragraph('Method', styles['TableHeader']),
        Paragraph('Path', styles['TableHeader']),
        Paragraph('Request', styles['TableHeader']),
        Paragraph('Response', styles['TableHeader']),
    ]

    data = [header]
    for ep in endpoints:
        row = [
            Paragraph(make_method_badge(ep[0]), styles['TableCell']),
            Paragraph(f'<font face="Courier" size="7">{ep[1]}</font>', styles['TableCell']),
            Paragraph(ep[2], styles['TableCell']),
            Paragraph(ep[3], styles['TableCell']),
        ]
        data.append(row)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t

def make_dep_table(deps):
    """Service dependency mini-table."""
    header = [
        Paragraph('Service/Client', styles['TableHeader']),
        Paragraph('Target', styles['TableHeader']),
        Paragraph('Calls', styles['TableHeader']),
    ]
    data = [header]
    for d in deps:
        data.append([
            Paragraph(d[0], styles['TableCellBold']),
            Paragraph(d[1], styles['TableCell']),
            Paragraph(d[2], styles['TableCell']),
        ])

    t = Table(data, colWidths=[120, 100, 290], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_ACCENT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t

def build_pdf():
    output_path = os.path.join(os.path.dirname(__file__), 'pochak_api_specification.pdf')

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=20*mm, bottomMargin=20*mm,
        title='Pochak API Specification',
        author='Pochak Engineering Team'
    )

    story = []

    # ═══════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════
    story.append(Spacer(1, 60*mm))
    story.append(Paragraph('POCHAK', styles['CoverTitle']))
    story.append(Paragraph('API Specification & Service Dependency Map', styles['CoverSubtitle']))
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="60%", thickness=2, color=HIGHLIGHT, spaceAfter=10, spaceBefore=10))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Sports OTT Microservices Platform', styles['CoverSubtitle']))
    story.append(Spacer(1, 30*mm))

    info_data = [
        ['Version', 'v1.0'],
        ['Date', datetime.now().strftime('%Y-%m-%d')],
        ['Architecture', 'Microservices (Spring Boot 3.3 + Spring Cloud)'],
        ['Services', '5 Core + 4 BFF + 1 Gateway'],
        ['Tech Stack', 'Java 21, PostgreSQL 16, Redis 7, RabbitMQ'],
    ]
    info_table = Table(info_data, colWidths=[100, 250])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), ACCENT),
        ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#333333')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('RIGHTPADDING', (0, 0), (0, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(info_table)
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════
    story.append(Paragraph('Table of Contents', styles['SectionTitle']))
    story.append(Spacer(1, 5*mm))

    toc_items = [
        '1. Architecture Overview',
        '2. Gateway & Routing',
        '3. Identity Service (Port 8081)',
        '4. Content Service (Port 8082)',
        '5. Commerce Service (Port 8083)',
        '6. Operation Service (Port 8084)',
        '7. Admin Service (Port 8085)',
        '8. App BFF (Mobile)',
        '9. Web BFF',
        '10. BO BFF (Admin Web)',
        '11. Partner BFF',
        '12. Inter-Service Dependency Matrix',
        '13. Event-Driven Communication',
    ]
    for item in toc_items:
        story.append(Paragraph(item, styles['BodyText2']))
        story.append(Spacer(1, 2*mm))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 1. ARCHITECTURE OVERVIEW
    # ═══════════════════════════════════════════
    story.append(Paragraph('1. Architecture Overview', styles['SectionTitle']))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        'Pochak is a sports-focused OTT streaming platform built on a microservices architecture. '
        'The system consists of 5 core domain services, 4 BFF (Backend-for-Frontend) aggregators, '
        'and 1 API Gateway. Each core service owns its own PostgreSQL schema for data isolation, '
        'and services communicate via synchronous REST calls and asynchronous RabbitMQ events.',
        styles['BodyText2']
    ))
    story.append(Spacer(1, 5*mm))

    arch_data = [
        [Paragraph('<b>Layer</b>', styles['TableHeader']),
         Paragraph('<b>Service</b>', styles['TableHeader']),
         Paragraph('<b>Port</b>', styles['TableHeader']),
         Paragraph('<b>Responsibility</b>', styles['TableHeader'])],
        [Paragraph('Gateway', styles['TableCell']), Paragraph('pochak-gateway', styles['TableCellBold']),
         Paragraph('8080', styles['TableCell']), Paragraph('JWT validation, routing, rate limiting, CORS', styles['TableCell'])],
        [Paragraph('Core', styles['TableCell']), Paragraph('pochak-identity-service', styles['TableCellBold']),
         Paragraph('8081', styles['TableCell']), Paragraph('Authentication, OAuth2 (Kakao/Google/Naver), user profiles, guardian management', styles['TableCell'])],
        [Paragraph('Core', styles['TableCell']), Paragraph('pochak-content-service', styles['TableCellBold']),
         Paragraph('8082', styles['TableCell']), Paragraph('LIVE/VOD/Clip assets, sports, teams, competitions, search, recommendations, social features', styles['TableCell'])],
        [Paragraph('Core', styles['TableCell']), Paragraph('pochak-commerce-service', styles['TableCellBold']),
         Paragraph('8083', styles['TableCell']), Paragraph('Products, purchases, payments, wallet, subscriptions, coupons, entitlements, refunds', styles['TableCell'])],
        [Paragraph('Core', styles['TableCell']), Paragraph('pochak-operation-service', styles['TableCellBold']),
         Paragraph('8084', styles['TableCell']), Paragraph('Venues, cameras, streaming ingest, reservations, recording sessions/schedules', styles['TableCell'])],
        [Paragraph('Core', styles['TableCell']), Paragraph('pochak-admin-service', styles['TableCellBold']),
         Paragraph('8085', styles['TableCell']), Paragraph('Admin RBAC, site management (banners/notices/events), CS, analytics, audit logs', styles['TableCell'])],
        [Paragraph('BFF', styles['TableCell']), Paragraph('pochak-app-bff', styles['TableCellBold']),
         Paragraph('-', styles['TableCell']), Paragraph('Mobile app aggregation (Identity + Content + Commerce + Operation)', styles['TableCell'])],
        [Paragraph('BFF', styles['TableCell']), Paragraph('pochak-web-bff', styles['TableCellBold']),
         Paragraph('9080', styles['TableCell']), Paragraph('Public web aggregation (Identity + Content + Commerce)', styles['TableCell'])],
        [Paragraph('BFF', styles['TableCell']), Paragraph('pochak-bo-bff', styles['TableCellBold']),
         Paragraph('9081', styles['TableCell']), Paragraph('Admin web aggregation (Admin + Identity + Content + Commerce)', styles['TableCell'])],
        [Paragraph('BFF', styles['TableCell']), Paragraph('pochak-partner-bff', styles['TableCellBold']),
         Paragraph('9091', styles['TableCell']), Paragraph('Partner portal aggregation (Operation + Content + Commerce + Identity)', styles['TableCell'])],
        [Paragraph('Shared', styles['TableCell']), Paragraph('pochak-common-lib', styles['TableCellBold']),
         Paragraph('-', styles['TableCell']), Paragraph('Shared DTOs, event outbox pattern, utilities', styles['TableCell'])],
    ]

    arch_table = Table(arch_data, colWidths=[50, 140, 35, 285])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(arch_table)
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 2. GATEWAY & ROUTING
    # ═══════════════════════════════════════════
    story.append(Paragraph('2. Gateway & Routing', styles['SectionTitle']))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        'The API Gateway (Spring Cloud Gateway) handles all external traffic on port 8080. '
        'It performs JWT validation, rate limiting, CORS handling, and routes requests to downstream services. '
        'Routes strip the /api/v1/ prefix before forwarding (stripPrefix=2).',
        styles['BodyText2']
    ))
    story.append(Spacer(1, 3*mm))

    route_data = [
        [Paragraph('<b>External Path Pattern</b>', styles['TableHeader']),
         Paragraph('<b>Target Service</b>', styles['TableHeader']),
         Paragraph('<b>Port</b>', styles['TableHeader']),
         Paragraph('<b>Transform</b>', styles['TableHeader'])],
        [Paragraph('/api/v1/auth/**, /api/v1/users/**, /api/v1/guardians/**', styles['TableCell']),
         Paragraph('Identity Service', styles['TableCellBold']), Paragraph('8081', styles['TableCell']),
         Paragraph('stripPrefix=2', styles['TableCell'])],
        [Paragraph('/api/v1/contents/**, /api/v1/sports/**, /api/v1/teams/**, /api/v1/competitions/**, /api/v1/matches/**, /api/v1/clubs/**, /api/v1/home/**, /api/v1/search/**, /api/v1/organizations/**, /api/v1/follows/**, /api/v1/notifications/**, /api/v1/streaming/**', styles['TableCell']),
         Paragraph('Content Service', styles['TableCellBold']), Paragraph('8082', styles['TableCell']),
         Paragraph('stripPrefix=2', styles['TableCell'])],
        [Paragraph('/api/v1/users/me/watch-history/**, /api/v1/users/me/favorites/**', styles['TableCell']),
         Paragraph('Content Service (high priority)', styles['TableCellBold']), Paragraph('8082', styles['TableCell']),
         Paragraph('stripPrefix=2', styles['TableCell'])],
        [Paragraph('/api/v1/subscriptions/**, /api/v1/products/**, /api/v1/wallet/**, /api/v1/purchases/**, /api/v1/refunds/**, /api/v1/entitlements/**, /api/v1/coupons/**', styles['TableCell']),
         Paragraph('Commerce Service', styles['TableCellBold']), Paragraph('8083', styles['TableCell']),
         Paragraph('stripPrefix=2', styles['TableCell'])],
        [Paragraph('/api/v1/wallets/**', styles['TableCell']),
         Paragraph('Commerce Service', styles['TableCellBold']), Paragraph('8083', styles['TableCell']),
         Paragraph('rewritePath: /wallets -> /wallet', styles['TableCell'])],
        [Paragraph('/api/v1/venues/**, /api/v1/cameras/**, /api/v1/reservations/**, /api/v1/streaming/ingest/**, /api/v1/studio/**, /api/v1/recording-*/**', styles['TableCell']),
         Paragraph('Operation Service', styles['TableCellBold']), Paragraph('8084', styles['TableCell']),
         Paragraph('stripPrefix=2', styles['TableCell'])],
        [Paragraph('/admin/**', styles['TableCell']),
         Paragraph('Admin Service', styles['TableCellBold']), Paragraph('8085', styles['TableCell']),
         Paragraph('no strip', styles['TableCell'])],
        [Paragraph('/api/v1/admin/**', styles['TableCell']),
         Paragraph('Admin Service', styles['TableCellBold']), Paragraph('8085', styles['TableCell']),
         Paragraph('rewrite: /api/v1/admin -> /admin/api/v1', styles['TableCell'])],
        [Paragraph('/api/v1/web/**', styles['TableCell']),
         Paragraph('Web BFF', styles['TableCellBold']), Paragraph('9080', styles['TableCell']),
         Paragraph('stripPrefix=3', styles['TableCell'])],
        [Paragraph('/api/v1/partners/**, /api/v1/partner/**', styles['TableCell']),
         Paragraph('Partner BFF', styles['TableCellBold']), Paragraph('9091', styles['TableCell']),
         Paragraph('no strip', styles['TableCell'])],
    ]

    route_table = Table(route_data, colWidths=[200, 110, 35, 165])
    route_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(route_table)

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Health Check:</b> GET /health, GET /health/services - Reactive health monitoring of all downstream services (60s interval, 5s timeout)', styles['BodyText2']))
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 3. IDENTITY SERVICE
    # ═══════════════════════════════════════════
    story.append(Paragraph('3. Identity Service (Port 8081)', styles['SectionTitle']))
    story.append(Paragraph('Authentication, user management, OAuth2, guardian system', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    # Auth
    story.append(Paragraph('3.1 Auth Controller (/auth)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/auth/login', 'Body: SignInRequest (email, password)', 'TokenResponse (accessToken, refreshToken, expiresIn)'],
        ['POST', '/auth/refresh', 'Body: { refreshToken }', 'TokenResponse'],
        ['POST', '/auth/logout', 'Header: X-User-Id', '{ success: true }'],
        ['DELETE', '/auth/withdraw', 'Header: X-User-Id', '{ success: true } + UserWithdrawnEvent'],
    ]))
    story.append(Paragraph('<b>Dependencies:</b> UserRepository, UserAuthAccountRepository, UserRefreshTokenRepository, JwtTokenProvider, PasswordEncoder, EventPublisher', styles['SmallText']))
    story.append(Spacer(1, 3*mm))

    # Signup
    story.append(Paragraph('3.2 Signup Controller (/auth)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/auth/signup', 'Body: DomesticSignupRequest (loginId, password, phone, birthday, email, name, consents)', 'TokenResponse'],
        ['POST', '/auth/signup/minor', 'Body: MinorSignupRequest (+ guardianUserId, guardianPhone)', 'TokenResponse'],
        ['POST', '/auth/signup/social', 'Body: SocialSignupRequest (provider, providerKey, phone token)', 'TokenResponse'],
        ['POST', '/auth/signup/foreign', 'Body: ForeignSignupRequest (+ nationality, email verified token)', 'TokenResponse'],
        ['POST', '/auth/phone/send-code', 'Body: PhoneVerificationRequest (phone, purpose)', '{ sent, expiresInSeconds: 180 }'],
        ['POST', '/auth/phone/verify-code', 'Body: PhoneVerifyCodeRequest (phone, code, purpose)', '{ verified, verifiedToken }'],
        ['GET', '/auth/phone/check', 'Query: phone', '{ registered, accountType, linkedProviders }'],
        ['POST', '/auth/guardian/verify', 'Query: guardianVerifiedToken', '{ guardianVerifiedToken, guardianUserId, guardianPhone }'],
        ['GET', '/auth/check-duplicate', 'Query: loginId, email, phone (optional)', 'CheckDuplicateResponse'],
    ]))
    story.append(Paragraph('<b>Dependencies:</b> SignupService -> PhoneVerificationService -> SmsService, GuardianVerificationService', styles['SmallText']))
    story.append(Spacer(1, 3*mm))

    # OAuth2
    story.append(Paragraph('3.3 OAuth2 Controller (/auth/oauth2)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/auth/oauth2/authorize/{provider}', 'Query: code_challenge, code_challenge_method, platform', 'HTTP Redirect to OAuth provider'],
        ['GET', '/auth/oauth2/callback/{provider}', 'Query: code, state', 'HTTP Redirect with auth code'],
        ['POST', '/auth/oauth2/token', 'Body: AuthCodeExchangeRequest (code, codeVerifier)', 'TokenResponse'],
        ['POST', '/auth/oauth2/complete-signup', 'Body: { signupToken, nickname }', 'TokenResponse'],
        ['POST', '/auth/oauth2/link', 'Body: { signupToken }', 'TokenResponse'],
    ]))
    story.append(Paragraph('<b>Providers:</b> Kakao, Google, Naver | <b>Security:</b> PKCE (SEC-003), One-time auth codes 30s (SEC-006)', styles['SmallText']))
    story.append(Spacer(1, 3*mm))

    # User
    story.append(Paragraph('3.4 User Controller (/users)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/users/me', 'Header: X-User-Id', 'UserProfileResponse'],
        ['PUT', '/users/me', 'Header: X-User-Id, Body: UpdateProfileRequest', 'UserProfileResponse'],
        ['GET', '/users/me/preferences', 'Header: X-User-Id', 'UserPreferencesResponse'],
        ['PUT', '/users/me/preferences', 'Header: X-User-Id, Body: UpdatePreferencesRequest', 'UserPreferencesResponse'],
        ['GET', '/users/me/status', 'Header: X-User-Id', 'UserStatusResponse'],
    ]))
    story.append(Spacer(1, 3*mm))

    # Push Token
    story.append(Paragraph('3.5 Push Token Controller (/users/me/push-tokens)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/users/me/push-tokens', 'Header: X-User-Id, Body: RegisterPushTokenRequest', 'PushTokenResponse'],
        ['DELETE', '/users/me/push-tokens', 'Header: X-User-Id, Body: DeletePushTokenRequest', '{ success: true }'],
    ]))
    story.append(Spacer(1, 3*mm))

    # Guardian
    story.append(Paragraph('3.6 Guardian Controller (/guardians)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/guardians/request', 'Header: X-User-Id, Body: GuardianRequestDto', 'GuardianResponseDto'],
        ['POST', '/guardians/{id}/verify', 'Query: verificationToken', 'GuardianResponseDto'],
        ['GET', '/guardians/minors', 'Header: X-User-Id (guardian)', 'List<GuardianResponseDto>'],
        ['GET', '/guardians/my-guardian', 'Header: X-User-Id (minor)', 'GuardianResponseDto'],
        ['PUT', '/guardians/{id}/limit', 'Body: PaymentLimitUpdateDto', 'GuardianResponseDto'],
        ['DELETE', '/guardians/{id}', '-', '{ success: true }'],
        ['GET', '/guardians/check-limit', 'Query: minorId, amount', 'PaymentLimitCheckDto (called by Commerce)'],
    ]))
    story.append(Spacer(1, 3*mm))

    # Admin Member
    story.append(Paragraph('3.7 Admin Member Controller (/admin/members)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/members', 'Query: page, size, status, role, search, searchType', 'AdminMemberListResponse (paginated)'],
        ['GET', '/admin/members/{id}', 'Path: id', 'AdminMemberResponse'],
        ['PUT', '/admin/members/{id}/status', 'Body: UpdateMemberStatusRequest', 'AdminMemberResponse'],
        ['PUT', '/admin/members/{id}/role', 'Body: UpdateMemberRoleRequest', 'AdminMemberResponse'],
    ]))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Inter-Service Communication (Outbound):</b>', styles['DepLabel']))
    story.append(Paragraph('- Publishes UserWithdrawnEvent via RabbitMQ (consumed by Operation Service for reservation cleanup)', styles['SmallText']))
    story.append(Paragraph('- /guardians/check-limit endpoint called by Commerce Service for minor payment validation', styles['SmallText']))
    story.append(Paragraph('<b>External APIs:</b> Kakao OAuth, Google OAuth, Naver OAuth, SMS provider', styles['SmallText']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 4. CONTENT SERVICE
    # ═══════════════════════════════════════════
    story.append(Paragraph('4. Content Service (Port 8082)', styles['SectionTitle']))
    story.append(Paragraph('Content management, social features, search, streaming, recommendations', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    # Assets
    story.append(Paragraph('4.1 VOD Controller (/contents/vod)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/contents/vod', 'Query: ownerType, venueId, dateFrom, dateTo, visibility; pageable', 'List<VodAssetListResponse>'],
        ['GET', '/contents/vod/search', 'Query: keyword; pageable', 'List<VodAssetListResponse>'],
        ['GET', '/contents/vod/{id}', 'Path: id', 'VodAssetDetailResponse'],
        ['POST', '/contents/vod', 'Body: CreateVodAssetRequest', 'VodAssetDetailResponse'],
        ['PUT', '/contents/vod/{id}', 'Body: UpdateVodAssetRequest', 'VodAssetDetailResponse'],
        ['PUT', '/contents/vod/bulk-visibility', 'Body: BulkVisibilityRequest', 'Void'],
        ['DELETE', '/contents/vod/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('4.2 Live Controller (/contents/live)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/contents/live', 'Query: ownerType, venueId, dateFrom, dateTo, visibility; pageable', 'List<LiveAssetListResponse>'],
        ['GET', '/contents/live/{id}', 'Path: id', 'LiveAssetDetailResponse'],
        ['POST', '/contents/live', 'Body: CreateLiveAssetRequest', 'LiveAssetDetailResponse'],
        ['PUT', '/contents/live/{id}', 'Body: UpdateLiveAssetRequest', 'LiveAssetDetailResponse'],
        ['PUT', '/contents/live/bulk-visibility', 'Body: BulkVisibilityRequest', 'Void'],
        ['DELETE', '/contents/live/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('4.3 Clip Controller (/contents/clips)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/contents/clips', 'Query: sourceType, visibility, matchId, creatorUserId; pageable', 'List<ClipAssetListResponse>'],
        ['GET', '/contents/clips/search', 'Query: keyword; pageable', 'List<ClipAssetListResponse>'],
        ['GET', '/contents/clips/{id}', 'Path: id', 'ClipAssetDetailResponse'],
        ['POST', '/contents/clips', 'Body: CreateClipAssetRequest', 'ClipAssetDetailResponse'],
        ['POST', '/contents/clips/create-from-range', 'Body: CreateClipFromRangeRequest', 'ClipAssetDetailResponse'],
        ['PUT', '/contents/clips/{id}', 'Body: UpdateClipAssetRequest', 'ClipAssetDetailResponse'],
        ['DELETE', '/contents/clips/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('4.4 Tag Controller (/contents/tags)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/contents/tags', 'Query: assetType, assetId', 'List<AssetTagResponse>'],
        ['POST', '/contents/tags', 'Body: CreateAssetTagRequest', 'AssetTagResponse'],
        ['DELETE', '/contents/tags/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Highlight
    story.append(Paragraph('4.5 Highlight Controller (/contents/{type}/{id}/highlights)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/contents/{type}/{id}/highlights', '-', 'List<HighlightResponse>'],
        ['POST', '/contents/{type}/{id}/highlights/detect', '-', 'Map (highlights + generatedClipIds)'],
        ['GET', '/contents/{type}/{id}/highlights/ai-clips', '-', 'List<AiClipResponse>'],
        ['POST', '/contents/{type}/{id}/highlights', 'Body: CreateHighlightRequest', 'HighlightResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Competition & Match
    story.append(Paragraph('4.6 Competition Controller (/competitions)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/competitions', 'Query: sportId, status, isDisplayed, keyword; pageable', 'List<CompetitionListResponse>'],
        ['GET', '/competitions/{id}', 'Path: id', 'CompetitionDetailResponse'],
        ['POST', '/competitions', 'Body: CreateCompetitionRequest', 'CompetitionDetailResponse'],
        ['PUT', '/competitions/{id}', 'Body: UpdateCompetitionRequest', 'CompetitionDetailResponse'],
        ['DELETE', '/competitions/{id}', '-', 'Void'],
        ['POST', '/competitions/access', 'Query: inviteCode, userId', 'CompetitionDetailResponse'],
        ['GET', '/competitions/visited', 'Query: userId', 'List<CompetitionListResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('4.7 Match Controller (/matches)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/matches', 'Query: competitionId, sportId, venueId, status, dateFrom, dateTo; pageable', 'List<MatchListResponse>'],
        ['GET', '/matches/{id}', 'Path: id', 'MatchDetailResponse'],
        ['POST', '/matches', 'Body: CreateMatchRequest', 'MatchDetailResponse'],
        ['PUT', '/matches/{id}', 'Body: UpdateMatchRequest', 'MatchDetailResponse'],
        ['PUT', '/matches/{id}/status', 'Body: ChangeMatchStatusRequest', 'MatchDetailResponse'],
        ['DELETE', '/matches/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Sport & Team
    story.append(Paragraph('4.8 Sport Controller (/sports)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/sports', 'Query: isActive; pageable', 'List<SportListResponse>'],
        ['GET', '/sports/{id}', '-', 'SportDetailResponse'],
        ['POST', '/sports', 'Body: CreateSportRequest', 'SportDetailResponse'],
        ['PUT', '/sports/{id}', 'Body: UpdateSportRequest', 'SportDetailResponse'],
        ['PUT', '/sports/order', 'Body: UpdateDisplayOrderRequest', 'Void'],
        ['DELETE', '/sports/{id}', '-', 'Void'],
        ['GET', '/sports/{sportId}/tags', '-', 'List<SportTagResponse>'],
        ['POST', '/sports/{sportId}/tags', 'Body: CreateSportTagRequest', 'SportTagResponse'],
        ['PUT', '/sports/{sportId}/tags/{tagId}', 'Body: CreateSportTagRequest', 'SportTagResponse'],
        ['DELETE', '/sports/{sportId}/tags/{tagId}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('4.9 Team Controller (/teams)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/teams', 'Query: sportId', 'List<Team>'],
        ['GET', '/teams/{id}', '-', 'Team'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Organization
    story.append(Paragraph('4.10 Organization Controller (/organizations)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/organizations', 'Query: orgType, parentId, sportId, keyword; pageable', 'List<OrganizationListResponse>'],
        ['GET', '/organizations/{id}', '-', 'OrganizationDetailResponse'],
        ['POST', '/organizations', 'Body: CreateOrganizationRequest', 'OrganizationDetailResponse'],
        ['PUT', '/organizations/{id}', 'Body: UpdateOrganizationRequest', 'OrganizationDetailResponse'],
        ['DELETE', '/organizations/{id}', '-', 'Void'],
        ['GET', '/organizations/{id}/children', '-', 'List<OrganizationListResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Club
    story.append(Paragraph('4.11 Club Controller (/clubs)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/clubs', 'Query: sportId, keyword; pageable', 'List<ClubListResponse>'],
        ['GET', '/clubs/nearby', 'Query: sportId, siGunGuCode, lat, lng; pageable', 'List<ClubListResponse>'],
        ['GET', '/clubs/popular', 'pageable', 'List<ClubListResponse>'],
        ['GET', '/clubs/recent', 'pageable', 'List<ClubListResponse>'],
        ['GET', '/clubs/{teamId}', '-', 'ClubDetailResponse'],
        ['POST', '/clubs/{teamId}/join', 'Body: JoinClubRequest', 'MembershipResponse'],
        ['GET', '/clubs/{teamId}/members', 'Query: status', 'List<ClubMemberResponse>'],
        ['PATCH', '/clubs/{teamId}/members/{membershipId}/role', 'Body: UpdateMemberRoleRequest', 'ClubMemberResponse'],
        ['DELETE', '/clubs/{teamId}/members/{membershipId}', '-', 'Void'],
        ['PATCH', '/clubs/{teamId}/members/{membershipId}/approve', 'Body: ApproveMemberRequest (opt)', 'ClubMemberResponse'],
        ['GET', '/clubs/{clubId}/posts', 'pageable', 'List<ClubPostResponse>'],
        ['POST', '/clubs/{clubId}/posts', 'Body: CreateClubPostRequest', 'ClubPostResponse'],
        ['PUT', '/clubs/{clubId}/posts/{postId}', 'Body: UpdateClubPostRequest', 'ClubPostResponse'],
        ['DELETE', '/clubs/{clubId}/posts/{postId}', '-', 'Void'],
        ['POST', '/clubs/{clubId}/status', 'Body: UpdateClubStatusRequest', 'ClubDetailResponse'],
        ['GET', '/clubs/{clubId}/stats', '-', 'ClubStatsResponse'],
        ['GET', '/clubs/by-partner', 'Query: partnerId', 'List<ClubCustomizationResponse>'],
        ['GET', '/clubs/{clubId}/customization', 'Query: partnerId', 'ClubCustomizationResponse'],
        ['PUT', '/clubs/{clubId}/customization', 'Body: UpdateClubCustomizationRequest', 'ClubCustomizationResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Social features
    story.append(Paragraph('4.12 Social Features', styles['SubSection']))

    story.append(Paragraph('4.12.1 Follow (/follows)', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/follows', 'Body: FollowRequest', 'FollowResponse'],
        ['DELETE', '/follows', 'Query: followerUserId, targetType, targetId', 'Void'],
        ['GET', '/follows/following', 'Query: userId', 'List<FollowResponse>'],
        ['GET', '/follows/count', 'Query: targetType, targetId', 'FollowCountResponse'],
    ]))

    story.append(Paragraph('4.12.2 Like (/contents/{type}/{id}/like)', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/contents/{type}/{id}/like', 'Header: X-User-Id', 'Void (toggle)'],
        ['DELETE', '/contents/{type}/{id}/like', 'Header: X-User-Id', 'Void'],
        ['GET', '/contents/{type}/{id}/like-count', 'Header: X-User-Id', 'LikeCountResponse'],
    ]))

    story.append(Paragraph('4.12.3 Comment (/contents/{type}/{id}/comments)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/contents/{type}/{id}/comments', 'pageable', 'List<CommentResponse>'],
        ['POST', '/contents/{type}/{id}/comments', 'Body: CreateCommentRequest', 'CommentResponse'],
        ['DELETE', '/comments/{id}', 'Query: userId', 'Void'],
        ['GET', '/comments/{id}/replies', '-', 'List<CommentResponse>'],
    ]))

    story.append(Paragraph('4.12.4 Favorite (/users/me/favorites)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/users/me/favorites', 'Header: X-User-Id; pageable', 'List<FavoriteResponse>'],
        ['POST', '/users/me/favorites', 'Header: X-User-Id, Body: AddFavoriteRequest', 'FavoriteResponse'],
        ['DELETE', '/users/me/favorites/{id}', 'Header: X-User-Id', 'Void'],
    ]))

    story.append(Paragraph('4.12.5 Share (/contents/{contentId})', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/contents/{contentId}/shares', 'Header: X-User-Id, Body: CreateShareRequest', 'ShareResponse'],
        ['GET', '/contents/{contentId}/share-info', 'Query: contentType', 'ShareInfoResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Discovery
    story.append(Paragraph('4.13 Discovery & Search', styles['SubSection']))

    story.append(Paragraph('4.13.1 Search (/search)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/search', 'Query: q, types (optional)', 'UnifiedSearchResponse'],
        ['GET', '/search/suggest', 'Query: q', 'List<SearchSuggestion>'],
        ['GET', '/search/trending', '-', 'TrendingSearchResponse'],
    ]))

    story.append(Paragraph('4.13.2 Recommendation (/recommendations)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/recommendations/personalized', 'Header: X-User-Id', 'List<RecommendedContentResponse>'],
        ['GET', '/recommendations/similar/{contentId}', '-', 'List<RecommendedContentResponse>'],
        ['GET', '/recommendations/trending', '-', 'List<RecommendedContentResponse>'],
        ['GET', '/recommendations/feed', 'Header: X-User-Id; page, size', 'List<RecommendedContentResponse>'],
        ['GET', '/recommendations/content-based/{contentId}', 'Query: limit', 'List<RecommendedContentResponse>'],
    ]))

    story.append(Paragraph('4.13.3 Home (/home)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/home', '-', 'HomeResponse (cached)'],
        ['GET', '/home/banners', '-', 'List<BannerItem>'],
        ['GET', '/home/competitions', '-', 'List<CompetitionBanner>'],
        ['GET', '/home/clips/popular', '-', 'List<ContentCard>'],
    ]))

    story.append(Paragraph('4.13.4 Schedule (/schedule)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/schedule/today', 'Query: sportId, month', 'List<TodayCompetitionItem>'],
        ['GET', '/schedule/matches', 'Query: sportId, competitionId, month, date', 'ScheduleResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Streaming & Live
    story.append(Paragraph('4.14 Streaming & Live', styles['SubSection']))

    story.append(Paragraph('4.14.1 Streaming (/contents/{contentType}/{contentId}/stream)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/contents/{contentType}/{contentId}/stream', 'Header: X-User-Id (optional)', 'PlaybackResponse'],
        ['GET', '/streaming/{contentType}/{contentId}', '-', 'StreamInfo (legacy)'],
        ['GET', '/streaming/cameras/{matchId}', '-', 'List<CameraView> (legacy)'],
    ]))

    story.append(Paragraph('4.14.2 LiveStream (/live-streams)', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/live-streams', 'Header: X-User-Id, Body: CreateLiveStreamRequest', 'LiveStreamResponse'],
        ['POST', '/live-streams/{id}/start', 'Header: X-User-Id', 'LiveStreamResponse'],
        ['POST', '/live-streams/{id}/stop', 'Header: X-User-Id', 'LiveStreamResponse'],
        ['GET', '/live-streams/{id}', '-', 'LiveStreamResponse'],
        ['GET', '/live-streams', 'Query: status; pageable', 'List<LiveStreamResponse>'],
        ['GET', '/live-streams/live', 'pageable', 'List<LiveStreamResponse>'],
        ['POST', '/live-streams/{id}/viewers/join', 'Header: X-User-Id', 'ViewerCountResponse'],
        ['POST', '/live-streams/{id}/viewers/leave', 'Header: X-User-Id', 'ViewerCountResponse'],
        ['GET', '/live-streams/{id}/viewers', '-', 'ViewerCountResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    # Other content controllers
    story.append(Paragraph('4.15 Other Controllers', styles['SubSection']))

    story.append(Paragraph('4.15.1 Notification (/notifications)', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/notifications', 'Body: CreateNotificationRequest', 'List<NotificationResponse>'],
        ['POST', '/notifications/internal', 'Body (internal service call)', 'List<NotificationResponse>'],
        ['GET', '/notifications', 'Header: X-User-Id; pageable', 'List<NotificationResponse>'],
        ['PUT', '/notifications/{id}/read', 'Header: X-User-Id', 'NotificationResponse'],
        ['GET', '/notifications/unread-count', 'Header: X-User-Id', 'Map<String, Long>'],
    ]))

    story.append(Paragraph('4.15.2 Watch History (/users/me/watch-history)', styles['SubSubSection']))
    story.append(make_api_table([
        ['GET', '/users/me/watch-history', 'Header: X-User-Id; pageable', 'List<WatchHistoryResponse>'],
        ['POST', '/users/me/watch-history', 'Header: X-User-Id, Body: RecordWatchEventRequest', 'WatchHistoryResponse'],
    ]))

    story.append(Paragraph('4.15.3 Community Post (/communities)', styles['SubSubSection']))
    story.append(Paragraph('Community post CRUD with moderation support', styles['SmallText']))

    story.append(Paragraph('4.15.4 Entitlement Check (/entitlements/check)', styles['SubSubSection']))
    story.append(Paragraph('Content-side access control check using VideoAclService (ACL policies: PUBLIC, AUTHENTICATED, SUBSCRIBERS, MEMBERS_ONLY, PRIVATE)', styles['SmallText']))

    story.append(Paragraph('4.15.5 Internal Display Section (/internal/admin/display-sections)', styles['SubSubSection']))
    story.append(make_api_table([
        ['POST', '/internal/admin/display-sections/banner', 'Body: Map', 'DisplaySection'],
        ['DELETE', '/internal/admin/display-sections/banner/{adminBannerId}', '-', 'Void'],
    ]))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Inter-Service Communication (Outbound):</b>', styles['DepLabel']))
    story.append(make_dep_table([
        ['CommerceEntitlementClient', 'Commerce (8083)', 'GET /entitlements/check - subscription/entitlement verification for ACL. Circuit breaker with 5min cache fallback.'],
        ['IdentityGuardianClient', 'Identity (8081)', 'GET /guardians/verify-relationship - guardian membership validation'],
    ]))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('<b>Caching:</b> ACL cache (acl:{type}:{contentId}:{userId}), Home cache (main), Trending search cache. Local Caffeine cache 10K entries 5min TTL for Commerce calls.', styles['SmallText']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 5. COMMERCE SERVICE
    # ═══════════════════════════════════════════
    story.append(Paragraph('5. Commerce Service (Port 8083)', styles['SectionTitle']))
    story.append(Paragraph('Products, purchases, payments, wallet, subscriptions, coupons, entitlements, refunds', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph('5.1 Product Controller (/products)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/products', 'Query: productType, isActive; pageable (size=20)', 'Page<ProductResponse>'],
        ['GET', '/products/{id}', 'Path: id', 'ProductResponse'],
        ['POST', '/products', 'Body: CreateProductRequest (name, productType, priceKrw, pricePoint, durationDays)', 'ProductResponse (201)'],
        ['PUT', '/products/{id}', 'Body: CreateProductRequest', 'ProductResponse'],
        ['DELETE', '/products/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.2 Purchase Controller (/purchases)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/purchases', 'Header: X-User-Id, Body: PurchaseRequest (productId, pgType, amount, receiptData)', 'PurchaseResponse (201)'],
        ['GET', '/purchases', 'Header: X-User-Id; pageable (size=20)', 'Page<PurchaseResponse>'],
        ['GET', '/purchases/{id}', 'Path: id', 'PurchaseResponse'],
        ['PUT', '/purchases/{id}/cancel', 'Path: id', 'PurchaseResponse'],
    ]))
    story.append(Paragraph('<b>Purchase Flow:</b> Validate Product -> Verify Payment (PG) -> Create Entitlement -> Credit Wallet (if POINT_CHARGE) -> Publish Events', styles['SmallText']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.3 Wallet Controller (/wallet)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/wallet', 'Header: X-User-Id', 'WalletResponse (id, userId, balance)'],
        ['GET', '/wallet/history', 'Header: X-User-Id, Query: ledgerType, dateFrom, dateTo; pageable', 'Page<WalletHistoryResponse>'],
        ['POST', '/wallet/charge', 'Header: X-User-Id, Body: ChargeRequest (amount 1-10M, paymentMethod)', 'WalletResponse'],
        ['POST', '/wallet/use', 'Header: X-User-Id, Body: UsePointsRequest (amount, referenceType, referenceId)', 'WalletResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.4 Subscription Controller (/subscriptions)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/subscriptions/me', 'Header: X-User-Id', 'EntitlementResponse'],
        ['POST', '/subscriptions/cancel', 'Header: X-User-Id', 'Void'],
        ['POST', '/subscriptions/renew', 'Header: X-User-Id', 'EntitlementResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.5 Entitlement Controller (/entitlements)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/entitlements/check', 'Header: X-User-Id, Query: type, scopeType, scopeId', 'EntitlementCheckResponse (hasAccess, reason, expiresAt)'],
        ['GET', '/entitlements', 'Header: X-User-Id', 'List<EntitlementResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.6 Coupon Controller (/coupons)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/coupons/my', 'Header: X-User-Id, Query: status', 'List<CouponResponse>'],
        ['POST', '/coupons/register', 'Header: X-User-Id, Body: RegisterCouponRequest (code)', 'CouponResponse'],
        ['POST', '/coupons/{id}/use', 'Header: X-User-Id', 'CouponResponse'],
        ['GET', '/coupons/available', '-', 'List<CouponResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('5.7 Refund Controller (/refunds)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/refunds', 'Header: X-User-Id, Body: RefundRequest (purchaseId, reason)', 'RefundResponse (201)'],
        ['GET', '/refunds', 'Query: status; pageable (size=20)', 'Page<RefundResponse>'],
        ['PUT', '/refunds/{id}/process', 'Body: ProcessRefundRequest (approved, adminNote)', 'RefundResponse'],
    ]))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Internal Service Dependencies:</b>', styles['DepLabel']))
    story.append(Paragraph('PurchaseService -> ProductService, EntitlementService, WalletService, PaymentGatewayService, EventPublisher', styles['SmallText']))
    story.append(Paragraph('RefundService -> EntitlementService, PaymentGatewayService, EventPublisher', styles['SmallText']))
    story.append(Paragraph('SubscriptionService -> ProductService, EntitlementRepository', styles['SmallText']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('<b>Published Events:</b> PurchaseCompletedEvent, SubscriptionActivatedEvent, RefundProcessedEvent', styles['SmallText']))
    story.append(Paragraph('<b>Payment Gateways:</b> KCP, INAPP_GOOGLE, INAPP_APPLE (via PaymentGatewayService interface)', styles['SmallText']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 6. OPERATION SERVICE
    # ═══════════════════════════════════════════
    story.append(Paragraph('6. Operation Service (Port 8084)', styles['SectionTitle']))
    story.append(Paragraph('Venues, cameras, streaming ingest, reservations, recording management', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph('6.1 Venue Controller (/venues)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/venues/search', 'Query: keyword, sportId, siGunGuCode, venueType, ownerType; pageable', 'List<VenueSearchResponse>'],
        ['GET', '/venues/nearby', 'Query: lat, lng, radiusDegree; pageable', 'List<VenueSearchResponse>'],
        ['GET', '/venues', 'Query: ownerType, venueType, sportId, name, ownerId; pageable', 'List<VenueListResponse>'],
        ['GET', '/venues/{id}', '-', 'VenueDetailResponse (incl. cameras)'],
        ['POST', '/venues', 'Body: CreateVenueRequest', 'VenueResponse (201)'],
        ['PUT', '/venues/{id}', 'Body: UpdateVenueRequest', 'VenueResponse'],
        ['DELETE', '/venues/{id}', '-', 'Void (204, soft delete)'],
        ['POST', '/venues/{id}/cameras', 'Body: LinkCameraRequest', 'VenueDetailResponse (201)'],
        ['DELETE', '/venues/{id}/cameras/{cameraId}', '-', 'Void (204)'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.2 Venue Schedule (/api/v1/venues/{venueId}/schedule)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/api/v1/venues/{venueId}/schedule', '-', 'VenueScheduleResponse (time slots + closed days)'],
        ['PUT', '/api/v1/venues/{venueId}/schedule', 'Header: X-User-Id, Body: VenueScheduleRequest', 'VenueScheduleResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.3 Camera Controller (/cameras)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/cameras', 'Query: name', 'List<CameraListResponse>'],
        ['GET', '/cameras/{id}', '-', 'CameraDetailResponse'],
        ['POST', '/cameras', 'Body: CreateCameraRequest', 'CameraDetailResponse (201)'],
        ['PUT', '/cameras/{id}', 'Body: CreateCameraRequest', 'CameraDetailResponse'],
        ['DELETE', '/cameras/{id}', '-', 'Void (204, soft delete)'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.4 Venue Product Controller (/api/v1/venues/{venueId}/products)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/api/v1/venues/{venueId}/products', 'Header: X-User-Id, Body: CreateVenueProductRequest', 'VenueProductResponse (201)'],
        ['GET', '/api/v1/venues/{venueId}/products', '-', 'List<VenueProductResponse>'],
        ['GET', '/api/v1/venues/{venueId}/products/{productId}', '-', 'VenueProductResponse'],
        ['PUT', '/api/v1/venues/{venueId}/products/{productId}', 'Header: X-User-Id, Body: UpdateVenueProductRequest', 'VenueProductResponse'],
        ['DELETE', '/api/v1/venues/{venueId}/products/{productId}', 'Header: X-User-Id', 'Void (204)'],
        ['GET', '/api/v1/venues/{venueId}/products/{productId}/availability', 'Query: date (LocalDate)', 'List<TimeSlotResponse>'],
        ['GET', '/api/v1/venues/{venueId}/products/{productId}/price-history', '-', 'List<PriceHistoryResponse>'],
        ['GET', '/api/v1/venues/products/owner', 'Query: ownerId', 'List<VenueProductResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.5 Reservation Controller (/reservations)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/reservations', 'Header: X-User-Id, Body: CreateReservationRequest', 'ReservationResponse (201)'],
        ['GET', '/reservations', 'Query: venueId, status, dateFrom, dateTo, reservedByUserId; pageable', 'List<ReservationResponse>'],
        ['GET', '/reservations/{id}', '-', 'ReservationResponse'],
        ['PUT', '/reservations/{id}/status', 'Body: ChangeStatusRequest', 'ReservationResponse'],
        ['GET', '/reservations/calendar', 'Query: mode (day/week/month), date, venueId', 'List<CalendarEventResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.6 Recording Schedule Controller (/api/v1/recording-schedules)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/api/v1/recording-schedules', 'Header: X-User-Id, Body: CreateRecordingScheduleRequest', 'RecordingScheduleResponse (201)'],
        ['GET', '/api/v1/recording-schedules', 'Query: userId; pageable', 'List<RecordingScheduleResponse>'],
        ['GET', '/api/v1/recording-schedules/{id}', '-', 'RecordingScheduleResponse'],
        ['PUT', '/api/v1/recording-schedules/{id}', 'Body: UpdateRecordingScheduleRequest', 'RecordingScheduleResponse'],
        ['DELETE', '/api/v1/recording-schedules/{id}', '-', 'Void (204)'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.7 Recording Session Controller (/api/v1/recording-sessions)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/api/v1/recording-sessions', 'Header: X-User-Id, Body: StartRecordingSessionRequest', 'RecordingSessionResponse (201)'],
        ['PUT', '/api/v1/recording-sessions/{id}/stop', '-', 'RecordingSessionResponse'],
        ['PUT', '/api/v1/recording-sessions/{id}/complete', '-', 'RecordingSessionResponse'],
        ['GET', '/api/v1/recording-sessions/{id}/status', '-', 'RecordingSessionResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.8 Streaming Ingest Controller (/streaming/ingest)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/streaming/ingest/endpoints', 'Body: CreateIngestRequest', 'IngestEndpoint (201)'],
        ['GET', '/streaming/ingest/endpoints', '-', 'List<IngestEndpoint>'],
        ['GET', '/streaming/ingest/endpoints/{id}/status', '-', 'IngestStatus'],
        ['POST', '/streaming/ingest/transcode/start', 'Body: StartTranscodeRequest', 'TranscodeSession (201)'],
        ['POST', '/streaming/ingest/transcode/{id}/stop', '-', 'Void'],
        ['GET', '/streaming/ingest/playback/{sessionId}', '-', 'PlaybackInfo (HLS/DASH URLs)'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('6.9 Other Controllers', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/studio/sessions', 'Query: venueId, matchId; pageable', 'Page<StudioSession>'],
        ['GET', '/api/v1/recording-notifications/preferences', 'Header: X-User-Id', 'NotificationPreferenceResponse'],
        ['PUT', '/api/v1/recording-notifications/preferences', 'Header: X-User-Id, Body: NotificationPreferenceRequest', 'NotificationPreferenceResponse'],
    ]))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Published Events:</b> RecordingCompletedEvent, ReservationCreatedEvent, ReservationCancelledEvent', styles['SmallText']))
    story.append(Paragraph('<b>Consumed Events:</b> UserWithdrawnEvent (cancels active reservations, anonymizes completed ones)', styles['SmallText']))
    story.append(Paragraph('<b>VPU Integration:</b> VpuService interface (stub) - startRecording, stopRecording, getRtmpIngestUrl', styles['SmallText']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 7. ADMIN SERVICE
    # ═══════════════════════════════════════════
    story.append(Paragraph('7. Admin Service (Port 8085)', styles['SectionTitle']))
    story.append(Paragraph('Admin authentication, RBAC, site management, CS, analytics, audit', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph('7.1 Admin Auth (/admin/api/v1/auth)', styles['SubSection']))
    story.append(make_api_table([
        ['POST', '/admin/api/v1/auth/login', 'Body: AdminLoginRequest (loginId, password)', 'AdminLoginResponse (accessToken, refreshToken, roles, permissions)'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.2 RBAC - Users (/admin/api/v1/rbac/members)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/rbac/members', 'pageable (size=20)', 'Page<AdminUserListResponse>'],
        ['GET', '/admin/api/v1/rbac/members/{id}', '-', 'AdminUserListResponse'],
        ['POST', '/admin/api/v1/rbac/members', 'Body: CreateAdminUserRequest', 'AdminUserListResponse (201)'],
        ['PUT', '/admin/api/v1/rbac/members/{id}', 'Body: UpdateAdminUserRequest', 'AdminUserListResponse'],
        ['DELETE', '/admin/api/v1/rbac/members/{id}', '-', 'Void'],
        ['PATCH', '/admin/api/v1/rbac/members/{id}/block', '-', 'AdminUserListResponse'],
        ['PATCH', '/admin/api/v1/rbac/members/{id}/unblock', '-', 'AdminUserListResponse'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.3 RBAC - Roles (/admin/api/v1/rbac/roles)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/rbac/roles', '-', 'List<AdminRoleResponse>'],
        ['GET', '/admin/api/v1/rbac/roles/{id}', '-', 'AdminRoleResponse'],
        ['POST', '/admin/api/v1/rbac/roles', 'Body: CreateRoleRequest (roleCode, roleName)', 'AdminRoleResponse (201)'],
        ['PUT', '/admin/api/v1/rbac/roles/{id}', 'Body: UpdateRoleRequest', 'AdminRoleResponse'],
        ['DELETE', '/admin/api/v1/rbac/roles/{id}', '-', 'Void'],
        ['PUT', '/admin/api/v1/rbac/roles/{id}/menus', 'Body: AssignMenusRequest (menuIds)', 'Void'],
        ['PUT', '/admin/api/v1/rbac/roles/{id}/functions', 'Body: AssignFunctionsRequest (functionIds)', 'Void'],
        ['GET', '/admin/api/v1/rbac/roles/{id}/menus', '-', 'List<AdminMenuTreeResponse>'],
        ['GET', '/admin/api/v1/rbac/roles/{id}/functions', '-', 'List<AdminFunctionResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.4 RBAC - Groups (/admin/api/v1/rbac/groups)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/rbac/groups', '-', 'List<AdminGroupTreeResponse>'],
        ['GET', '/admin/api/v1/rbac/groups/{id}', '-', 'AdminGroupTreeResponse'],
        ['POST', '/admin/api/v1/rbac/groups', 'Body: CreateGroupRequest', 'AdminGroupTreeResponse (201)'],
        ['PUT', '/admin/api/v1/rbac/groups/{id}', 'Body: UpdateGroupRequest', 'AdminGroupTreeResponse'],
        ['DELETE', '/admin/api/v1/rbac/groups/{id}', '-', 'Void'],
        ['POST', '/admin/api/v1/rbac/groups/{id}/members', 'Body: AssignMembersRequest', 'Void'],
        ['DELETE', '/admin/api/v1/rbac/groups/{id}/members', 'Body: AssignMembersRequest', 'Void'],
        ['POST', '/admin/api/v1/rbac/groups/{id}/roles', 'Body: AssignRolesRequest', 'Void'],
        ['DELETE', '/admin/api/v1/rbac/groups/{id}/roles', 'Body: AssignRolesRequest', 'Void'],
        ['GET', '/admin/api/v1/rbac/groups/{id}/permissions', '-', 'List<String>'],
        ['GET', '/admin/api/v1/rbac/groups/{id}/members', '-', 'List<AdminUserListResponse>'],
        ['GET', '/admin/api/v1/rbac/groups/{id}/roles', '-', 'List<AdminRoleResponse>'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.5 RBAC - Menus (/admin/api/v1/rbac/menus)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/rbac/menus', '-', 'List<AdminMenuTreeResponse>'],
        ['GET', '/admin/api/v1/rbac/menus/{id}', '-', 'AdminMenuTreeResponse'],
        ['POST', '/admin/api/v1/rbac/menus', 'Body: CreateMenuRequest (menuCode, menuName, parentId, menuPath)', 'AdminMenuTreeResponse (201)'],
        ['PUT', '/admin/api/v1/rbac/menus/{id}', 'Body: UpdateMenuRequest', 'AdminMenuTreeResponse'],
        ['DELETE', '/admin/api/v1/rbac/menus/{id}', '-', 'Void'],
        ['PUT', '/admin/api/v1/rbac/menus/reorder', 'Body: ReorderMenuRequest', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.6 RBAC - Functions (/admin/api/v1/rbac/functions)', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/rbac/functions', '-', 'List<AdminFunctionResponse>'],
        ['GET', '/admin/api/v1/rbac/functions/{id}', '-', 'AdminFunctionResponse'],
        ['POST', '/admin/api/v1/rbac/functions', 'Body: CreateFunctionRequest (functionCode, httpMethod, apiPath)', 'AdminFunctionResponse (201)'],
        ['PUT', '/admin/api/v1/rbac/functions/{id}', 'Body: UpdateFunctionRequest', 'AdminFunctionResponse'],
        ['DELETE', '/admin/api/v1/rbac/functions/{id}', '-', 'Void'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.7 Site Management', styles['SubSection']))
    story.append(make_api_table([
        ['GET', '/admin/api/v1/site/banners', 'Query: page, size, status, searchKeyword', 'Page<BannerResponse>'],
        ['POST', '/admin/api/v1/site/banners', 'Body: BannerRequest', 'BannerResponse (201) + sync to Content'],
        ['PUT', '/admin/api/v1/site/banners/{id}', 'Body: BannerRequest', 'BannerResponse + sync to Content'],
        ['PUT', '/admin/api/v1/site/banners/order', 'Body: Map (items: [{id, order}])', 'Void'],
        ['DELETE', '/admin/api/v1/site/banners/{id}', '-', 'Void (204) + remove from Content'],
        ['GET', '/admin/api/v1/site/notices', 'pageable', 'Page<Notice>'],
        ['POST', '/admin/api/v1/site/notices', 'Body: Notice', 'Notice (201)'],
        ['DELETE', '/admin/api/v1/site/notices/{id}', '-', 'Void (204)'],
        ['GET', '/admin/api/v1/site/events', 'pageable', 'Page<Event>'],
        ['POST', '/admin/api/v1/site/events', 'Body: Event', 'Event (201)'],
        ['DELETE', '/admin/api/v1/site/events/{id}', '-', 'Void (204)'],
        ['GET', '/admin/api/v1/site/popups', '-', 'List<Popup>'],
        ['POST', '/admin/api/v1/site/popups', 'Body: Popup', 'Popup (201)'],
        ['DELETE', '/admin/api/v1/site/popups/{id}', '-', 'Void (204)'],
        ['GET', '/admin/api/v1/site/push-campaigns', 'pageable', 'Page<PushCampaign>'],
        ['POST', '/admin/api/v1/site/push-campaigns', 'Body: PushCampaign', 'PushCampaign (201)'],
        ['PUT', '/admin/api/v1/site/push-campaigns/{id}/cancel', '-', 'PushCampaign'],
    ]))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph('7.8 Other Admin Controllers', styles['SubSection']))
    story.append(make_api_table([
        ['PUT', '/admin/api/v1/organizations/{id}/verify', 'Attr: adminUserId', 'OrganizationVerifyResponse + audit log'],
        ['GET', '/admin/api/v1/clubs', 'Query: sportId, status, keyword, page, size', 'JsonNode (proxied to Content)'],
        ['PATCH', '/admin/api/v1/clubs/{clubId}/status', 'Body: UpdateClubStatusRequest', 'JsonNode + audit log'],
        ['GET', '/admin/api/v1/cs/inquiries', 'Query: status; pageable', 'Page<Inquiry>'],
        ['GET', '/admin/api/v1/cs/reports', 'Query: status; pageable', 'Page<Report>'],
        ['GET', '/admin/api/v1/cs/terms', '-', 'List<Term>'],
        ['POST', '/admin/api/v1/analytics/events', 'Body: BulkEventRequest', '{ ingested: count }'],
        ['GET', '/admin/api/v1/analytics/dashboard', 'Query: period (day/week/month)', 'DashboardStatsResponse'],
        ['GET', '/admin/api/v1/app/versions', 'Query: platform', 'List<AppVersion>'],
        ['GET', '/admin/api/v1/app/versions/latest', 'Query: platform', 'AppVersion'],
        ['POST', '/admin/api/v1/app/versions', 'Body: AppVersion', 'AppVersion (201)'],
    ]))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('<b>Inter-Service Communication (Outbound):</b>', styles['DepLabel']))
    story.append(make_dep_table([
        ['ContentSyncService', 'Content (8082)', 'POST /internal/admin/display-sections/banner, DELETE /internal/admin/display-sections/banner/{id}'],
        ['AdminClubContentClient', 'Content (8082)', 'GET /clubs, GET /clubs/{id}, POST /clubs/{id}/status, GET /clubs/{id}/members'],
        ['ContentServiceClient', 'Content (8082)', 'PUT /organizations/{id}/verify (stub implementation)'],
    ]))
    story.append(Paragraph('<b>Audit:</b> Hash-chain linked audit logs with synchronized writes (REQUIRES_NEW transaction)', styles['SmallText']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 8-11. BFF SERVICES
    # ═══════════════════════════════════════════
    story.append(Paragraph('8. App BFF (Mobile)', styles['SectionTitle']))
    story.append(Paragraph('Mobile app aggregation layer - combines data from multiple core services', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(make_api_table([
        ['GET', '/home', '-', 'HomeResponse (banners, liveNow, recommended, featuredProducts)'],
        ['GET', '/player/{type}/{id}', '-', 'PlayerResponse (playerData, cameras, productSuggestions)'],
        ['GET', '/mypage', 'Header: X-User-Id', 'MyPageResponse (profile, watchHistory, favorites, wallet)'],
        ['GET', '/auth/oauth2/start/{provider}', 'Query: code_challenge, code_challenge_method', 'Redirect to OAuth (PKCE mobile flow)'],
        ['POST', '/auth/signup/minor', 'Header: Authorization', 'TokenResponse'],
        ['GET', '/auth/guardian/verify', 'Query: token', 'GuardianVerifyResponse'],
        ['GET', '/version/check', 'Query: platform (AOS/iOS)', 'AppVersion'],
        ['POST', '/push/register', 'Header: X-User-Id', 'PushTokenResponse'],
        ['DELETE', '/push/unregister', 'Header: X-User-Id', 'Void'],
    ]))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Aggregation Pattern:</b> Identity + Content + Commerce + Operation + Admin', styles['DepLabel']))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('9. Web BFF', styles['SectionTitle']))
    story.append(Paragraph('Public web aggregation with cookie-based auth', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(make_api_table([
        ['GET', '/home', '-', 'HomeResponse (mainBanners, liveContents, competitionBanners, featuredProducts)'],
        ['GET', '/player/{type}/{id}', '-', 'PlayerResponse (playerData, accessGranted, productSuggestions)'],
        ['GET', '/mypage', 'Header: X-User-Id', 'MyPageResponse (profile, watchHistory, favorites, wallet, entitlements)'],
        ['GET', '/auth/oauth2/start/{provider}', '-', 'Redirect to OAuth (web platform)'],
        ['POST', '/auth/login', '-', 'Set HttpOnly cookies (pochak_at, pochak_rt)'],
        ['POST', '/auth/signup', '-', 'Set HttpOnly cookies'],
        ['POST', '/auth/logout', '-', 'Clear cookies'],
        ['GET', '/notices', '-', 'List<Notice> (from Admin Service)'],
    ]))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Auth:</b> Cookie-based (pochak_at, pochak_rt - HttpOnly, Secure, SameSite=Lax)', styles['DepLabel']))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('10. BO BFF (Admin Web)', styles['SectionTitle']))
    story.append(Paragraph('Admin web aggregation - proxy pattern to core services', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(make_api_table([
        ['GET', '/rbac/roles|groups|menus|functions', '-', 'Proxied RBAC endpoints (Admin)'],
        ['POST/PUT/DELETE', '/rbac/roles|groups|menus|functions/...', 'Various', 'Proxied RBAC mutations (Admin)'],
        ['GET', '/site/banners|notices', 'Query params', 'Proxied site management (Admin)'],
        ['POST/PUT/DELETE', '/site/banners|notices/...', 'Various', 'Proxied site mutations (Admin)'],
        ['GET', '/members', 'Query params', 'Proxied member list (Identity)'],
        ['PUT', '/members/{id}/status', 'Body', 'Proxied member status update (Identity)'],
        ['GET/POST/PUT/DELETE', '/products|refunds/...', 'Various', 'Proxied commerce endpoints (Commerce)'],
        ['GET/POST/PUT/DELETE', '/content/{resource}/...', 'Various', 'Generic CRUD proxy for sports, teams, competitions, etc (Content)'],
    ]))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Pattern:</b> Transparent proxy to Admin + Identity + Content + Commerce', styles['DepLabel']))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('11. Partner BFF', styles['SectionTitle']))
    story.append(Paragraph('Partner portal aggregation - venue/product/reservation management', styles['BodyText2']))
    story.append(Spacer(1, 3*mm))

    story.append(make_api_table([
        ['GET', '/api/v1/partner/me', 'Header: X-User-Id', 'Partner info (Identity)'],
        ['POST', '/api/v1/partner/register', 'Header: X-User-Id', 'Partner registration (Identity)'],
        ['GET', '/api/v1/partners/me/venues', 'Header: X-User-Id', 'Partner venues (Operation)'],
        ['GET', '/api/v1/partners/me/products', 'Header: X-User-Id', 'Partner products aggregated (Operation)'],
        ['GET', '/api/v1/partners/me/dashboard-stats', 'Header: X-User-Id', 'Dashboard stats (Operation)'],
        ['GET', '/api/v1/partner/venues', 'Header: X-User-Id', 'Venue list by owner (Operation)'],
        ['GET/PUT', '/api/v1/partner/venues/{venueId}/schedule', 'Header: X-User-Id', 'Venue schedule (Operation)'],
        ['POST/GET/PUT/DELETE', '/api/v1/partner/venues/{venueId}/products/...', 'Header: X-User-Id', 'Venue products CRUD (Operation)'],
        ['GET', '/api/v1/partner/reservations', 'Query: venueId, status; pageable', 'Reservation list (Operation)'],
        ['PUT', '/api/v1/partner/reservations/{id}/approve', 'Header: X-User-Id', 'Approve reservation (Operation)'],
        ['PUT', '/api/v1/partner/reservations/{id}/reject', 'Header: X-User-Id', 'Reject reservation (Operation)'],
        ['GET/PUT', '/api/v1/partner/partners/{partnerId}/clubs/...', '-', 'Club customization (Content)'],
        ['GET', '/api/v1/partner/analytics/revenue', 'Query: from, to', 'Revenue analytics (Commerce)'],
        ['GET', '/api/v1/partner/analytics/reservations/stats', 'Query: venueId', 'Reservation stats (Operation)'],
    ]))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Pattern:</b> Identity + Operation + Content + Commerce', styles['DepLabel']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 12. DEPENDENCY MATRIX
    # ═══════════════════════════════════════════
    story.append(Paragraph('12. Inter-Service Dependency Matrix', styles['SectionTitle']))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        'This matrix shows all synchronous REST dependencies between services. '
        'Rows represent the calling service, columns represent the called service. '
        'Async event-based communication is shown separately in Section 13.',
        styles['BodyText2']
    ))
    story.append(Spacer(1, 5*mm))

    services = ['Identity', 'Content', 'Commerce', 'Operation', 'Admin']

    matrix_header = [Paragraph('<b>Caller \\ Callee</b>', styles['TableHeader'])]
    for s in services:
        matrix_header.append(Paragraph(f'<b>{s}</b>', styles['TableHeader']))

    def cell(text, bold=False):
        if bold:
            return Paragraph(f'<b>{text}</b>', styles['TableCell'])
        return Paragraph(text, styles['TableCell'])

    def check():
        return Paragraph('<font color="#28a745"><b>O</b></font>', styles['TableCell'])
    def dash():
        return Paragraph('<font color="#dee2e6">-</font>', styles['TableCell'])

    matrix_data = [
        matrix_header,
        [cell('Identity', True), dash(), dash(), dash(), dash(), dash()],
        [cell('Content', True), check(), dash(), check(), dash(), dash()],
        [cell('Commerce', True), dash(), dash(), dash(), dash(), dash()],
        [cell('Operation', True), dash(), dash(), dash(), dash(), dash()],
        [cell('Admin', True), dash(), check(), dash(), dash(), dash()],
        [cell('App BFF', True), check(), check(), check(), check(), check()],
        [cell('Web BFF', True), check(), check(), check(), dash(), check()],
        [cell('BO BFF', True), check(), check(), check(), dash(), check()],
        [cell('Partner BFF', True), check(), check(), check(), check(), dash()],
    ]

    cw = 95
    matrix_table = Table(matrix_data, colWidths=[cw, cw, cw, cw, cw, cw])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BACKGROUND', (0, 1), (0, -1), SECONDARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('TEXTCOLOR', (0, 1), (0, -1), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (1, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(matrix_table)

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('<b>Detailed Cross-Service REST Calls:</b>', styles['DepLabel']))
    story.append(Spacer(1, 3*mm))

    detail_deps = [
        ['Content -> Commerce', 'CommerceEntitlementClient', 'GET /entitlements/check (subscription/access validation, circuit breaker, 5min cache)'],
        ['Content -> Identity', 'IdentityGuardianClient', 'GET /guardians/verify-relationship (guardian membership check)'],
        ['Admin -> Content', 'ContentSyncService', 'POST/DELETE /internal/admin/display-sections/banner (banner sync)'],
        ['Admin -> Content', 'AdminClubContentClient', 'GET/POST /clubs/** (club management proxy)'],
        ['Admin -> Content', 'ContentServiceClient', 'PUT /organizations/{id}/verify (org verification toggle)'],
        ['App BFF -> Identity', 'IdentityServiceClient', 'GET /users/me, /auth/oauth2/**, POST /auth/signup/minor, push tokens'],
        ['App BFF -> Content', 'ContentServiceClient', 'GET /home, /contents/**/player, /contents/**/access, watch-history, favorites'],
        ['App BFF -> Commerce', 'CommerceServiceClient', 'GET /products, /wallet'],
        ['App BFF -> Operation', 'OperationServiceClient', 'GET /streaming/cameras/{matchId}'],
        ['App BFF -> Admin', 'AdminServiceClient', 'GET /admin/api/v1/app/versions/latest'],
        ['Web BFF -> Identity', 'IdentityServiceClient', 'POST /auth/login, /auth/signup, GET /users/me, /auth/oauth2/**'],
        ['Web BFF -> Content', 'ContentServiceClient', 'GET /home, /contents/**/player, /contents/**/access, watch-history, favorites'],
        ['Web BFF -> Commerce', 'CommerceServiceClient', 'GET /products, /wallet, /entitlements'],
        ['Web BFF -> Admin', 'RestClient', 'GET /admin/api/v1/site/notices'],
        ['BO BFF -> Admin', 'AdminServiceClient', 'GET/POST/PUT/DELETE /admin/api/v1/** (RBAC, site mgmt, analytics)'],
        ['BO BFF -> Identity', 'IdentityServiceClient', 'GET /admin/members/**, PUT /admin/members/{id}/status'],
        ['BO BFF -> Content', 'ContentServiceClient', 'GET/POST/PUT/DELETE /{resource}/** (generic CRUD proxy)'],
        ['BO BFF -> Commerce', 'CommerceServiceClient', 'GET/POST/PUT/DELETE /products/**, /refunds/**'],
        ['Partner BFF -> Identity', 'RestClient', 'GET /api/v1/partners/me, POST /api/v1/partners/register'],
        ['Partner BFF -> Operation', 'RestClient', 'GET/PUT venues, products, reservations, schedules'],
        ['Partner BFF -> Content', 'RestClient', 'GET/PUT /clubs/by-partner, /clubs/{id}/customization'],
        ['Partner BFF -> Commerce', 'RestClient', 'GET /api/v1/partner/revenue'],
    ]

    detail_table = make_dep_table(detail_deps)
    story.append(detail_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 13. EVENT-DRIVEN COMMUNICATION
    # ═══════════════════════════════════════════
    story.append(Paragraph('13. Event-Driven Communication (RabbitMQ)', styles['SectionTitle']))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        'Services communicate asynchronously via RabbitMQ using the Transactional Outbox Pattern '
        '(pochak-common-lib). Events are persisted in the outbox table within the same transaction '
        'as the domain change, then relayed to RabbitMQ by a scheduled poller.',
        styles['BodyText2']
    ))
    story.append(Spacer(1, 5*mm))

    event_header = [
        Paragraph('<b>Event</b>', styles['TableHeader']),
        Paragraph('<b>Publisher</b>', styles['TableHeader']),
        Paragraph('<b>Consumer(s)</b>', styles['TableHeader']),
        Paragraph('<b>Payload / Action</b>', styles['TableHeader']),
    ]
    event_data = [
        event_header,
        [Paragraph('UserWithdrawnEvent', styles['TableCellBold']),
         Paragraph('Identity Service', styles['TableCell']),
         Paragraph('Operation Service', styles['TableCell']),
         Paragraph('Cancel active reservations (PENDING/CONFIRMED), anonymize completed reservations (user_id -> -1)', styles['TableCell'])],
        [Paragraph('PurchaseCompletedEvent', styles['TableCellBold']),
         Paragraph('Commerce Service', styles['TableCell']),
         Paragraph('Content Service (notifications)', styles['TableCell']),
         Paragraph('userId, productId, amount, paymentMethod', styles['TableCell'])],
        [Paragraph('SubscriptionActivatedEvent', styles['TableCellBold']),
         Paragraph('Commerce Service', styles['TableCell']),
         Paragraph('Content Service', styles['TableCell']),
         Paragraph('userId, tierName, expiresAt', styles['TableCell'])],
        [Paragraph('RefundProcessedEvent', styles['TableCellBold']),
         Paragraph('Commerce Service', styles['TableCell']),
         Paragraph('Content Service', styles['TableCell']),
         Paragraph('userId, refundId, amount', styles['TableCell'])],
        [Paragraph('RecordingCompletedEvent', styles['TableCellBold']),
         Paragraph('Operation Service', styles['TableCell']),
         Paragraph('Content Service (upload pipeline)', styles['TableCell']),
         Paragraph('sessionId, scheduleId, userId, venueId, cameraId', styles['TableCell'])],
        [Paragraph('ReservationCreatedEvent', styles['TableCellBold']),
         Paragraph('Operation Service', styles['TableCell']),
         Paragraph('Content Service (notifications)', styles['TableCell']),
         Paragraph('reservationId, venueId, userId, startTime', styles['TableCell'])],
        [Paragraph('ReservationCancelledEvent', styles['TableCellBold']),
         Paragraph('Operation Service', styles['TableCell']),
         Paragraph('Content Service (notifications)', styles['TableCell']),
         Paragraph('reservationId, reason', styles['TableCell'])],
    ]

    event_table = Table(event_data, colWidths=[120, 90, 100, 200])
    event_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(event_table)

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('<b>Outbox Pattern Implementation (pochak-common-lib):</b>', styles['DepLabel']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('1. Domain change + OutboxEvent saved in same DB transaction', styles['SmallText']))
    story.append(Paragraph('2. Scheduled poller reads unpublished events from outbox table', styles['SmallText']))
    story.append(Paragraph('3. Events published to RabbitMQ exchange', styles['SmallText']))
    story.append(Paragraph('4. Consumer processes event, records in ProcessedEvent table (idempotency)', styles['SmallText']))
    story.append(Paragraph('5. Repositories: OutboxEventRepository, ProcessedEventRepository', styles['SmallText']))

    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        f'Generated on {datetime.now().strftime("%Y-%m-%d %H:%M")} | Pochak Engineering Team | All API responses wrapped in ApiResponse&lt;T&gt;',
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=grey, alignment=TA_CENTER)
    ))

    # Build PDF
    doc.build(story)
    return output_path

if __name__ == '__main__':
    path = build_pdf()
    print(f"PDF generated: {path}")
