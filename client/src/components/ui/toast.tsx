import { AnimatePresence, motion } from 'framer-motion';

export function Toast({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 right-5 z-50 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-glow"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
