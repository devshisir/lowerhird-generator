let canvas = new fabric.Canvas('lowerThirdCanvas');
        let bgRect, text1, text2, text3, bgImage = null;


        // Constants and Initial Values
        const GOOGLE_FONTS_API_KEY = 'AIzaSyB8VYq4-yRAvtFwZ1MdF_xn8PulMgZXLiI';
        const FULL_WIDTH = 1920;
        const FULL_HEIGHT = 1080;
        const PREVIEW_WIDTH = 768;
        const PREVIEW_HEIGHT = 432;
        const SCALE_FACTOR = 0.4;

        let baseRectWidth = 0;
        let baseRectHeight = 0;
        let baseRectLeft = 0;
        let baseRectTop = 0;

        let originalRectWidth = 0;
        let originalRectLeft = 0;

        const INITIAL_FONTS = {
            fontFamily1: 'Roboto',
            fontFamily2: 'Roboto',
            fontFamily3: 'Roboto'
        };

        const SYSTEM_FONTS = ['Arial', 'Helvetica', 'Verdana', 'Georgia'];

        const ALLOWED_FONTS = [
            'Roboto',
            'Open Sans',
            'Lato',
            'Montserrat',
            'Poppins',
            'Oswald',
            'Raleway',
            'Merriweather',
            'Nunito',
            'Playfair Display'
        ];

        const loadedFonts = new Set();

        const INITIAL_VALUES = {
            text1: 'John Smith',
            text2: 'Graphic Designer, Simple Thirds',
            text3: 'Additional Information Here',
            fontColor: '#ffffff',
            fontSize1: 50,
            fontSize2: 35,
            fontSize3: 31,
            lineSpacing1: 50,
            lineSpacing2: 50,
            bottomHeight: 100,
            bgColor: '#154c79',
            bgOpacity: 100,
            textAlignment: 'left',
            textMargin: 0,
            leftCrop: 0,
            rightCrop: 0,
            roundedEdges: 0,
            rectType: 'solid',
            gradientColor1: '#000000',
            gradientColor2: '#ffffff',
            gradientDirection: 'left-right',
            rectHeight: 100,
            rectPadding: 0,
            baseHeight: 100,
            strokeEnabled: false,
            strokeWidth: 2,
            strokeColor: '#ffffff',
            fontFamily1: 'Roboto',
            fontFamily2: 'Roboto',
            fontFamily3: 'Roboto',
            verticalPosition: 0
        };

        let bottomHeight = 100;
        let verticalOffset = 100;
        let verticalOffsetPercent = 0;
        const MAX_VERTICAL_OFFSET = 0;
        const MAX_VERTICAL_RANGE = 100;

        // Initial Setup
        function initializeCanvas() {
            canvas.clear();

            const baseTop = calculateYPosition();

            bgRect = new fabric.Rect({
                left: (FULL_WIDTH * INITIAL_VALUES.leftCrop / 100) * SCALE_FACTOR,
                top: baseTop,
                width: FULL_WIDTH * (1 - (INITIAL_VALUES.leftCrop + INITIAL_VALUES.rightCrop) / 100) * SCALE_FACTOR, // Fixed parentheses
                height: 150 * SCALE_FACTOR,
                fill: '#154c79',
                opacity: INITIAL_VALUES.bgOpacity / 100,
                rx: 0,
                ry: 0,
                selectable: false
            });

            baseRectWidth = bgRect.width;
            baseRectHeight = bgRect.height;
            baseRectLeft = bgRect.left;
            baseRectTop = bgRect.top;
            originalRectWidth = bgRect.width;
            originalRectLeft = bgRect.left;

            const verticalSlider = document.getElementById('verticalPosition');
            verticalSlider.min = -MAX_VERTICAL_RANGE;
            verticalSlider.max = 7;
            verticalSlider.value = 0;

            bgRect.baseTop = baseTop; // Set baseTop for rectangle

            // Text Elements
            text1 = createTextElement(1, bgRect.top + 20 * SCALE_FACTOR - 4);
            text2 = createTextElement(2, text1.top + INITIAL_VALUES.lineSpacing1 * SCALE_FACTOR);
            text3 = createTextElement(3, text2.top + INITIAL_VALUES.lineSpacing2 * SCALE_FACTOR - 3);

            canvas.add(bgRect, text1, text2, text3);
            loadSampleBackground();
            canvas.renderAll();
        }

        // creating text elements
        function createTextElement(line, topPos) {
            const text = new fabric.Text(INITIAL_VALUES[`text${line}`], {
                left: 100 * SCALE_FACTOR,
                top: topPos,
                fontSize: INITIAL_VALUES[`fontSize${line}`] * SCALE_FACTOR,
                fill: '#ffffff',
                // fontFamily: INITIAL_VALUES[`fontFamily${line}`],
                selectable: false,
                textAlign: INITIAL_VALUES.textAlignment,
                visible: true
            });
            text.baseTop = topPos; // Set baseTop here
            return text;

        }

        function calculateYPosition() {
            const baseHeight = 150;
            const currentHeight = baseHeight * (document.getElementById('rectHeight').value / 100);

            // Get current bottom height from the slider
            bottomHeight = document.getElementById('bottomHeight')?.value || INITIAL_VALUES.bottomHeight;

            return (FULL_HEIGHT - bottomHeight - currentHeight) * SCALE_FACTOR;
        }

        // Reset Function
        function resetLowerThird() {
            // Reset UI Controls
            Object.keys(INITIAL_VALUES).forEach(key => {
                const el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = true;
                    } else {
                        el.value = INITIAL_VALUES[key];
                    }
                }
            });

            // Update value displays
            document.querySelectorAll('[id$="Value"]').forEach(el => {
                const prop = el.id.replace('Value', '');
                el.textContent = INITIAL_VALUES[prop] || document.getElementById(prop).value;
            });

            // Explicitly reset font size displays
            document.getElementById('fontSizeValue1').textContent = INITIAL_VALUES.fontSize1;
            document.getElementById('fontSizeValue2').textContent = INITIAL_VALUES.fontSize2;
            document.getElementById('fontSizeValue3').textContent = INITIAL_VALUES.fontSize3;

            // Explicitly set font color
            document.getElementById('fontColor').value = INITIAL_VALUES.fontColor;
            [text1, text2, text3].forEach(t => t.set({ fill: INITIAL_VALUES.fontColor }));

            // set 0% for crop value
            document.getElementById("leftCropValue").textContent = "0%";
            document.getElementById("rightCropValue").textContent = "0%";

            document.getElementById("bgOpacityValue").textContent = "100%";
            document.getElementById("roundedEdgesValue").textContent = "0%";


            // Reset position controls
            [1, 2, 3].forEach(line => {
                const checkbox = document.getElementById(`enableLine${line}`);
                const slider = document.getElementById(`positionY${line}`);

                checkbox.checked = true;
                // Reset to default values
                const defaults = { 1: 750, 2: 800, 3: 850 };
                slider.value = defaults[line];
            });

            // Reset height control
            document.getElementById('rectHeight').value = INITIAL_VALUES.rectHeight;
            document.getElementById('rectHeightValue').textContent = INITIAL_VALUES.rectHeight + '%';

            // Reset stroke controls
            document.getElementById('strokeEnabled').checked = INITIAL_VALUES.strokeEnabled;
            document.getElementById('strokeWidth').value = INITIAL_VALUES.strokeWidth;
            document.getElementById('strokeColor').value = INITIAL_VALUES.strokeColor;
            document.getElementById('strokeWidthValue').textContent = `${INITIAL_VALUES.strokeWidth}px`;
            toggleStrokeSettings(INITIAL_VALUES.strokeEnabled);



            initializeCanvas();
            updateTextAlignment();
            updateBoxCrop();
            updateRoundedEdges();
            toggleRectangleSettings();
        }

        // Update Functions
        function updateText(line) {
            const newText = document.getElementById(`text${line}`).value;
            // Directly access the text objects
            switch (line) {
                case 1:
                    text1.set({ text: newText });
                    break;
                case 2:
                    text2.set({ text: newText });
                    break;
                case 3:
                    text3.set({ text: newText });
                    break;
            }
            canvas.renderAll();
        }

        // Update font size
        function updateFontSize(line) {
            const newSize = document.getElementById(`fontSize${line}`).value;
            document.getElementById(`fontSizeValue${line}`).textContent = newSize;
            switch (line) {
                case 1:
                    text1.set({ fontSize: newSize * SCALE_FACTOR });
                    break;
                case 2:
                    text2.set({ fontSize: newSize * SCALE_FACTOR });
                    break;
                case 3:
                    text3.set({ fontSize: newSize * SCALE_FACTOR });
                    break;
            }
            canvas.renderAll();
        }

        // update position
        function updateTextPosition(line) {
            const newY = document.getElementById(`positionY${line}`).value * SCALE_FACTOR;
            switch (line) {
                case 1:
                    text1.set({ top: newY });
                    break;
                case 2:
                    text2.set({ top: newY });
                    break;
                case 3:
                    text3.set({ top: newY });
                    break;
            }
            canvas.renderAll();
        }

        // line toggle active and function
        function toggleLine(line) {
            const isEnabled = document.getElementById(`enableLine${line}`).checked;
            const positionSlider = document.getElementById(`positionY${line}`);
            if (line === 1) {
                text1.set({ visible: isEnabled });
                // positionSlider.disabled = !isEnabled;
            }
            if (line === 2) {
                text2.set({ visible: isEnabled });
                // positionSlider.disabled = !isEnabled;
            }
            if (line === 3) {
                text3.set({ visible: isEnabled });
                // positionSlider.disabled = !isEnabled;
            }
            canvas.renderAll();
        }


        function updateLineSpacing() {
            lineSpacing1 = document.getElementById('lineSpacing1').value;
            lineSpacing2 = document.getElementById('lineSpacing2').value;
            text2.set({ top: text1.top + lineSpacing1 * SCALE_FACTOR });
            text3.set({ top: text2.top + lineSpacing2 * SCALE_FACTOR });
            canvas.renderAll();
        }

        function updateBottomHeight() {
            bottomHeight = document.getElementById('bottomHeight').value;
            bgRect.set({ top: calculateYPosition() });
            // Update text positions...
            canvas.renderAll();
        }

        function updateFontColor() {
            const newColor = document.getElementById('fontColor').value;
            [text1, text2, text3].forEach(t => t.set({ fill: newColor }));
            canvas.renderAll();
        }


        function updateTextAlignment() {
            const margin = parseInt(document.getElementById("textMargin").value) || 100 * SCALE_FACTOR;
            document.getElementById("textMarginValue").textContent = margin;
            const alignment = document.getElementById("textAlignment").value;

            // Get background rectangle boundaries
            const bgLeft = bgRect.left;
            const bgRight = bgRect.left + bgRect.width;

            [text1, text2, text3].forEach(t => {
                switch (alignment) {
                    case "left":
                        // Left edge of bgRect + margin
                        t.set({ left: bgLeft + margin });
                        break;

                    case "center":
                        // Center of bgRect - text width/2 + margin
                        t.set({
                            left: bgLeft + (bgRect.width / 2) - (t.getScaledWidth() / 2) + margin
                        });
                        break;

                    case "right":
                        // Right edge of bgRect - text width - margin
                        t.set({
                            left: bgRight - t.getScaledWidth() - margin
                        });
                        break;
                }
            });

            canvas.renderAll();
        }

        // Remove updateTextMargin and use this single function
        document.getElementById('textMargin').addEventListener('input', updateTextAlignment);
        document.getElementById('textAlignment').addEventListener('change', updateTextAlignment);


        function updateBoxCrop() {
            const leftCrop = document.getElementById('leftCrop').value;
            const rightCrop = document.getElementById('rightCrop').value;

            document.getElementById("leftCropValue").textContent = leftCrop + "%";
            document.getElementById("rightCropValue").textContent = rightCrop + "%";

            const newLeft = (FULL_WIDTH * leftCrop / 100) * SCALE_FACTOR;
            const newWidth = FULL_WIDTH * (1 - (leftCrop / 100 + rightCrop / 100)) * SCALE_FACTOR;

            bgRect.set({
                left: newLeft,
                width: newWidth
            });

            // Update original dimensions to current cropped values
            originalRectWidth = newWidth;
            originalRectLeft = newLeft;

            baseRectWidth = newWidth;
            baseRectLeft = newLeft;

            canvas.renderAll();
        }

        function updateRoundedEdges() {
            const roundedValue = document.getElementById('roundedEdges').value;
            document.getElementById('roundedEdgesValue').textContent = roundedValue + '%';
            const radius = 300 * (roundedValue / 100) * SCALE_FACTOR;
            bgRect.set({ rx: radius, ry: radius });
            canvas.renderAll();
        }

        // Background Functions
        function loadSampleBackground() {
            if (bgImage) canvas.remove(bgImage);

            fabric.Image.fromURL("../../assets/images/sample-bg.jpg", img => {
                img.set({
                    scaleX: PREVIEW_WIDTH / img.width,
                    scaleY: PREVIEW_HEIGHT / img.height,
                    selectable: false,
                    evented: false
                });
                bgImage = img;
                canvas.add(img);
                canvas.sendToBack(img);
                canvas.renderAll();
            });
        }

        function toggleRectangleSettings() {
            const type = document.getElementById('rectType').value;
            const solidSettings = document.getElementById('solidColorSettings');
            const gradientSettings = document.getElementById('gradientSettings');

            switch (type) {
                case 'solid':
                    solidSettings.style.display = 'block';
                    gradientSettings.style.display = 'none';
                    updateBgColor(); // Update with solid color
                    break;

                case 'gradient':
                    solidSettings.style.display = 'none';
                    gradientSettings.style.display = 'block';
                    updateGradient(); // Update with gradient
                    break;

                default:
                    // Hide both if unknown type
                    solidSettings.style.display = 'none';
                    gradientSettings.style.display = 'none';
                    console.warn('Unknown rectangle type:', type);
            }
        }

        function updateGradient() {
            const color1 = document.getElementById('gradientColor1').value;
            const color2 = document.getElementById('gradientColor2').value;
            const direction = document.getElementById('gradientDirection').value;

            const gradient = {
                type: 'linear',
                gradientUnits: 'percentage',
                colorStops: [
                    { offset: 0, color: color1 },
                    { offset: 1, color: color2 }
                ],
                coords: {
                    'top-bottom': { x1: 0, y1: 0, x2: 0, y2: 1 },
                    'left-right': { x1: 0, y1: 0, x2: 1, y2: 0 },
                    'diagonal': { x1: 0, y1: 0, x2: 1, y2: 1 }
                }[direction]
            };

            bgRect.set({ fill: new fabric.Gradient(gradient) });
            canvas.renderAll();
        }

        function updateBgColor() {
            bgRect.set({ fill: document.getElementById('bgColor').value });
            canvas.renderAll();
        }

        function updateBgOpacity() {
            const opacityValue = document.getElementById('bgOpacity').value;
            document.getElementById('bgOpacityValue').textContent = opacityValue + '%';
            bgRect.set({ opacity: opacityValue / 100 });
            canvas.renderAll();
        }


        function updateRectangleHeight() {
            const currentVisualTop = bgRect.top;
            const currentVerticalOffset = parseInt(document.getElementById('verticalPosition').value) || 0;




            const heightPercent = document.getElementById('rectHeight').value;
            document.getElementById('rectHeightValue').textContent = heightPercent + '%';

            // Get current line spacing values from DOM
            const lineSpacing1 = document.getElementById('lineSpacing1')?.value || INITIAL_VALUES.lineSpacing1;
            const lineSpacing2 = document.getElementById('lineSpacing2')?.value || INITIAL_VALUES.lineSpacing2;

            // Calculate new height (base height is 150px)
            const baseHeight = 150;
            const newHeight = baseHeight * (heightPercent / 100);

            baseRectHeight = 150 * (heightPercent / 100) * SCALE_FACTOR;

            // Calculate new base position without vertical offset
            const newBaseTop = (FULL_HEIGHT - INITIAL_VALUES.bottomHeight - newHeight) * SCALE_FACTOR;




            // Re-apply stroke adjustments
            updateStroke();
            document.getElementById('rectHeightValue').textContent = heightPercent + '%';





            // Update rectangle height and maintain bottom position
            bgRect.set({
                height: newHeight * SCALE_FACTOR,
                // top: calculateYPosition()
                baseTop: newBaseTop,
                // top: newBaseTop + (currentVisualTop - bgRect.baseTop)
                top: newBaseTop
            });

            // Update text positions relative to new height
            const textVerticalStart = bgRect.top + 20 * SCALE_FACTOR;
            // Update text base positions
            text1.set({ top: textVerticalStart });
            text2.set({ top: text1.top + lineSpacing1 * SCALE_FACTOR });
            text3.set({ top: text2.top + lineSpacing2 * SCALE_FACTOR });

            // Store new base positions
            bgRect.baseTop = newBaseTop;
            text1.baseTop = text1.top;
            text2.baseTop = text2.top;
            text3.baseTop = text3.top;

            baseRectHeight = bgRect.height;
            baseRectTop = bgRect.top;

            // Re-apply vertical offset
            document.getElementById('verticalPosition').value = currentVerticalOffset;
            applyVerticalPosition();

            canvas.requestRenderAll();
            updateBoxCrop();
        }

        // Initialize stroke settings
        function initStroke() {
            document.getElementById('strokeEnabled').checked = INITIAL_VALUES.strokeEnabled;
            document.getElementById('strokeWidth').value = INITIAL_VALUES.strokeWidth;
            document.getElementById('strokeColor').value = INITIAL_VALUES.strokeColor;
            document.getElementById('strokeWidthValue').textContent = `${INITIAL_VALUES.strokeWidth}px`;
            toggleStrokeSettings(INITIAL_VALUES.strokeEnabled);
        }

        // Toggle stroke visibility
        function toggleStroke() {
            const enabled = document.getElementById('strokeEnabled').checked;
            toggleStrokeSettings(enabled);
            updateStroke();
        }

        function toggleStrokeSettings(show) {
            document.getElementById('strokeSettings').style.display = show ? 'block' : 'none';
        }

        // Update stroke properties
        function updateStroke() {
            const enabled = document.getElementById('strokeEnabled').checked;
            const width = parseInt(document.getElementById('strokeWidth').value);
            const color = document.getElementById('strokeColor').value;

            if (enabled) {
                // Reduce width only from right side
                bgRect.set({
                    stroke: color,
                    strokeWidth: width,
                    width: originalRectWidth - width, // Decrease from right
                    left: originalRectLeft, // Maintain original left position
                    height: bgRect.height // Keep original height
                });
            } else {
                // Restore original dimensions
                bgRect.set({
                    stroke: null,
                    strokeWidth: 0,
                    width: originalRectWidth,
                    left: originalRectLeft
                });
            }

            canvas.renderAll();
        }
        // Initialize stroke settings when page loads
        initStroke();


        // for fonts load
        async function initializeFonts() {
            try {
                const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
                const data = await response.json();

                // Filter to only allowed fonts
                const allowedFontData = data.items.filter(font =>
                    ALLOWED_FONTS.includes(font.family)
                );

                populateFontSelectors(allowedFontData);
                loadInitialFonts();

            } catch (error) {
                console.error('Using fallback font loading:', error);
                loadFontsFallback();
            }
        }

        function populateFontSelectors(fonts) {
            document.querySelectorAll('.font-selector').forEach((select, index) => {
                select.innerHTML = '';

                // Add allowed Google Fonts
                fonts.forEach(font => {
                    const option = document.createElement('option');
                    option.value = font.family;
                    option.textContent = font.family;
                    option.dataset.googleFont = true;
                    select.appendChild(option);
                });

                // Add system fonts separator
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = '── System Fonts ──';
                select.appendChild(separator);

                // Add system fonts
                SYSTEM_FONTS.forEach(font => {
                    const option = document.createElement('option');
                    option.value = font;
                    option.textContent = font;
                    select.appendChild(option);
                });

                select.value = INITIAL_FONTS[select.id] || ALLOWED_FONTS[index];
            });
        }

        function loadInitialFonts() {
            WebFont.load({
                google: {
                    families: Object.values(INITIAL_FONTS)
                },
                active: () => {
                    loadedFonts.add(...Object.values(INITIAL_FONTS));
                    initializeCanvas();
                },
                inactive: initializeCanvas
            });
        }

        function loadFontsFallback() {
            // Directly attempt to load allowed fonts
            WebFont.load({
                google: {
                    families: ALLOWED_FONTS
                },
                active: () => {
                    document.querySelectorAll('.font-selector').forEach((select, index) => {
                        select.innerHTML = ALLOWED_FONTS.map(font =>
                            `<option value="${font}">${font}</option>`
                        ).join('');
                        select.value = INITIAL_FONTS[select.id] || ALLOWED_FONTS[index];
                    });
                    initializeCanvas();
                }
            });
        }

        async function updateFontFamily(line) {
            const select = document.getElementById(`fontFamily${line}`);
            const font = select.value;
            const textElement = [text1, text2, text3][line - 1];

            if (SYSTEM_FONTS.includes(font)) {
                textElement.set({ fontFamily: font });
                canvas.requestRenderAll();
                return;
            }

            if (!loadedFonts.has(font)) {
                try {
                    await new Promise((resolve, reject) => {
                        WebFont.load({
                            google: { families: [font] },
                            active: resolve,
                            inactive: reject
                        });
                    });
                    loadedFonts.add(font);
                } catch (error) {
                    console.error(`Failed to load ${font}:`, error);
                    textElement.set({ fontFamily: 'Arial' });
                    select.value = 'Arial';
                    canvas.requestRenderAll();
                    return;
                }
            }

            textElement.set({ fontFamily: font });
            canvas.requestRenderAll();
        }


        // Vertical position handler
        // Vertical slider handler (fixed)
        document.getElementById('verticalPosition').addEventListener('input', function () {
            if (!bgRect || !text1 || !text2 || !text3) return;
            verticalOffsetPercent = parseInt(this.value);
            document.getElementById('verticalPositionValue').textContent = `${verticalOffsetPercent}%`;

            applyVerticalPosition();

            // // Calculate pixel offset
            // const pixelOffset = (verticalOffset / 100) * canvasHeight;

            // // Move all elements using stored base positions
            // bgRect.set({ top: bgRect.baseTop + pixelOffset });
            // text1.set({ top: text1.baseTop + pixelOffset });
            // text2.set({ top: text2.baseTop + pixelOffset });
            // text3.set({ top: text3.baseTop + pixelOffset });

            // canvas.requestRenderAll();
        });

        function applyVerticalPosition() {
            const verticalOffset = parseInt(document.getElementById('verticalPosition').value) || 0;
            const pixelOffset = (verticalOffset / 100) * canvas.getHeight();

            bgRect.set({ top: bgRect.baseTop + pixelOffset });
            text1.set({ top: text1.baseTop + pixelOffset });
            text2.set({ top: text2.baseTop + pixelOffset });
            text3.set({ top: text3.baseTop + pixelOffset });

            canvas.requestRenderAll();
        }





        function exportAsPNG() {
            const resolution = document.getElementById("resolutionToggle").value;
            let exportWidth, exportHeight, resolutionScale;

            const isStrokeEnabled = document.getElementById('strokeEnabled').checked;

            const verticalOffset = parseInt(document.getElementById('verticalPosition').value) || 0;

            const selectedFonts = [
                document.getElementById('fontFamily1').value,
                document.getElementById('fontFamily2').value,
                document.getElementById('fontFamily3').value
            ].filter(font => !SYSTEM_FONTS.includes(font));



            WebFont.load({
                google: { families: selectedFonts },
                active: () => {
                    // Get current height percentage
                    const heightPercent = document.getElementById('rectHeight').value || 100;

                    // Get crop values
                    const leftCrop = parseInt(document.getElementById("leftCrop").value) || 0;
                    const rightCrop = parseInt(document.getElementById("rightCrop").value) || 0;
                    const totalCrop = Math.min(leftCrop + rightCrop, 95);


                    // Get current values from UI controls
                    const currentBottomHeight = document.getElementById('bottomHeight')?.value || INITIAL_VALUES.bottomHeight;
                    const lineSpacing1 = document.getElementById('lineSpacing1')?.value || INITIAL_VALUES.lineSpacing1;
                    const lineSpacing2 = document.getElementById('lineSpacing2')?.value || INITIAL_VALUES.lineSpacing2;
                    const rectHeight = document.getElementById('rectHeight')?.value || INITIAL_VALUES.rectHeight;

                    const strokeWidth = bgRect.strokeWidth || 0;
                    const visibleWidth = baseRectWidth / SCALE_FACTOR - (strokeWidth * 2);
                    const visibleHeight = baseRectHeight / SCALE_FACTOR - (strokeWidth * 2);





                    // Set resolution parameters
                    if (resolution === "hd") {
                        exportWidth = 1920;
                        exportHeight = 1080;
                        resolutionScale = 1;

                    } else {
                        exportWidth = 3840;
                        exportHeight = 2160;
                        resolutionScale = 2;

                    }



                    const bgWidth = exportWidth * (1 - totalCrop / 100);
                    const bgLeft = exportWidth * (leftCrop / 100);
                    const baseHeight = 150 * (heightPercent / 100);
                    // const bgHeight = baseHeight * resolutionScale;
                    // const bgTop = exportHeight - (currentBottomHeight * resolutionScale) - bgHeight;
                    const bgBaseTop = (bgRect.baseTop / SCALE_FACTOR) * resolutionScale;
                    const bgHeight = (bgRect.height / SCALE_FACTOR) * resolutionScale;


                    const verticalPixelOffset = (verticalOffset / 100) * exportHeight;
                    // Create temporary canvas
                    const tempCanvas = new fabric.StaticCanvas(null, {
                        width: exportWidth,
                        height: exportHeight
                    });


                    let finalWidth;
                    switch (resolution.toLowerCase()) {
                        case '4k':
                            finalWidth = isStrokeEnabled
                                ? bgWidth - (strokeWidth + 75)
                                : bgWidth;
                            break;

                        case 'hd':
                        default:
                            finalWidth = isStrokeEnabled
                                ? bgWidth - (strokeWidth + 40)
                                : bgWidth;
                            break;
                    }

                    let bgTop = bgBaseTop + verticalPixelOffset;
                    bgTop = Math.max(0, Math.min(bgTop, exportHeight - bgHeight));

                    const bgClone = new fabric.Rect({
                        left: bgLeft,
                        top: bgTop,
                        width: finalWidth,
                        height: bgHeight,
                        fill: bgRect.fill,
                        opacity: bgRect.opacity,
                        rx: bgRect.rx / SCALE_FACTOR * resolutionScale,
                        ry: bgRect.ry / SCALE_FACTOR * resolutionScale,
                        stroke: bgRect.stroke,
                        strokeWidth: (strokeWidth / SCALE_FACTOR) * resolutionScale, // Critical fix
                        strokeUniform: true
                    });

                    // // Clone text elements without position changes
                    // const textOffset = (strokeWidth / SCALE_FACTOR) * resolutionScale;
                    // const text1Clone = new fabric.Text(text1.text, {
                    //     ...text1.toObject(),
                    //     left: (text1.left / SCALE_FACTOR) * resolutionScale,
                    //     top: (text1.top / SCALE_FACTOR) * resolutionScale,
                    //     fontSize: (text1.fontSize / SCALE_FACTOR) * resolutionScale,
                    //     fontFamily: fontFamily,
                    // });

                    // const text2Clone = new fabric.Text(text2.text, {
                    //     ...text2.toObject(),
                    //     left: (text2.left / SCALE_FACTOR) * resolutionScale,
                    //     top: (text2.top / SCALE_FACTOR) * resolutionScale,
                    //     fontSize: (text2.fontSize / SCALE_FACTOR) * resolutionScale,
                    //     fontFamily: fontFamily,
                    // });

                    // const text3Clone = new fabric.Text(text3.text, {
                    //     ...text3.toObject(),
                    //     left: (text3.left / SCALE_FACTOR) * resolutionScale,
                    //     top: (text3.top / SCALE_FACTOR) * resolutionScale,
                    //     fontSize: (text3.fontSize / SCALE_FACTOR) * resolutionScale,
                    //     fontFamily: fontFamily,
                    // });

                    const cloneTextElement = (textElement) => {
                        const textBaseTop = (textElement.baseTop / SCALE_FACTOR) * resolutionScale;
                        const textTop = textBaseTop + verticalPixelOffset;

                        return new fabric.Text(textElement.text, {
                            ...textElement.toObject(),
                            left: (textElement.left / SCALE_FACTOR) * resolutionScale,
                            top: textTop,
                            fontSize: (textElement.fontSize / SCALE_FACTOR) * resolutionScale,
                            fontFamily: document.fonts.check(`12px "${textElement.fontFamily}"`)
                                ? textElement.fontFamily
                                : DEFAULT_FALLBACK_FONT
                        });
                    };

                    const text1Clone = cloneTextElement(text1);
                    const text2Clone = cloneTextElement(text2);
                    const text3Clone = cloneTextElement(text3);

                    // Add elements
                    tempCanvas.add(bgClone, text1Clone, text2Clone, text3Clone);
                    tempCanvas.renderAll();

                    // Export
                    const link = document.createElement('a');
                    link.href = tempCanvas.toDataURL({ format: 'png' });
                    link.download = `lower_third_${resolution}.png`;
                    link.click();
                    tempCanvas.dispose();
                },
                inactive: () => {
                    console.error('Failed to load fonts for export');
                    alert('Error: Could not load required fonts for export');
                }
            });





        }






        // Initialization
        document.getElementById('lowerThirdCanvas').width = PREVIEW_WIDTH;
        document.getElementById('lowerThirdCanvas').height = PREVIEW_HEIGHT;
        canvas.setDimensions({ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT });
        document.addEventListener('DOMContentLoaded', initializeFonts);
        initializeCanvas();