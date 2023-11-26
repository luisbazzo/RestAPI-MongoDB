const urlBase = 'https://rest-taurante.vercel.app/api'
//const urlBase = 'http://localhost:2002/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))

//evento submit do formulário
document.getElementById('formUsuario').addEventListener('submit', function (event) {
    event.preventDefault() // evita o recarregamento
    const idUsuario = document.getElementById('id').value
    let usuario = {}

    if (idUsuario.length > 0) { //Se possuir o ID, enviamos junto com o objeto
        usuario = {
            "_id": idUsuario,
            "nome": document.getElementById('nome').value,
            "email": document.getElementById('email').value,
            "senha": document.getElementById('senha').value,
            "ativo": document.getElementById('ativo').checked,
            "tipo": document.getElementById('tipo').value,
            "avatar": NULL
        }
    } else {
        usuario = {
            "nome": document.getElementById('nome').value,
            "email": document.getElementById('email').value,
            "senha": document.getElementById('senha').value,
            "ativo": document.getElementById('ativo').checked,
            "tipo": document.getElementById('tipo').value,
            "avatar": NULL
        }
    }
    salvaUsuario(usuario)
})

async function salvaUsuario(usuario) {    
        await fetch(`${urlBase}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(usuario)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Usuário incluído com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formUsuario').reset()
                } else if (data.errors) {
                    // Caso haja erros na resposta da API
                    const errorMessages = data.errors.map(error => error.msg).join("\n");
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                    resultadoModal.show();
                } else {
                    document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
                    resultadoModal.show();
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuário: ${error.message}</span>`
                resultadoModal.show();
            });
}
