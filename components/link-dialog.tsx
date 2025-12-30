"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (title: string, url: string) => void;
    initialTitle?: string;
    initialUrl?: string;
}

export const LinkDialog = ({
    open,
    onOpenChange,
    onConfirm,
    initialTitle = "",
    initialUrl = "",
}: LinkDialogProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [url, setUrl] = useState(initialUrl);

    useEffect(() => {
        if (open) {
            setTitle(initialTitle);
            setUrl(initialUrl);
        }
    }, [open, initialTitle, initialUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(title, url);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="link-title">Text</Label>
                        <Input
                            id="link-title"
                            placeholder="Link Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="link-url">Link</Label>
                        <Input
                            id="link-url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!url}>
                            Apply
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
