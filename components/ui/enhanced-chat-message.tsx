"use client"

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/lib/chat-storage';
import { MarketChartData } from '@/lib/types';
import { MarketAlphaChart } from '@/components/ui/market-alpha-chart';
import Image from 'next/image';

// Format message content for clean display
const formatMessageContent = (content: string) => {
  return content
    // Remove markdown bold markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Convert bullet points to numbered lists or simple dashes
    .replace(/^[•*]\s/gm, '- ');
};

interface EnhancedChatMessageProps {
  message: ChatMessageType;
  agentType: 'copilot' | 'market-insights';
  className?: string;
  chartData?: MarketChartData;
}

export function EnhancedChatMessage({ 
  message, 
  agentType, 
  className, 
  chartData 
}: EnhancedChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const isUser = message.role === 'user';

  if (isUser) {
    // User message bubble
    return (
      <div className={cn(
        "group flex justify-end px-4 py-2",
        className
      )}>
        <div className="relative max-w-[70%] sm:max-w-[60%]">
          <div className="bg-gray-800 text-white rounded-2xl px-4 py-3 shadow-sm">
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {formatMessageContent(message.content)}
            </div>
          </div>
          
          {/* Copy button */}
          <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message bubble with optional chart
  return (
    <div className={cn(
      "group flex gap-3 px-4 py-2",
      className
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center mt-1">
        <Image 
          src="/logo.png" 
          alt="Aelys Logo" 
          width={14} 
          height={14} 
          className="w-3.5 h-3.5" 
        />
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0 relative max-w-full">
        {/* Text Message */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            <SimpleFormattedContent content={message.content} />
          </div>
        </div>

        {/* Chart Data - Full width */}
        {chartData && (
          <div className="mt-4 w-full">
            <MarketAlphaChart 
              chartData={chartData} 
              title="Market Alpha Trends" 
              description="Real-time NFT market data visualization"
            />
          </div>
        )}
        
        {/* Copy button */}
        <div className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple formatted content component
function SimpleFormattedContent({ content }: { content: string }) {
  const formattedContent = formatMessageContent(content);
  
  // Split content into lines and handle numbered lists
  const lines = formattedContent.split('\n').filter(line => line.trim());
  let currentNumber = 1;
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Handle numbered list items (starting with number or dash)
        if (trimmedLine.match(/^\d+\.|^-\s/)) {
          const isNumbered = trimmedLine.match(/^\d+\./);
          const content = isNumbered 
            ? trimmedLine.replace(/^\d+\.\s*/, '')
            : trimmedLine.replace(/^-\s*/, '');
          
          const number = isNumbered ? trimmedLine.match(/^(\d+)/)?.[1] : currentNumber;
          if (!isNumbered) currentNumber++;
          
          return (
            <div key={index} className="flex items-start gap-2">
              <span className="font-medium text-foreground flex-shrink-0 mt-0.5">{number}.</span>
              <span className="flex-1 leading-normal">{content}</span>
            </div>
          );
        }
        
        // Handle section headers (lines ending with :)
        if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
          return (
            <div key={index} className="font-medium text-foreground mt-3 first:mt-0">
              {trimmedLine.replace(':', '')}
            </div>
          );
        }
        
        // Regular paragraphs
        if (trimmedLine) {
          return (
            <div key={index} className="text-foreground leading-normal">
              {trimmedLine}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}
