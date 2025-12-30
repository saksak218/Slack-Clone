"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface MentionListProps {
    items: any[];
    command: (item: any) => void;
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item.sessionId, label: item.name });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden min-w-[200px] z-50">
            {props.items.length ? (
                <div className="p-1">
                    {props.items.map((item, index) => (
                        <button
                            key={item._id}
                            onClick={() => selectItem(index)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded transition-colors",
                                index === selectedIndex ? "bg-sky-600 text-white" : "hover:bg-gray-100 text-gray-900"
                            )}
                        >
                            <Avatar className="size-6 rounded">
                                <AvatarImage src={item.image} className="rounded" />
                                <AvatarFallback className={cn(
                                    "rounded text-white text-[10px] font-semibold",
                                    index === selectedIndex ? "bg-white/20" : "bg-sky-500"
                                )}>
                                    {item.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate flex-1 text-left">{item.name}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-2 text-sm text-gray-500 text-center">No results</div>
            )}
        </div>
    );
});

MentionList.displayName = 'MentionList';
