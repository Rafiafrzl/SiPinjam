export const getImageUrl = (foto, placeholder = 'https://via.placeholder.com/300?text=No+Image') => {
    if (!foto || foto === 'default-barang.jpg') {
        return placeholder;
    }
    return foto;
};
