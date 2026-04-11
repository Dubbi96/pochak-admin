# Pochak 에뮬레이터/디바이스 테스트 가이드

---

## 사전 준비 (공통)

### 1. 백엔드 실행
앱에서 API를 호출하려면 백엔드가 실행 중이어야 합니다.

```bash
cd ~/Dubbi/pochak

# 방법 A: Docker로 전체 실행 (권장)
make all-up

# 방법 B: 인프라만 Docker + 서비스는 로컬
make deps-up
make run-svc s=gateway    # 별도 터미널
make run-svc s=identity   # 별도 터미널
# ... 필요한 서비스만 실행
```

### 2. 백엔드 상태 확인
```bash
# Gateway 헬스체크
curl http://localhost:8080/health

# 전체 서비스 상태
curl http://localhost:8080/health/services

# 또는
make status
```

### 3. Mac IP 확인 (실기기 테스트 시)
```bash
ipconfig getifaddr en0
# 예: 192.168.0.10
```

---

## Android 에뮬레이터 테스트

### 사전 요구사항
- **Android Studio** Hedgehog 이상
- **JDK 17+**
- Android SDK (compileSdk 35, minSdk 26)

### 절차

#### Step 1: Android Studio에서 프로젝트 열기
```bash
# 방법 A: Makefile
cd ~/Dubbi/pochak
open -a "Android Studio" clients/apps/android

# 방법 B: Android Studio GUI
# File → Open → ~/Dubbi/pochak/clients/apps/android 선택
```

#### Step 2: Gradle Sync 대기
- 프로젝트 열면 자동으로 Gradle Sync 시작 (첫 실행 시 3-5분)
- 하단 Build 탭에서 진행 상황 확인
- "BUILD SUCCESSFUL" 메시지 확인

#### Step 3: Pretendard 폰트 설치
```bash
# 폰트 다운로드 (GitHub Releases)
# https://github.com/orioncactus/pretendard/releases

# 다운로드한 .ttf 파일을 아래 경로에 복사:
# clients/apps/android/app/src/main/res/font/
# 필요 파일:
#   pretendard_thin.ttf
#   pretendard_light.ttf
#   pretendard_regular.ttf
#   pretendard_medium.ttf
#   pretendard_semibold.ttf
#   pretendard_bold.ttf
#   pretendard_extrabold.ttf
```

#### Step 4: 에뮬레이터 생성
1. Android Studio → **Tools → Device Manager**
2. **Create Virtual Device** 클릭
3. 기기 선택: **Pixel 7** (권장) 또는 Pixel 8
4. 시스템 이미지: **API 35** (Android 15) — "UpsideDownCake" 다운로드
5. AVD Name: `Pixel_7_API_35`
6. **Finish**

#### Step 5: 실행
1. 상단 툴바에서 디바이스 선택: `Pixel 7 API 35`
2. ▶ 버튼 클릭 (또는 `Shift+F10`)
3. 에뮬레이터가 시작되고 앱이 설치/실행됨

```bash
# CLI로 실행 (Android Studio 없이):
cd ~/Dubbi/pochak
make android-build   # APK 빌드
make android-run     # 설치 + 실행
```

#### Step 6: API 연결 확인
에뮬레이터에서 Gateway 접근:
- 에뮬레이터 → `10.0.2.2:8080` (= Mac의 localhost)
- 앱 설정에서 base URL이 `http://10.0.2.2:8080`인지 확인
- 파일: `clients/apps/android/app/build.gradle.kts` → `API_BASE_URL`

#### 트러블슈팅
```bash
# 에뮬레이터 목록 확인
emulator -list-avds

# 에뮬레이터 직접 실행
emulator -avd Pixel_7_API_35

# ADB 연결 확인
adb devices

# 에뮬레이터에서 API 접근 테스트
adb shell curl http://10.0.2.2:8080/health

# 로그 확인
adb logcat | grep -i pochak
```

### 실기기 테스트 (USB)
1. 기기에서: **설정 → 개발자 옵션 → USB 디버깅 ON**
2. USB 케이블 연결
3. `adb devices`로 기기 확인
4. `API_BASE_URL`을 Mac IP로 변경: `http://192.168.0.10:8080`
5. Android Studio에서 기기 선택 → ▶ 실행

---

## iOS 시뮬레이터 테스트

### 사전 요구사항
- **Xcode 16+** (App Store에서 설치)
- **macOS Sequoia** 이상 권장
- 시뮬레이터: 무료 (실기기는 Apple Developer 계정 필요)

### 절차

#### Step 1: Xcode 프로젝트 생성

