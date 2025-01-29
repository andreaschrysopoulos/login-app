const header = document.querySelectorAll('.userEmail');
const img = document.querySelector('#userImg');
const popupMenu = document.querySelector('#popupMenu');

fetch('/data')
  .then(respose => respose.text())
  .then(data => header.forEach((item) => { item.value = `${data}` }))
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

document.querySelector("#email").addEventListener('input', (event) => {
  document.querySelector("#edit-email").disabled = false;
  document.getElementById('message').style.opacity = '0';

});

document.querySelector("#password").addEventListener('input', (event) => {
  document.querySelector("#edit-password").disabled = false;
});

document.querySelector('#form-email').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const email = document.querySelector('#email').value.trim();
  const message = document.getElementById('message');


  try {
    const response = await fetch('/editEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.error);
    } else {
      response.text().then(text => {
        if (text === 'ok') {
          message.innerText = "Email updated";
          message.style.color = 'rgb(40, 184, 0)';
          message.style.opacity = '1';
          setTimeout(() => {
            message.style.opacity = '0';
          }, 2000);
          document.querySelector("#edit-email").disabled = true;

        } else {
          message.innerText = "Error";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.opacity = '1';
          setTimeout(() => {
            message.style.opacity = '0';
          }, 2000);
          console.log(text);
        }
      }
      )
    }

  } catch (error) {
    console.log(error);
  }

});

document.querySelector('#form-pass').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
});