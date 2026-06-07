import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const AppShell = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Topbar title={title} />
        <motion.main
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-5"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppShell;