const urlBase = 'http://localhost:2002/api'
 
//monitorando o submit do formulário
document.getElementById('loginForm').addEventListener('submit', function(event){
    event.preventDefault() //evita o recarregamento do form
    const login = document.getElementById('login').value
    const senha = document.getElementById('senha').value
    const resultadoModal = new bootstrap.Modal(document.getElementById('modalMessage'))
    //criando o objeto para autenticar
    const dadosLogin = {
        email: login,
        senha: senha
    }
    //efetuando o post para a api rest
    fetch(`${urlBase}/usuarios/login`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLogin)
    })
    .then(response => response.json())
    .then(data => {
        //verifica se o token foi retornado
        if(data.access_token){
            //armazenamos no localstorage
            localStorage.setItem('token', data.access_token)
            window.location.href = 'menu.html'
        } else if (data.errors) {
            //possui algum erro?
            const errorMessages = data.errors.map(error => error.msg).join('<br>')
            //alert('Falha ao efetuar o login:\n'+errorMessages)
            document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
            resultadoModal.show() //abre o modal
        } else {
            alert('Não foi possível efetuar o login no servidor')
        }
    })
    .catch(error => {
        console.error(`Erro no login ${error}`)
    })
})