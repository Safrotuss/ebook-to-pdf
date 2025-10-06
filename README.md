# E-Book to PDF Converter
[한국어](docs/README.ko.md) | [日本語](docs/README.ja.md) | [中文](docs/README.zh.md)

A desktop application that automatically captures pages from E-Book viewers and converts them to PDF.

## Features
- Automatic screen region capture
- Automatic page turning (Right arrow key or Enter key)
- PDF conversion
- Adjustable capture speed
- Real-time progress display
- Multi-platform support (macOS, Windows)
- Multi-language support (English, Korean, Japanese, Chinese)

## Tech Stack
- Electron
- React
- TypeScript
- Sharp (Image processing)
- PDFKit (PDF generation)

## Installation
```bash
npm install
```

## Running the Application

### For Development
```bash
# Build
npm run build

# Run
npm start
```

### For Production
```bash
# Coming soon
```

## Build
### Build for both macOS & Windows
```bash
npm run package
```

### Build for macOS only
```bash
npm run package:mac
```

### Build for Windows only
```bash
npm run package:win
```

Build output will be in the `release` folder.

## How to Use
1. Open your E-Book viewer and navigate to the first page
2. Click to set the top-left coordinate of the capture area
3. Click to set the bottom-right coordinate of the capture area
4. Enter the total number of pages
5. Enter the PDF file name
6. Select save location (optional, default: Downloads folder)
7. Adjust capture speed (default: 500ms)
8. Click "Create PDF" button
9. When the app minimizes, click on the app you want to capture (capture starts automatically 1 second after clicking)

## Important Notes
- The E-Book viewer must support page navigation using the right arrow key or Enter key
- The capture area must not exceed the viewer boundaries
- Large page counts may take considerable time
- Do not perform other tasks during capture
- For personal use only
- The folder containing the PDF will open automatically when capture is complete

## System Requirements
### macOS
- macOS 10.14 or later
- Screen Recording permission required
- Accessibility permission required (for keyboard input)

### Windows
- Windows 10 or later
- PowerShell 5.0 or later

## Legal Notice
This program is created for personal learning and use purposes only.
Sharing or commercial use of generated PDF files may violate copyright laws.
All responsibility lies with the user.

## License
Apache 2.0

Copyright 2025 efforthye

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
