// Importações corretas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

// Função para remover formatação do CPF
function removerFormatacaoCPF(cpf) {
    return cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
  }

// Função para validar os campos
function validarFormulario(formData) {
    const requiredFields = [
        "nome", "dataNascimento", "cpf", "telefone", "email",
        "bairro", "numero", "cep", "cidade", "grupoOracoes", "diasEvent",
    ];

    for (let field of requiredFields) {
        if (!formData[field]) {
            Swal.fire("Erro!", `O campo ${field} é obrigatório.`, "error");
            return false;  // Retorna falso se algum campo obrigatório estiver vazio
        }
    }

    // Validar seleção de dias de participação
    if ((formData.tipoInscricao === "diaria" || formData.tipoInscricao === "inscricoesDiariaKids")) {
        const diasParticipacao = document.querySelectorAll("input[name='diasParticipacao']:checked");
        if (diasParticipacao.length === 0) {
            Swal.fire("Erro!", `Você precisa selecionar pelo menos um dia de participação`, "error");
            return false
        }
    }

    return true;  // Retorna verdadeiro se todos os campos obrigatórios estiverem preenchidos
}
// Obtenha o elemento select diretamente
const tipInscElement = document.getElementById("tipInsc");


// Botão de inscrição
const buttonInscricao = document.getElementById("buttonConfirm");

var linksPagamento = {
    "lote1": "https://pay.kiwify.com.br/PbYMrqN",
    "lote1K": "https://pay.kiwify.com.br/keF5BPE",
    "diaria": "https://pay.kiwify.com.br/o2ltBMs",
    "inscricoesDiariaKids": "https://pay.kiwify.com.br/FnHgatE"
};

buttonInscricao.addEventListener("click", () => {


    Swal.fire({
        title: "Suas informações estão corretas para sua inscrição?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim",
        denyButtonText: `Quero revisar`
    }).then((result) => {
        if (result.isConfirmed) {
            // Obtenha todos os valores do formulário
            const formData = {
                tipoInscricao: tipInscElement.value, // Use o elemento select diretamente
                nome: document.querySelector("input[name=txtName]").value,
                dataNascimento: document.querySelector("input[name=dtpDataNascimento]").value,
                idade: document.querySelector("input[name=txtIdade]").value,
                cpf: removerFormatacaoCPF(document.querySelector("input[name=txtCPF]").value), // Remove a formatação do CPF
                telefone: document.querySelector("input[name=txtTelefone]").value,
                email: document.querySelector("input[name=txtEmail]").value,
                logradouro: document.querySelector("input[name=txtLogradouro]").value,
                bairro: document.querySelector("input[name=txtBairro]").value,
                numero: document.querySelector("input[name=txtNumero]").value,
                cep: document.querySelector("input[name=txtCEP]").value,
                cidade: document.querySelector("input[name=txtCidade]").value,
                complemento: document.querySelector("input[name=txtComplemento]").value,
                grupoOracoes: document.querySelector("input[name=txtGrupo]").value,
                diasEvent: document.querySelector("select[name=diasEvent]").value, // Adicione a quantidade de dias
                primeiroRetiro: document.querySelector("select[name=primeiroRetiro]").value,
                alergia: document.querySelector("input[name=alergia]").value,
                pouso: document.querySelector("select[name=pouso]").value,
                diasParticipacao: Array.from(document.querySelectorAll("input[name='diasParticipacao']:checked")).map(checkbox => checkbox.value),
            };

            // Validar o formulário
            if (!validarFormulario(formData)) {
                return; // Se algum campo obrigatório não for preenchido, interrompe a inscrição
            }

            // Determinar o nó correto com base no tipo de inscrição
             let userRef;
             let databaseNode;
             
             if (formData.tipoInscricao === "lote1") {
                databaseNode = "inscricoes";
             }
              else if (formData.tipoInscricao === "lote1K") {
                  databaseNode = "inscricoesKids";
            }
            else if (formData.tipoInscricao === "diaria") {
                databaseNode = "inscricoesDiarias";
            }
            else if (formData.tipoInscricao === "inscricoesDiariaKids") {
                 databaseNode = "inscricoesDiariaKids";
            }
            userRef = ref(database,`${databaseNode}/${formData.cpf}`);
          
            set(userRef, formData)
                .then(() => {
                    Swal.fire("Inscrição quase Pronta!", "", "success");
                    window.location.href = linksPagamento[formData.tipoInscricao];
                })
                .catch((error) => {
                    Swal.fire("Erro ao salvar dados!", error.message, "error");
                });
        } else if (result.isDenied) {
            Swal.fire("Nenhuma alteração realizada!", "", "info");
        }
    });
});

// Limpar o formulário
const clearButton = document.getElementById("clearButton");
const form = document.getElementById("formInscricao");

clearButton.addEventListener("click", () => {
    Swal.fire({
        title: "Deseja limpar os dados preenchidos?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim",
        denyButtonText: `Não`,
    }).then((result) => {
        if (result.isConfirmed) {
            form.reset();
        } else if (result.isDenied) {
            Swal.fire("Nenhuma alteração realizada!", "", "info");
        }
    });
});

// Consulta de CEP
(function () {
    const cep = document.querySelector("input[name=txtCEP]");

    cep.addEventListener("blur", (e) => {
        const value = cep.value.replace(/[^0-9]+/, "");
        const url = `https://viacep.com.br/ws/${value}/json/`;

        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                if (json.localidade) {
                    document.querySelector("input[name=txtLogradouro]").value = json.logradouro;
                    document.querySelector("input[name=txtBairro]").value = json.bairro;
                    document.querySelector("input[name=txtCidade]").value = json.localidade;
                    document.querySelector("input[name=txtComplemento]").value = json.complemento;
                }
            });
    });
})();