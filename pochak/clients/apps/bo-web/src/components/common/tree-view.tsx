"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  enableDragPlaceholder?: boolean;
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  enableDragPlaceholder?: boolean;
}

function TreeNodeItem({
  node,
  level,
  selectedId,
  onSelect,
  enableDragPlaceholder,
}: TreeNodeItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelect = () => {
    onSelect?.(node);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100",
          isSelected && "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {enableDragPlaceholder && (
          <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-gray-300 opacity-0 group-hover:opacity-100" />
        )}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-gray-200"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        {node.icon && <span className="shrink-0">{node.icon}</span>}
        <button
          className="flex-1 truncate text-left"
          onClick={handleSelect}
        >
          {node.label}
        </button>
      </div>
      {hasChildren && expanded && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              enableDragPlaceholder={enableDragPlaceholder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({
  data,
  selectedId,
  onSelect,
  enableDragPlaceholder = false,
  className,
}: TreeViewProps) {
  return (
    <div
      role="tree"
      className={cn("rounded-md border border-gray-200 bg-white p-2", className)}
    >
      {data.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">항목이 없습니다.</p>
      ) : (
        data.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            selectedId={selectedId}
            onSelect={onSelect}
            enableDragPlaceholder={enableDragPlaceholder}
          />
        ))
      )}
    </div>
  );
}
