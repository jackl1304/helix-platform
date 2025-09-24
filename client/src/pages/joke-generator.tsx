import React from 'react';
import { JokeGenerator } from '@/components/JokeGenerator';

export default function JokeGeneratorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Random Joke Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Take a break and enjoy some humor! Get random jokes from our collection and share a laugh.
        </p>
      </div>
      
      <JokeGenerator />
    </div>
  );
}