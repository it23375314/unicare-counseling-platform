import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle2, MessageCircle, AlertTriangle } from 'lucide-react';

const PopMsg = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // 'warning', 'info', 'prompt'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  inputValue = '',
  setInputValue = () => {},
  placeholder = 'Enter reason...'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'prompt': return <MessageCircle className="text-blue-500" size={32} />;
      case 'info': return <CheckCircle2 className="text-emerald-500" size={32} />;
      case 'warning': 
      default: return <AlertTriangle className="text-rose-500" size={32} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'prompt': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
      case 'info': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      case 'warning': 
      default: return 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>

          <div className="p-10 pt-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
              {getIcon()}
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 italic">
              {title}
            </h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">
              {message}
            </p>

            {type === 'prompt' && (
              <div className="mt-8 px-2">
                <textarea
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border-none text-sm font-bold rounded-[1.5rem] p-5 shadow-inner transition-all focus:ring-4 focus:ring-blue-500/10 text-slate-900 outline-none min-h-[100px] resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button
                onClick={onClose}
                className="py-4 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] text-slate-400 border-2 border-slate-100 hover:border-slate-300 hover:text-slate-600 transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`py-4 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-lg hover:brightness-110 active:scale-95 ${getButtonClass()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopMsg;
