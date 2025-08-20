
        let map;
        let marker;

        document.addEventListener('DOMContentLoaded', function() {
            initializeMap();
        });

        function initializeMap() {
            map = L.map('map').setView([20, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                updateMapLocation(lat, lng);
                populateInputsFromMap(lat, lng);
            });
        }

        function updateMapLocation(lat, lng) {
            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lng]).addTo(map);

            map.setView([lat, lng], Math.max(map.getZoom(), 10));

            updateMapInfo(lat, lng);
        }

        function updateMapInfo(lat, lng) {
            const mapInfo = document.getElementById('map-info');
            const mapCoordinates = document.getElementById('map-coordinates');
            const mapZoom = document.getElementById('map-zoom');

            mapInfo.style.display = 'block';
            mapCoordinates.textContent = `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
            mapZoom.textContent = map.getZoom();

            map.on('zoomend', function() {
                mapZoom.textContent = map.getZoom();
            });
        }

        function populateInputsFromMap(lat, lng) {
            const latDMS = decimalToDMS(Math.abs(lat));
            const lngDMS = decimalToDMS(Math.abs(lng));
            
            document.getElementById('lat-deg').value = latDMS.degrees;
            document.getElementById('lat-min').value = latDMS.minutes;
            document.getElementById('lat-sec').value = latDMS.seconds.toFixed(3);
            document.getElementById('lat-dir').value = lat >= 0 ? 'N' : 'S';
            
            document.getElementById('lng-deg').value = lngDMS.degrees;
            document.getElementById('lng-min').value = lngDMS.minutes;
            document.getElementById('lng-sec').value = lngDMS.seconds.toFixed(3);
            document.getElementById('lng-dir').value = lng >= 0 ? 'E' : 'W';

            convertCoordinates();
        }

        function convertCoordinates() {
            const errorElement = document.getElementById('error-message');
            errorElement.style.display = 'none';

            try {
                const latDeg = parseFloat(document.getElementById('lat-deg').value) || 0;
                const latMin = parseFloat(document.getElementById('lat-min').value) || 0;
                const latSec = parseFloat(document.getElementById('lat-sec').value) || 0;
                const latDir = document.getElementById('lat-dir').value;

                const lngDeg = parseFloat(document.getElementById('lng-deg').value) || 0;
                const lngMin = parseFloat(document.getElementById('lng-min').value) || 0;
                const lngSec = parseFloat(document.getElementById('lng-sec').value) || 0;
                const lngDir = document.getElementById('lng-dir').value;

                if (!validateInputs(latDeg, latMin, latSec, lngDeg, lngMin, lngSec)) {
                    return;
                }

                const latDecimal = dmsToDecimal(latDeg, latMin, latSec, latDir);
                const lngDecimal = dmsToDecimal(lngDeg, lngMin, lngSec, lngDir);

                const result = `Latitude: ${latDecimal.toFixed(6)}°
Longitude: ${lngDecimal.toFixed(6)}°

Coordinates: ${latDecimal.toFixed(6)}, ${lngDecimal.toFixed(6)}

Google Maps format: ${latDecimal.toFixed(6)}, ${lngDecimal.toFixed(6)}

Original DMS:
Latitude: ${latDeg}° ${latMin}' ${latSec}" ${latDir}
Longitude: ${lngDeg}° ${lngMin}' ${lngSec}" ${lngDir}`;

                document.getElementById('result').value = result;

                displayActionButtons(latDecimal, lngDecimal);

                updateMapLocation(latDecimal, lngDecimal);

                const copyBtn = document.getElementById('copy-btn');
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');

            } catch (error) {
                showError('An error occurred during conversion. Please check your inputs.');
                clearActionButtons();
            }
        }

        function dmsToDecimal(degrees, minutes, seconds, direction) {
            let decimal = degrees + (minutes / 60) + (seconds / 3600);
            
            if (direction === 'S' || direction === 'W') {
                decimal = -decimal;
            }
            
            return decimal;
        }

        function validateInputs(latDeg, latMin, latSec, lngDeg, lngMin, lngSec) {
            if (latDeg < 0 || latMin < 0 || latSec < 0 || lngDeg < 0 || lngMin < 0 || lngSec < 0) {
                showError('Degrees, minutes, and seconds must be positive. Use the direction selector for North/South and East/West.');
                return false;
            }

            if (latDeg > 90) {
                showError('Latitude degrees cannot exceed 90°.');
                return false;
            }

            if (lngDeg > 180) {
                showError('Longitude degrees cannot exceed 180°.');
                return false;
            }

            if (latMin >= 60 || lngMin >= 60) {
                showError('Minutes must be less than 60.');
                return false;
            }

            if (latSec >= 60 || lngSec >= 60) {
                showError('Seconds must be less than 60.');
                return false;
            }

            if (latDeg === 90 && (latMin > 0 || latSec > 0)) {
                showError('Latitude cannot exceed 90°. When degrees is 90, minutes and seconds must be 0.');
                return false;
            }

            if (lngDeg === 180 && (lngMin > 0 || lngSec > 0)) {
                showError('Longitude cannot exceed 180°. When degrees is 180, minutes and seconds must be 0.');
                return false;
            }

            return true;
        }

        function showError(message) {
            const errorElement = document.getElementById('error-message');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        async function copyToClipboard() {
            const resultText = document.getElementById('result').value;
            const copyBtn = document.getElementById('copy-btn');

            if (!resultText.trim()) {
                showError('No coordinates to copy. Please convert some coordinates first.');
                return;
            }

            try {
                await navigator.clipboard.writeText(resultText);
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
                
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = resultText;
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (fallbackErr) {
                    showError('Failed to copy to clipboard. Please copy manually.');
                }
                
                document.body.removeChild(textArea);
            }
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                convertCoordinates();
            }
        });

        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('blur', function() {
                const value = parseFloat(this.value);
                
                if (this.id.includes('deg')) {
                    const isLat = this.id.includes('lat');
                    const max = isLat ? 90 : 180;
                    if (value > max) {
                        this.value = max;
                    }
                } else if (this.id.includes('min') || this.id.includes('sec')) {
                    if (value >= 60) {
                        this.value = 59.999;
                    }
                }
                
                if (value < 0) {
                    this.value = 0;
                }
            });
        });

        function parseSmartInput() {
            const input = document.getElementById('smart-input').value.trim();
            if (!input) {
                clearParsedResults();
                return;
            }

            try {
                const coordinates = parseCoordinateText(input);
                if (coordinates.length > 0) {
                    displayParsedCoordinates(coordinates);
                    if (coordinates.length === 1) {
                        populateManualInputs(coordinates[0]);
                        convertCoordinates();
                        updateMapLocation(coordinates[0].lat, coordinates[0].lng);
                    } else if (coordinates.length > 1) {
                        displayActionButtons(coordinates[0].lat, coordinates[0].lng);
                        updateMapLocation(coordinates[0].lat, coordinates[0].lng);
                    }
                } else {
                    clearParsedResults();
                    clearActionButtons();
                }
            } catch (error) {
                console.error('Parsing error:', error);
                showError('Unable to parse the coordinate format. Please check your input.');
            }
        }

        function parseCoordinateText(text) {
            const coordinates = [];
            
            text = text.replace(/[""]/g, '"').replace(/'/g, "'");
            
            const decimalPattern = /(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/g;
            
            const dmsPattern = /(\d+)°?\s*(\d+)'?\s*(\d+(?:\.\d+)?)"?\s*([NSEW])\s*,?\s*(\d+)°?\s*(\d+)'?\s*(\d+(?:\.\d+)?)"?\s*([NSEW])/g;
            
            const dmsDirectionFirstPattern = /([NSEW])\s*(\d+)°?\s*(\d+)'?\s*(\d+(?:\.\d+)?)"?\s*([NSEW])\s*(\d+)°?\s*(\d+)'?\s*(\d+(?:\.\d+)?)"?/g;
            
            const dmPattern = /(\d+)\.(\d+)'(\d+(?:\.\d+)?)"?([NSEW])/g;
            
            const labeledPattern = /(?:lat(?:itude)?[:\s]*(-?\d+\.?\d*)°?\s*(?:long(?:itude)?[:\s]*(-?\d+\.?\d*)°?)?)|(?:long(?:itude)?[:\s]*(-?\d+\.?\d*)°?)/gi;
            
            let match;
            
            while ((match = dmsPattern.exec(text)) !== null) {
                const lat = parseDMSToDecimal(parseInt(match[1]), parseInt(match[2]), parseFloat(match[3]), match[4]);
                const lng = parseDMSToDecimal(parseInt(match[5]), parseInt(match[6]), parseFloat(match[7]), match[8]);
                coordinates.push({ lat, lng, format: 'DMS', original: match[0] });
            }
            
            if (coordinates.length === 0) {
                while ((match = dmsDirectionFirstPattern.exec(text)) !== null) {
                    let lat, lng;
                    if (match[1] === 'N' || match[1] === 'S') {
                        lat = parseDMSToDecimal(parseInt(match[2]), parseInt(match[3]), parseFloat(match[4]), match[1]);
                        lng = parseDMSToDecimal(parseInt(match[6]), parseInt(match[7]), parseFloat(match[8]), match[5]);
                    } else {
                        lng = parseDMSToDecimal(parseInt(match[2]), parseInt(match[3]), parseFloat(match[4]), match[1]);
                        lat = parseDMSToDecimal(parseInt(match[6]), parseInt(match[7]), parseFloat(match[8]), match[5]);
                    }
                    coordinates.push({ lat, lng, format: 'DMS Direction First', original: match[0] });
                }
            }
            
            if (coordinates.length === 0) {
                while ((match = decimalPattern.exec(text)) !== null) {
                    const lat = parseFloat(match[1]);
                    const lng = parseFloat(match[2]);
                    if (isValidCoordinate(lat, lng)) {
                        coordinates.push({ lat, lng, format: 'Decimal', original: match[0] });
                    }
                }
            }
            
            if (coordinates.length === 0) {
                const labeledMatches = [];
                while ((match = labeledPattern.exec(text)) !== null) {
                    labeledMatches.push(match);
                }
                
                for (let i = 0; i < labeledMatches.length; i++) {
                    const latMatch = labeledMatches[i][1];
                    const lngMatch = labeledMatches[i][2] || labeledMatches[i][3];
                    
                    if (latMatch && lngMatch) {
                        const lat = parseFloat(latMatch);
                        const lng = parseFloat(lngMatch);
                        if (isValidCoordinate(lat, lng)) {
                            coordinates.push({ lat, lng, format: 'Labeled', original: labeledMatches[i][0] });
                        }
                    }
                }
            }
            
            if (coordinates.length === 0) {
                const dmMatches = [];
                while ((match = dmPattern.exec(text)) !== null) {
                    dmMatches.push(match);
                }
                
                if (dmMatches.length >= 2) {
                    for (let i = 0; i < dmMatches.length - 1; i += 2) {
                        const coord1 = parseDMToDecimal(dmMatches[i]);
                        const coord2 = parseDMToDecimal(dmMatches[i + 1]);
                        
                        let lat, lng;
                        if (dmMatches[i][4] === 'N' || dmMatches[i][4] === 'S') {
                            lat = coord1;
                            lng = coord2;
                        } else {
                            lat = coord2;
                            lng = coord1;
                        }
                        
                        if (isValidCoordinate(lat, lng)) {
                            coordinates.push({ lat, lng, format: 'Decimal Minutes', original: dmMatches[i][0] + ' ' + dmMatches[i + 1][0] });
                        }
                    }
                }
            }
            
            return coordinates;
        }

        function parseDMSToDecimal(degrees, minutes, seconds, direction) {
            let decimal = degrees + (minutes / 60) + (seconds / 3600);
            if (direction === 'S' || direction === 'W') {
                decimal = -decimal;
            }
            return decimal;
        }

        function parseDMToDecimal(match) {
            const degrees = parseInt(match[1]);
            const minutes = parseFloat(match[2] + '.' + match[3]);
            const direction = match[4];
            
            let decimal = degrees + (minutes / 60);
            if (direction === 'S' || direction === 'W') {
                decimal = -decimal;
            }
            return decimal;
        }

        function isValidCoordinate(lat, lng) {
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        }

        function displayParsedCoordinates(coordinates) {
            clearParsedResults();
            
            const resultContainer = document.querySelector('.result-section');
            const parsedDiv = document.createElement('div');
            parsedDiv.className = 'parsed-coordinates';
            parsedDiv.id = 'parsed-results';
            
            let html = '<h4>🎯 Parsed Coordinates:</h4><ul class="coordinate-list">';
            
            coordinates.forEach((coord, index) => {
                html += `<li>
                    <strong>Point ${index + 1}:</strong> ${coord.lat.toFixed(6)}\t${coord.lng.toFixed(6)}
                    <br><small>Format: ${coord.format} | Original: "${coord.original}"</small>
                </li>`;
            });
            
            html += '</ul>';
            parsedDiv.innerHTML = html;
            
            resultContainer.insertBefore(parsedDiv, resultContainer.firstChild);
        }

        function clearParsedResults() {
            const existing = document.getElementById('parsed-results');
            if (existing) {
                existing.remove();
            }
        }

        function populateManualInputs(coordinate) {
            const latDMS = decimalToDMS(Math.abs(coordinate.lat));
            const lngDMS = decimalToDMS(Math.abs(coordinate.lng));
            
            document.getElementById('lat-deg').value = latDMS.degrees;
            document.getElementById('lat-min').value = latDMS.minutes;
            document.getElementById('lat-sec').value = latDMS.seconds.toFixed(3);
            document.getElementById('lat-dir').value = coordinate.lat >= 0 ? 'N' : 'S';
            
            document.getElementById('lng-deg').value = lngDMS.degrees;
            document.getElementById('lng-min').value = lngDMS.minutes;
            document.getElementById('lng-sec').value = lngDMS.seconds.toFixed(3);
            document.getElementById('lng-dir').value = coordinate.lng >= 0 ? 'E' : 'W';
        }

        function decimalToDMS(decimal) {
            const degrees = Math.floor(decimal);
            const minutesFloat = (decimal - degrees) * 60;
            const minutes = Math.floor(minutesFloat);
            const seconds = (minutesFloat - minutes) * 60;
            
            return { degrees, minutes, seconds };
        }

        function clearSmartInput() {
            document.getElementById('smart-input').value = '';
            clearParsedResults();
            clearActionButtons();
            
            document.getElementById('lat-deg').value = '';
            document.getElementById('lat-min').value = '';
            document.getElementById('lat-sec').value = '';
            document.getElementById('lng-deg').value = '';
            document.getElementById('lng-min').value = '';
            document.getElementById('lng-sec').value = '';
            
            document.getElementById('result').value = '';
            
            resetMap();
        }

        function resetMap() {
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            map.setView([20, 0], 2);
            document.getElementById('map-info').style.display = 'none';
        }

        function displayActionButtons(lat, lng) {
            const existing = document.getElementById('action-buttons');
            if (existing) {
                existing.remove();
            }

            const actionContainer = document.createElement('div');
            actionContainer.className = 'action-buttons';
            actionContainer.id = 'action-buttons';

            const googleEarthBtn = document.createElement('a');
            googleEarthBtn.className = 'action-btn google-earth';
            googleEarthBtn.href = `https://earth.google.com/web/search/${lat},${lng}/@${lat},${lng},1000a,35y,0h,0t,0r`;
            googleEarthBtn.target = '_blank';
            googleEarthBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Show on Google Earth
            `;

            const googleMapsBtn = document.createElement('a');
            googleMapsBtn.className = 'action-btn google-maps';
            googleMapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            googleMapsBtn.target = '_blank';
            googleMapsBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Open in Google Maps
            `;

            const osmBtn = document.createElement('a');
            osmBtn.className = 'action-btn openstreetmap';
            osmBtn.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
            osmBtn.target = '_blank';
            osmBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                View on OpenStreetMap
            `;

            actionContainer.appendChild(googleEarthBtn);
            actionContainer.appendChild(googleMapsBtn);
            actionContainer.appendChild(osmBtn);

            const resultContainer = document.querySelector('.result-container');
            resultContainer.parentNode.insertBefore(actionContainer, resultContainer.nextSibling);
        }

        function clearActionButtons() {
            const existing = document.getElementById('action-buttons');
            if (existing) {
                existing.remove();
            }
        }
