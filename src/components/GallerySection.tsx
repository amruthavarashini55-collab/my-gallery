import React, { useState, useEffect } from "react";
import { Drawing, Comment } from "../types";
import { getComments, addComment, deleteComment, likeDrawing } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../lib/i18n";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Edit, 
  Trash2, 
  Info,
  Maximize2,
  Heart,
  MessageSquare,
  Send,
  Loader2
} from "lucide-react";

interface GallerySectionProps {
  drawings: Drawing[];
  isAdmin: boolean;
  onEditClick?: (drawing: Drawing) => void;
  onDeleteClick?: (id: string) => void;
}

export default function GallerySection({
  drawings,
  isAdmin,
  onEditClick,
  onDeleteClick
}: GallerySectionProps) {
  const { t } = useLanguage();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  // Likes state
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const currentDrawing = selectedIdx !== null ? drawings[selectedIdx] : null;

  useEffect(() => {
    if (currentDrawing) {
      loadComments(currentDrawing.id);
    }
  }, [currentDrawing?.id]);

  const loadComments = async (drawingId: string) => {
    setIsLoadingComments(true);
    try {
      const fetched = await getComments(drawingId);
      setComments(fetched);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, drawingId: string, currentLikes: number = 0) => {
    e.stopPropagation();
    if (likedSet.has(drawingId)) return; // Already liked

    // Optimistic UI update
    setLikedSet(prev => new Set(prev).add(drawingId));
    setLocalLikes(prev => ({
      ...prev,
      [drawingId]: (prev[drawingId] !== undefined ? prev[drawingId] : currentLikes) + 1
    }));

    try {
      await likeDrawing(drawingId);
    } catch (err) {
      console.error("Failed to like", err);
      // Revert optimistic update
      setLikedSet(prev => {
        const next = new Set(prev);
        next.delete(drawingId);
        return next;
      });
      setLocalLikes(prev => ({
        ...prev,
        [drawingId]: (prev[drawingId] || currentLikes + 1) - 1
      }));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDrawing || !newComment.trim() || !authorName.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addComment(currentDrawing.id, authorName.trim(), newComment.trim());
      setNewComment("");
      // Reload comments
      await loadComments(currentDrawing.id);
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentDrawing || !isAdmin) return;
    try {
      await deleteComment(currentDrawing.id, commentId);
      await loadComments(currentDrawing.id);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedIdx(index);
  };

  const closeLightbox = () => {
    setSelectedIdx(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % drawings.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx(
        (selectedIdx - 1 + drawings.length) % drawings.length
      );
    }
  };

  return (
    <section id="drawings" className="py-20 bg-brand-beige/50 border-t border-brand-charcoal/5 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-charcoal">
            {t("gallery.tag")} <span className="italic text-brand-accent font-normal">{t("gallery.title1")} {t("gallery.title2")}</span>
          </h2>
          <p className="text-brand-charcoal/70 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            {t("gallery.subtitle")}
          </p>
          {drawings.length === 0 && (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/20">
              <Info className="h-3.5 w-3.5" />
              <span>{t("gallery.adminEmpty")}</span>
            </div>
          )}
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {drawings.map((drawing, index) => (
            <motion.div
              key={drawing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              className="group relative flex flex-col justify-between bg-white border border-brand-charcoal/10 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
            >
              {/* Image Container */}
              <div 
                onClick={() => openLightbox(index)}
                className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={drawing.imageUrl}
                  alt={drawing.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 bg-brand-beige text-brand-charcoal px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                    <Maximize2 className="h-3.5 w-3.5 text-brand-accent" />
                    <span>View Larger</span>
                  </span>
                </div>
              </div>

              {/* Artwork Details */}
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal tracking-tight truncate">
                    {drawing.title}
                  </h3>
                  <p className="text-xs text-brand-charcoal/60 line-clamp-2 mt-1 min-h-[32px]">
                    {drawing.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-charcoal/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-brand-charcoal/50">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{drawing.date || "Unknown Date"}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Public Likes Count */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                      <Heart className={`h-3.5 w-3.5 ${likedSet.has(drawing.id) ? "fill-rose-500" : ""}`} />
                      <span>{localLikes[drawing.id] !== undefined ? localLikes[drawing.id] : (drawing.likes || 0)}</span>
                    </div>

                    {/* Admin Specific Action Buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 border-l border-brand-charcoal/10 pl-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditClick) onEditClick(drawing);
                          }}
                          title="Edit Details"
                          className="p-1.5 text-brand-charcoal/70 hover:text-brand-accent hover:bg-brand-charcoal/5 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteClick) onDeleteClick(drawing.id);
                          }}
                          title="Delete Artwork"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedIdx !== null && currentDrawing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/95 p-4 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Prev Button */}
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Lightbox Inner Container */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl w-full flex flex-col md:flex-row bg-brand-beige border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] md:max-h-[80vh]"
              >
                {/* Left: Compressed High Res Image */}
                <div className="flex-1 bg-stone-900 flex items-center justify-center p-4 overflow-hidden min-h-[40vh] md:min-h-0">
                  <img
                    src={currentDrawing.imageUrl}
                    alt={currentDrawing.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[50vh] md:max-h-[75vh] object-contain rounded-md"
                  />
                </div>

                {/* Right: Artwork Metadata & Social */}
                <div className="w-full md:w-[350px] flex flex-col bg-white border-t md:border-t-0 md:border-l border-brand-charcoal/10 h-full max-h-[50vh] md:max-h-[80vh]">
                  
                  {/* Top: Metadata */}
                  <div className="p-6 md:p-8 shrink-0 border-b border-brand-charcoal/5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-serif text-2xl font-bold text-brand-charcoal tracking-tight">
                            {currentDrawing.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-brand-charcoal/60">
                            <Calendar className="h-3.5 w-3.5 text-brand-accent" />
                            <span>Created on: {currentDrawing.date || "Unknown Date"}</span>
                          </div>
                        </div>
                        {/* Big Like Button */}
                        <button
                          onClick={(e) => handleLike(e, currentDrawing.id, currentDrawing.likes)}
                          disabled={likedSet.has(currentDrawing.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                            likedSet.has(currentDrawing.id)
                              ? "bg-rose-50 text-rose-500 cursor-default"
                              : "bg-stone-50 text-brand-charcoal/40 hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                          }`}
                        >
                          <Heart className={`h-6 w-6 ${likedSet.has(currentDrawing.id) ? "fill-rose-500" : ""}`} />
                          <span className="text-xs font-bold mt-1">
                            {localLikes[currentDrawing.id] !== undefined ? localLikes[currentDrawing.id] : (currentDrawing.likes || 0)}
                          </span>
                        </button>
                      </div>

                      {currentDrawing.description && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] uppercase tracking-wider text-brand-accent font-bold">About this drawing</span>
                          <p className="text-sm text-brand-charcoal/80 leading-relaxed font-light">
                            {currentDrawing.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Comments List */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal mb-4">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comments ({comments.length})</span>
                    </div>

                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-charcoal/30" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-xs text-brand-charcoal/40 text-center py-4 italic">
                        Be the first to leave a comment!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-white p-3.5 rounded-xl border border-brand-charcoal/5 shadow-sm text-sm group">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-brand-charcoal">{comment.authorName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-brand-charcoal/40">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1 cursor-pointer"
                                    title="Delete Comment"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-brand-charcoal/80 text-xs leading-relaxed">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Comment Input */}
                  <div className="p-4 md:p-6 bg-white border-t border-brand-charcoal/10 shrink-0">
                    <form onSubmit={handleAddComment} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        maxLength={50}
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full bg-stone-50 border border-brand-charcoal/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent text-brand-charcoal"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          required
                          maxLength={500}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full bg-stone-50 border border-brand-charcoal/10 rounded-lg py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent text-brand-charcoal"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !newComment.trim() || !authorName.trim()}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-brand-charcoal text-brand-beige rounded-md hover:bg-brand-accent disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {isSubmittingComment ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
