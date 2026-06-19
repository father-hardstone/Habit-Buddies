'use client';

import * as React from 'react';
import { ImagePlus, Loader2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  cropFileToSquare,
  getInitialCropTransform,
  loadImageFromFile,
  type CropTransform,
} from '@/lib/image-crop';

const CROP_SIZE = 280;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

type ImageUploadCropModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isUploading?: boolean;
};

export function ImageUploadCropModal({
  open,
  onOpenChange,
  onConfirm,
  title = 'Upload photo',
  description = 'Crop your image to a square. Drag to reposition and use the slider to zoom.',
  confirmLabel = 'Save photo',
  isUploading = false,
}: ImageUploadCropModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragStartRef = React.useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null,
  );

  const [sourceFile, setSourceFile] = React.useState<File | null>(null);
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = React.useState<CropTransform | null>(null);
  const [zoom, setZoom] = React.useState([1]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const resetState = React.useCallback(() => {
    setSourceFile(null);
    setImage(null);
    setTransform(null);
    setZoom([1]);
    setLoadError(null);
    setIsProcessing(false);
    dragStartRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const loadFile = React.useCallback(async (file: File) => {
    setLoadError(null);
    setIsProcessing(true);

    try {
      const loaded = await loadImageFromFile(file);
      const nextTransform = getInitialCropTransform(loaded, CROP_SIZE);
      setSourceFile(file);
      setImage(loaded);
      setTransform(nextTransform);
      setZoom([1]);
    } catch {
      setLoadError('Could not load that image. Try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      void loadFile(file);
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoom(value);
    setTransform((current) =>
      current ? { ...current, scale: value[0] ?? 1 } : current,
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!transform) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) {
      return;
    }

    setTransform((current) =>
      current
        ? {
            ...current,
            offsetX: start.offsetX + (event.clientX - start.x),
            offsetY: start.offsetY + (event.clientY - start.y),
          }
        : current,
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragStartRef.current = null;
    }
  };

  const handleConfirm = async () => {
    if (!sourceFile || !transform) {
      fileInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    try {
      const cropped = await cropFileToSquare(sourceFile, transform);
      await onConfirm(cropped);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayScale = transform ? transform.baseScale * transform.scale : 1;
  const displayW = image ? image.naturalWidth * displayScale : 0;
  const displayH = image ? image.naturalHeight * displayScale : 0;

  const isBusy = isUploading || isProcessing;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!image ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex h-[280px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <ImagePlus className="size-10 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Choose an image to crop
                </span>
              </button>
            ) : (
              <>
                <div
                  className={cn(
                    'relative mx-auto overflow-hidden rounded-xl bg-black touch-none',
                    'ring-2 ring-border',
                  )}
                  style={{ width: CROP_SIZE, height: CROP_SIZE }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt="Crop preview"
                    draggable={false}
                    className="pointer-events-none absolute max-w-none select-none"
                    style={{
                      width: displayW,
                      height: displayH,
                      left: CROP_SIZE / 2 - displayW / 2 + (transform?.offsetX ?? 0),
                      top: CROP_SIZE / 2 - displayH / 2 + (transform?.offsetY ?? 0),
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ZoomIn className="size-4 shrink-0" />
                    <span className="shrink-0">Zoom</span>
                    <Slider
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.01}
                      onValueChange={handleZoomChange}
                      disabled={isBusy}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Drag the image to reposition
                  </p>
                </div>
              </>
            )}

            {loadError && (
              <p className="text-center text-sm text-destructive">{loadError}</p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
            >
              Change image
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={isBusy || (!sourceFile && !image)}
            >
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isUploading ? 'Uploading…' : 'Processing…'}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
