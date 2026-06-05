import './ThoughtChain.less';
import { type CSSProperties, type ReactNode } from 'react';
import type { ThoughtChainItem } from '../../types';
export type ThoughtChainSemanticSlot = 'root' | 'item' | 'header' | 'icon' | 'main' | 'title' | 'description' | 'extra' | 'content' | 'footer';
export interface ThoughtChainProps {
    items: ThoughtChainItem[];
    defaultExpandedKeys?: string[];
    expandedKeys?: string[];
    onExpand?: (expandedKeys: string[], info: {
        key: string;
        expanded: boolean;
    }) => void;
    collapsible?: boolean;
    line?: boolean;
    size?: 'sm' | 'md';
    renderContent?: (content: ReactNode, item: ThoughtChainItem, index: number) => ReactNode;
    renderHeader?: (item: ThoughtChainItem, index: number, state: {
        expanded: boolean;
    }) => ReactNode;
    className?: string;
    classNames?: Partial<Record<ThoughtChainSemanticSlot, string>>;
    style?: CSSProperties;
    styles?: Partial<Record<ThoughtChainSemanticSlot, CSSProperties>>;
}
export declare function ThoughtChain({ items, defaultExpandedKeys, expandedKeys, onExpand, collapsible, line, size, renderContent, renderHeader, className, classNames, style, styles, }: ThoughtChainProps): import("react").JSX.Element;
