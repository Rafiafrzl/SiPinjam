import { toast } from 'react-toastify';



const toastConfig = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

const Toast = {
    ok: (message, options = {}) => {
        toast(message, { ...toastConfig, ...options });
    },

    success: (message, options = {}) => {
        toast.success(message, {
            ...toastConfig,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#8b5cf6" />
                </svg>
            ),
            ...options
        });
    },

    error: (message, options = {}) => {
        toast.error(message, { ...toastConfig, autoClose: 4000, ...options });
    },

    warning: (message, options = {}) => {
        toast.warning(message, { ...toastConfig, ...options });
    },

    info: (message, options = {}) => {
        toast.info(message, { ...toastConfig, ...options });
    },

    promise: (promise, messages, options = {}) => {
        return toast.promise(
            promise,
            {
                pending: messages.pending || 'Memproses...',
                success: messages.success || 'Berhasil!',
                error: messages.error || 'Gagal!',
            },
            { ...toastConfig, ...options }
        );
    },

    dismiss: () => {
        toast.dismiss();
    },
};

export default Toast;
