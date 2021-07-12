
import { useState } from "react";


const useLocalStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Lấy ra giá trị từ local storage theo key truyền vào
            const item = window.localStorage.getItem(key);

            // COnvert dữ liệu
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Nếu không tồn tại object với thằng key truyền vào thì trả về giá trị ban đầu truyền vào
            console.log(error);
            return initialValue;
        }
    });

    // Hàm  set giá trị mới cho object trong localstorage
    const setValue = (value: any) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
};

export { useLocalStorage };
