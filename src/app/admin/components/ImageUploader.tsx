'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import SafeImage from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadImage, deleteImage, generateUniqueFilename, getStoragePath, UploadProgress } from '@/lib/storage-utils';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    contentType: 'team-members' | 'achievements' | 'partners' | 'pages';
    contentId: string;
    currentImageUrl?: string;
    onUploadComplete: (url: string) => void;
    onDelete?: () => void;
    className?: string;
    maxSizeMB?: number;
}

export default function ImageUploader({
    contentType,
    contentId,
    currentImageUrl,
    onUploadComplete,
    onDelete,
    className,
    maxSizeMB = 5,
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync previewUrl with currentImageUrl prop when it changes
    useEffect(() => {
        setPreviewUrl(currentImageUrl || null);
    }, [currentImageUrl]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File must be an image');
            return;
        }

        // Validate file size
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`Image size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setIsUploading(true);
        setUploadProgress({ bytesTransferred: 0, totalBytes: file.size, progress: 0 });

        try {
            // Generate unique filename
            const uniqueFilename = generateUniqueFilename(file.name);
            const path = getStoragePath(contentType, contentId, uniqueFilename);

            // Upload image
            const downloadUrl = await uploadImage(file, path, (progress) => {
                setUploadProgress(progress);
            });

            setPreviewUrl(downloadUrl);
            onUploadComplete(downloadUrl);
            setIsUploading(false);
            setUploadProgress(null);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleDelete = async () => {
        // We generally don't want to delete the previous image from storage immediately 
        // when the user just clicks "Remove" in the UI, because they might cancel the dialog.
        // However, we do want to clear the preview and the form state.

        // If needed, we could implement a cleanup strategy later for unused images,
        // or strictly delete only if it was just uploaded in this session.

        setError(null);
        setPreviewUrl(null);

        // Notify parent to clear the URL in form data
        if (onDelete) onDelete();

        // Reset file input value so selecting the same file again works
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Preview */}
            {previewUrl ? (
                <div className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted group">
                        <SafeImage
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                            fallback="/placeholder-image.jpg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                type="button"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Remove Image
                            </Button>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        type="button"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Image
                    </Button>
                </div>
            ) : (
                <div
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground/75 mt-1">Max {maxSizeMB}MB</p>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
                <div className="space-y-2">
                    <Progress value={uploadProgress.progress} />
                    <p className="text-xs text-muted-foreground text-center">
                        Uploading... {Math.round(uploadProgress.progress)}%
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            {/* Upload Button */}
            {!previewUrl && !isUploading && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                </Button>
            )}
        </div>
    );
}
