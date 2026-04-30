import './ThoughtChain.less';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { ThoughtChainItem } from '../../types';

export type ThoughtChainSemanticSlot =
  | 'root'
  | 'item'
  | 'header'
  | 'icon'
  | 'main'
  | 'title'
  | 'description'
  | 'extra'
  | 'content'
  | 'footer';

export interface ThoughtChainProps {
  items: ThoughtChainItem[];
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpand?: (expandedKeys: string[], info: { key: string; expanded: boolean }) => void;
  collapsible?: boolean;
  line?: boolean;
  size?: 'sm' | 'md';
  renderContent?: (content: ReactNode, item: ThoughtChainItem, index: number) => ReactNode;
  renderHeader?: (item: ThoughtChainItem, index: number, state: { expanded: boolean }) => ReactNode;
  className?: string;
  classNames?: Partial<Record<ThoughtChainSemanticSlot, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<ThoughtChainSemanticSlot, CSSProperties>>;
}

function uniq(keys: string[]): string[] {
  return Array.from(new Set(keys));
}

function formatDuration(durationMs?: number): string | null {
  if (durationMs == null) return null;
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function ThoughtChain({
  items,
  defaultExpandedKeys,
  expandedKeys,
  onExpand,
  collapsible = true,
  line = true,
  size = 'md',
  renderContent,
  renderHeader,
  className,
  classNames,
  style,
  styles,
}: ThoughtChainProps) {
  const fallbackExpandedKeys = useMemo(() => {
    if (defaultExpandedKeys) return defaultExpandedKeys;
    return items.filter((item) => item.status === 'running').map((item) => item.key);
  }, [defaultExpandedKeys, items]);

  const [innerExpandedKeys, setInnerExpandedKeys] = useState<string[]>(fallbackExpandedKeys);
  const mergedExpandedKeys = expandedKeys ?? innerExpandedKeys;
  const expandedSet = useMemo(() => new Set(mergedExpandedKeys), [mergedExpandedKeys]);

  const toggleItem = (item: ThoughtChainItem) => {
    const itemCollapsible = item.collapsible ?? collapsible;
    if (!itemCollapsible || item.disabled) return;

    const expanded = !expandedSet.has(item.key);
    const nextKeys = expanded
      ? uniq([...mergedExpandedKeys, item.key])
      : mergedExpandedKeys.filter((key) => key !== item.key);

    if (expandedKeys == null) {
      setInnerExpandedKeys(nextKeys);
    }
    onExpand?.(nextKeys, { key: item.key, expanded });
  };

  return (
    <div
      className={cx(
        'chat-ui-thought-chain',
        `chat-ui-thought-chain-${size}`,
        line && 'has-line',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {items.map((item, index) => {
        const expanded = expandedSet.has(item.key);
        const itemCollapsible = item.collapsible ?? collapsible;
        const hasContent = item.content != null;
        const canToggle = itemCollapsible && hasContent && !item.disabled;
        const durationLabel = formatDuration(item.durationMs);
        const status = item.status ?? 'success';

        return (
          <section
            key={item.key}
            className={cx(
              'chat-ui-thought-chain-item',
              `is-${status}`,
              expanded && 'is-expanded',
              itemCollapsible && hasContent && !item.disabled && 'is-collapsible',
              item.disabled && 'is-disabled',
              item.className,
              classNames?.item,
            )}
            style={styles?.item}
          >
            <div
              className={cx('chat-ui-thought-chain-header', classNames?.header)}
              style={styles?.header}
              role={canToggle ? 'button' : undefined}
              tabIndex={canToggle ? 0 : undefined}
              aria-expanded={canToggle ? expanded : undefined}
              aria-disabled={item.disabled ? true : undefined}
              onClick={() => toggleItem(item)}
              onKeyDown={(event) => {
                if (!canToggle) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleItem(item);
                }
              }}
            >
              <span className={cx('chat-ui-thought-chain-icon', classNames?.icon)} style={styles?.icon}>
                {item.icon ?? <span className="chat-ui-thought-chain-status-dot" />}
              </span>
              <span className={cx('chat-ui-thought-chain-main', classNames?.main)} style={styles?.main}>
                {renderHeader ? (
                  renderHeader(item, index, { expanded })
                ) : (
                  <>
                    <span className={cx('chat-ui-thought-chain-title', classNames?.title)} style={styles?.title}>
                      {item.title ?? 'Thought'}
                    </span>
                    {(item.description || durationLabel) && (
                      <span
                        className={cx('chat-ui-thought-chain-description', classNames?.description)}
                        style={styles?.description}
                      >
                        {item.description}
                        {item.description && durationLabel ? ' · ' : null}
                        {durationLabel}
                      </span>
                    )}
                  </>
                )}
              </span>
              {item.extra && (
                <span className={cx('chat-ui-thought-chain-extra', classNames?.extra)} style={styles?.extra}>
                  {item.extra}
                </span>
              )}
              {itemCollapsible && hasContent && (
                <span className="chat-ui-thought-chain-arrow" aria-hidden="true">
                  {expanded ? 'v' : '>'}
                </span>
              )}
            </div>
            {hasContent && expanded && (
              <div className={cx('chat-ui-thought-chain-content', classNames?.content)} style={styles?.content}>
                {renderContent ? renderContent(item.content, item, index) : item.content}
              </div>
            )}
            {item.footer && (
              <div className={cx('chat-ui-thought-chain-footer', classNames?.footer)} style={styles?.footer}>
                {item.footer}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
