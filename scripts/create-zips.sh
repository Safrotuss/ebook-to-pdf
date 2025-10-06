#!/bin/bash
cd release
echo "Creating ZIP files..."
zip -q EBookToPDF-1.0.0-macOS-arm64.zip "E-Book to PDF-1.0.0-arm64.dmg" 2>/dev/null || echo "DMG not found"
zip -q EBookToPDF-1.0.0-Windows-Setup.zip "E-Book to PDF Setup 1.0.0.exe" 2>/dev/null || echo "EXE not found"
echo "ZIP files created!"
ls -lh *.zip 2>/dev/null || echo "No ZIP files created"
