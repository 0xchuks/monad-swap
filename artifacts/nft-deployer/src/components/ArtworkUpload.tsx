import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, Plus, ImageIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Trait {
  id: string;
  trait_type: string;
  value: string;
}

export interface ArtworkFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  traits: Trait[];
}

interface ArtworkUploadProps {
  initialArtworks: ArtworkFile[];
  onNext: (artworks: ArtworkFile[]) => void;
  onBack: () => void;
}

export function ArtworkUpload({ initialArtworks, onNext, onBack }: ArtworkUploadProps) {
  const [artworks, setArtworks] = useState<ArtworkFile[]>(initialArtworks);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(
    initialArtworks.length > 0 ? initialArtworks[0].id : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newArtworks: ArtworkFile[] = [];
    const currentLength = artworks.length;
    
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substring(7);
        newArtworks.push({
          id,
          file,
          previewUrl: URL.createObjectURL(file),
          name: `Token #${currentLength + index + 1}`,
          traits: []
        });
      }
    });

    if (newArtworks.length > 0) {
      setArtworks(prev => {
        const updated = [...prev, ...newArtworks];
        if (!selectedArtworkId) setSelectedArtworkId(updated[0].id);
        return updated;
      });
    }
  }, [artworks, selectedArtworkId]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeArtwork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArtworks(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (selectedArtworkId === id) {
        setSelectedArtworkId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const updateArtworkName = (id: string, name: string) => {
    setArtworks(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };

  const addTrait = (artworkId: string) => {
    setArtworks(prev => prev.map(a => {
      if (a.id === artworkId) {
        return {
          ...a,
          traits: [...a.traits, { id: Math.random().toString(36).substring(7), trait_type: "", value: "" }]
        };
      }
      return a;
    }));
  };

  const updateTrait = (artworkId: string, traitId: string, key: "trait_type" | "value", value: string) => {
    setArtworks(prev => prev.map(a => {
      if (a.id === artworkId) {
        return {
          ...a,
          traits: a.traits.map(t => t.id === traitId ? { ...t, [key]: value } : t)
        };
      }
      return a;
    }));
  };

  const removeTrait = (artworkId: string, traitId: string) => {
    setArtworks(prev => prev.map(a => {
      if (a.id === artworkId) {
        return {
          ...a,
          traits: a.traits.filter(t => t.id !== traitId)
        };
      }
      return a;
    }));
  };

  const selectedArtwork = artworks.find(a => a.id === selectedArtworkId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Artwork & Metadata</h2>
        <p className="text-muted-foreground">
          Upload your NFT images and configure their individual traits and metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div 
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${isDragging ? "border-primary bg-primary/10" : "border-border bg-card/50 hover:bg-card/80"}
            `}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="dropzone-artwork"
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Click or drag images to upload</p>
                <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, GIF, SVG</p>
              </div>
            </div>
          </div>

          {artworks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
              <AnimatePresence>
                {artworks.map(artwork => (
                  <motion.div
                    key={artwork.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedArtworkId(artwork.id)}
                    className={`
                      relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square
                      ${selectedArtworkId === artwork.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground"}
                    `}
                    data-testid={`grid-item-${artwork.id}`}
                  >
                    <img src={artwork.previewUrl} alt={artwork.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <button 
                        className="self-end bg-destructive/80 hover:bg-destructive text-white rounded-full p-1"
                        onClick={(e) => removeArtwork(artwork.id, e)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs font-medium text-white truncate drop-shadow-md">{artwork.name}</p>
                    </div>
                    {selectedArtworkId === artwork.id && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 text-center">
                        Selected
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div>
          <Card className="border-border bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-4 sm:p-6 space-y-6 h-full flex flex-col">
              {!selectedArtwork ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p>Upload and select an image to edit its metadata.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <Label>Token Name</Label>
                    <Input 
                      value={selectedArtwork.name} 
                      onChange={e => updateArtworkName(selectedArtwork.id, e.target.value)}
                      data-testid="input-token-name"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Attributes / Traits</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-1 text-xs"
                        onClick={() => addTrait(selectedArtwork.id)}
                        data-testid="button-add-trait"
                      >
                        <Plus className="w-3 h-3" /> Add Trait
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {selectedArtwork.traits.length === 0 ? (
                          <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-border rounded-md"
                          >
                            No traits added yet.
                          </motion.p>
                        ) : (
                          selectedArtwork.traits.map((trait, index) => (
                            <motion.div 
                              key={trait.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex gap-2 items-start overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2 flex-1">
                                <Input 
                                  placeholder="e.g. Background" 
                                  value={trait.trait_type} 
                                  onChange={e => updateTrait(selectedArtwork.id, trait.id, "trait_type", e.target.value)}
                                  className="h-8 text-sm"
                                  data-testid={`input-trait-type-${index}`}
                                />
                                <Input 
                                  placeholder="e.g. Blue" 
                                  value={trait.value} 
                                  onChange={e => updateTrait(selectedArtwork.id, trait.id, "value", e.target.value)}
                                  className="h-8 text-sm"
                                  data-testid={`input-trait-value-${index}`}
                                />
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeTrait(selectedArtwork.id, trait.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border items-center">
        <Button type="button" variant="outline" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          {artworks.length} items ready
        </div>
        <Button 
          type="button" 
          onClick={() => onNext(artworks)} 
          disabled={artworks.length === 0}
          className="gap-2" 
          data-testid="button-next-step"
        >
          Continue to Royalties <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}