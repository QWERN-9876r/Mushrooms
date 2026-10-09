export function throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number,
): T {
    let inThrottle: boolean = false

    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    } as T
}
