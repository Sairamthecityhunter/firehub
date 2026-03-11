import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  MoreHorizontal,
  Send,
  User,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CommentSection = ({ videoId, comments = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Add comment mutation
  const addCommentMutation = useMutation(
    (data) => contentAPI.addComment(videoId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', videoId]);
        reset();
        setReplyingTo(null);
        toast.success('Comment added successfully!');
      },
      onError: () => {
        toast.error('Failed to add comment');
      },
    }
  );

  // Like comment mutation
  const likeCommentMutation = useMutation(
    ({ commentId, value }) => contentAPI.likeComment(commentId, value),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', videoId]);
      },
      onError: () => {
        toast.error('Failed to like comment');
      },
    }
  );

  const onSubmit = (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    const commentData = {
      content: data.content,
      parent: replyingTo?.id || null,
    };

    addCommentMutation.mutate(commentData);
  };

  const handleLike = (commentId, value) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    likeCommentMutation.mutate({ commentId, value });
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const [showActions, setShowActions] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const handleLike = (value) => {
      if (value === 1 && isLiked) {
        setIsLiked(false);
      } else if (value === -1 && isDisliked) {
        setIsDisliked(false);
      } else {
        setIsLiked(value === 1);
        setIsDisliked(value === -1);
      }
      handleLike(comment.id, value);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700' : 'mb-4'}`}
      >
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.display_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {comment.author.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.author.display_name}
              </span>
              {comment.author.is_verified_creator && (
                <span className="text-primary-600 text-sm">✓</span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {comment.content}
            </p>

            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(1)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{formatViews(comment.likes)}</span>
              </button>

              <button
                onClick={() => handleLike(-1)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isDisliked
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{formatViews(comment.dislikes)}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment)}
                  className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              )}

              {comment.replies && comment.replies.length > 0 && !isReply && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showReplies[comment.id] ? 'Hide' : 'Show'} {comment.replies.length} replies
                </button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo?.id === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div>
                    <textarea
                      {...register('content', {
                        required: 'Comment content is required',
                        minLength: {
                          value: 1,
                          message: 'Comment cannot be empty',
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Comment is too long',
                        },
                      })}
                      placeholder={`Reply to ${comment.author.display_name}...`}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addCommentMutation.isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && showReplies[comment.id] && !isReply && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>

          {/* More actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add comment form */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex items-start space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.display_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <textarea
                  {...register('content', {
                    required: 'Comment content is required',
                    minLength: {
                      value: 1,
                      message: 'Comment cannot be empty',
                    },
                    maxLength: {
                      value: 1000,
                      message: 'Comment is too long',
                    },
                  })}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows="3"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.content.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={addCommentMutation.isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Comment</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 