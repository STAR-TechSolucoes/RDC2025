const initApp = () => {
    const url = window.location.href;
    const pageName = window.location.pathname.split("/").pop() || "index.html"; // Trata a raiz como index.html

    console.log("URL:", url);
    console.log("Página:", pageName);

    const keepLoggedIn = localStorage.getItem('keepLoggedIn') === "yes";
    const typeUser = localStorage.getItem('typeUser'); // Obtém o tipo de usuário


    if ( (typeUser != '1' && typeUser != '2' && typeUser != '3')) {
            window.location.href = '../../index.html'; // Redireciona para login se não estiver autenticado
    }
    else{
        if(pageName == "index.html" && typeUser == '3'){
            window.location.href = 'powerbi.html'; 
        }
    }
};


// Aguarda o carregamento do DOM antes de executar
document.addEventListener("DOMContentLoaded", initApp);
