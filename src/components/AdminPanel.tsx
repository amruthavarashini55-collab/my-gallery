import React, { useState, useRef } from "react";
import { Drawing } from "../types";
import { 
  createDrawing, 
  updateDrawing, 
  deleteDrawing, 
  compressImage 
} from "../lib/firebase";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Check, 
  AlertTriangle, 
  Sparkles,
  Loader2,
  Calendar
} from "lucide-react";

interface AdminPanelProps {
  drawings: Drawing[];
  onRefresh: () => Promise<void>;
}

export default function AdminPanel({ drawings, onRefresh }: AdminPanelProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<"idle" | "compressing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Update state
  const [editingDrawing, setEditingDrawing] = useState<Drawing | null>(null);
  const [deletingDrawingId, setDeletingDrawingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // File Upload Handlers
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Unsupported file: Please upload a valid image (JPEG, PNG, WebP).");
      return;
    }

    setUploadProgress("compressing");
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          // Compress the image before uploading to Firestore to keep document size < 1MB
          const compressed = await compressImage(rawBase64, 900, 900, 0.7);
          setImageUrl(compressed);
          setUploadProgress("success");
          setSuccessMessage("Image loaded and optimized successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (compErr) {
          console.error("Compression failed: ", compErr);
          setImageUrl(rawBase64); // Fallback to raw if compression fails
          setUploadProgress("success");
        }
      };
    } catch (err) {
      console.error("File reading error: ", err);
      setUploadProgress("error");
      setErrorMessage("Failed to process drawing file.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter a title for your drawing.");
      return;
    }
    if (!imageUrl) {
      setErrorMessage("Please upload an image file or provide an image URL.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingDrawing) {
        // UPDATE drawing
        await updateDrawing(editingDrawing.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          imageUrl
        });
        setSuccessMessage(`"${title}" details successfully updated!`);
      } else {
        // CREATE new drawing
        await createDrawing({
          title: title.trim(),
          description: description.trim(),
          date,
          imageUrl
        });
        setSuccessMessage(`"${title}" has been added to your gallery!`);
      }

      // Reset form
      handleCancelEdit();
      await onRefresh();
      
      // Auto dismiss success message
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to save drawing: ", err);
      setErrorMessage(`Error: ${err.message || "Failed to persist drawing to cloud."}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Populate form to EDIT a drawing
  const handleEditSelect = (drawing: Drawing) => {
    setEditingDrawing(drawing);
    setTitle(drawing.title);
    setDescription(drawing.description);
    setDate(drawing.date);
    setImageUrl(drawing.imageUrl);
    setUploadProgress("success");
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingDrawing(null);
    setTitle("");
    setDescription("");
    // Reset date to today
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
    setImageUrl("");
    setUploadProgress("idle");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // DELETE a drawing
  const handleDeleteConfirm = async (id: string) => {
    try {
      setIsSaving(true);
      await deleteDrawing(id);
      setSuccessMessage("Drawing deleted successfully.");
      setDeletingDrawingId(null);
      await onRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete drawing: ", err);
      setErrorMessage(`Failed to delete: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="py-12 bg-brand-beige px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-charcoal/10 pb-6">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-bold text-brand-charcoal">
              Admin <span className="italic text-brand-accent font-normal">Dashboard</span>
            </h2>
            <p className="text-xs text-brand-charcoal/60">
              Upload, edit details, or remove artwork from your personal portfolio instantly.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold bg-brand-charcoal text-brand-beige px-3 py-1.5 rounded-full border border-brand-charcoal/20">
              Total Artworks: {drawings.length}
            </span>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2 animate-fade-in">
            <Check className="h-4 w-4 text-emerald-600 flex-none" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 flex-none" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: FORM (Upload/Edit) */}
          <div className="lg:col-span-6 bg-white border border-brand-charcoal/10 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal flex items-center gap-2">
                {editingDrawing ? <Edit className="h-5 w-5 text-brand-accent" /> : <Plus className="h-5 w-5 text-brand-accent" />}
                <span>{editingDrawing ? "Edit Drawing Details" : "Upload New Drawing"}</span>
              </h3>
              {editingDrawing && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider block">
                  Artwork Image
                </label>
                
                {imageUrl ? (
                  /* Image Preview Mode */
                  <div className="relative aspect-video w-full border border-brand-charcoal/10 bg-brand-beige/50 rounded-xl overflow-hidden group">
                    <img
                      src={imageUrl}
                      alt="Upload Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl("");
                          setUploadProgress("idle");
                        }}
                        className="bg-rose-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-rose-700 cursor-pointer shadow-sm"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and Drop Upload Box */
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-video w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-brand-accent bg-brand-accent/5"
                        : "border-brand-charcoal/20 hover:border-brand-accent hover:bg-brand-beige/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    {uploadProgress === "compressing" ? (
                      <div className="space-y-2 text-brand-accent">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto" />
                        <span className="text-xs font-bold block uppercase tracking-widest">Optimizing Image...</span>
                        <p className="text-[11px] text-brand-charcoal/60">Reducing file size for smooth loading</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-brand-beige flex items-center justify-center mx-auto border border-brand-charcoal/5">
                          <UploadCloud className="h-6 w-6 text-brand-accent" />
                        </div>
                        <p className="text-sm font-semibold text-brand-charcoal">
                          Drag and drop your sketch here, or <span className="text-brand-accent underline">browse</span>
                        </p>
                        <p className="text-[11px] text-brand-charcoal/50">
                          Supports PNG, JPG, JPEG, WebP. Automatically optimized client-side.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Image URL input as fallback */}
                {!imageUrl && (
                  <div className="pt-2 text-center">
                    <span className="text-xs text-brand-charcoal/40 font-bold uppercase tracking-wider block mb-2">— OR —</span>
                    <input
                      type="url"
                      placeholder="Paste an external image URL directly..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadProgress("success");
                      }}
                      className="w-full bg-brand-beige/50 border border-brand-charcoal/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent text-brand-charcoal"
                    />
                  </div>
                )}
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider block">
                  Drawing Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whispering Forest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-brand-beige/50 border border-brand-charcoal/10 rounded-lg py-2.5 px-3.5 text-sm text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                />
              </div>

              {/* Date Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider block">
                  Creation Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-charcoal/40" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-brand-beige/50 border border-brand-charcoal/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider block">
                  Story & Notes (Optional)
                </label>
                <textarea
                  placeholder="Tell visitors about your inspiration, tools used, or hours spent on this piece..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-beige/50 border border-brand-charcoal/10 rounded-lg py-2.5 px-3.5 text-sm text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSaving || uploadProgress === "compressing"}
                  className="flex-1 bg-brand-charcoal hover:bg-brand-accent text-brand-beige hover:text-brand-charcoal font-bold py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingDrawing ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Publish Artwork</span>
                    </>
                  )}
                </button>
                {editingDrawing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3.5 border border-brand-charcoal/20 hover:bg-brand-charcoal/5 rounded-lg text-xs uppercase tracking-widest text-brand-charcoal font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Right: MANAGER LIST */}
          <div className="lg:col-span-6 bg-white border border-brand-charcoal/10 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                Portfolio Collection
              </h3>
              <p className="text-xs text-brand-charcoal/50">
                Quickly browse your collection, edit captions, or trigger deletions.
              </p>
            </div>

            {drawings.length === 0 ? (
              <div className="border border-dashed border-brand-charcoal/10 rounded-xl p-12 text-center text-brand-charcoal/50">
                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-brand-charcoal/30" />
                <span className="font-semibold block text-sm">No Custom Drawings Published</span>
                <p className="text-xs mt-1">Upload your first artwork using the form on the left!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {drawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="flex gap-4 p-3 border border-brand-charcoal/5 rounded-xl hover:border-brand-charcoal/20 transition-all items-center bg-brand-beige/20"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-none">
                      <img
                        src={drawing.imageUrl}
                        alt={drawing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-brand-charcoal text-sm truncate">
                        {drawing.title}
                      </h4>
                      <p className="text-xs text-brand-charcoal/50 mt-0.5">
                        {drawing.date || "No Date"}
                      </p>
                      {drawing.description && (
                        <p className="text-[11px] text-brand-charcoal/70 truncate mt-1">
                          {drawing.description}
                        </p>
                      )}
                    </div>

                    {/* Action controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 flex-none">
                      {deletingDrawingId === drawing.id ? (
                        <div className="flex items-center gap-1 animate-fade-in bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                          <button
                            onClick={() => handleDeleteConfirm(drawing.id)}
                            className="text-[10px] uppercase bg-rose-600 text-white font-bold px-2 py-1 rounded hover:bg-rose-700 cursor-pointer"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setDeletingDrawingId(null)}
                            className="text-[10px] uppercase bg-brand-beige text-brand-charcoal font-bold px-2 py-1 rounded border hover:bg-white cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditSelect(drawing)}
                            title="Edit details"
                            className="p-2 hover:bg-brand-charcoal/5 rounded-lg text-brand-charcoal/80 hover:text-brand-accent transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingDrawingId(drawing.id)}
                            title="Delete artwork"
                            className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
