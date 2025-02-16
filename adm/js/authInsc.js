// Importações corretas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const qrModalEl = document.getElementById('qrModal');
    const camera = document.getElementById('camera');
    const qrResult = document.getElementById('qrResult');
    const meuBotao = document.getElementById('meuBotao');
    const loading = document.getElementById('loading');
    const fecharModal = document.getElementById('fecharModal');

    const qrModal = new bootstrap.Modal(qrModalEl, {
        backdrop: 'static',
        keyboard: false
    });

    const codeReader = new ZXing.BrowserQRCodeReader();
    let stream = null;
    let qrCodeLido = "";

    let processingQrCode = false; // Flag para evitar múltiplas leituras

    meuBotao.addEventListener('click', async () => {
        resetModal();
        qrModal.show();
        processingQrCode = false; // Reseta a flag ao abrir o modal
    
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            camera.srcObject = stream;
            
            // Inicia a leitura do QR code
            codeReader.decodeFromVideoDevice(undefined, camera, async (result, err) => {
                if (result && !processingQrCode) {
                    processingQrCode = true; // Impede leituras duplicadas
                    qrCodeLido = result.text.trim();
                    qrResult.textContent = `Código Lido: ${qrCodeLido}`;
                    loading.classList.remove("d-none");
    
                    await verificarInscricao(qrCodeLido);
    
                    loading.classList.add("d-none");
                    processingQrCode = false; // Libera para uma nova leitura se necessário

                    encerrarStream(); // Fecha a câmera após a leitura
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error("Erro ao ler o QR Code:", err);
                    mostrarErro("Erro ao ler o QR Code");
                    encerrarStream(); // Fecha a câmera em caso de erro
                }
            });
        } catch (error) {
            console.error("Erro ao acessar a câmera:", error);
            mostrarErro("Erro ao acessar a câmera");
            encerrarStream(); // Fecha a câmera em caso de erro
        }
    });

    fecharModal.addEventListener('click', () => {
        encerrarStream();
        qrModal.hide();
    });
});

async function verificarInscricao(cpf) {
    try {
        // 1. Verificar se a inscrição já foi autenticada
        const inscricaoAutenticadaRef = ref(database, `inscricoesAutenticadas/${cpf}`);
        const inscricaoAutenticadaSnapshot = await get(inscricaoAutenticadaRef);

        if (inscricaoAutenticadaSnapshot.exists()) {
            // Inscrição já autenticada, exibir mensagem e sair
            const inscricao = inscricaoAutenticadaSnapshot.val();
            mostrarErro(`⚠️ Inscrição já autenticada por ${inscricao.autenticadoPor} em ${inscricao.dataHora}`);
            encerrarStream(); // Encerra a câmera
            return;
        }

        // 2. Se não foi autenticada, verificar se a inscrição existe no nó original
        const inscricaoOriginalRef = ref(database, `inscricoes/${cpf}`);
        const inscricaoOriginalSnapshot = await get(inscricaoOriginalRef);

        if (!inscricaoOriginalSnapshot.exists()) {
            // Inscrição não encontrada, exibir mensagem e sair
            mostrarErro("❌ Inscrição não encontrada!");
            encerrarStream(); // Encerra a câmera
            return;
        }

        // 3. Se a inscrição existe e não foi autenticada, registrar a autenticação
        qrResult.textContent = "✅ Inscrição confirmada!";
        qrResult.classList.add("text-success");
        await registrarAutenticacao(cpf);
        inscricaoConfirmada();
        encerrarStream(); // Encerra a câmera

    } catch (error) {
        console.error("Erro ao acessar o Firebase:", error);
        mostrarErro("Erro ao verificar inscrição!");
        encerrarStream(); // Encerra a câmera
    }
}

async function registrarAutenticacao(cpf) {
    try {
        const user = JSON.parse(localStorage.getItem("user")) || { nome: "Desconhecido", imgUser: "default-user.png" };
        const userName = user.nome;
        const dataAtual = new Date().toLocaleString("pt-BR");
        const authRef = ref(database, `inscricoesAutenticadas/${cpf}`); // Atualiza o nó correto

        console.log("Atualizando o Firebase com:", { cpf, userName, dataAtual });

        // Dados a serem salvos no nó de autenticação
        const authData = {
            autenticadoPor: userName,
            dataHora: dataAtual
        };

        await update(authRef, authData);

        alert(`Autenticação registrada para ${cpf} por ${userName} em ${dataAtual}`);
    } catch (error) {
        console.error("Erro ao registrar autenticação no Firebase:", error);
    }
}

function inscricaoConfirmada() {
    Swal.fire({
        icon: 'success',
        title: 'INSCRIÇÃO CONFIRMADA',
        text: 'Participante liberado',
        timer: 5000
    });
}

function mostrarErro(mensagem) {
    qrResult.textContent = mensagem;
    qrResult.classList.add("text-danger");
}

function resetModal() {
    qrResult.textContent = "Posicione o QR Code na câmera...";
    qrResult.classList.remove("text-danger", "text-success");
    loading.classList.add("d-none");
}

function encerrarStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        camera.srcObject = null;
    }
}
