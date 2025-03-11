import { clsx, type ClassValue } from "clsx"

export const cn = (...inputs: ClassValue[]) => {
    return clsx(inputs);
}
