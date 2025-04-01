type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

export const cn = (...inputs: ClassValue[]) => {
    return inputs
        .filter(Boolean)
        .join(" ")
        .trim();
}
