
import type { SVGProps } from "react";

interface CodeConnectLogoProps extends SVGProps<SVGSVGElement> {
  isLoading?: boolean;
}

export function CodeConnectLogo({ isLoading = false, className = "", ...props }: CodeConnectLogoProps) {
  if (isLoading) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`animate-spin ${className}`}
        {...props}
      >
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
      <path d="M10 13l-2 2l2 2" />
      <path d="M14 13l2 2l-2 2" />
      <path d="M12 12v-2" />
      <path d="M12 17v-1" />
      <path d="M10 10h4" />
    </svg>
  );
}
