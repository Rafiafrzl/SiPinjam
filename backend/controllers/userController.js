import User from '../models/User.js';

// Get all users (admin only) - hanya menampilkan user biasa, bukan admin
export const getAllUsers = async (req, res) => {
    try {
        const { search, isActive, page = 1, limit = 10 } = req.query;

        // Build query - hanya tampilkan user biasa (bukan admin)
        const query = { role: 'user' };

        // Filter by isActive
        if (isActive !== undefined && isActive !== 'all') {
            query.isActive = isActive === 'true';
        }

        // Search by nama or email
        if (search) {
            query.$or = [
                { nama: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { kelas: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get users
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                current: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data users',
            error: error.message
        });
    }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
            error: error.message
        });
    }
};

// Toggle user active status (admin only)
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Tidak bisa menonaktifkan akun sendiri'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
            data: {
                _id: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengubah status user',
            error: error.message
        });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Tidak bisa menghapus akun sendiri'
            });
        }

        // Prevent deleting admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Tidak bisa menghapus akun admin'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus user',
            error: error.message
        });
    }
};
