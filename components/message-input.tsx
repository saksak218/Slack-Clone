"use client"

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import { Plus, SendHorizonal } from 'lucide-react';
import MenuBar from './menu-bar';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "./ui/form"

const formSchema = z.object({
    message: z.string().min(1, {
        message: "Message cannot be empty.",
    }),
})

interface MessageInputProps {
    placeholder?: string;
    onSubmit?: (content: string) => void;
}

const MessageInput = ({ placeholder = "Message", onSubmit }: MessageInputProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    })

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
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[44px] max-h-[200px] overflow-y-auto border-none focus:outline-none focus:border-none focus:ring-0 text-sm text-gray-900 [&_p]:!m-0 [&_p]:leading-relaxed [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-gray-400 [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-gray-400 [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none [&_li]:!m-0 [&_li]:!p-0 [&_ul]:!my-0 [&_ol]:!my-0 [&_li>p]:!m-0 [&_li>p]:!leading-normal [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-[rgba(29,28,29,0.08)] [&_code]:text-[#e01e5a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_pre]:bg-[#f8f8f8] [&_pre]:border [&_pre]:border-[#e0e0e0] [&_pre]:text-[#1d1c1d] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:my-2 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 [&_u]:underline"
            },
        },
        onUpdate: ({ editor }) => {
            const value = editor.isEmpty ? "" : editor.getHTML();
            form.setValue("message", value, { shouldValidate: true });
        }
    });

    const onSubmitHandler = React.useCallback((values: z.infer<typeof formSchema>) => {
        if (onSubmit) {
            onSubmit(values.message);
            form.reset();
            editor?.commands.clearContent();
        }
    }, [onSubmit, form, editor]);

    React.useEffect(() => {
        if (!editor) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                const isMobile = window.matchMedia("(max-width: 768px)").matches;

                if (event.shiftKey) {
                    // If we can split a list item (meaning we are in a list), do that instead of a hard break
                    if (editor.can().splitListItem('listItem')) {
                        event.preventDefault();
                        editor.chain().focus().splitListItem('listItem').run();
                    }
                    // Otherwise let default behavior happen (e.g. standard hard break)
                } else {
                    if (isMobile) {
                        return;
                    }
                    // Submit on Enter without Shift
                    event.preventDefault();
                    form.handleSubmit(onSubmitHandler)();
                }
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('keydown', handleKeyDown);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor, form, onSubmitHandler]);

    return (
        <div className="w-full px-4 py-3">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitHandler)}>
                    <div className="bg-white rounded-lg focus-within:border-[#1164A3] focus-within:shadow-md transition-all">
                        <div className="border-b border-gray-200">
                            <MenuBar editor={editor} />
                        </div>
                        <FormField
                            control={form.control}
                            name="message"
                            render={() => (
                                <FormItem>
                                    <FormControl>
                                        <div className="px-3 py-2">
                                            <EditorContent editor={editor} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-1 text-gray-500">
                                <button 
                                    type="button" 
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Add attachment"
                                >
                                    <Plus size={18} />
                                </button>
                                <button 
                                    type="button" 
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Add emoji"
                                >
                                    <span className="text-lg">😊</span>
                                </button>
                                <button 
                                    type="button" 
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Mention someone"
                                >
                                    <span className="text-lg">@</span>
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="bg-[#2EB67D] hover:bg-[#2A9D6F] flex items-center gap-x-2 text-white h-7 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                            >
                                <SendHorizonal size={16} />
                            </button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default MessageInput;