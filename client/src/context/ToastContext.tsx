import { useState, useContext, createContext, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: Toast['type'] = 'success') => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast: ToastContextType = {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
        loading: (message: string) => {
            const id = toastId++;
            addToast(message, 'loading');
            return id;
        },
        dismiss: (id: number) => removeToast(id)
    };
    
    const ToastContainer = () => (
        <div className="fixed top-5 right-5 z-50 space-y-3">
            {toasts.map(t => {
                const colors = {
                    success: 'bg-green-100 border-green-500 text-green-800',
                    error: 'bg-red-100 border-red-500 text-red-800',
                    info: 'bg-blue-100 border-blue-500 text-blue-800',
                    loading: 'bg-slate-100 border-slate-500 text-slate-800 animate-pulse'
                };
                return (
                    <div key={t.id} className={`p-4 rounded-lg border-l-4 shadow-xl flex justify-between items-center ${colors[t.type]}`} role="alert">
                        <p className="font-semibold mr-4">{t.message}</p>
                        <button onClick={() => removeToast(t.id)} className="text-2xl font-semibold leading-none">&times;</button>
                    </div>
                );
            })}
        </div>
    );

    return (
        <ToastContext.Provider value={toast}>
            <ToastContainer />
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};