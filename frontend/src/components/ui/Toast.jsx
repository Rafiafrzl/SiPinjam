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
        toast.success(message, { ...toastConfig, ...options });
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
