import LoadingSpinner from './LoadingSpinner';

interface LoadingPageProps {
    className?: string;
    style?: React.CSSProperties;
}

export default function LoadingPage({ className, style }: LoadingPageProps) {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh', // 기본값, 필요시 style prop으로 오버라이드 가능
                width: '100%',
                backgroundColor: 'var(--bg-color)', // 기본 배경, 투명이 필요하면 style로 오버라이드
                ...style,
            }}
        >
            <LoadingSpinner size="large" />
        </div>
    );
}
