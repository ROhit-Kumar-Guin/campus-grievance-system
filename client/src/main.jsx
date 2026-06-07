
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Apply saved theme before React renders
// This prevents a flash of wrong theme on reload
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(

    <App />
 
);