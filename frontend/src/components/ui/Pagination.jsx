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
        <div className="flex items-center justify-center gap-3 pt-6">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border
                    ${currentPage === 1
                        ? 'bg-neutral-900 border-neutral-800 text-gray-700 cursor-not-allowed'
                        : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:border-purple-500/50 active:scale-95'
                    }`}
            >
                <IoChevronBack size={16} />
                Sebelumnya
            </button>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                <span className="text-sm font-bold text-purple-400">{currentPage}</span>
                <span className="text-xs text-gray-600">/</span>
                <span className="text-sm font-bold text-gray-400">{totalPages}</span>
            </div>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border
                    ${currentPage === totalPages
                        ? 'bg-neutral-900 border-neutral-800 text-gray-700 cursor-not-allowed'
                        : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:border-purple-500/50 active:scale-95'
                    }`}
            >
                Selanjutnya
                <IoChevronForward size={16} />
            </button>
        </div>
    );
};

export default Pagination;
