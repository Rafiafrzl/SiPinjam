export const getImageUrl = (foto, placeholder = 'https://via.placeholder.com/300?text=No+Image') => {
    if (!foto || foto === 'default-barang.jpg') {
        return placeholder;
    }
    // Jika sudah URL lengkap (dari Cloudinary), return langsung
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
        return foto;
    }
    // Jika hanya filename, return apa adanya (untuk backward compatibility)
    return foto;
};
