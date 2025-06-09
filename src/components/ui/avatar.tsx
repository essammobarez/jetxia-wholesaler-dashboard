import React from "react";

export function Avatar({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function AvatarImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} {...props} />;
}

export function AvatarFallback({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}
