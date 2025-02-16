// Importações corretas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCd2mI-E14mkZwnTQu3l_5RnzguY5Q5BOg",
    authDomain: "rebanhaocarnaval.firebaseapp.com",
    databaseURL: "https://rebanhaocarnaval-default-rtdb.firebaseio.com",
    projectId: "rebanhaocarnaval",
    storageBucket: "rebanhaocarnaval.firebasestorage.app",
    messagingSenderId: "1064690883975",
    appId: "1:1064690883975:web:750fd0bde27e233c820722",
    measurementId: "G-6JZSLS39KN",
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Variáveis 

var usuId = document.getElementById("usuario");
var usuSenha = document.getElementById("senha");
var btnSubmit = document.getElementById("btnSubmit");

btnSubmit.addEventListener('click', LoginForm);

function LoginForm() {
    var usuIdVal = usuId.value;
    usuIdVal = usuIdVal.replace(".", "_");
    console.log(usuIdVal)
    var usuSenhaVal = usuSenha.value;

    if (!usuIdVal) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Preencha o campo nome, por favor!'
        });
        return;
    }

    if (!usuSenhaVal) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'A senha não pode ficar em branco!'
        });
        return;
    }

    const dbRef = ref(database); 
    get(child(dbRef, "hierarquia/usuários/" + usuIdVal)).then((snapshot) => {
        if (snapshot.exists()) {
            const uid = snapshot.val().uid; // Obtém o UID do usuário

            // 2. Busca os dados do usuário no nó "acessos" usando o UID
            get(child(dbRef, "hierarquia/acessos/" + uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    const userFound = snapshot.val();
                    console.log(userFound.password)
                    // Verifica a senha (criptografada)
                    const encryptedInputPassword = usuSenhaVal;
                    console.log(encryptedInputPassword)
                    if (encryptedInputPassword === decPass(userFound.password).toString()) {
                        localStorage.setItem('auth', 1);
                        localStorage.setItem('typeUser', userFound.codhie);
                        Login(userFound);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Senha Incorreta!'
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Usuário não encontrado!'
                    });
                }
            }).catch(error => {
                console.error("Erro ao buscar dados do usuário:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Erro ao acessar o banco de dados.'
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Usuário não encontrado!'
            });
        }
    }).catch(error => {
        console.error("Erro ao buscar UID do usuário:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Erro ao acessar o banco de dados.'
        });
    });
}

function Login(user) {
    localStorage.setItem('keepLoggedIn', 'yes');
    localStorage.setItem('user', JSON.stringify(user));

    // Exibe a foto no SweetAlert
    let imageUrl = user.imgUser;

    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        Swal.fire({
            title: 'BEM VINDO!',
            text: 'Obrigado pela confiança.',
            imageUrl: imageUrl,
            imageAlt: user.nome,
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            window.location = "index.html";
        });
    } else {
        console.warn("URL de imagem inválida ou ausente:", imageUrl);
        Swal.fire({
            title: 'BEM VINDO!',
            text: 'Obrigado pela confiança. (Foto não disponível)',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            window.location = "index.html";
        });
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        const user = JSON.parse(storedUser);

        const userPhoto = document.getElementById('userPhoto');
        const userName = document.getElementById('userName');

        if (userPhoto) {
            userPhoto.src = user.imgUser;
            userPhoto.alt = user.nome;
        }

        if (userName) {
            userName.textContent = user.nome;
        }
    } else {
        // Redirect to login if not logged in
        console.log("AA")
    }
});