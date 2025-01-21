// Importações corretas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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


// Função para validar os campos
function validarFormulario(formData) {
  const requiredFields = [
      "nome", "dataNascimento", "cpf", "telefone", "email", 
      "localidade", "bairro", "numero", "cep", "cidade", "grupoOracoes"
  ];

  for (let field of requiredFields) {
      if (!formData[field]) {
          Swal.fire("Erro!", `O campo ${field} é obrigatório.`, "error");
          return false;  // Retorna falso se algum campo obrigatório estiver vazio
      }
  }

  return true;  // Retorna verdadeiro se todos os campos obrigatórios estiverem preenchidos
}



// Botão de inscrição
const buttonInscricao = document.getElementById("buttonConfirm");

buttonInscricao.addEventListener("click", () => {
  var tipInsc = document.getElementById("tipInsc").value;

  Swal.fire({
      title: "Suas informações estão corretas para sua inscrição?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Sim",
      denyButtonText: `Quero revisar`
  }).then((result) => {
      if (result.isConfirmed) {
          const formData = {
              tipoInscricao: document.getElementById("tipInsc").value,
              nome: document.querySelector("input[name=txtName]").value,
              dataNascimento: document.querySelector("input[name=dtpDataNascimento]").value,
              idade: document.querySelector("input[name=txtIdade]").value,
              cpf: document.querySelector("input[name=txtCPF]").value,
              telefone: document.querySelector("input[name=txtTelefone]").value,
              email: document.querySelector("input[name=txtEmail]").value,
              logradouro: document.querySelector("input[name=txtLogradouro]").value,
              bairro: document.querySelector("input[name=txtBairro]").value,
              numero: document.querySelector("input[name=txtNumero]").value,
              cep: document.querySelector("input[name=txtCEP]").value,
              cidade: document.querySelector("input[name=txtCidade]").value,
              complemento: document.querySelector("input[name=txtComplemento]").value,
              grupoOracoes: document.querySelector("input[name=txtGrupo]").value,
              qtdeDias: document.querySelector("input[name=txtQtdeDias]").value,
              primeiroRetiro: document.querySelector("select[name=primeiroRetiro]").value,
              alergia: document.querySelector("input[name=alergia]").value,
              pouso: document.querySelector("select[name=pouso]").value,
              dataChegada: document.querySelector("select[name=dataChegada]").value
          };

          // Validar o formulário
          if (!validarFormulario(formData)) {
              return; // Se algum campo obrigatório não for preenchido, interrompe a inscrição
          }

          // Se o formulário for válido, continue com o processo de inscrição
          if (tipInsc == "lote1") {
              ref("inscricoes").push(formData)
                  .then(() => {
                      Swal.fire("Inscrição feita com Sucesso!", "", "success");
                  })
                  .catch((error) => {
                      Swal.fire("Erro ao salvar dados!", error.message, "error");
                  });
          }
          if (tipInsc == "lote1K") {
              database.ref("inscricoesKids").push(formData)
                  .then(() => {
                      Swal.fire("Inscrição feita com Sucesso!", "", "success");
                  })
                  .catch((error) => {
                      Swal.fire("Erro ao salvar dados!", error.message, "error");
                  });
          }
          if (tipInsc == "diaria") {
              database.ref("inscricoesDiarias").push(formData)
                  .then(() => {
                      Swal.fire("Inscrição feita com Sucesso!", "", "success");
                  })
                  .catch((error) => {
                      Swal.fire("Erro ao salvar dados!", error.message, "error");
                  });
          }
          if (tipInsc == "diariaK") {
              database.ref("inscricoesDiariaKids").push(formData)
                  .then(() => {
                      Swal.fire("Inscrição feita com Sucesso!", "", "success");
                  })
                  .catch((error) => {
                      Swal.fire("Erro ao salvar dados!", error.message, "error");
                  });
          }
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
