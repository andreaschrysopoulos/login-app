document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const email = document.getElementById('eemail').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  const button = document.querySelector('button');

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.error);
    } else {
      response.text().then(text => {
        if (text === 'OK') {
          button.style.disabled = "true";
          button.disabled = true;
          redirect();
        } else if (text === 'credentials') {
          message.innerText = "Incorrect credentials.";
          message.style.color = 'rgb(220, 0, 0)';
        } else {
          message.innerText = "Unknown error.";
          message.style.color = 'rgb(220, 0, 0)';
        }
      }
      )

    }
  } catch (error) {
    console.error('Error:', error);
  }
});

function redirect() {
  setTimeout(() => {
    location.reload(true);
  }, 500);
}

