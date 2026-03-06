// ─── Navbar Hamburger Toggle ───
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close menu when a link is clicked (mobile)
document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = navToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});
