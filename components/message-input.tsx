"use client"

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import { Plus, SendHorizonal, File, Image as ImageIcon, X } from 'lucide-react';
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
} from "./ui/form"
import dynamic from 'next/dynamic';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const formSchema = z.object({
    message: z.string().optional(),
})

interface Attachment {
    storageId: string;
    name: string;
    type: string;
}

interface MessageInputProps {
    placeholder?: string;
    onSubmit?: (content: string, attachments?: Attachment[], linkPreviews?: any[]) => void;
    defaultValue?: string;
    workspaceId?: Id<"workspaces">;
}

const MessageInput = ({ placeholder = "Message", onSubmit, defaultValue = "" }: MessageInputProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = React.useState<Attachment[]>([]);
    const [linkPreviews, setLinkPreviews] = React.useState<any[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);

    const generateUploadUrl = useAction(api.functions.chat.actions.generateUploadUrl);
    const unfurlLink = useAction(api.functions.chat.actions.unfurlLink);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: defaultValue,
        },
    })

    // Check if form is valid (either message or attachments)
    const isValid = form.watch("message")?.trim() || attachments.length > 0;

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
        content: defaultValue,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[44px] max-h-[200px] overflow-y-auto border-none focus:outline-none focus:border-none focus:ring-0 text-sm text-gray-900 [&_p]:!m-0 [&_p]:leading-relaxed [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-gray-400 [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-gray-400 [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none [&_li]:!m-0 [&_li]:!p-0 [&_ul]:!my-0 [&_ol]:!my-0 [&_li>p]:!m-0 [&_li>p]:!leading-normal [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-[rgba(29,28,29,0.08)] [&_code]:text-[#e01e5a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_pre]:bg-[#f8f8f8] [&_pre]:border [&_pre]:border-[#e0e0e0] [&_pre]:text-[#1d1c1d] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:my-2 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 [&_u]:underline"
            },
        },
        onUpdate: ({ editor }) => {
            const value = editor.isEmpty ? "" : editor.getHTML();
            form.setValue("message", value, { shouldValidate: true });

            const urls = editor.getHTML().match(/href="([^"]+)"/g)?.map(m => m.match(/href="([^"]+)"/)?.[1]) || [];
            urls.forEach(url => {
                if (url && !linkPreviews.some(p => p.url === url)) {
                    handleUnfurl(url);
                }
            });
        }
    });

    const handleUnfurl = async (url: string) => {
        try {
            const preview = await unfurlLink({ url });
            if (preview) {
                setLinkPreviews(prev => {
                    if (prev.some(p => p.url === url)) return prev;
                    return [...prev, preview];
                });
            }
        } catch (error) {
            console.error("Unfurl failed:", error);
        }
    };

    const onEmojiClick = (emojiData: any) => {
        editor?.chain().focus().insertContent(emojiData.emoji).run();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            setAttachments(prev => [...prev, {
                storageId,
                name: file.name,
                type: file.type,
            }]);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (storageId: string) => {
        setAttachments(prev => prev.filter(a => a.storageId !== storageId));
    };

    const onSubmitHandler = React.useCallback((values: z.infer<typeof formSchema>) => {
        if (onSubmit && (values.message || attachments.length > 0)) {
            onSubmit(values.message || "", attachments as any, linkPreviews);
            form.reset();
            setAttachments([]);
            setLinkPreviews([]);
            editor?.commands.clearContent();
        }
    }, [onSubmit, form, editor, attachments, linkPreviews]);

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

                                            {/* Attachment Previews */}
                                            {attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {attachments.map((file) => (
                                                        <div
                                                            key={file.storageId}
                                                            className="relative group bg-gray-50 border border-gray-200 rounded-md p-2 flex items-center gap-2 max-w-[200px]"
                                                        >
                                                            {file.type.startsWith("image/") ? (
                                                                <ImageIcon className="size-4 text-sky-600 shrink-0" />
                                                            ) : (
                                                                <File className="size-4 text-gray-500 shrink-0" />
                                                            )}
                                                            <span className="text-xs truncate text-gray-700">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachment(file.storageId)}
                                                                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {linkPreviews.length > 0 && (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {linkPreviews.map((preview) => (
                                                        <div
                                                            key={preview.url}
                                                            className="relative group bg-gray-50 border border-gray-200 rounded-md p-3 flex gap-3 max-w-full"
                                                        >
                                                            {preview.image && (
                                                                <img
                                                                    src={preview.image}
                                                                    alt=""
                                                                    className="size-16 rounded object-cover shrink-0"
                                                                />
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-bold text-gray-900 truncate">
                                                                    {preview.title || preview.url}
                                                                </p>
                                                                {preview.description && (
                                                                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                                                                        {preview.description}
                                                                    </p>
                                                                )}
                                                                <p className="text-[10px] text-blue-600 truncate mt-1">
                                                                    {preview.url}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setLinkPreviews(prev => prev.filter(p => p.url !== preview.url))}
                                                                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0.5"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-1 text-gray-500">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Add attachment"
                                >
                                    <Plus size={18} />
                                </button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                            title="Add emoji"
                                        >
                                            <span className="text-lg">😊</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 border-none" side="top" align="start">
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <button
                                type="submit"
                                className="bg-[#2EB67D] hover:bg-[#2A9D6F] flex items-center gap-x-2 text-white h-7 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isValid || form.formState.isSubmitting || isUploading}
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