import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toastConfig = {
  position: 'top-right', // Position of the toast
  autoClose: 2000, // Auto-close after 3 seconds
  hideProgressBar: false, // Show progress bar
  closeOnClick: true, // Close toast on click
  pauseOnHover: true, // Pause toast on hover
  draggable: true, // Allow dragging to dismiss
  progress: undefined, // Use default progress bar
};

export default ToastContainer;