"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { X, Upload, Loader2, Music } from "lucide-react";
import { uploadAudioToCloudinary } from "@/services/cloudinary";
import { toast } from "sonner";

interface AudioUploadProps {
    value?: string;
    onChange: (url: string | null) => void;
    maxSizeMB?: number;
    folder?: string;
    disabled?: boolean;
}

export function AudioUpload({
    value,
    onChange,
    maxSizeMB = 50,
    folder = "hamere-trufat/audio",
    disabled = false,
}: AudioUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("audio/") && !file.type.includes("mpeg") && !file.type.includes("wav")) {
            toast.error("Please select an audio file (mp3, wav, etc.)");
            return;
        }

        // Validate file size
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadAudioToCloudinary({
                file,
                folder,
                onProgress: (progress) => {
                    setUploadProgress(progress);
                },
            });

            onChange(result.secure_url);
            toast.success("Audio uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to upload audio"
            );
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a"
                onChange={handleFileSelect}
                disabled={disabled || uploading}
                className="hidden"
            />
            {value ? (
                <div className="relative group border rounded-lg p-4 flex items-center gap-4 bg-gray-50">
                    <Music className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate mb-1">Audio File Uploaded</p>
                        <audio controls src={value} className="w-full h-8" />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled || uploading}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Remove audio"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploading ? (
                        <div className="space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                            <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload audio</p>
                            <p className="text-xs text-gray-500">MP3, WAV up to {maxSizeMB}MB</p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || uploading}
                            >
                                Select Audio
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
