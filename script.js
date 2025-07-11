// Sample database of known images and their results
const imageDatabase = {
    'apple.jpg': {
        edible: true,
        message: 'This produce appears to be safe for consumption.\nNo signs of chemical treatment detected.'
    },
    'rottenfruit2.jpg': {
        edible: false,
        message: 'High levels of artificial waxing detected.\nPossible presence of harmful preservatives.\nReasons:\n- Unnatural shape\n- Unusual color patterns\n- Signs of artificial ripening'
    }
};

const shutterSound = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAs...'); // shortened for brevity

// Smooth vertical scrolling navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active nav link based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`a[href="#${sectionId}"]`);
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(navLink => {
                    navLink.style.color = 'white';
                    navLink.style.backgroundColor = 'transparent';
                });
                
                // Add active class to current link
                if (correspondingLink) {
                    correspondingLink.style.color = 'var(--secondary-yellow)';
                    correspondingLink.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
            }
        });
    });
});

// Enhanced file upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadInput = document.getElementById('uploadInput');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                // Play shutter sound
                shutterSound.play().catch(() => {
                    // Ignore audio play errors in case user hasn't interacted with page yet
                });
                
                // Get modal elements
                const scanResult = document.getElementById('scanResult');
                const modalBackdrop = document.getElementById('modalBackdrop');
                const uploadedImage = document.getElementById('uploadedImage');
                const resultContent = document.getElementById('resultContent');
                
                // Show backdrop and modal
                modalBackdrop.style.display = 'block';
                scanResult.style.display = 'block';
                
                // Show loading state
                resultContent.innerHTML = `
                    <div class="loading-message">
                        <h3>🔍 Analyzing image...</h3>
                        <p>Please wait while we process your image using advanced AI technology. This might take a few seconds.</p>
                    </div>
                `;
                
                // Display uploaded image
                uploadedImage.style.display = 'block';
                uploadedImage.src = URL.createObjectURL(file);

                // Add visible class after a short delay to trigger animation
                setTimeout(() => {
                    modalBackdrop.classList.add('visible');
                    scanResult.classList.add('visible');
                }, 50);

                // Simulate processing time and show results
                setTimeout(() => {
                    const fileName = file.name.toLowerCase();
                    
                    // Check if it's a known image or generate random result
                    let result;
                    if (imageDatabase[fileName]) {
                        result = imageDatabase[fileName];
                    } else {
                        const isEdible = Math.random() > 0.5;
                        result = {
                            edible: isEdible,
                            message: `Analysis complete! This ${isEdible ? 'appears to be safe for consumption' : 'may contain harmful chemicals'}.\n\nConfidence: ${Math.floor(Math.random() * 30 + 70)}%\n\nRecommendation: ${isEdible ? 'Safe to consume after proper washing' : 'Avoid consumption or wash thoroughly'}`
                        };
                    }

                    const resultHTML = `
                        <div class="${result.edible === true ? 'result-safe' : 'result-unsafe'}">
                            <h3>${result.edible ? '✅ SAFE TO CONSUME' : '⚠️ CAUTION ADVISED'}</h3>
                            <p>${result.message.split('\n').join('<br>')}</p>
                            <button class="audio-button" onclick="speakResult(this)">🔊 Listen to Result</button>
                            <button class="audio-button" onclick="closeResult()" style="background-color: #666; margin-left: 10px;">✕ Close</button>
                        </div>
                    `;

                    resultContent.innerHTML = resultHTML;
                }, 3000);
            }
        });
    }
});

