import React from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { List, Strikethrough, BoldIcon, ItalicIcon, UnderlineIcon, ListOrdered } from 'lucide-react'
import { Editor } from '@tiptap/react'

interface ToolbarProps {
    editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
    return (
        <div><div className="flex items-center gap-0.5 px-2 py-1 border-b bg-slate-50 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-0.5 shrink-0">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={cn("text-slate-600", editor?.isActive("bold") && "bg-slate-200")}
                >
                    <BoldIcon className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={cn("text-slate-600", editor?.isActive("italic") && "bg-slate-200")}
                >
                    <ItalicIcon className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={cn("text-slate-600", editor?.isActive("underline") && "bg-slate-200")}
                >
                    <UnderlineIcon className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={cn("text-slate-600", editor?.isActive("strike") && "bg-slate-200")}
                >
                    <Strikethrough className="size-4" />
                </Button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={cn("text-slate-600", editor?.isActive("bulletList") && "bg-slate-200")}
                >
                    <List className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={cn("text-slate-600", editor?.isActive("orderedList") && "bg-slate-200")}
                >
                    <ListOrdered className="size-4" />
                </Button>
            </div>
        </div></div>
    )
}

export default Toolbar