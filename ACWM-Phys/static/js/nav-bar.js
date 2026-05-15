(() => {
    const floatingNav = document.getElementById('floating-nav');
    if (!floatingNav) return;

    const sectionSelectors = [
        '#abstract',
        '#benchmark',
        '#model',
        '#results',
        '#ablations',
        '#findings',
        '#bibtex',
    ];

    let clickScrolling = false;
    let clickScrollTimer = null;

    function updateScrollMargins() {
        const navHeight = floatingNav.offsetHeight;
        const margin = (navHeight + 10) + 'px';
        sectionSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.scrollMarginTop = margin;
        });
        return navHeight;
    }

    function onScroll() {
        if (window.innerWidth <= 900) {
            floatingNav.classList.remove('visible');
            return;
        }

        const navHeight = updateScrollMargins();
        const threshold = navHeight + 10;
        const firstSection = document.querySelector(sectionSelectors[0]);
        if (firstSection && firstSection.getBoundingClientRect().top <= threshold) {
            floatingNav.classList.add('visible');
        } else {
            floatingNav.classList.remove('visible');
        }

        if (clickScrolling) return;

        const navLinks = floatingNav.querySelectorAll('.floating-nav-link');
        let currentActive = null;

        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (!section) return;
            if (section.getBoundingClientRect().top <= threshold) {
                currentActive = link;
            }
        });

        navLinks.forEach(link => link.classList.remove('active'));
        if (currentActive) {
            currentActive.classList.add('active');
        }
    }

    floatingNav.addEventListener('click', (e) => {
        const link = e.target.closest('.floating-nav-link');
        if (!link) return;

        clickScrolling = true;
        clearTimeout(clickScrollTimer);

        const navLinks = floatingNav.querySelectorAll('.floating-nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        clickScrollTimer = setTimeout(() => { clickScrolling = false; }, 800);
    });

    document.addEventListener('scroll', onScroll);
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 900) {
            floatingNav.classList.remove('visible');
        }
        updateScrollMargins();
    });

    updateScrollMargins();
})();
