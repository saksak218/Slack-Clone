"use client"

import {
    Bold,
    Code,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    SquareTerminal,
    Strikethrough,
    Underline as UnderlineIcon,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { Toggle } from "./ui/toggle";
import { useEffect, useState } from "react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            forceUpdate({});
        };

        editor.on("transaction", handleUpdate);
        editor.on("selectionUpdate", handleUpdate);
        editor.on("update", handleUpdate);

        return () => {
            editor.off("transaction", handleUpdate);
            editor.off("selectionUpdate", handleUpdate);
            editor.off("update", handleUpdate);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    const options = [
        {
            icon: <Bold className="size-4" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive("bold"),
        },
        {
            icon: <Italic className="size-4" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive("italic"),
        },
        {
            icon: <UnderlineIcon className="size-4" />,
            onClick: () => editor.chain().focus().toggleUnderline().run(),
            pressed: editor.isActive("underline"),
        },
        {
            icon: <Strikethrough className="size-4" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive("strike"),
        },
        {
            icon: <LinkIcon className="size-4" />,
            onClick: () => {
                const previousUrl = editor.getAttributes('link').href
                const url = window.prompt('URL', previousUrl)

                if (url === null) {
                    return
                }

                if (url === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run()
                    return
                }

                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            },
            pressed: editor.isActive("link"),
        },
        {
            icon: <List className="size-4" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered className="size-4" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: editor.isActive("orderedList"),
        },
        {
            icon: <Quote className="size-4" />,
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
            pressed: editor.isActive("blockquote"),
        },
        {
            icon: <Code className="size-4" />,
            onClick: () => editor.chain().focus().toggleCode().run(),
            pressed: editor.isActive("code"),
        },
        {
            icon: <SquareTerminal className="size-4" />,
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            pressed: editor.isActive("codeBlock"),
        },
    ];



    return (
        <div className="flex items-center gap-0.5 p-1 bg-transparent">
            {options.map((option, index) => (
                <Toggle
                    key={index}
                    defaultPressed={false}
                    pressed={option.pressed}
                    onPressedChange={option.onClick}
                    className="data-[state=on]:bg-gray-200 hover:bg-gray-100 h-7 w-7"
                >
                    {option.icon}
                </Toggle>
            ))}
        </div>
    );
}