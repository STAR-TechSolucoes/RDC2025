// Importações corretas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
    const autenticarButton = document.getElementById('autenticarButton');
    const cpfExibido = document.getElementById('cpfExibido');
    const inputCPF = document.getElementById('inputCPF');
    const limpaCPF = document.getElementById('limpaCPF');

    const abrirCameraBtn = document.getElementById('abrirCameraBtn');
    const fecharCameraBtn = document.getElementById('fecharCameraBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    const qrResult = document.getElementById('cpfExibido');  // Using cpfExibido for result
    const loading = document.getElementById('loading');

    let stream = null;
    let codeReader = new ZXing.BrowserQRCodeReader();

    let processingQrCode = false;
    let decodingActive = false;

    let cpf = new URLSearchParams(window.location.search).get('cpf') || "";
    cpf = cpf.replace(/\D/g, '');
    inputCPF.value = cpf;
    cpfExibido.textContent = cpf;

    // Event Listeners
    autenticarButton.addEventListener('click', async () => {
        let cpfParaAutenticar = inputCPF.value.replace(/\D/g, '');
        if (!cpfParaAutenticar) {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Por favor, digite um CPF.' });
            return;
        }
        await verificarInscricao(cpfParaAutenticar);
    });

    limpaCPF.addEventListener('click', () => {
        inputCPF.value = "";
        cpfExibido.textContent = "";
    });

    abrirCameraBtn.addEventListener('click', () => {
        startCamera();
    });

    fecharCameraBtn.addEventListener('click', () => {
        stopCamera();
    });

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            cameraPreview.srcObject = stream;
            cameraPreview.style.display = 'block';
            abrirCameraBtn.style.display = 'none';
            fecharCameraBtn.style.display = 'block';
            qrResult.textContent = "Aguardando leitura do QR Code..."; // Initial message
            loading.classList.add("d-none");

            decodingActive = true;
            decodeContinuously();

        } catch (error) {
            console.error("Erro ao acessar a câmera:", error);
            mostrarErro("Erro ao acessar a câmera. Verifique as permissões.");
            stopCamera(); // Ensure camera is stopped even if start fails
        }
    }

    function stopCamera() {
        decodingActive = false;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            cameraPreview.srcObject = null; // Clear the video source
            stream = null;
        }

        cameraPreview.style.display = 'none';
        abrirCameraBtn.style.display = 'block';
        fecharCameraBtn.style.display = 'none';
        codeReader.reset(); // Important: Reset the code reader!
    }

    async function decodeContinuously() {
        if (!decodingActive) return;

        try {
            codeReader.decodeFromVideoDevice(undefined, cameraPreview, async (result, err) => {
                if (!decodingActive) return;

                if (result && !processingQrCode) {
                    processingQrCode = true;
                    const qrCodeLido = result.text.trim();
                    qrResult.textContent = `CPF LIDO: ${qrCodeLido}`; // Set CPF to cpfExibido
                    inputCPF.value = qrCodeLido;
                    cpfExibido.textContent = qrCodeLido;
                    loading.classList.remove("d-none");

                    try {
                        await verificarInscricao(qrCodeLido);
                    } catch (e) {
                        console.error("Error during verification:", e);
                        mostrarErro("Erro ao verificar inscrição");
                    } finally {
                        loading.classList.add("d-none");
                        processingQrCode = false;
                        stopCamera(); // Stop after successful read - IMPORTANT
                    }

                } else if (err) {  // Handling Errors

                    if (!(err instanceof ZXing.NotFoundException)) {
                        console.error("Erro ao ler o QR Code:", err);
                        mostrarErro("Erro ao ler o QR Code");
                    }
                    // Do not stop the camera on NotFoundException; keep scanning
                }
            });
        } catch (e) {
            console.error("Decoding error:", e);
            mostrarErro("Erro ao decodificar QR code");
            stopCamera(); // Ensure camera is stopped on decoding errors
        }
    }


    function mostrarErro(message) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: message,
        });
    }

    async function verificarInscricao(cpf) {
        if (!cpf) {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Ter um CPF é obrigatório' });
            return;
        }

        const firebaseNodes = ["inscricoes", "inscricoesDiariaKids", "inscricoesDiarias", "inscricoesKids"];
        let participante = null;
        let tipoInscricaoEncontrada = null;

        for (const node of firebaseNodes) {
            try {
                const inscricaoRef = ref(database, `${node}/${cpf}`);
                const inscricaoSnapshot = await get(inscricaoRef);

                if (inscricaoSnapshot.exists()) {
                    participante = inscricaoSnapshot.val();
                    tipoInscricaoEncontrada = node;
                    break;
                }
            } catch (error) {
                console.error(`Erro ao acessar o Firebase (nó ${node}):`, error);
                Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao verificar inscrição!' });
                return;
            }
        }

        if (!participante) {
            Swal.fire({ icon: 'error', title: 'Inscrição não encontrada', text: 'Inscrição não encontrada no Firebase!' });
            return;
        }

        const inscricaoAutenticadaRef = ref(database, `inscricoesAutenticadas/${cpf}`);
        const inscricaoAutenticadaSnapshot = await get(inscricaoAutenticadaRef);
        const dataAtualFormatada = new Date().toISOString().slice(0, 10);

        if (inscricaoAutenticadaSnapshot.exists()) {
            const inscricaoAutenticada = inscricaoAutenticadaSnapshot.val();
            console.log(participante);
            if (!participante.diasParticipacao) {
                participante.diasParticipacao = ['TODOS'];
            }
            console.log(participante);
            if (inscricaoAutenticada.dataComparecendo.length >= participante.diasParticipacao.length) {
                Swal.fire({ icon: 'warning', title: 'Alerta', text: 'Inscrição já autenticada para hoje ou atingiu limite de dias da inscrição!' });
                return;
            }
        }

        Swal.fire({
            title: 'Confirmar Inscrição',
            text: `Deseja confirmar a inscrição para: ${participante.nome}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, confirmar!',
            cancelButtonText: 'Não, cancelar!'
        }).then((result) => {
            if (result.isConfirmed) {
                registrarAutenticacao(cpf, tipoInscricaoEncontrada, participante, dataAtualFormatada);
            }
        });
    }

    // Função para registrar autenticação no Firebase
    async function registrarAutenticacao(cpf, tipoInscricao, participante, dataAtualFormatada) {
        console.log(dataAtualFormatada);
        try {
            const user = JSON.parse(localStorage.getItem("user")) || { nome: "Desconhecido", imgUser: "default-user.png" };
            const userName = user.nome;
            const dataAtual = new Date();
            const dataHoraFormatada = dataAtual.toLocaleString("pt-BR");
            const authRef = ref(database, `inscricoesAutenticadas/${cpf}`);

            const inscricaoAutenticadaSnapshot = await get(authRef);
            let dataComparecendo = [];

            if (inscricaoAutenticadaSnapshot.exists()) {
                const inscricaoAutenticada = inscricaoAutenticadaSnapshot.val();
                dataComparecendo = inscricaoAutenticada.dataComparecendo || [];
            }

            if (!dataComparecendo.includes(dataAtualFormatada)) {
                dataComparecendo.push(dataAtualFormatada);
            }

            let authData;

            if (tipoInscricao !== "inscricoes" && tipoInscricao !== "inscricoesKids") {
                const authDias = ref(database, tipoInscricao + `/${cpf}`);
                const inscricaoPessoaSnapshot = await get(authDias);
                const inscricaoAutenticada = inscricaoPessoaSnapshot.val();
                const diasParticipacao = inscricaoAutenticada.diasParticipacao;

                authData = {
                    autenticadoPor: userName,
                    dataHora: dataHoraFormatada,
                    tipoInscricao: tipoInscricao,
                    diasParticipacao: diasParticipacao,
                    dataComparecendo: dataComparecendo
                };
            } else {
                authData = {
                    autenticadoPor: userName,
                    dataHora: dataHoraFormatada,
                    tipoInscricao: tipoInscricao,
                    diasParticipacao: ['TODOS'],
                    dataComparecendo: dataComparecendo
                };
            }

            console.log("Atualizando o Firebase com:", authData);
            await set(authRef, authData);

            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Autenticação registrada com sucesso!'
            }).then(() => {
                inscricaoConfirmada(userName);
            });

        } catch (error) {
            console.error("Erro ao registrar autenticação no Firebase:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao registrar autenticação no Firebase!'
            });
        }
    }

    function inscricaoConfirmada(userName) {
        Swal.fire({
            icon: 'success',
            title: 'INSCRIÇÃO CONFIRMADA',
            text: userName + ' liberado',
            timer: 5000
        });
    }
});