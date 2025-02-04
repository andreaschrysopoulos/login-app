const messageDuration = 2000;

const miPhoto = document.querySelector('#menu-photo');
const miEmail = document.querySelector('#menu-email');
const miDelete = document.querySelector('#menu-delete');

const stPhoto = document.querySelector('#section-photo');
const stEmail = document.querySelector('#section-email');
const stDelete = document.querySelector('#section-delete');

const photoPreview = document.getElementById('photoPreview');
const selectedPhoto = document.getElementById('selectedPhoto');
const sendButton = document.getElementById('sendbutton');
const btnRemovePhoto = document.getElementById('btnRemovePhoto');

const img2 = document.querySelector('#userImg');

let intervalID_email, intervalID_password;

function resetEmailTimer(duration, callback) {
  clearTimeout(intervalID_email);
  intervalID_email = setTimeout(() => {
    callback();
  }, duration);
}

function resetPasswordTimer(duration, callback) {
  clearTimeout(intervalID_password);
  intervalID_password = setTimeout(() => {
    callback();
  }, duration);
}

document.querySelector("#email").addEventListener('input', (event) => {
  document.querySelector("#edit-email").disabled = false;
  document.getElementById('message-email').style.opacity = '0';
});

document.querySelector("#newPassword").addEventListener('input', (event) => {
  document.querySelector("#edit-password").disabled = false;
  document.getElementById('message-password').style.opacity = '0';
});

document.querySelector("#confirmNewPassword").addEventListener('input', (event) => {
  document.querySelector("#edit-password").disabled = false;
  document.getElementById('message-password').style.opacity = '0';
});

document.querySelector('#form-email').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const email = document.querySelector('#email').value.trim();
  const message = document.getElementById('message-email');


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
          resetEmailTimer(messageDuration, () => message.style.opacity = '0');
          document.querySelector("#edit-email").disabled = true;

        } else {
          message.innerText = "Error";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.opacity = '1';
          resetEmailTimer(messageDuration, () => message.style.opacity = '0');
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

  const newPassword = document.querySelector('#newPassword').value.trim();
  const confirmNewPassword = document.querySelector('#confirmNewPassword').value.trim();
  const message = document.getElementById('message-password');

  try {
    const response = await fetch('/editPass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, confirmNewPassword })
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.error);
    } else {
      response.text().then(text => {
        if (text === 'ok') {
          message.innerText = "Password updated";
          message.style.color = 'rgb(40, 184, 0)';
          message.style.opacity = '1';
          resetPasswordTimer(messageDuration, () => message.style.opacity = '0');
          document.querySelector('#newPassword').value = '';
          document.querySelector('#confirmNewPassword').value = '';
          document.querySelector("#edit-password").disabled = true;

        } else if (text === 'nomatch') {
          message.innerText = "Passwords don't match.";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.opacity = '1';
          resetPasswordTimer(messageDuration, () => message.style.opacity = '0');

        } else {
          message.innerText = "Error";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.opacity = '1';
          resetPasswordTimer(messageDuration, () => message.style.opacity = '0');
          console.log(text);
        }

      }
      )
    }

  } catch (error) {
    console.log(error);
  }
});


miPhoto.addEventListener('click', (event) => {
  miPhoto.classList.add('dark:bg-stone-800', 'bg-stone-200');
  miEmail.classList.remove('dark:bg-stone-800', 'bg-stone-200');
  miDelete.classList.remove('dark:bg-stone-800', 'bg-stone-200');

  localStorage.setItem('selected-item', 'photo');

  stPhoto.style.display = "flex";
  stEmail.style.display = "none";
  stDelete.style.display = "none";
});


miEmail.addEventListener('click', (event) => {
  miPhoto.classList.remove('dark:bg-stone-800', 'bg-stone-200');
  miEmail.classList.add('dark:bg-stone-800', 'bg-stone-200');
  miDelete.classList.remove('dark:bg-stone-800', 'bg-stone-200');

  localStorage.setItem('selected-item', 'email');

  stPhoto.style.display = "none";
  stEmail.style.display = "flex";
  stDelete.style.display = "none";
});

miDelete.addEventListener('click', (event) => {
  miPhoto.classList.remove('dark:bg-stone-800', 'bg-stone-200');
  miEmail.classList.remove('dark:bg-stone-800', 'bg-stone-200');
  miDelete.classList.add('dark:bg-stone-800', 'bg-stone-200');

  localStorage.setItem('selected-item', 'delete');

  stPhoto.style.display = "none";
  stEmail.style.display = "none";
  stDelete.style.display = "flex";
});


document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('selected-item') === 'photo') {
    stPhoto.style.display = "flex";
    miPhoto.classList.add('dark:bg-stone-800', 'bg-stone-200');
  }
  else if (localStorage.getItem('selected-item') === 'email') {
    stEmail.style.display = "flex";
    miEmail.classList.add('dark:bg-stone-800', 'bg-stone-200');
  }
  else if (localStorage.getItem('selected-item') === 'delete') {
    stDelete.style.display = "flex";
    miDelete.classList.add('dark:bg-stone-800', 'bg-stone-200');
  } else if (!localStorage.getItem('selected-item')) {
    stPhoto.style.display = "flex";
    miPhoto.classList.add('dark:bg-stone-800', 'bg-stone-200');
  }
});

photoPreview.addEventListener('click', () => {
  selectedPhoto.click();
});

selectedPhoto.addEventListener('change', async (e) => {
  const file = selectedPhoto.files[0];

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch('/updatePhoto', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    console.log("Error receving photo from server after sending it.");
  } else if (response.redirected) {
    window.location.href = response.url; // Manually follow the redirect
  }

});

btnRemovePhoto.addEventListener('click', async (e) => {
  const response = await fetch('/removeProfilePhoto', { method: 'POST' });

  if (response.redirected) {
    window.location.href = response.url; // Manually follow the redirect
  }
})