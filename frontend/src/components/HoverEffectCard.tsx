import { Card, CardProps } from '@heroui/react';
import React from 'react';

interface HoverEffectCardProps extends CardProps {
    children: React.ReactNode;
    maxXRotation?: number;
    maxYRotation?: number;
    lightClassName?: string;
    lightStyle?: React.CSSProperties;
}

export default function HoverEffectCard({
    children,
    maxXRotation = 4,
    maxYRotation = 4,
    className,
    style,
    lightClassName,
    lightStyle,
    ...props
}: HoverEffectCardProps) {
    const cardRef = React.useRef<HTMLDivElement | null>(null);
    const [showLight, setShowLight] = React.useState(false);
    const [pos, setPos] = React.useState({ left: 0, top: 0 });

    return (
        <Card
            {...props}
            ref={cardRef}
            className={`relative overflow-hidden ${className || ''}`}
            style={{
                willChange: 'transform',
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                ...style
            }}
            onMouseEnter={() => {
                if (cardRef.current) cardRef.current.style.transition = 'transform 0.25s ease-out';
            }}
            onMouseLeave={() => {
                setShowLight(false);
                if (cardRef.current) {
                    cardRef.current.style.transition = 'transform 0.45s ease';
                    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                }
            }}
            onMouseMove={(e) => {
                if (!cardRef.current) return;

                setShowLight(true);
                const rect = cardRef.current.getBoundingClientRect();
                const offsetX = e.clientX - rect.x;
                const offsetY = e.clientY - rect.y;

                const lightWidth = parseInt(lightStyle?.width?.toString() || '140', 10);
                const lightHeight = parseInt(lightStyle?.height?.toString() || '140', 10);

                setPos({
                    left: offsetX - lightWidth / 2,
                    top: offsetY - lightHeight / 2
                });

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((offsetY - centerY) / centerY) * maxXRotation;
                const rotateY = -((offsetX - centerX) / centerX) * maxYRotation;

                cardRef.current.style.transition = 'transform 0.08s linear';
                cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }}
        >
            <div
                className={`${showLight ? 'opacity-100' : 'opacity-0'} absolute h-[150px] w-[150px] rounded-full bg-gradient-to-r from-primary/60 to-secondary/60 blur-[90px] transition-opacity duration-300 pointer-events-none ${lightClassName || ''}`}
                style={{ ...pos, ...lightStyle, zIndex: 0 }}
            />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </Card>
    );
}
