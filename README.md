# 예약 관리 PWA (Mobile-First)

## 📖 프로젝트 개요
이 프로젝트는 **예약 노쇼(No-Show)를 방지**하기 위해 설계된 모바일 최우선 **프로그레시브 웹 앱(PWA)**입니다.  
구매자에게 예약 1시간 전 푸시 알림을 발송하고, 판매자에게는 실시간으로 예약 상태를 공유하는 시스템을 **비용 없이(Zero-Cost)** 구축하는 것을 목표로 합니다.

## 🛠 기술 스택 (Zero-Cost Architecture)
최신 오픈소스와 클라우드 솔루션의 무료 티어를 조합하여 구축되었습니다.

| 분류 | 기술 | 용도 |
|------|------|------|
| **Framework** | Next.js 16 (App Router, Turbopack) | 서버/클라이언트 렌더링 |
| **Runtime** | Node.js 22+ | 최신 ECMAScript 지원 |
| **Styling** | SCSS Modules | 컴포넌트 기반 스타일링 |
| **PWA** | Serwist 9 | Service Worker, Push 알림 |
| **Database** | Supabase (PostgreSQL) | 데이터베이스, 인증, 실시간 |
| **Scheduling** | Upstash QStash | 서버리스 예약 알림 |
| **Deployment** | Vercel | CI/CD 및 호스팅 |

## 👥 사용자 역할 및 권한

| 역할 | 권한 |
|------|------|
| **user** (기본) | 예약 생성, 본인 예약 알림 수신 |
| **owner** (사장님) | 예약 관리 (승인/취소), 새 예약 알림 수신 |
| **admin** (관리자) | 모든 권한 + 사용자 역할 변경 |

> ⚠️ **중요**: 사용자 역할 변경은 `admin` 계정만 가능합니다.

## 📁 프로젝트 구조

```
app/
├── admin/                    # 관리자 대시보드
│   ├── page.tsx              # 데이터 로딩 (Server Component)
│   ├── loading.tsx           # 스켈레톤 로딩 UI
│   ├── AdminDashboard.tsx    # 렌더링 컴포넌트
│   ├── LiveReservationList.tsx # 실시간 업데이트 (Client)
│   ├── reservations/         # 예약 관리
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── users/                # 사용자 관리 (admin 전용)
│       ├── page.tsx
│       └── loading.tsx
├── my/                       # 내 예약 페이지
│   ├── page.tsx
│   └── loading.tsx
├── components/               # 공용 컴포넌트
│   ├── Card.tsx
│   ├── Skeleton.tsx          # 스켈레톤 컴포넌트
│   └── ThemeToggle.tsx
├── types/                    # TypeScript 타입 정의
├── page.tsx                  # 메인 페이지 (데이터 로딩)
├── loading.tsx               # 메인 로딩 UI
├── HomeClient.tsx            # 메인 예약 화면
└── layout.tsx                # 루트 레이아웃

utils/
├── push.ts                   # 웹 푸시 알림 유틸
└── supabase/                 # Supabase 클라이언트
```

## ⚡ 성능 최적화 패턴 (Next.js App Router)

### 1. 데이터 로딩은 `page.tsx`에서

Next.js 공식 권장 패턴에 따라, **데이터 호출은 `page.tsx` (최상위 서버 컴포넌트)**에서 수행합니다.

```
# 올바른 패턴
page.tsx (데이터 로딩)
    ↓ props 전달
Component.tsx (렌더링만 담당)

# 잘못된 패턴 ❌
page.tsx → Component.tsx (내부에서 데이터 로딩)
```

### 2. 병렬 데이터 로딩 (`Promise.all`)

독립적인 데이터는 순차 호출 대신 **병렬 호출**로 로딩 시간을 단축합니다.

```typescript
// ✅ 올바른 패턴 - 병렬 로딩
const [reservations, profile] = await Promise.all([
  getReservations(),
  getProfile(),
]);

// ❌ 잘못된 패턴 - 순차 로딩 (Waterfall)
const reservations = await getReservations();
const profile = await getProfile();
```

### 3. `loading.tsx`로 즉각 로딩 UI 제공

각 라우트 폴더에 `loading.tsx`를 배치하면 Next.js가 자동으로 Suspense 경계를 생성합니다.

```
app/
├── admin/
│   ├── page.tsx        # 데이터 로딩
│   ├── loading.tsx     # 스켈레톤 UI
│   └── AdminDashboard.tsx  # 렌더링
```

### 4. Server/Client 컴포넌트 분리

- **Server Component**: 데이터 로딩, 정적 UI
- **Client Component**: 실시간 업데이트, 이벤트 핸들링

```typescript
// page.tsx (Server) - 초기 데이터 로딩
export default async function Page() {
  const data = await getData();
  return <ClientComponent initialData={data} />;
}

// ClientComponent.tsx - 실시간 업데이트만 담당
'use client'
export default function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  // 실시간 구독 로직...
}
```


## 🚀 시작하기

### 1. 요구사항
- **Node.js 22 이상** (ESLint 9 호환)
- npm 또는 yarn

### 2. 설치
```bash
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Scheduled Notifications
QSTASH_TOKEN=your_qstash_token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 프로덕션 빌드
```bash
npm run build
npm start
```

## 💡 핵심 원칙

### 1. 모바일 우선 (Mobile First)
- 320px ~ 480px 기준 설계
- PC/태블릿은 미디어 쿼리로 확장

### 2. 비용 제로 (Zero-Cost)
- 모든 인프라 무료 티어 운영

### 3. 타입 안전성 (Type Safety)
- TypeScript Strict Mode
- `any` 타입 사용 금지

### 4. 한국어 환경
- 모든 UI 텍스트 한글
- 코드 주석 한글

## 📋 개발 가이드라인

### 스타일링
- ❌ Tailwind CSS 사용 금지
- ✅ SCSS Modules (`*.module.scss`) 사용

### 컴포넌트
- Server Components 기본
- 상호작용이 필요할 때만 `'use client'`
- 공용 컴포넌트는 `app/components/`에 배치

### 성능 (CRITICAL)
- **데이터 로딩은 `page.tsx`에서** - 하위 컴포넌트는 props로만 수신
- **`Promise.all()` 활용** - 독립적 데이터는 병렬 로딩
- **`loading.tsx` 필수** - 각 라우트에 스켈레톤 UI 제공

### 타입
- `any` 대신 적절한 타입 명시
- 공용 타입은 `app/types/`에 정의

### 린팅
```bash
npm run lint
```

## 📄 라이선스
MIT License
