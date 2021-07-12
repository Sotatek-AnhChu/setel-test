export const convertToPromise = (target: any): ((...arg: any[]) => Promise<any>) => {
    const converted = async (...arg: any[]) => {
        return new Promise(async (resolve, reject) => {
            if (target.constructor.name == "AsyncFunction" || target instanceof Promise) {
                target(...arg)
                    .then(resolve)
                    .catch(reject);
            } else {
                const result = target(...arg);
                resolve(result);
            }
        });
    };
    return converted;
};