현재 Swift 소스 파일만 있고 .xcodeproj가 없으므로 생성이 필요합니다.

1. **Xcode 열기**: `open -a Xcode`
2. **File → New → Project**
3. 설정:
   - Template: **iOS → App**
   - Product Name: `PochakiOS`
   - Team: (개인 Apple ID 또는 개발자 계정)
   - Organization Identifier: `com.pochak`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **None**
4. 저장 위치: `~/Dubbi/pochak/clients/apps/ios/`
5. **Create**

#### Step 2: 소스 파일 연결

Xcode 프로젝트에 기존 Swift 파일 추가:

1. Xcode 좌측 Project Navigator에서 `PochakiOS` 폴더 우클릭
2. **Add Files to "PochakiOS"** 선택
3. 다음 폴더들을 선택 (모두):
   - `Theme/`
   - `Components/`
   - `Models/`
   - `Features/`
   - `Core/`
   - `Navigation/`
4. 옵션:
   - ☐ Copy items if needed (해제 — 이미 프로젝트 안에 있음)
   - ☑ Create groups
   - ☑ Add to targets: PochakiOS
5. **Add**

#### Step 3: Pretendard 폰트 추가 (선택)

```bash
# Pretendard 다운로드
# https://github.com/orioncactus/pretendard/releases

# .otf 또는 .ttf를 프로젝트에 드래그 앤 드롭
# Xcode에서: Copy items if needed ☑
```

Info.plist에 폰트 등록:
1. Target → **Info** 탭
2. **Fonts provided by application** 키 추가 (Array)
3. 폰트 파일명 입력 (예: `PretendardVariable.ttf`)

#### Step 4: 시뮬레이터 실행

1. 상단 디바이스 선택: **iPhone 16 Pro** (또는 원하는 기기)
2. `Cmd+R` (빌드 & 실행)
3. 시뮬레이터에서 앱 확인

```bash
# CLI로 시뮬레이터 실행 (Xcode 없이):
# 시뮬레이터 목록
xcrun simctl list devices available

# 시뮬레이터 부팅
xcrun simctl boot "iPhone 16 Pro"

# 시뮬레이터 앱 열기
open -a Simulator
```

#### Step 5: API 연결 확인
시뮬레이터에서 Gateway 접근:
- 시뮬레이터 → `localhost:8080` (= Mac의 localhost, 직접 접근 가능)
- 파일: `Core/Network/APIClient.swift` → `baseURL`이 `http://localhost:8080`

#### 트러블슈팅
```bash
# Xcode 빌드 에러 시:
# Product → Clean Build Folder (Cmd+Shift+K)
# 그 다음 Cmd+R

# 시뮬레이터 초기화
xcrun simctl erase "iPhone 16 Pro"

# 시뮬레이터에서 API 확인
# Safari에서 http://localhost:8080/health 접속
```

### 실기기 테스트 (USB)
1. **Apple Developer 계정** 필요 (무료 계정도 가능, 7일 제한)
2. iPhone USB 연결
3. Xcode 상단에서 실기기 선택
4. **Signing & Capabilities**:
   - Team: Apple 계정 선택
   - Bundle Identifier: `com.pochak.ios` (고유)
   - ☑ Automatically manage signing
5. `Cmd+R` 빌드 & 실행
6. iPhone에서: **설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 신뢰**
7. `API_BASE_URL`을 Mac IP로 변경: `http://192.168.0.10:8080`

---

## 전체 셧다운

```bash
cd ~/Dubbi/pochak

# 방법 A: Makefile
make all-down

# 방법 B: 전체 셧다운 스크립트 (Docker + 로컬 프로세스 + 포트 정리)
./scripts/shutdown-all.sh
```

---

## 빠른 참조

| 작업 | 명령어 |
|------|-------|
| 전체 시작 | `make all-up` |
| 전체 중지 | `make all-down` 또는 `./scripts/shutdown-all.sh` |
| Web 로컬 개발 | `make web-dev` → http://localhost:3100 |
| BO 로컬 개발 | `make bo-dev` → http://localhost:3000 |
| Android 빌드 | `make android-build` |
| Android 실행 | `make android-run` |
| iOS Xcode 열기 | `make ios-open` |
| 상태 확인 | `make status` |
| 전체 테스트 | `make test` |

| 플랫폼 | API Base URL |
|--------|-------------|
| Web (브라우저) | `http://localhost:8080` |
| Android 에뮬레이터 | `http://10.0.2.2:8080` |
| iOS 시뮬레이터 | `http://localhost:8080` |
| 실기기 (공통) | `http://{Mac IP}:8080` |
