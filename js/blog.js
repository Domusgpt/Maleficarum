document.addEventListener('DOMContentLoaded', async () => {
    const contentPath = '/content/maleficarum.json';

    try {
        console.log('Attempting to fetch content...');
        const response = await fetch(contentPath);
        
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }

        const rawContent = await response.text();
        console.log('Raw content fetched:', rawContent);

        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');
        const jsonString = rawContent.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON string:', jsonString);

        const data = JSON.parse(jsonString);
        console.log('Parsed JSON data:', data);

    } catch (e) {
        console.error("Error during fetch or parse:", e);
    }
});