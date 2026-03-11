import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { moderationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetTitle }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const reportMutation = useMutation(
    (data) => moderationAPI.reportContent(data),
    {
      onSuccess: () => {
        toast.success('Report submitted successfully. Our team will review it shortly.');
        setStep(3);
        setTimeout(() => {
          onClose();
          reset();
          setStep(1);
        }, 2000);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit report');
      }
    }
  );

  const reportReasons = [
    { value: 'spam', label: 'Spam or misleading content', icon: '🚫' },
    { value: 'harassment', label: 'Harassment or bullying', icon: '⚠️' },
    { value: 'hate_speech', label: 'Hate speech or discrimination', icon: '🛑' },
    { value: 'violence', label: 'Violence or graphic content', icon: '⛔' },
    { value: 'copyright', label: 'Copyright infringement', icon: '©️' },
    { value: 'inappropriate', label: 'Inappropriate or offensive content', icon: '🔞' },
    { value: 'misinformation', label: 'False or misleading information', icon: '❌' },
    { value: 'other', label: 'Other violation', icon: '📝' }
  ];

  const onSubmit = (data) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!user) {
      toast.error('Please log in to submit a report');
      return;
    }

    const reportData = {
      type: targetType, // 'video', 'user', 'comment'
      target_id: targetId,
      reason: data.reason,
      description: data.description || '',
      reporter_id: user.id
    };

    reportMutation.mutate(reportData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Flag className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report {targetType}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Target Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    You are reporting:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {targetTitle || `${targetType} #${targetId}`}
                  </p>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Why are you reporting this {targetType}?
                  </label>
                  <div className="space-y-2">
                    {reportReasons.map((reason) => (
                      <label
                        key={reason.value}
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={reason.value}
                          {...register('reason', { required: 'Please select a reason' })}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-lg">{reason.icon}</span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {reason.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!watch('reason')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Please provide any additional context that might help our review team..."
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Privacy & Review Process
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Your report is confidential and will be reviewed by our moderation team. 
                        We may take action including content removal or account suspension if violations are found.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={reportMutation.isLoading}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Flag className="h-4 w-4" />
                    <span>{reportMutation.isLoading ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Report Submitted
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Thank you for helping keep Firehub safe. Our team will review this report and take appropriate action.
                </p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal; 