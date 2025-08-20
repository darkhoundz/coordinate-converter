# Coordinate Converter

A modern web-based coordinate converter that transforms latitude and longitude coordinates from Degrees, Minutes, Seconds (DMS) format to Decimal Degrees format.

## Features

- **Modern Dark Theme**: Beautiful gradient design with dark color scheme
- **DMS to Decimal Conversion**: Convert coordinates from degrees, minutes, seconds to decimal format
- **Input Validation**: Comprehensive validation for coordinate bounds and format
- **Copy to Clipboard**: One-click copy functionality for converted results
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multiple Output Formats**: Results shown in various formats including Google Maps compatible
- **Real-time Validation**: Input bounds checking with user-friendly error messages
- **Keyboard Support**: Press Enter to convert coordinates
- **Examples**: Includes real-world coordinate examples for reference

## Usage

1. Open `index.html` in any modern web browser
2. Enter the degrees, minutes, and seconds for latitude and longitude
3. Select the direction (N/S for latitude, E/W for longitude)
4. Click "Convert to Decimal Degrees" or press Enter
5. Copy the results using the copy button

## Examples

- **New York City**: 40° 44' 54.36" N, 74° 0' 21.49" W → 40.748433, -74.005969
- **London**: 51° 30' 26" N, 0° 7' 39" W → 51.507222, -0.1275
- **Tokyo**: 35° 40' 39" N, 139° 45' 10" E → 35.6775, 139.752778

## Technical Details

- Pure HTML, CSS, and JavaScript (no external dependencies)
- Uses modern CSS features like gradients and grid layout
- Implements modern `navigator.clipboard` API with fallback support
- Comprehensive input validation with edge case handling
- Mobile-responsive design

## File Structure

```
.
├── index.html          # Main coordinate converter application
├── .gitignore         # Git ignore file for version control
└── README.md          # This documentation file
```

## Version Control

This project uses Git for version control. All changes are tracked and documented through commits.

## Browser Compatibility

- Chrome 63+
- Firefox 53+
- Safari 13+
- Edge 79+

## License

This project is open source and available for educational and commercial use.
