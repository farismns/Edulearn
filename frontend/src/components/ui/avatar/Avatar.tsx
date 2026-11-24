"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const showImage = Boolean(src) && !imageError;

  return (
    <div
      className={`
        inline-flex shrink-0 items-center justify-center
        overflow-hidden rounded-full bg-surface-secondary
        font-semibold text-secondary-text
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          sizes={`${imageSizes[size]}px`}
          onError={() => setImageError(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-label={name}>{initials || "?"}</span>
      )}
    </div>
  );
}
