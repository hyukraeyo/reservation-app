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
├── admin/              # 관리자 대시보드
│   ├── AdminDashboard.tsx  # 통합 관리 화면
│   ├── reservations/   # 예약 관리
│   └── users/          # 사용자 관리 (admin 전용)
├── components/         # 공용 컴포넌트
│   ├── Card.tsx
│   └── ThemeToggle.tsx
├── types/              # TypeScript 타입 정의
├── HomeClient.tsx      # 메인 예약 화면
└── layout.tsx          # 루트 레이아웃

utils/
├── push.ts             # 웹 푸시 알림 유틸
└── supabase/           # Supabase 클라이언트
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

### 타입
- `any` 대신 적절한 타입 명시
- 공용 타입은 `app/types/`에 정의

### 린팅
```bash
npm run lint
```

## 📄 라이선스
MIT License
