import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const AppShell = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* ── DESKTOP sidebar — always visible on lg+ ── */}
      <div className="hidden lg:block fixed left-0 top-0 z-30 h-full">
        <Sidebar />
      </div>

      {/* ── MOBILE sidebar — slide in/out ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark overlay behind sidebar */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />

            {/* Sidebar sliding in from left */}
            <motion.div
              key="sidebar"
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex-1 lg:ml-[200px] flex flex-col min-h-screen w-full">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <motion.main
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4 lg:p-5"
        >
          {children}
        </motion.main>
      </div>

    </div>
  );
};

export default AppShell;