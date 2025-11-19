document.querySelector('#loginBtn').onclick = function (){
    var username = document.querySelector('#user').value;
    var password = document.querySelector('#passwd').value;

    checkCredentials(username, password);
}

function checkCredentials (username, password) {
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Login exitoso');
            alert('Login exitoso');
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            // Mostrar error específico si existe
            if (data.error) {
                console.error('Error del servidor:', data.error);
                
            } else {
                console.log('Credenciales incorrectas');
                alert('Credenciales incorrectas');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

