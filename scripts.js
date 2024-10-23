document.addEventListener("DOMContentLoaded", function() {
    const url = "https://lucaslorran22.github.io/lista_presentes/lista.json";
    const listaPresentes = document.querySelector(".gift-list");

    // Limpa a lista antes de adicionar novos itens
    listaPresentes.innerHTML = '';

    fetch(url)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error('Network response was not ok');
            }
            return resposta.json();
        })
        .then(dados => {
            dados.forEach(item => {
                const li = document.createElement("li");
                li.className = "gift-item";
                
                li.innerHTML = `
                    <img src="${item.imagem}" alt="${item.nome}">
                    <h2>${item.nome}</h2>
                    <p>${item.descricao}</p>
                    <a href="${item.link}" target="_blank">Ver mais</a>
                `;
                
                listaPresentes.appendChild(li);
            });
        })
        .catch(erro => {
            console.error('Erro ao buscar a lista de presentes:', erro);
            listaPresentes.innerHTML = '<li>Desculpe, não foi possível carregar a lista de presentes.</li>';
        });
});
