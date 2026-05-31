"use client";

import { useState, useEffect } from "react";
import { getRecentActivity, type ActivityFeedItem } from "@/lib/social-proof";

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setItems(getRecentActivity(5));
    // Trigger fade-in after mount
    const fadeTimer = setTimeout(() => setVisible(true), 50);

    // Refresh every hour to match the hourly key
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setItems(getRecentActivity(5));
        setVisible(true);
      }, 200);
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="card-f-static p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Recent activity
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex items-baseline gap-2 text-xs text-text-secondary transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(4px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1">
              {item.text}
              <span className="mono-f ml-1.5 text-[10px] text-text-secondary/60">
                {item.timeAgo}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
