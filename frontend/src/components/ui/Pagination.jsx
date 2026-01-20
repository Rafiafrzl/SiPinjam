import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="flex items-center justify-center gap-3 pt-2">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                    ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                    }`}
            >
                <IoChevronBack size={16} />
                Sebelumnya
            </button>

            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                {currentPage} / {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                    ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                    }`}
            >
                Selanjutnya
                <IoChevronForward size={16} />
            </button>
        </div>
    );
};

export default Pagination;
