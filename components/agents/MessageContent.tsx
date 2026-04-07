"use client";

import { memo } from "react";

function parseContent(content: string): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;

  function nextKey(): string {
    return `msg-${keyCounter++}`;
  }

  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.match(/^###\s+/)) {
      elements.push(
        <h3 key={nextKey()} className="mt-4 mb-2 text-[15px] font-semibold text-black/90">
          {line.replace(/^###\s+/, "")}
        </h3>
      );
      i++;
      continue;
    }

    if (line.match(/^##\s+/)) {
      elements.push(
        <h2 key={nextKey()} className="mt-5 mb-2 text-[17px] font-semibold text-black/90">
          {line.replace(/^##\s+/, "")}
        </h2>
      );
      i++;
      continue;
    }

    if (line.match(/^#\s+/)) {
      elements.push(
        <h1 key={nextKey()} className="mt-5 mb-2 text-[19px] font-bold text-black">
          {line.replace(/^#\s+/, "")}
        </h1>
      );
      i++;
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\)[\s •]+(.+)/);
    if (numberedMatch) {
      const items: React.ReactNode[] = [];
      while (i < lines.length) {
        const match = lines[i].match(/^(\d+)\)[\s •]+(.+)/);
        if (match) {
          items.push(
            <div key={nextKey()} className="flex items-start gap-2 py-1">
              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#171819] text-[10px] font-medium text-white">
                {match[1]}
              </span>
              <span className="text-[13px] leading-[1.6] text-black/80">
                {parseInline(match[2])}
              </span>
            </div>
          );
          i++;
        } else if (lines[i].match(/^\s*$/)) {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(<div key={nextKey()}>{items}</div>);
      continue;
    }

    const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
    if (bulletMatch) {
      const items: React.ReactNode[] = [];
      while (i < lines.length) {
        const match = lines[i].match(/^[•\-\*]\s+(.+)/);
        if (match) {
          items.push(
            <div key={nextKey()} className="flex items-start gap-2 py-1">
              <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-[#171819]" />
              <span className="text-[13px] leading-[1.6] text-black/80">
                {parseInline(match[1])}
              </span>
            </div>
          );
          i++;
        } else if (lines[i].match(/^\s*$/)) {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(<div key={nextKey()}>{items}</div>);
      continue;
    }

    if (line.match(/^```/)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```/)) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={nextKey()}
          className="my-3 overflow-x-auto rounded-lg bg-[#171819] px-4 py-3 text-[12px] leading-[1.5] text-gray-200 font-mono"
        >
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    if (line.trim()) {
      elements.push(
        <p
          key={nextKey()}
          className="text-[13px] leading-[1.65] text-black/80 sm:text-[14px] sm:leading-[1.7]"
        >
          {parseInline(line)}
        </p>
      );
    } else {
      elements.push(<div key={nextKey()} className="h-2" />);
    }
    i++;
  }

  return elements;
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partId = 0;

  while (remaining) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={`inline-${partId++}`} className="font-semibold text-black">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(
        <em key={`inline-${partId++}`} className="italic text-black/70">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={`inline-${partId++}`}
          className="rounded bg-[#171819]/8 px-1.5 py-0.5 text-[12px] font-mono text-[#171819]/80"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={`inline-${partId++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-700"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const emojiMatch = remaining.match(/^(💰|✅|❌|⚠️|📊|🚀|💡|🔔|📈|📉|🔒|🔓|💎|🔥|⭐|✨|🎯|💸|🏦|📋)/);
    if (emojiMatch) {
      parts.push(<span key={`inline-${partId++}`}>{emojiMatch[1]}</span>);
      remaining = remaining.slice(emojiMatch[0].length);
      continue;
    }

    const match = remaining.match(/^([^*`\[]+)/);
    if (match) {
      parts.push(match[1]);
      remaining = remaining.slice(match[0].length);
    } else {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return parts;
}

export const MessageContent = memo(function MessageContent({
  content,
}: {
  content: string;
}) {
  return <div className="space-y-0.5">{parseContent(content)}</div>;
});
