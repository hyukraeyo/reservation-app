
# 예약 관리 PWA (Mobile-First)

## 📖 프로젝트 개요
이 프로젝트는 **예약 노쇼(No-Show)를 방지**하기 위해 설계된 모바일 최우선 **프로그레시브 웹 앱(PWA)**입니다.  
구매자에게 예약 1시간 전 푸시 알림을 발송하고, 판매자에게는 실시간으로 예약 상태를 공유하는 시스템을 **비용 없이(Zero-Cost)** 구축하는 것을 목표로 합니다.

## 🛠 기술 스택 (Zero-Cost Architecture)
최신 오픈소스와 클라우드 솔루션의 무료 티어를 조합하여 구축되었습니다.

- **Framework**: Next.js 15 (App Router)
- **Styling**: SCSS Modules (No Tailwind CSS) 🎨
- **PWA**: Serwist (Service Worker, Manifest, Push Optimizations) 📱
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime) ⚡️
- **Scheduling**: Upstash QStash (Serverless Job Scheduling) ⏳
- **Deployment**: Vercel 🚀

## 💡 핵심 원칙
1.  **반응형 최우선 (Mobile First)**
    *   모바일 환경(320px ~ 480px)을 기본 디자인 기준으로 삼습니다.
    *   PC나 태블릿 환경은 미디어 쿼리를 통해 확장하여 대응합니다.
    
2.  **비용 제로 (Zero-Cost)**
    *   유료 결제 없이 모든 인프라를 무료 티어 내에서 운영 가능하도록 설계했습니다.

3.  **오프라인 & 성능 최적화**
    *   PWA 표준을 준수하여 앱과 유사한 사용자 경험을 제공합니다.

## 📋 개발 가이드라인 (Agent Rules)
이 프로젝트에 기여하거나 코드를 수정할 때 다음 규칙을 준수해야 합니다.

-   **스타일링**: Tailwind CSS 사용 금지. 반드시 **SCSS Modules**(`*.module.scss`)를 사용합니다.
-   **타입스크립트**: Strict Mode를 유지하며 철저한 타입 안전성을 확보합니다.
-   **컴포넌트 구조**: Next.js의 Server Components를 기본으로 하되, 상호작용이 필요한 경우에만 `'use client'`를 사용합니다.

## 🚀 시작하기

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정해주세요.
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
QSTASH_TOKEN=your_qstash_token
```

### 3. 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.
