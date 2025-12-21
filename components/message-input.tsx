"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
    Send,
    Plus,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Strikethrough,
    Underline as UnderlineIcon,
    List,
    ListOrdered
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Toolbar from "./toolbar";

interface MessageInputProps {
    placeholder: string;
    onSubmit: (content: string) => void;
    disabled?: boolean;
}

export const MessageInput = ({ placeholder, onSubmit, disabled }: MessageInputProps) => {
    const [isEmpty, setIsEmpty] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
        ],
        immediatelyRender: false,
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-sm focus:outline-none max-w-none min-h-[80px] p-3 text-sm",
            },
        },
        onUpdate: ({ editor }) => {
            setIsEmpty(editor.isEmpty);
        },
    });

    const handleSend = () => {
        if (editor && !isEmpty) {
            onSubmit(editor.getHTML());
            editor.commands.clearContent();
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="px-5 pb-5 w-full">
            <div className="flex flex-col border border-slate-300 rounded-md focus-within:border-slate-400 focus-within:shadow-sm transition-all bg-white overflow-hidden">
                {/* Toolbar */}
                <Toolbar editor={editor} />
                <EditorContent
                    editor={editor}
                    className="w-full"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <div className="flex items-center justify-between px-2 pb-2 mt-auto">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={disabled}
                            className="text-slate-500 hover:bg-slate-100"
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    <Button
                        size="icon-sm"
                        disabled={disabled || isEmpty}
                        onClick={handleSend}
                        className="bg-[#007a5a] hover:bg-[#007a5a]/90 text-white"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
            </div>
            <div className="pt-2 flex justify-end">
                <span className="text-[10px] text-muted-foreground mr-1">
                    <b>Return</b> to send
                </span>
            </div>
        </div>
    );
};