// Enhanced text-to-speech functionality
function speakResult(button) {
    button.disabled = true;
    button.innerHTML = '🔊 Speaking...';
    
    const resultDiv = button.parentElement;
    const heading = resultDiv.querySelector('h3').textContent;
    const content = resultDiv.querySelector('p').textContent;
    const textToSpeak = `${heading}. ${content}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onend = function() {
        button.disabled = false;
        button.innerHTML = '🔊 Listen to Result';
    };
    
    utterance.onerror = function() {
        button.disabled = false;
        button.innerHTML = '🔊 Listen to Result';
        alert('Speech synthesis is not available in your browser.');
    };
    
    window.speechSynthesis.speak(utterance);
}

// Close scan result modal
function closeResult() {
    const scanResult = document.getElementById('scanResult');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    scanResult.classList.remove('visible');
    modalBackdrop.classList.remove('visible');
    
    // Hide modal after animation completes
    setTimeout(() => {
        scanResult.style.display = 'none';
        modalBackdrop.style.display = 'none';
    }, 300);
    
    document.getElementById('uploadInput').value = ''; // Reset file input
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const scanResult = document.getElementById('scanResult');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const uploadInput = document.getElementById('uploadInput');
    const cameraIcon = document.querySelector('.camera-icon');
    const scanButton = document.querySelector('.scan-button');
    
    if ((scanResult.style.display === 'block' && 
        !scanResult.contains(event.target) && 
        event.target !== uploadInput && 
        event.target !== cameraIcon &&
        event.target !== scanButton) ||
        event.target === modalBackdrop) {
        closeResult();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        const currentSection = getCurrentSection();
        const previousSection = currentSection.previousElementSibling;
        if (previousSection && previousSection.tagName === 'SECTION') {
            previousSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const currentSection = getCurrentSection();
        const nextSection = currentSection.nextElementSibling;
        if (nextSection && nextSection.tagName === 'SECTION') {
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    } else if (event.key === 'Escape') {
        closeResult();
    }
});

// Helper function to get current section
function getCurrentSection() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            return section;
        }
    }
    return sections[0]; // Default to first section
}

// Add intersection observer for section animations
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.3
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            
            // Trigger specific animations based on section
            if (entry.target.id === 'organic') {
                const chartBars = entry.target.querySelectorAll('.chart-bar');
                chartBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.animationPlayState = 'running';
                    }, index * 200);
                });
            }
        }
    });
}, observerOptions);

// Observe all sections
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});

// Add responsive touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndY < touchStartY - swipeThreshold) {
        // Swipe up - next section
        const currentSection = getCurrentSection();
        const nextSection = currentSection.nextElementSibling;
        if (nextSection && nextSection.tagName === 'SECTION') {
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    } else if (touchEndY > touchStartY + swipeThreshold) {
        // Swipe down - previous section
        const currentSection = getCurrentSection();
        const previousSection = currentSection.previousElementSibling;
        if (previousSection && previousSection.tagName === 'SECTION') {
            previousSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// --- Drag & Drop Scan Section Logic ---
const dropArea = document.getElementById('dropArea');
const cameraIcon = document.getElementById('cameraIcon');
const sampleImages = document.querySelectorAll('.draggable-sample');
const scanResult = document.getElementById('scanResult');
const uploadedImage = document.getElementById('uploadedImage');
const resultContent = document.getElementById('resultContent');

sampleImages.forEach(img => {
    img.addEventListener('dragstart', (e) => {
        img.classList.add('dragging');
        e.dataTransfer.setData('text/plain', img.src);
        e.dataTransfer.setData('data-type', img.dataset.type);
        setTimeout(() => img.classList.remove('dragging'), 200);
    });
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', (e) => {
    dropArea.classList.remove('dragover');
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const imgSrc = e.dataTransfer.getData('text/plain');
    const imgType = e.dataTransfer.getData('data-type');
    if (imgSrc) {
        showScanResult(imgSrc, imgType);
    }
});

function showScanResult(imgSrc, imgType) {
    uploadedImage.src = imgSrc;
    uploadedImage.style.display = 'block';
    
    // Mock result based on type
    let resultHTML = '';
    if (imgType === 'fresh') {
        resultHTML = `
            <div class="result-safe">
                <h3>✅ FRESH PRODUCE</h3>
                <p>This item appears fresh and safe to eat. No visible signs of spoilage detected.</p>
                <button class="audio-button" onclick="speakResult(this)">🔊 Listen to Result</button>
                <button class="audio-button" onclick="closeResult()" style="background-color: #666; margin-left: 10px;">✕ Close</button>
            </div>
        `;
    } else if (imgType === 'rotten') {
        resultHTML = `
            <div class="result-unsafe">
                <h3>⚠️ SPOILED PRODUCE</h3>
                <p>This item shows signs of spoilage. Please avoid consumption.</p>
                <button class="audio-button" onclick="speakResult(this)">🔊 Listen to Result</button>
                <button class="audio-button" onclick="closeResult()" style="background-color: #666; margin-left: 10px;">✕ Close</button>
            </div>
        `;
    } else {
        resultHTML = `
            <div class="result-unknown">
                <h3>❓ ANALYSIS INCONCLUSIVE</h3>
                <p>Unable to determine the quality of this item. Please try again with a clearer image.</p>
                <button class="audio-button" onclick="speakResult(this)">🔊 Listen to Result</button>
                <button class="audio-button" onclick="closeResult()" style="background-color: #666; margin-left: 10px;">✕ Close</button>
            </div>
        `;
    }
    
    resultContent.innerHTML = resultHTML;
    
    // Show backdrop and modal
    const modalBackdrop = document.getElementById('modalBackdrop');
    modalBackdrop.style.display = 'block';
    scanResult.style.display = 'block';
    
    // Add visible class after a short delay to trigger animation
    setTimeout(() => {
        modalBackdrop.classList.add('visible');
        scanResult.classList.add('visible');
    }, 50);
}

// Optional: Hide scan result when clicking outside or scanning again
// (Add your own logic if needed)
