'use client';

import React from 'react';
import { RubySegment } from '@/lib/koto-data';

interface RubyTextProps {
  segments: RubySegment[];
  highlightParticle?: string;
  className?: string;
  rtClassName?: string;
}

export function RubyText({
  segments,
  highlightParticle,
  className = '',
  rtClassName = 'font-sans text-outline font-normal',
}: RubyTextProps) {
  const plainLabel = segments.map((s) => s.text).join('');
  const hasRuby = segments.some((s) => Boolean(s.rt));

  return (
    <span
      aria-label={plainLabel}
      className={`${hasRuby ? 'koto-editorial-text inline-block' : ''} ${className}`.trim()}
    >
      <span aria-hidden="true">
        {segments.map((seg, i) => {
          const isHighlighted = highlightParticle && seg.text === highlightParticle;
          if (seg.rt) {
            return (
              <ruby key={i} className={isHighlighted ? 'text-primary font-bold' : ''}>
                {seg.text}
                <rt className={rtClassName}>{seg.rt}</rt>
              </ruby>
            );
          }
          if (
            highlightParticle &&
            seg.text.includes(highlightParticle) &&
            seg.text !== highlightParticle
          ) {
            const parts = seg.text.split(highlightParticle);
            return (
              <React.Fragment key={i}>
                {parts.map((part, pIdx) => (
                  <React.Fragment key={pIdx}>
                    {part}
                    {pIdx < parts.length - 1 && (
                      <span className="text-primary font-bold underline decoration-primary/40 underline-offset-4">
                        {highlightParticle}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          }
          return (
            <span
              key={i}
              className={
                isHighlighted
                  ? 'text-primary font-bold underline decoration-primary/40 underline-offset-4'
                  : ''
              }
            >
              {seg.text}
            </span>
          );
        })}
      </span>
    </span>
  );
}
