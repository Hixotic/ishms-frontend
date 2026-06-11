import React from 'react';
import {
  SkeletonDashboard,
  SkeletonGrid,
  SkeletonList,
  FullPageLoader,
} from './Loading';

export const PageLoader = ({
  isLoading,
  children,
  type = 'dashboard',
  message = 'Loading...',
}) => {
  // If not loading, show content with fade-in animation
  if (!isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        {children}
      </div>
    );
  }

  // Show appropriate skeleton based on type
  switch (type) {
    case 'dashboard':
      return <SkeletonDashboard />;
    case 'grid':
      return <SkeletonGrid count={6} columns={3} />;
    case 'list':
      return <SkeletonList count={5} />;
    case 'fullpage':
      return <FullPageLoader message={message} />;
    default:
      return <SkeletonDashboard />;
  }
};

export default PageLoader;
