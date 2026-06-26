'use client';

import * as React from 'react';
import Image from 'next/image';
import { Check, ChevronDown, GripVertical, Users } from 'lucide-react';
import type { Group } from '@/lib/database';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const VISIBLE_TAB_COUNT = 3;

type GroupTabsBarProps = {
  groups: Group[];
  activeGroupId: string;
  onActiveGroupChange: (groupId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function GroupTabAvatar({ group }: { group: Group }) {
  if (group.image?.startsWith('http')) {
    return (
      <Image
        src={group.image}
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-lg object-cover ring-1 ring-border/60"
      />
    );
  }

  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15">
      {group.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function GroupTabButton({
  group,
  isActive,
  isDragging,
  isDropTarget,
  draggable = true,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  group: Group;
  isActive: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDrop: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      title={group.name}
      className={cn(
        'group/tab relative flex w-full min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isActive
          ? 'border-primary/30 bg-gradient-to-br from-primary/12 via-background to-accent/10 shadow-md shadow-primary/10'
          : 'border-transparent bg-background/70 hover:border-border/80 hover:bg-background hover:shadow-sm',
        isDragging && 'scale-[0.98] opacity-50',
        isDropTarget && 'ring-2 ring-primary/35 ring-offset-2 ring-offset-background',
      )}
    >
      {isActive ? (
        <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
      ) : null}
      {draggable ? (
        <GripVertical
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/50 transition-opacity',
            'opacity-0 group-hover/tab:opacity-100',
            isDragging && 'opacity-100',
          )}
          aria-hidden
        />
      ) : null}
      <GroupTabAvatar group={group} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold leading-tight',
            isActive ? 'text-foreground' : 'text-muted-foreground group-hover/tab:text-foreground',
          )}
        >
          {group.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground max-sm:hidden">
          <Users className="size-3 shrink-0" />
          {group.members} members
        </p>
      </div>
    </button>
  );
}

export function GroupTabsBar({
  groups,
  activeGroupId,
  onActiveGroupChange,
  onReorder,
}: GroupTabsBarProps) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  if (groups.length === 0) {
    return null;
  }

  const visibleGroups = groups.slice(0, VISIBLE_TAB_COUNT);
  const overflowGroups = groups.slice(VISIBLE_TAB_COUNT);
  const activeInOverflow = overflowGroups.some((group) => group.id === activeGroupId);
  const activeOverflowGroup = overflowGroups.find((group) => group.id === activeGroupId);

  const handleDragStart = (index: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDrop = (index: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const fromIndex = Number.parseInt(event.dataTransfer.getData('text/plain'), 10);

    if (!Number.isNaN(fromIndex) && fromIndex !== index) {
      onReorder(fromIndex, index);
    }

    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 p-1.5 shadow-inner scrollbar-thin">
        <div className="flex min-w-0 flex-1 gap-1.5 max-sm:min-w-full">
          {visibleGroups.map((group, index) => (
            <div key={group.id} className="min-w-[6.75rem] flex-1 max-sm:shrink-0">
              <GroupTabButton
              group={group}
              isActive={group.id === activeGroupId}
              isDragging={dragIndex === index}
              isDropTarget={dropIndex === index && dragIndex !== index}
              onSelect={() => onActiveGroupChange(group.id)}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              />
            </div>
          ))}

        </div>

        {overflowGroups.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'h-auto min-h-[3.75rem] shrink-0 flex-col gap-1 rounded-xl border-border/70 bg-background/80 px-3 py-2.5 shadow-sm',
                  activeInOverflow && 'border-primary/35 bg-primary/5 text-primary',
                )}
              >
                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  More
                  <ChevronDown className="size-3.5" />
                </span>
                <span className="max-w-[5.5rem] truncate text-sm font-medium">
                  {activeInOverflow && activeOverflowGroup
                    ? activeOverflowGroup.name
                    : `${overflowGroups.length} groups`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Other groups</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {overflowGroups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => onActiveGroupChange(group.id)}
                  className="flex items-center gap-2 py-2.5"
                >
                  <GroupTabAvatar group={group} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.members} members</p>
                  </div>
                  {group.id === activeGroupId ? (
                    <Check className="size-4 shrink-0 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {groups.length > 1 ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Drag tabs to reorder your groups. Top three stay pinned here.
        </p>
      ) : null}
    </div>
  );
}
