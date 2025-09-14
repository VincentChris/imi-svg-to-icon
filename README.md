# IMI SVG to React Icon Extension

VS Code extension that converts SVG files to React components using @imile/components SvgIcon.

## Features

- Convert SVG files to React components with a single command
- Automatic viewBox extraction from SVG content
- PascalCase component naming (e.g., `upload-fill.svg` → `UploadFillIcon`)
- Integration with @imile/components SvgIcon component

## Usage

### Convert SVG File to React Component

1. Right-click on an SVG file in the explorer
2. Select "Convert SVG to React Component"
3. The React component will be created in the same directory
4. The generated file will automatically open in the editor

### Alternative: Use Keyboard Shortcut

1. **Open an SVG file in the editor**
2. **Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac)** 
3. **The current SVG file will be converted automatically**

## Generated Component Format

```typescript
import { SvgIcon } from '@imile/components';

import type { SvgIconProps } from '@imile/components';

export function ComponentNameIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 width height" {...props}>
      {/* SVG content */}
    </SvgIcon>
  );
}
```

## Development

1. Install dependencies: `npm install`
2. Compile TypeScript: `npm run compile`
3. Press F5 to run the extension in a new Extension Development Host window
4. Test the extension with SVG files

## Requirements

- VS Code 1.74.0 or higher
- @imile/components package in your project