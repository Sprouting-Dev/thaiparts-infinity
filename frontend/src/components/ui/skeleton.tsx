import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  const baseClasses = 'animate-pulse rounded-md bg-gray-200';
  const classes = className ? `${baseClasses} ${className}` : baseClasses;
  
  return <div className={classes} {...props} />;
}
