const header = document.querySelectorAll('.userEmail');
const popupMenu = document.querySelector('#popupMenu');
const img = document.querySelector('#userImg');

document.getElementById('logout').addEventListener('click', () => {
  localStorage.clear();
});

fetch('/data')
  .then(respose => respose.text())
  .then(data => header.forEach((item) => { item.value = `${data}` }))
  .catch(error => console.log(error));

document.addEventListener('click', (event) => {
  // Check if the click is outside the image and the popup menu
  if (!img.contains(event.target) && !popupMenu.contains(event.target)) {
    popupMenu.classList.add('hidden'); // Hide the menu
  }
});

img.addEventListener('click', () => {
  popupMenu.classList.toggle('hidden');
});