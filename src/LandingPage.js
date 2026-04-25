export function renderLandingPage(onGetStarted) {
    const root = document.getElementById('app-root'); // Maan lijiye aapka main container ye hai
    
    root.innerHTML = `
        <div id="landing-page" style="text-align: center; width: 100%;">
            <h1 style="font-size: clamp(2.5rem, 8vw, 4.5rem); color: white; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); font-weight: 800;">
                Sticky Notes App ✨
            </h1>
            <p class="text-white mb-4" style="font-size: 1.2rem; opacity: 0.9;">
                Keep your essential thoughts and tasks secure.
            </p>
            <button id="get-started-btn" class="btn btn-warning btn-lg px-5 shadow" style="border-radius: 30px; font-weight: bold;">
                Get Started 🚀
            </button>
        </div>
    `;

    // Button par event listener lagana
    document.getElementById('get-started-btn').onclick = onGetStarted;
}