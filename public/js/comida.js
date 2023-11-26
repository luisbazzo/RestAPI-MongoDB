const urlBase = 'https://rest-taurante.vercel.app/api'
//const urlBase = 'http://localhost:2002/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null

//evento submit do formulário
document.getElementById('formComida').addEventListener('submit', function (event) {
    event.preventDefault() // evita o recarregamento
    const idPrato = document.getElementById('id').value
    let prato = {}

    if (idPrato.length > 0) { //Se possuir o ID, enviamos junto com o objeto
        prato = {
            "_id": idPrato,
            "nome": document.getElementById('nome').value,
            "origem": document.getElementById('origem').value,
            "cozinheiro": document.getElementById('cozinheiro').value,
            "tempo_preparo": document.getElementById('tempo_preparo').value,
            "data_cardapio": document.getElementById('data_cardapio').value,
            "tipo": document.getElementById('tipo').value,
            "preço": document.getElementById('preco').value
        }
    } else {
        prato = {
            "nome": document.getElementById('nome').value,
            "origem": document.getElementById('origem').value,
            "cozinheiro": document.getElementById('cozinheiro').value,
            "tempo_preparo": document.getElementById('tempo_preparo').value,
            "data_cardapio": document.getElementById('data_cardapio').value,
            "tipo": document.getElementById('tipo').value,
            "preço": document.getElementById('preco').value
        }
    }
    salvaPrato(prato)
})

async function salvaPrato(prato) {    
    if (prato.hasOwnProperty('_id')) { //Se o prestador tem o id iremos alterar os dados (PUT)
        // Fazer a solicitação PUT para o endpoint dos pratos
        await fetch(`${urlBase}/pratos`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(prato)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Prato alterado com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formComida').reset()
                    //Atualiza a UI
                    carregaPratos()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prato: ${error.message}</span>`
                resultadoModal.show();
            });

    } else { //caso não tenha o ID, iremos incluir (POST)
        // Fazer a solicitação POST para o endpoint dos prestadores
        await fetch(`${urlBase}/pratos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(prato)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Prato incluído com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formComida').reset()
                    //Atualiza a UI
                    carregaPratos()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prato: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function carregaPratos() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //Limpa a tabela antes de recarregar
    // Fazer a solicitação GET para o endpoint dos pratos
    await fetch(`${urlBase}/pratos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(prato => {
                tabela.innerHTML += `
                <tr>
                   <td>${prato.nome}</td>
                   <td>${prato.origem}</td>
                   <td>${prato.cozinheiro}</td>
                   <td>${prato.data_cardapio}</td>                   
                   <td>${prato.tempo_preparo}</td>        
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removePrato("${prato._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaPratoPeloId("${prato._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prato: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removePrato(id) {
    if (confirm('Deseja realmente excluir o prato?')) {
        await fetch(`${urlBase}/pratos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    carregaPratos() // atualiza a UI
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prato: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaPratoPeloId(id) {
    await fetch(`${urlBase}/pratos/id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data[0]) { //Iremos pegar os dados e colocar no formulário.
                document.getElementById('id').value = data[0]._id
                document.getElementById('nome').value = data[0].nome,
                document.getElementById('origem').value = data[0].origem,
                document.getElementById('cozinheiro').value = data[0].cozinheiro,
                document.getElementById('tempo_preparo').value = data[0].tempo_preparo,
                document.getElementById('data_cardapio').value = data[0].data_cardapio,
                document.getElementById('tipo').value = data[0].tipo,
                document.getElementById('preco').value = data[0].preço
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o prato: ${error.message}</span>`
            resultadoModal.show();
        });

}