const header = document.querySelectorAll('.userEmail');
const img = document.querySelector('#userImg');
const popupMenu = document.querySelector('#popupMenu');

fetch('/data')
  .then(respose => respose.text())
  .then(data => header.forEach((item) => { item.innerHTML = `${data}` }))
  .catch(error => console.log(error));


img.addEventListener('click', () => {
  popupMenu.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
  // Check if the click is outside the image and the popup menu
  if (!img.contains(event.target) && !popupMenu.contains(event.target)) {
    popupMenu.classList.add('hidden'); // Hide the menu
  }
});
