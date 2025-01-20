document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('message');
    const button = document.querySelector('button');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData.error);
        } else {
            response.text().then(text => {
                if (text === 'OK') {
                    message.innerText = "Authentication Successful";
                    message.style.color = 'rgb(40, 184, 0)';
                    message.style.display = 'block';
                    button.style.display = "none";
                    redirect();
                } else {
                    message.innerText = "Incorrect credentials.";
                    message.style.color = 'rgb(200, 0, 0)';
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
        location.reload(true);
    }, 500);
}