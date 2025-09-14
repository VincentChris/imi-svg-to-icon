export interface SvgData {
    viewBox: {
        width: number;
        height: number;
        x?: number;
        y?: number;
    };
    innerContent: string;
}

export class SvgParser {
    private static readonly SVG_REGEX = /<svg[^>]*>([\s\S]*?)<\/svg>/i;
    private static readonly VIEWBOX_REGEX = /viewBox\s*=\s*["']([^"']+)["']/i;

    static parse(svgContent: string): SvgData | null {
        try {
            // Extract SVG content
            const svgMatch = svgContent.match(this.SVG_REGEX);
            if (!svgMatch) {
                return null;
            }

            const innerContent = svgMatch[1].trim();

            // Extract viewBox
            const viewBoxMatch = svgContent.match(this.VIEWBOX_REGEX);
            if (!viewBoxMatch) {
                // Try to extract width and height attributes as fallback
                const widthMatch = svgContent.match(/width\s*=\s*["']([^"']+)["']/i);
                const heightMatch = svgContent.match(/height\s*=\s*["']([^"']+)["']/i);
                
                if (widthMatch && heightMatch) {
                    const width = parseFloat(widthMatch[1]);
                    const height = parseFloat(heightMatch[1]);
                    
                    if (!isNaN(width) && !isNaN(height)) {
                        return {
                            viewBox: { width, height, x: 0, y: 0 },
                            innerContent
                        };
                    }
                }
                
                // Default fallback
                return {
                    viewBox: { width: 24, height: 24, x: 0, y: 0 },
                    innerContent
                };
            }

            // Parse viewBox values
            const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(v => parseFloat(v.trim()));
            if (viewBoxValues.length !== 4) {
                return null;
            }

            const [x, y, width, height] = viewBoxValues;
            
            if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
                return null;
            }

            return {
                viewBox: { x, y, width, height },
                innerContent
            };

        } catch (error) {
            console.error('Error parsing SVG:', error);
            return null;
        }
    }

    static isValidSvg(content: string): boolean {
        return this.SVG_REGEX.test(content);
    }
}