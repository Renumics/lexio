type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

/**
 * Utility function to merge tailwind utility classes
 *
 * @remarks
 * - Calling cn("pb-1 text-white", { "rounded-md": true, "truncate": false }) will return "pb-1 text-white rounded-md"
 */
export const cn = (...inputs: ClassValue[]) => {
    return inputs
        .flatMap<string>((arg: ClassValue): string[] => {
            if (!arg) return [];
            if (typeof arg === "string") return [arg];
            if (Array.isArray(arg)) return cn(...arg).split(" ");
            if (typeof arg === "object") {
                return Object.entries(arg)
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .filter(([_, value]) => Boolean(value))
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map(([key, _]) => key);
            }
            return [];
        })
        .filter(Boolean)
        .join(" ")
        .trim();
}
