import React from 'react';
import { Link } from 'react-router-dom';
import { X, CalendarDays, MessageCircle, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';

/**
 * A professional, animated slide-in menu overlay.
 * Props:
 * - isOpen: boolean to toggle menu
 * - onClose: function to close menu
 * - user: object with firstName
 * - onOpenCalendar, onToggleSavedJobs: callback handlers
 */
export default function SlideInMenu({
  isOpen,
  onClose,
  user,
  onOpenCalendar,
  onToggleSavedJobs
}) {
  // Animation variants
  const backdrop = {
    visible: { opacity: 0.5 },
    hidden: { opacity: 0 }
  };

  const panel = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden
          />

          {/* Slide-in panel */}
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-72 max-w-full bg-white shadow-2xl rounded-l-2xl p-6 flex flex-col"
            role="dialog"
            aria-modal="true"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="self-end text-gray-600 hover:text-gray-900"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* Greeting & User Button */}
            <div className="mt-4 mb-6 flex items-center space-x-3">
              <p className="text-lg font-medium">Hello, {user.firstName}</p>
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={() => { /* User menu logic */ }}
              >
                {/* Placeholder for user avatar */}
                <UserButton />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-4">
              <button
                onClick={() => { onOpenCalendar(); onClose(); }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <CalendarDays size={20} />
                Calendar
              </button>

              <Link
                to="/chat-system"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <MessageCircle size={20} />
                Chat
              </Link>

              <Link
                to="/subscribe"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
              >
                Subscription
              </Link>

              <Link
                to="/blogs"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
              >
                Blogs
              </Link>

              <button
                onClick={() => { onToggleSavedJobs(); onClose(); }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Bookmark size={20} />
                Saved Jobs
              </button>

              <Link
                to="/application"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
