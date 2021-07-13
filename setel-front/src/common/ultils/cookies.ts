
import Cookies from "js-cookie";
import { useState } from "react";


const useCookiesStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item =  Cookies.get(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: any) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            Cookies.set(key, value);
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
};

export { useCookiesStorage };
