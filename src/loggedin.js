const header = document.querySelector('#user');

fetch('/data')
  .then(respose => respose.text())
  .then(data => header.innerHTML = `${data}`)
  .catch(error => console.log(error));