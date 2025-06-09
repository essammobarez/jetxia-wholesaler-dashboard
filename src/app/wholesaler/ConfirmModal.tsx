// components/ConfirmModal.tsx

"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiTrash2 } from "react-icons/fi";

type ConfirmModalProps = {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "Please Confirm",
  message,
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Determine action type
  const isDelete = /delete/i.test(message);
  const HeaderIcon = isDelete ? FiTrash2 : FiCheckCircle;
  const iconColor = isDelete ? "text-red-600" : "text-green-600";
  const confirmBg = isDelete ? "bg-red-600" : "bg-green-600";
  const confirmLabel = isDelete ? "Delete" : "Approve";

  // Keyboard & focus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", handleKey);
    confirmButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel, onConfirm]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          onClick={onCancel}
        />

        {/* Modal Panel */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-message"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <HeaderIcon className={`text-2xl ${iconColor}`} />
            <h2
              id="confirm-modal-title"
              className="text-xl font-semibold text-gray-800"
            >
              {title}
            </h2>
          </div>

          {/* Message */}
          <p id="confirm-modal-message" className="text-gray-700 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 ${confirmBg}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmModal;