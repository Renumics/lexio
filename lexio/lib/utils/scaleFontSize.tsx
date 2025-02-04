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