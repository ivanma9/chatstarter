import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateServer() {
	const imageUpload = useImageUpload();
	const createServer = useMutation(api.functions.server.create);
	const [name, setName] = useState("");
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const { serverId, defaultChannelId } = await createServer({
				name,
				iconId: imageUpload.storageId,
			});
			router.push(`/servers/${serverId}/channels/${defaultChannelId}`);
			setOpen(false);
		} catch (error) {
			toast.error("Failed to create server", {
				description:
					error instanceof Error ? error.message : "An unknown error occured",
			});
		}
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<SidebarMenuButton tooltip="Create Server">
					<PlusIcon className="w-4 h-4" />
				</SidebarMenuButton>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Server</DialogTitle>
				</DialogHeader>
				<form className="contents" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label>Name</Label>
						<Input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Icon</Label>
						<div className="flex items-center gap-2">
							<input {...imageUpload.inputProps} />
							<Avatar className="size-10 border relative">
								{imageUpload.previewUrl && (
									<AvatarImage
										src={imageUpload.previewUrl}
										className="absolute inset-0"
									/>
								)}
								<AvatarFallback>
									<ImageIcon className="size-4 text-muted-foreground" />
								</AvatarFallback>
							</Avatar>
							<Button
								variant="outline"
								type="button"
								size="sm"
								onClick={imageUpload.open}
								disabled={imageUpload.isUploading}
							>
								{imageUpload.isUploading ? "Uploading..." : "Upload Image"}
							</Button>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Create Server</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
