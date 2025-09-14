import { SvgData } from './svgParser';

export class ReactGenerator {
    static generate(fileName: string, svgData: SvgData): string {
        const componentName = this.toPascalCase(fileName);
        const { viewBox, innerContent } = svgData;
        
        const viewBoxString = viewBox.x !== undefined && viewBox.y !== undefined
            ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
            : `0 0 ${viewBox.width} ${viewBox.height}`;

        return `import { SvgIcon } from '@imile/components';

import type { SvgIconProps } from '@imile/components';

export function ${componentName}Icon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="${viewBoxString}" {...props}>
      ${innerContent}
    </SvgIcon>
  );
}
`;
    }

    static getComponentFileName(fileName: string): string {
        const componentName = this.toPascalCase(fileName);
        return `${componentName}Icon.tsx`;
    }

    private static toPascalCase(str: string): string {
        return str
            // Replace hyphens, underscores, dots, and spaces with spaces
            .replace(/[-_.]/g, ' ')
            // Split by spaces and convert each word
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
            // Remove any remaining non-alphanumeric characters
            .replace(/[^a-zA-Z0-9]/g, '');
    }
}