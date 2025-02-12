function scaleFontSize(fontSize: string, factor: number): string {
    const match = fontSize.match(/^([\d.]+)(px|rem|em|%)$/);

    if (!match) {
        throw new Error(`Invalid font size format: ${fontSize}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    return `${value * factor}${unit}`;
}

export { scaleFontSize };

// todo: create a function that adds opacity to a valid css color. this function should work with color names, hex, rgb, hsl, and rgba colors.
function addOpacity(color: string, opacity: number): string {
    // Ensure opacity is clamped between 0 and 1
    opacity = Math.max(0, Math.min(1, opacity));

    // Convert named colors to RGB using a temporary element
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.fillStyle = color;
    const computedColor = ctx.fillStyle; // This normalizes named colors to `rgb(r, g, b)`

    // HEX format (#RRGGBB or #RRGGBBAA)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(computedColor)) {
        if (computedColor.length === 7) {
            // Convert to #RRGGBBAA
            return computedColor + Math.round(opacity * 255).toString(16).padStart(2, "0");
        } else if (computedColor.length === 9) {
            // Replace existing alpha channel
            return computedColor.slice(0, 7) + Math.round(opacity * 255).toString(16).padStart(2, "0");
        }
    }

    // RGB / RGBA format
    const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // HSL / HSLA format
    const hslMatch = computedColor.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/);
    if (hslMatch) {
        const [, h, s, l] = hslMatch;
        return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
    }

    throw new Error(`Unsupported color format: ${color}`);
}

export { addOpacity };