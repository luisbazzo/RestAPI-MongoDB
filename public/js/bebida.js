const urlBase = 'https://rest-taurante.vercel.app/api'
//const urlBase = 'http://localhost:2002/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null

//evento submit do formulário
document.getElementById('formBebida').addEventListener('submit', function (event) {
    event.preventDefault() // evita o recarregamento
    const idBebida = document.getElementById('id').value
    let bebida = {}

    if (idBebida.length > 0) { //Se possuir o ID, enviamos junto com o objeto
        bebida = {
            "_id": idBebida,
            "nome": document.getElementById('nome').value,
            "qtde_ml": document.getElementById('qtde_ml').value,
            "data_adição": document.getElementById('data_cardapio').value,
            "tipo": document.getElementById('tipo').value,
            "preço": document.getElementById('preco').value
        }
    } else {
        bebida = {
            "nome": document.getElementById('nome').value,
            "qtde_ml": document.getElementById('qtde_ml').value,
            "data_adição": document.getElementById('data_cardapio').value,
            "tipo": document.getElementById('tipo').value,
            "preço": document.getElementById('preco').value
        }
    }
    salvaBebida(bebida)
})

async function salvaBebida(bebida) {    
    if (bebida.hasOwnProperty('_id')) { //Se a bebida tem o id iremos alterar os dados (PUT)
        // Fazer a solicitação PUT para o endpoint das bebidas
        await fetch(`${urlBase}/bebidas`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(bebida)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Bebida alterado com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formBebida').reset()
                    //Atualiza a UI
                    carregaBebidas()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar a bebida: ${error.message}</span>`
                resultadoModal.show();
            });

    } else { //caso não tenha o ID, iremos incluir (POST)
        // Fazer a solicitação POST para o endpoint dos prestadores
        await fetch(`${urlBase}/bebidas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(bebida)
        })
            .then(response => response.json())
            .then(data => {
                // Verificar se o token foi retornado        
                if (data.acknowledged) {
                    alert('✔ Bebida incluído com sucesso!')
                    //Limpar o formulário
                    document.getElementById('formBebida').reset()
                    //Atualiza a UI
                    carregaBebidas()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar a bebida: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function carregaBebidas() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //Limpa a tabela antes de recarregar
    // Fazer a solicitação GET para o endpoint das bebidas
    await fetch(`${urlBase}/bebidas`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token //envia o token na requisição
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(bebida => {
                tabela.innerHTML += `
                <tr>
                   <td>${bebida.nome}</td>
                   <td>${bebida.qtde_ml}</td>
                   <td>${bebida.data_adição}</td>      
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removeBebida("${bebida._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaBebidaPeloId("${bebida._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar a bebida: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removeBebida(id) {
    if (confirm('Deseja realmente excluir o prato?')) {
        await fetch(`${urlBase}/bebidas/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    carregaBebidas() // atualiza a UI
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar a bebida: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaBebidaPeloId(id) {
    await fetch(`${urlBase}/bebidas/id/${id}`, {
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
                document.getElementById('qtde_ml').value = data[0].qtde_ml,
                document.getElementById('data_cardapio').value = data[0].data_adição,
                document.getElementById('tipo').value = data[0].tipo,
                document.getElementById('preco').value = data[0].preço
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar a bebida: ${error.message}</span>`
            resultadoModal.show();
        });

}