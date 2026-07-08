import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Routes that skip the page transition (e.g. full-screen tools)
const SKIP_TRANSITION_ROUTES = ['/design', '/loading', '/admin'];

const variants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const noAnimVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit:    { opacity: 1 },
};

import { cloneElement, isValidElement } from 'react';

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  const shouldSkip = SKIP_TRANSITION_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={shouldSkip ? noAnimVariants : variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: shouldSkip ? undefined : '100vh' }}
      >
        {isValidElement(children) ? cloneElement(children as any, { location }) : children}
      </motion.div>
    </AnimatePresence>
  );
}

