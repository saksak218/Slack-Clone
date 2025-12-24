"use client"

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React from 'react';
import { Bold, ChevronDown, Plus, SendHorizonal } from 'lucide-react';
import { Button } from './ui/button';
import MenuBar from './menu-bar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from "@tiptap/extension-highlight"

interface MessageInputProps {
    placeholder?: string;
    onSubmit?: (content: string) => void;
}

const MessageInput = ({ placeholder = "Message", onSubmit }: MessageInputProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc ml-3",
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: "list-decimal ml-3",
                    },
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Highlight,
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[44px] max-h-[200px] overflow-y-auto border-none focus:outline-none focus:border-none focus:ring-0 px-3 py-2 text-sm [&_p]:!m-0 [&_li]:!m-0 [&_li]:!p-0 [&_ul]:!my-0 [&_ol]:!my-0 [&_li>p]:!m-0 [&_li>p]:!leading-normal"
            },

        }
    });

    const handleSubmit = () => {
        if (!editor) return;
        const content = editor.getHTML();
        if (content.trim() && onSubmit) {
            onSubmit(content);
            editor.commands.clearContent();
        }
    };

    React.useEffect(() => {
        if (!editor) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (event.shiftKey) {
                    // If we can split a list item (meaning we are in a list), do that instead of a hard break
                    if (editor.can().splitListItem('listItem')) {
                        event.preventDefault();
                        editor.chain().focus().splitListItem('listItem').run();
                    }
                    // Otherwise let default behavior happen (e.g. standard hard break)
                } else {
                    // Submit on Enter without Shift
                    event.preventDefault();
                    handleSubmit();
                }
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('keydown', handleKeyDown);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor, onSubmit]);

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <div className="bg-white rounded-[10px] border border-b-none border-gray-300 shadow-sm">
                <div >
                    <MenuBar editor={editor} />
                </div>
                <EditorContent editor={editor} />
                <div className="flex items-center justify-between px-3 py-2 ">
                    <div className="flex items-center gap-2 text-gray-600">
                        <button className="bg-gray-100 p-1.5 rounded-full transition-colors">
                            <span className=""><Plus size={18} /></span>
                        </button>
                        <button className="hover:bg-gray-200 p-1.5 rounded transition-colors">
                            <span className="text-lg">😊</span>
                        </button>
                        <button className="hover:bg-gray-100 p-1.5 rounded transition-colors">
                            <span className="text-lg">@</span>
                        </button>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-700 hover:bg-green-700 flex items-center gap-x-2 text-white  h-7 px-2 py-1 rounded text-sm font-medium transition-colors"
                    >

                        <SendHorizonal size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;