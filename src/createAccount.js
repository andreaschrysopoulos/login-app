document.querySelector('#create-account-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const rpassword = document.getElementById('rpassword').value.trim();
  const message = document.getElementById('message');
  const button = document.querySelector('button');

  try {
    const response = await fetch('/createAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rpassword })
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.error);
    } else {
      response.text().then(text => {
        if (text === 'ok') {
          message.innerText = "Account Created Successfully.";
          message.style.color = 'rgb(40, 184, 0)';
          message.style.display = 'block';
          button.style.display = "none";
          redirect();
        } else if (text === 'nomatch') {
          message.innerText = "Passwords do not match.";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.display = 'block';
        } else if (text === 'exists') {
          message.innerText = "Account already exists.";
          message.style.color = 'rgb(220, 0, 0)';
          message.style.display = 'block';
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
    location.replace('/');
  }, 500);
}