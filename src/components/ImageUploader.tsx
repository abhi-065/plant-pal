import { useState, useCallback } from 'react';
import { Upload, Camera, Leaf, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (imageBase64: string) => void;
  isLoading?: boolean;
}

export const ImageUploader = ({ onImageSelect, isLoading }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  if (preview) {
    return (
      <div className="relative animate-scale-in">
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <img 
            src={preview} 
            alt="Plant preview" 
            className="w-full h-64 sm:h-80 object-cover"
          />
          {!isLoading && (
            <button
              onClick={clearPreview}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Leaf className="w-12 h-12 text-primary animate-pulse-soft" />
                  <div className="absolute inset-0 animate-spin">
                    <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-primary" />
                  </div>
                </div>
                <p className="text-foreground font-medium">Analyzing plant...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "border-2 border-dashed rounded-2xl",
        "flex flex-col items-center justify-center",
        "h-64 sm:h-80",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className={cn(
          "p-4 rounded-full transition-all duration-300",
          isDragging ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
        )}>
          {isDragging ? (
            <Leaf className="w-10 h-10 text-primary animate-pulse" />
          ) : (
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? "Drop your plant photo here" : "Upload a plant photo"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span>Supports JPG, PNG, WEBP</span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-8 h-8 text-leaf-light opacity-50">
        <Leaf className="w-full h-full" />
      </div>
      <div className="absolute bottom-4 left-4 w-6 h-6 text-leaf-light opacity-30 rotate-45">
        <Leaf className="w-full h-full" />
      </div>
    </div>
  );
};
