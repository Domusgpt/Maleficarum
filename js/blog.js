document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sections = document.querySelectorAll('.blog-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollContainer = document.querySelector('#scroll-container');
    const audioButton = document.getElementById('audio-toggle');

    // --- Configuration ---
    const contentPath = '/content/maleficarum.json';
    const sectionColors = {
        cover: 0x00f6ff,
        editorial: 0xff00ff,
        culture: 0x00ff00,
        tech: 0xffff00,
        interview: 0xffa500,
        ads: 0xff4500,
        lore: 0xda70d6,
        visuals: 0x00ffff
    };

    // --- State ---
    let scrolling = false;

    /**
     * ===================================================================
     * 1. CONTENT LOADING & INJECTION
     * ===================================================================
     */

    const loadContent = async () => {
        try {
            const response = await fetch(contentPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const rawContent = await response.text();
            const data = extractJson(rawContent);
            injectContent(data.sections);
            new VIB34DCardBendingSystem('.ad-card, .visual-card');
        } catch (e) {
            console.error("Could not load or parse blog content:", e);
            displayError();
        }
    };

    const extractJson = (text) => {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    };

    const injectContent = (content) => {
        const injectors = {
            cover: () => createCover(content.cover),
            editorial: () => createSection(content.editorial, 'h1'),
            culture: () => createSection(content.culture, 'h2'),
            tech: () => createSection(content.tech, 'h2'),
            interview: () => createInterview(content.interview),
            ads: () => createAds(content.ads),
            lore: () => createSection(content.lore_serial, 'h2'),
            visuals: () => createVisuals(content.visual_prompts)
        };

        for (const sectionId in injectors) {
            const element = document.querySelector(`#${sectionId}`);
            if (element) {
                element.innerHTML = injectors[sectionId]();
            }
        }
    };

    const createCover = (section) => `<div class="content-card"><h1>${section.title}</h1><p>${section.blurb}</p></div>`;
    const createSection = (section, titleTag) => `<div class="content-card"><${titleTag}>${section.title || section.headline || section.chapter}</${titleTag}><p>${section.article || section.body || section.text}</p></div>`;
    const createInterview = (section) => {
        let qAndA = section.q_and_a.map(item => `<dt>${item.Q}</dt><dd>${item.A}</dd>`).join('');
        return `<div class="content-card"><h2>Interview with ${section.subject}</h2><dl>${qAndA}</dl></div>`;
    };
    const createAds = (ads) => {
        let adCards = ads.map(ad => `<div class="ad-card"><h3>${ad.product}</h3><p>${ad.copy}</p></div>`).join('');
        return `<div class="ads-container">${adCards}</div>`;
    };
    const createVisuals = (prompts) => {
        let visualCards = prompts.map(prompt => `<div class="visual-card"><p>${prompt}</p></div>`).join('');
        return `<div class="visuals-container"><h2>Visual Prompts</h2>${visualCards}</div>`;
    };

    const displayError = () => {
        sections.forEach(section => {
            section.innerHTML = `<div class="content-card"><h2>Error</h2><p>Could not load content. Please ensure the server is running and the path is correct.</p></div>`;
        });
    };

    /**
     * ===================================================================
     * 2. NAVIGATION & SCROLL-BASED INTERACTIONS
     * ===================================================================
     */

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            const contentCard = entry.target.querySelector('.content-card, .ads-container, .visuals-container');

            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (contentCard) contentCard.classList.add('glitch-active');
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
                if (window.holographicBg) window.holographicBg.setColor(sectionColors[id]);
            } else {
                entry.target.classList.remove('is-visible');
                if (contentCard) contentCard.classList.remove('glitch-active');
            }
        });
    }, { root: scrollContainer, threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    // Parallax Scrolling (Optimized with requestAnimationFrame)
    scrollContainer.addEventListener('scroll', () => { if (!scrolling) { window.requestAnimationFrame(updateParallax); scrolling = true; } });

    function updateParallax() {
        const scrollTop = scrollContainer.scrollTop;
        const contentCards = document.querySelectorAll('.content-card');
        contentCards.forEach(card => {
            const section = card.parentElement;
            const sectionTop = section.offsetTop;
            const scrollAmount = (scrollTop - sectionTop) * 0.2;
            card.style.transform = `translateY(${scrollAmount}px) translateZ(0)`;
        });
        scrolling = false;
    }

    /**
     * ===================================================================
     * 3. CARD BENDING SYSTEM
     * ===================================================================
     */

    class VIB34DCardBendingSystem {
        constructor(selector) {
            this.cards = document.querySelectorAll(selector);
            if (this.cards.length === 0) return;
            this.setupCardInteractions();
        }

        setupCardInteractions() {
            this.cards.forEach((card) => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const deltaX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
                    const deltaY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
                    
                    // Apply dynamic 3D transforms
                    card.style.setProperty('--rotation-z', `${deltaX * 8}deg');
                    card.style.setProperty('--skew-x', `${-deltaY * 4}deg');
                    card.style.setProperty('--skew-y', `${deltaX * 4}deg');
                });

                card.addEventListener('mouseleave', () => {
                    // Reset transforms on mouse leave
                    card.style.setProperty('--rotation-z', '0deg');
                    card.style.setProperty('--skew-x', '0deg');
                    card.style.setProperty('--skew-y', '0deg');
                });
            });
        }
    }

    /**
     * ===================================================================
     * 4. AUDIO TOGGLE
     * ===================================================================
     */

    audioButton.addEventListener('click', () => {
        if (window.holographicBg && !window.holographicBg.audioInitialized) {
            window.holographicBg.initAudio();
            audioButton.textContent = 'Audio Enabled';
            audioButton.style.color = 'var(--glow-color)';
            audioButton.style.borderColor = 'var(--glow-color)';
        }
    });

    /**
     * ===================================================================
     * 5. INITIAL LOAD
     * ===================================================================
     */

    loadContent();
});