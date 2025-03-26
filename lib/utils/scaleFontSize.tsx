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

    // Handle common color formats directly without relying on canvas
    
    // Named colors mapping (add more as needed)
    const namedColors: Record<string, string> = {
        black: "#000000",
        white: "#FFFFFF",
        red: "#FF0000",
        green: "#008000",
        blue: "#0000FF",
        // Add more named colors as needed
    };
    
    // Convert named colors if they exist in our mapping
    if (namedColors[color.toLowerCase()]) {
        color = namedColors[color.toLowerCase()];
    }

    // HEX format (#RGB or #RRGGBB)
    if (color.startsWith('#')) {
        // Convert shorthand hex (#RGB) to full form (#RRGGBB)
        if (color.length === 4) {
            color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        
        // Standard hex color (#RRGGBB)
        if (color.length === 7) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        
        // Hex with alpha (#RRGGBBAA)
        if (color.length === 9) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    // RGB format
    const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // RGBA format - extract existing values and replace opacity
    const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/);
    if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // HSL format
    const hslMatch = color.match(/^hsl\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
    if (hslMatch) {
        const [, h, s, l] = hslMatch;
        return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
    }
    
    // HSLA format - extract existing values and replace opacity
    const hslaMatch = color.match(/^hsla\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*,\s*[\d.]+\s*\)$/);
    if (hslaMatch) {
        const [, h, s, l] = hslaMatch;
        return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
    }

    // If we can't parse the color, return it with the requested opacity
    // This is a fallback that might work in some cases
    return `rgba(0, 0, 0, ${opacity})`;
}

export { addOpacity };