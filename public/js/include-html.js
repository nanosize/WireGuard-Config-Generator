// include-html.js: Load HTML partials for header and footer
function includeHTML() {
  document.querySelectorAll('[data-include]').forEach(el => {
    const file = el.getAttribute('data-include');
    if (file) {
      fetch(file)
        .then(response => {
          if (!response.ok) throw new Error('Failed to load ' + file);
          return response.text();
        })
        .then(html => el.innerHTML = html)
        .catch(err => console.error(err));
    }
  });
}
document.addEventListener('DOMContentLoaded', includeHTML);