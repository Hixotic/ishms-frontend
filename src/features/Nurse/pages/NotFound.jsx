import React from "react";
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">Sorry, the page you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Home size={20} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
