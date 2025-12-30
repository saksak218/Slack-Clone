"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

interface DeleteWorkspaceDialogProps {
    workspaceId: Id<"workspaces">;
    workspaceName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DeleteWorkspaceDialog = ({
    workspaceId,
    workspaceName,
    open,
    onOpenChange,
}: DeleteWorkspaceDialogProps) => {
    const router = useRouter();
    const session = authClient.useSession();
    const [isPending, setIsPending] = useState(false);

    const removeWorkspace = useMutation(api.functions.workspaces.mutations.deleteWorkspace);

    const handleDelete = async () => {
        const userId = session.data?.user.id;
        if (!userId) return;

        setIsPending(true);
        try {
            await removeWorkspace({
                workspaceId,
                userId,
            });

            toast.success("Workspace deleted successfully");
            sessionStorage.removeItem("selectedWorkspaceId");
            onOpenChange(false);
            router.push("/workspace-select");
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete workspace:", error);
            toast.error(error.message || "Failed to delete workspace");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="size-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-xl">Delete Workspace</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">"{workspaceName}"</span>?
                        This action is permanent and will delete all channels, messages, and files.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Workspace"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
