document.addEventListener("DOMContentLoaded", function () {
    // Verifique se o token existe no localStorage
    const token = localStorage.getItem("token");

    if (!token) {
        // Se o token não existe, redirecione para a página de login
        window.location.href = "index.html";
    } else {
        // Token existe, verifique se ele expirou
        const tokenData = parseJwt(token); // Função para decodificar o token

        if (tokenData && tokenData.exp && tokenData.exp * 1000 > Date.now()) {
            // Token não expirou, permita o acesso à página de menu
        } else {
            // Token expirou, redirecione para a página de login
            window.location.href = "index.html";
        }
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace("-", "+").replace("_", "/");
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

// Captura o botão "Logout" pelo ID
const logoutBtn = document.getElementById("logoutBtn");
// Adicione um ouvinte de eventos ao botão "Logout" para lidar com a ação de logout
logoutBtn.addEventListener("click", function () {
    // Remova o token do localStorage
    localStorage.removeItem("token");

    // Redirecione o usuário para a página de login
    window.location.href = "index.html";
});