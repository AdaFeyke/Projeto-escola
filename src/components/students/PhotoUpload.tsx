"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface PhotoUploadProps {
  defaultImage?: string | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function PhotoUpload({ defaultImage, onFileSelect, className }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(defaultImage || null);
  }, [defaultImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative w-28 h-28 rounded-full border-4 border-white shadow-md cursor-pointer overflow-hidden transition-all bg-slate-100 ring-2 ring-slate-100 hover:ring-primary/50",
          !preview && "flex items-center justify-center p-6 border-dashed border-slate-300"
        )}
      >
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Preview" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1 flex-col">
              <Camera className="w-6 h-6" />
              <span>ALTERAR</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold uppercase">Foto</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-3 h-3 mr-2" />
          {preview ? "Trocar Foto" : "Adicionar Foto"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <input
        type="file"
        name="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
}