import { useState, useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';
import Modal from './Modal';
import Button from './Button';

let alertCallback = null;

const AlertContainer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        type: 'info',
        title: '',
        message: '',
        confirmText: 'OK',
    });

    useEffect(() => {
        alertCallback = (alertConfig) => {
            setConfig(alertConfig);
            setIsOpen(true);
        };

        return () => {
            alertCallback = null;
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (config.onCancel) config.onCancel();
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (config.onConfirm) config.onConfirm();
    };

    const getIcon = () => {
        switch (config.type) {
            case 'success':
                return { icon: IoCheckmarkCircle, color: 'text-green-600', bg: 'bg-green-100' };
            case 'error':
                return { icon: IoCloseCircle, color: 'text-red-600', bg: 'bg-red-100' };
            case 'warning':
            case 'confirm':
                return { icon: IoWarning, color: 'text-yellow-600', bg: 'bg-yellow-100' };
            default:
                return { icon: IoInformationCircle, color: 'text-blue-600', bg: 'bg-blue-100' };
        }
    };

    const iconData = getIcon();
    const IconComponent = iconData.icon;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={config.title}
            size="sm"
            zIndex={99999}
        >
            <div className="text-center py-4">
                <div className={`w-16 h-16 ${iconData.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={iconData.color} size={32} />
                </div>
                <p className="text-gray-700 mb-6 px-2">
                    {config.message}
                </p>
                <div className="flex gap-3 justify-center">
                    {config.type === 'confirm' && (
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            {config.cancelText || 'Batal'}
                        </Button>
                    )}
                    <Button
                        variant={config.type === 'error' ? 'danger' : 'primary'}
                        onClick={handleConfirm}
                        className={config.type === 'confirm' ? 'flex-1' : 'w-full'}
                    >
                        {config.confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const Alert = {
    success: (message, title = 'Berhasil!', confirmText = 'OK') => {
        if (alertCallback) {
            alertCallback({
                type: 'success',
                title,
                message,
                confirmText,
            });
        }
    },

    error: (message, title = 'Terjadi Kesalahan', confirmText = 'OK') => {
        if (alertCallback) {
            alertCallback({
                type: 'error',
                title,
                message,
                confirmText,
            });
        }
    },

    warning: (message, title = 'Peringatan', confirmText = 'OK') => {
        if (alertCallback) {
            alertCallback({
                type: 'warning',
                title,
                message,
                confirmText,
            });
        }
    },

    confirm: (message, title = 'Konfirmasi', confirmText = 'Ya', cancelText = 'Batal') => {
        return new Promise((resolve) => {
            if (alertCallback) {
                alertCallback({
                    type: 'confirm',
                    title,
                    message,
                    confirmText,
                    cancelText,
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            } else {
                resolve(false);
            }
        });
    },

    info: (message, title = 'Informasi', confirmText = 'OK') => {
        if (alertCallback) {
            alertCallback({
                type: 'info',
                title,
                message,
                confirmText,
            });
        }
    },
};

export { Alert, AlertContainer };
