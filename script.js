// Helper to get element
const $ = id => document.getElementById(id);
let pageIndex = 0;  // current page index
// Gather all sections (each .page)
const pages = Array.from(document.querySelectorAll('.page'));
const totalPages = pages.length;

// Initialize table of contents and pages
function initPages() {
  pages.forEach((p, i) => {
    $('toc').options.add(new Option((i+1)+'. '+p.querySelector('h2, h1').textContent, i));
    p.style.display = (i===0 ? 'block' : 'none');
  });
  updateNav();
}
function go(n) {
  if (n<0) n=0;
  if (n>=pages.length) n=pages.length-1;
  pages[pageIndex].style.display='none';
  pageIndex = n;
  pages[pageIndex].style.display='block';
  updateNav();
  // Initialize special pages if needed
  if (pages[pageIndex].id === 'radar') initRadar();
  if (pages[pageIndex].id === 'c4') initRadar(); // to ensure map toggles reset
}
function updateNav() {
  $('page-indicator').textContent = (pageIndex+1) + ' / ' + pages.length;
  $('toc').selectedIndex = pageIndex;
  $('btnBack').style.visibility = pageIndex === 0 ? 'hidden' : 'visible';
  $('btnNext').textContent = (pageIndex === pages.length-1 ? 'Restart' : 'Next');
  // Disable or style nav for specific pages (if needed)
}
$('btnNext').addEventListener('click', () => {
  go(pageIndex === pages.length-1 ? 0 : pageIndex+1);
});
$('btnBack').addEventListener('click', () => go(pageIndex-1));
$('toc').addEventListener('change', e => go(parseInt(e.target.value)));

// WOW fact buttons: replace with static fact on click
document.querySelectorAll('.wow').forEach(btn => {
  btn.addEventListener('click', function() {
    const fact = document.createElement('div');
    fact.className = 'fact';
    fact.innerHTML = '<b>Did you know?</b> ' + this.dataset.text;
    this.replaceWith(fact);
    scoreStars(1);
  });
});

