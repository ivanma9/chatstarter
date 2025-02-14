"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export function NewDirectMessage() {
	const [open, setOpen] = useState(false);
	const createDirectMessage = useMutation(api.functions.dm.create);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const id = await createDirectMessage({
				username: e.currentTarget.username.value,
			});
			setOpen(false);
			router.push(`/dms/${id}`);
		} catch (error) {
			toast.error("Failed to create direct message", {
				description:
					error instanceof Error ? error.message : "An Unknown error occurred",
			});
		}
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<SidebarGroupAction>
					<PlusIcon />
					<span className="sr-only">New DM</span>
				</SidebarGroupAction>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New DM</DialogTitle>
					<DialogDescription>
						Enter a username to start a new direct message
					</DialogDescription>
				</DialogHeader>
				<form className="contents" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-1">
						<Label htmlFor="username">Username</Label>
						<Input id="username" type="text" />
					</div>
					<DialogFooter>
						<Button>Send DM</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
