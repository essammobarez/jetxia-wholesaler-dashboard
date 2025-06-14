"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

interface MarkupDetail {
  value: number;
  type: string;
}

interface MarkupPlan {
  _id: string;
  name: string;
  markups: MarkupDetail[];
}

type AssignMarkupModalProps = {
  agencyCount: number;
  onConfirm: (planId: string) => void;
  onCancel: () => void;
  wholesalerId: string;
  authToken: string;
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const AssignMarkupModal: React.FC<AssignMarkupModalProps> = ({
  agencyCount,
  onConfirm,
  onCancel,
  wholesalerId,
  authToken,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [plans, setPlans] = useState<MarkupPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkupPlans = async () => {
      if (!wholesalerId || !authToken) {
        toast.error("Authentication details are missing.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}markup/plans/wholesaler/${wholesalerId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPlans(json.data);
        } else {
          toast.error(json.message || "Failed to fetch markup plans.");
        }
      } catch (error) {
        console.error("Failed to fetch markup plans:", error);
        toast.error("An error occurred while fetching markup plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchMarkupPlans();
  }, [wholesalerId, authToken]);

  const handleConfirm = () => {
    if (!selectedPlan) {
      toast.warn("Please select a markup plan.");
      return;
    }
    onConfirm(selectedPlan);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    confirmButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          role="dialog"
          aria-modal="true"
          variants={panelVariants}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <FiCheckCircle className="text-2xl text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Please Assign markup and confirm</h2>
          </div>

          <p className="text-gray-700 mb-6">
            Select a markup plan to assign to the {agencyCount} selected agency(s). This will also approve their registration.
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-24">
              <FiLoader className="animate-spin text-2xl text-gray-500" />
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="markup-plan-select" className="block text-sm font-medium text-gray-700 mb-2">
                Markup Plan
              </label>
              <select
                id="markup-plan-select"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>-- Select a Plan --</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              disabled={loading || !selectedPlan}
              className="px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 bg-green-600 disabled:bg-gray-400"
            >
              Assign and Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssignMarkupModal;