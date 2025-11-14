'use client'

import { Sparkles } from 'lucide-react';

const suggestedPrompts = [
  'Write a blog post about artificial intelligence',
  'Create a video script for a product launch',
  'Generate social media content for a campaign',
  'Help me brainstorm ideas for content',
  'Create an email newsletter template',
  'Write a press release announcement',
];

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export default function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Content Creation AI
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-10">
          Start creating amazing content with AI. Ask me anything!
        </p>

        {/* Suggested Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


