# 예약 관리 PWA (Mobile-First)

## 📖 프로젝트 개요
이 프로젝트는 **예약 노쇼(No-Show)를 방지**하고 소상공인의 예약 관리를 돕기 위해 설계된 **모바일 최우선 프로그레시브 웹 앱(PWA)**입니다.
구매자에게는 편리한 예약과 푸시 알림을, 판매자에게는 효율적인 예약/고객 관리 기능을 **비용 없이(Zero-Cost)** 제공합니다.

## 🚀 주요 기능

### 👤 사용자 (고객)
- **간편 예약**: 서비스 선택 후 날짜/시간 클릭만으로 예약 완료
- **PWA 지원**: 앱처럼 설치하여 사용 가능 (Splash Screen, 홈 화면 아이콘)
- **알림**: 예약 확정/취소 시 실시간 웹 푸시 알림 수신
- **내 예약 관리**: 본인의 예약 현황 조회 및 취소

### 👑 관리자 (사장님)
- **예약 관리**: 들어온 예약을 승인하거나 거절(취소) 및 상태 변경
- **고객 관리 (`/admin/users`)**: 
  - 회원 목록 조회 (권한, 가입일 등)
  - **관리자 메모**: 고객 특이사항(알러지, 단골 여부 등) 기록 (자동 요약 및 더보기 기능)
  - **권한 관리**: 사용자/사장님/관리자 권한 변경
- **대시보드**: 오늘의 예약 현황 한눈에 파악

## 🛠 기술 스택 (Zero-Cost Architecture)

| 분류 | 기술 | 버전 | 특징 |
|------|------|------|------|
| **Core** | Next.js (App Router) | 16.1.1 | 서버/클라이언트 컴포넌트, Turbopack |
| **Language** | TypeScript | 5.x | Strict Mode, Type Safety |
| **Styling** | SCSS Modules | - | 컴포넌트 스코프 스타일링, CSS Variables |
| **Runtime** | Node.js | 22+ | 최신 JS Spec 준수 |
| **Database** | Supabase | - | PostgreSQL, Auth, Realtime, Edge Functions |
| **PWA** | Serwist | 9.x | Service Worker, Cache, Push Notification |
| **Deployment** | Vercel | - | CI/CD, Serverless Hosting |
| **Cron** | GitHub Actions | - | 주기적 작업 실행 (예약 리마인드 등) |

## 📁 프로젝트 구조

```bash
app/
├── admin/                    # 관리자 전용 페이지
│   ├── reservations/         # 예약 상태 관리
│   └── users/                # 사용자 정보 및 메모 관리
├── components/               # 재사용 가능한 UI 컴포넌트
├── login/                    # 로그인 페이지
├── my/                       # 마이 페이지 (내 예약)
├── types/                    # 전역 TypeScript 타입 정의
├── HomeClient.tsx            # 메인 예약 캘린더 (Client)
└── page.tsx                  # 메인 진입점 (Server Data Fetching)

utils/
├── supabase/                 # Supabase 클라이언트 설정
└── push.ts                   # 웹 푸시 알림 로직
```

## ⚡ 퍼포먼스 & 최적화 (Optimization)

이 프로젝트는 **Next.js App Router의 성능을 극대화**하기 위해 다음과 같은 규칙을 엄격히 준수합니다.

1.  **Server-Side Data Fetching**: 모든 초기 데이터 로딩은 `page.tsx` 등 서버 컴포넌트에서 수행하여 클라이언트 번들 사이즈를 줄이고 FCP를 개선합니다.
2.  **Parallel Data Fetching**: `Promise.all`을 사용하여 독립적인 비동기 요청을 병렬로 처리, 폭포수(Waterfall) 형상을 방지합니다.
3.  **Direct DB Query**: 관리자 작업 등에서 불필요한 API 경유 없이 `profiles` 테이블을 직접 조회하여 오버헤드를 제거합니다.
4.  **Optimized UI/UX**:
    *   **Skeleton Loading**: 데이터 로딩 중 스켈레톤 UI를 보여주어 체감 속도 향상.
    *   **Gradient Blur**: 긴 텍스트는 CSS 마스킹 처리하여 깔끔한 UI 유지.

## 🚀 설치 및 실행 방법

### 1. 환경 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정합니다.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

## 📋 컨트리뷰션 가이드 (Rules)

개발 시 `.cursorrules`에 정의된 원칙을 준수해야 합니다.
- **언어**: 모든 주석과 커밋 메시지는 **한국어** 사용.
- **스타일**: Tailwind CSS 금지, **SCSS Modules** 사용.
- **전략**: 모바일 뷰 최우선 개발 후 데스크탑 대응.

## 📄 라이선스
MIT License
