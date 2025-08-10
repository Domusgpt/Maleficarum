document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sections = document.querySelectorAll('.blog-section');

    // --- Configuration ---
    const contentPath = '/content/maleficarum.json';

    /**
     * ===================================================================
     * 1. CONTENT LOADING & INJECTION (Minimal Version)
     * ===================================================================
     */

    const loadContent = async () => {
        try {
            const response = await fetch(contentPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const rawContent = await response.text();
            const data = extractJson(rawContent);
            injectContent(data.sections);
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
     * 2. MINIMAL INITIAL LOAD
     * ===================================================================
     */

    loadContent();
});