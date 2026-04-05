"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  agentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
};

export function DeleteConfirmModal({
  isOpen,
  agentName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[380px] mx-4 bg-white rounded-[8px] border border-black/10 shadow-xl overflow-hidden"
          >
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-1 rounded-[4px] text-black/40 hover:text-black hover:bg-black/5 transition-colors"
              disabled={isDeleting}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-black tracking-[-0.01em]">
                    Delete Agent
                  </h3>
                  <p className="text-[11px] text-black/50 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-[#fafafa] rounded-[6px] p-4 mb-5">
                <p className="text-[13px] text-black/70 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-black">
                    &quot;{agentName}&quot;
                  </span>
                  ? This will permanently remove the agent and all associated data from your collection.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-[4px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-[4px] bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Agent"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
