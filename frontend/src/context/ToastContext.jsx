import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // types: "success", "error", "info", "warning"
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          
          let Icon = CheckCircle2;
          let bgColor = "bg-green-500";
          if(toast.type === "error") { Icon = XCircle; bgColor = "bg-red-500"; }
          if(toast.type === "info") { Icon = Info; bgColor = "bg-blue-500"; }
          if(toast.type === "warning") { Icon = AlertCircle; bgColor = "bg-yellow-500"; }

          return (
            <div 
              key={toast.id}
              className={`flex items-center gap-3 px-5 py-4 min-w-[300px] shadow-2xl rounded-xl text-white transform transition-all duration-300 pointer-events-auto shadow-black/20 ${bgColor} animate-slide-up`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="font-semibold text-sm">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-auto opacity-70 hover:opacity-100 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  );
};
