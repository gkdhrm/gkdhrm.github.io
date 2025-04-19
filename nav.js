// Navigation content
const navigationHTML = `
<div class="navigation">
    <a href="index.html">Home</a>
    <a href="urgyen.html">Tulku Urgyen Rinpoche</a>
    <a href="eckhart-tolle.html">Eckhart Tolle</a>
    <a href="papaji.html">Papaji (H.W.L. Poonja)</a>
    <a href="abraham.html">Abraham Hicks</a>
    <a href="joe-dispenza.html">Dr. Joe Dispenza</a>
    <a href="bashar.html">Bashar</a>
</div>
`;

// Function to load navigation
function loadNavigation() {
    document.getElementById('nav-placeholder').innerHTML = navigationHTML;
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', loadNavigation);