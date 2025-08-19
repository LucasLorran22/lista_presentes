// Dados dos presentes (armazenados no localStorage)
let presentes = JSON.parse(localStorage.getItem('presentes')) || [
    {
        id: 1,
        nome: "Smartphone Samsung Galaxy S24",
        descricao: "Smartphone com câmera de alta qualidade e processador potente",
        preco: 2500.00,
        categoria: "eletronicos",
        link: "https://www.samsung.com/br/smartphones/galaxy-s24/",
        prioridade: "alta"
    },
    {
        id: 2,
        nome: "Livro: Clean Code",
        descricao: "Livro sobre boas práticas de programação",
        preco: 89.90,
        categoria: "livros",
        link: "https://www.amazon.com.br/",
        prioridade: "media"
    },
    {
        id: 3,
        nome: "Camiseta Polo",
        descricao: "Camiseta polo azul marinho, tamanho M",
        preco: 120.00,
        categoria: "roupas",
        link: "",
        prioridade: "baixa"
    }
];

// Variáveis globais
let editandoId = null;
let filtroAtivo = 'todos';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderizarPresentes();
    configurarEventListeners();
    configurarNavegacao();
});

// Configurar event listeners
function configurarEventListeners() {
    // Formulário de adicionar presente
    const form = document.getElementById('presenteForm');
    form.addEventListener('submit', adicionarPresente);

    // Formulário de editar presente
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', salvarEdicao);

    // Filtros
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filtroAtivo = this.dataset.filter;
            atualizarFiltroAtivo();
            renderizarPresentes();
        });
    });

    // Modal
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', fecharModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    });

    // Navegação suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            atualizarNavAtiva(this);
        });
    });
}

