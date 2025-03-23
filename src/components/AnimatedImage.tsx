
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  delay?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'pulse-soft' | 'float';
  duration?: number;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  className,
  delay = 0,
  animation = 'fade-in',
  duration = 0.5,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const imageStyle = isInView
    ? {
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        className={cn(
          "w-full h-auto object-cover",
          isInView && isLoaded && `animate-${animation}`
        )}
        style={{
          ...imageStyle,
          animationDelay: `${delay}s`,
        }}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  );
};

export default AnimatedImage;
