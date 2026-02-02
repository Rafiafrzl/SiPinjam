import { useEffect, useRef } from 'react';

const usePolling = (callback, interval = 5000) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        if (interval !== null) {
            let id = setInterval(tick, interval);
            return () => clearInterval(id);
        }
    }, [interval]);
};

export default usePolling;