// Configurar navegação ativa baseada no scroll
function configurarNavegacao() {
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Scroll suave para seção
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Atualizar navegação ativa
function atualizarNavAtiva(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Renderizar presentes na tela
function renderizarPresentes() {
    const grid = document.getElementById('presentesGrid');
    const presentesFiltrados = filtrarPresentes();
    
    if (presentesFiltrados.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #cccccc;">
                <h3>Nenhum presente encontrado</h3>
                <p>Adicione alguns presentes à sua lista!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = presentesFiltrados.map(presente => `
        <div class="presente-card" data-categoria="${presente.categoria}">
            <div class="presente-header">
                <div>
                    <h3 class="presente-nome">${presente.nome}</h3>
                    <span class="presente-categoria">${formatarCategoria(presente.categoria)}</span>
                </div>
                <span class="presente-prioridade prioridade-${presente.prioridade}">
                    ${formatarPrioridade(presente.prioridade)}
                </span>
            </div>
            
            <p class="presente-descricao">${presente.descricao || 'Sem descrição'}</p>
            
            ${presente.preco ? `<div class="presente-preco">R$ ${presente.preco.toFixed(2).replace('.', ',')}</div>` : ''}
            
            <div class="presente-actions">
                ${presente.link ? `<a href="${presente.link}" target="_blank" class="action-btn link-btn">🔗 Ver</a>` : ''}
                <button class="action-btn edit-btn" onclick="editarPresente(${presente.id})">✏️ Editar</button>
                <button class="action-btn delete-btn" onclick="excluirPresente(${presente.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');

    // Adicionar animação de entrada
    setTimeout(() => {
        document.querySelectorAll('.presente-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
}

// Filtrar presentes
function filtrarPresentes() {
    if (filtroAtivo === 'todos') {
        return presentes;
    }
    return presentes.filter(presente => presente.categoria === filtroAtivo);
}

// Atualizar filtro ativo
function atualizarFiltroAtivo() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// Adicionar presente
function adicionarPresente(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const novoPresente = {
        id: Date.now(),
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        preco: formData.get('preco') ? parseFloat(formData.get('preco')) : null,
        categoria: formData.get('categoria'),
        link: formData.get('link'),
        prioridade: formData.get('prioridade')
    };

    presentes.push(novoPresente);
    salvarPresentes();
    renderizarPresentes();
    
    // Limpar formulário
    e.target.reset();
    
    // Mostrar feedback
    mostrarFeedback('Presente adicionado com sucesso!', 'sucesso');
    
    // Scroll para a lista
    scrollToSection('lista');
}

// Editar presente
function editarPresente(id) {
    const presente = presentes.find(p => p.id === id);
    if (!presente) return;

    editandoId = id;
    
    // Preencher formulário de edição
    document.getElementById('editNome').value = presente.nome;
    document.getElementById('editDescricao').value = presente.descricao || '';
    document.getElementById('editPreco').value = presente.preco || '';
    document.getElementById('editCategoria').value = presente.categoria;
    document.getElementById('editLink').value = presente.link || '';
    document.getElementById('editPrioridade').value = presente.prioridade;
    
    // Abrir modal
    document.getElementById('editModal').style.display = 'block';
}

// Salvar edição
function salvarEdicao(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const presenteIndex = presentes.findIndex(p => p.id === editandoId);
    
    if (presenteIndex === -1) return;
    
    presentes[presenteIndex] = {
        ...presentes[presenteIndex],
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        preco: formData.get('preco') ? parseFloat(formData.get('preco')) : null,
        categoria: formData.get('categoria'),
        link: formData.get('link'),
        prioridade: formData.get('prioridade')
    };
    
    salvarPresentes();
    renderizarPresentes();
    fecharModal();
    
    mostrarFeedback('Presente atualizado com sucesso!', 'sucesso');
}

// Excluir presente
function excluirPresente(id) {
    if (confirm('Tem certeza que deseja excluir este presente?')) {
        presentes = presentes.filter(p => p.id !== id);
        salvarPresentes();
        renderizarPresentes();
        mostrarFeedback('Presente excluído com sucesso!', 'sucesso');
    }
}

// Fechar modal
function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
    editandoId = null;
}

// Salvar presentes no localStorage
function salvarPresentes() {
    localStorage.setItem('presentes', JSON.stringify(presentes));
}

// Formatadores
function formatarCategoria(categoria) {
    const categorias = {
        'eletronicos': 'Eletrônicos',
        'livros': 'Livros',
        'roupas': 'Roupas',
        'outros': 'Outros'
    };
    return categorias[categoria] || categoria;
}

function formatarPrioridade(prioridade) {
    const prioridades = {
        'alta': 'Alta',
        'media': 'Média',
        'baixa': 'Baixa'
    };
    return prioridades[prioridade] || prioridade;
}

// Sistema de feedback
function mostrarFeedback(mensagem, tipo = 'sucesso') {
    // Remover feedback anterior se existir
    const feedbackAnterior = document.querySelector('.feedback-message');
    if (feedbackAnterior) {
        feedbackAnterior.remove();
    }

    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = `feedback-message feedback-${tipo}`;
    feedback.textContent = mensagem;
    
    // Estilos do feedback
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${tipo === 'sucesso' ? 'rgba(0, 255, 127, 0.9)' : 'rgba(255, 0, 100, 0.9)'};
        color: #000000;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(feedback);
    
    // Remover após 3 segundos
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Adicionar estilos de animação para o feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Funcionalidades extras
document.addEventListener('keydown', function(e) {
    // Fechar modal com ESC
    if (e.key === 'Escape') {
        fecharModal();
    }
});

// Função para exportar lista (bonus)
function exportarLista() {
    const dados = {
        presentes: presentes,
        dataExportacao: new Date().toISOString(),
        totalItens: presentes.length,
        valorTotal: presentes.reduce((total, p) => total + (p.preco || 0), 0)
    };
    
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `lista-presentes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Função para importar lista (bonus)
function importarLista(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.presentes && Array.isArray(dados.presentes)) {
                presentes = dados.presentes;
                salvarPresentes();
                renderizarPresentes();
                mostrarFeedback('Lista importada com sucesso!', 'sucesso');
            } else {
                mostrarFeedback('Arquivo inválido!', 'erro');
            }
        } catch (error) {
            mostrarFeedback('Erro ao importar arquivo!', 'erro');
        }
    };
    reader.readAsText(file);
}

// Adicionar estatísticas (bonus)
function atualizarEstatisticas() {
    const totalItens = presentes.length;
    const valorTotal = presentes.reduce((total, p) => total + (p.preco || 0), 0);
    const prioridadeAlta = presentes.filter(p => p.prioridade === 'alta').length;
    
    console.log('Estatísticas da Lista:');
    console.log(`Total de itens: ${totalItens}`);
    console.log(`Valor total: R$ ${valorTotal.toFixed(2)}`);
    console.log(`Itens de alta prioridade: ${prioridadeAlta}`);
}

// Chamar estatísticas quando a lista for renderizada
const originalRenderizar = renderizarPresentes;
renderizarPresentes = function() {
    originalRenderizar();
    atualizarEstatisticas();
};

