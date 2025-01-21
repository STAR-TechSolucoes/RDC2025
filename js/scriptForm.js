const buttonInscricao = document.getElementById("buttonConfirm");

buttonInscricao.addEventListener("click", () => {
    Swal.fire({
        title: "Sua informações estão corretas para sua inscrição?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim",
        denyButtonText: `Quero revisar`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Inscrição feita com Sucesso!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Nenhuma alteração realizada!", "", "info");
        }
      });
})

    const clearButton = document.getElementById("clearButton");
    const form = document.getElementById("formInscricao");

    // Adiciona um ouvinte de evento ao botão
    clearButton.addEventListener("click", () => {
      Swal.fire({
        title: "Deseja limpar os dados preenchidos?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim",
        denyButtonText: `Não`
      }).then((result) => {
        if (result.isConfirmed) {
          form.reset();
        } else if (result.isDenied) {
          Swal.fire("Nenhuma alteração realizada!", "", "info");
        }
      });
    });

    (function(){ 
 
        const cep = document.querySelector("input[name=txtCEP]");
     
        cep.addEventListener('blur', e=> {
          const value = cep.value.replace(/[^0-9]+/, '');
          const url = `https://viacep.com.br/ws/${value}/json/`;

          fetch(url)
          .then ( response => response.json())
          .then ( json => {
            if (json.logradouro) {
              document.querySelector('input[name=txtLogradouro]').value = json.logradouro;
              document.querySelector('input[name=txtBairro]').value = json.bairro;
              document.querySelector('input[name=txtCidade]').value = json.localidade;
              document.querySelector('input[name=txtComplemento]').value = json.complemento;
            }

          })
       });
     
     })();