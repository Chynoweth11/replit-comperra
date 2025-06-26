import React, { useState, useContext, createContext } from 'react';

const ToastContext = createContext<any>(null);

let toastId = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<any[]>([]);

    const addToast = (message: string, type = 'success') => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
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
                const colors: Record<string, string> = {
                    success: 'bg-green-100 border-green-500 text-green-800',
                    error: 'bg-red-100 border-red-500 text-red-800',
                    info: 'bg-blue-100 border-blue-500 text-blue-800',
                    loading: 'bg-slate-100 border-slate-500 text-slate-800 animate-pulse'
                };
                return (
                    <div key={t.id} className={`p-4 rounded-lg border-l-4 shadow-xl flex justify-between items-center ${colors[t.type] || colors.info}`} role="alert">
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

export const useToast = () => useContext(ToastContext);