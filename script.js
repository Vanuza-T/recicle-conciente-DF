// Variáveis do jogo
let score = 0;
let lives = 3;
let correct = 0;
let gameActive = false;

// Banco de dados de itens
const items = [
    // Itens de plástico
    { name: 'Garrafa PET', icon: 'bi-cup-straw', type: 'plastic' },
    { name: 'Sacola Plástica', icon: 'bi-bag', type: 'plastic' },
    { name: 'Copo Descartável', icon: 'bi-cup', type: 'plastic' },
    { name: 'Embalagem Plástica', icon: 'bi-box', type: 'plastic' },
    
    // Itens de papel
    { name: 'Jornal', icon: 'bi-newspaper', type: 'paper' },
    { name: 'Revista', icon: 'bi-book', type: 'paper' },
    { name: 'Caixa de Papelão', icon: 'bi-box-seam', type: 'paper' },
    { name: 'Folha de Caderno', icon: 'bi-file-text', type: 'paper' },
    
    // Itens de metal
    { name: 'Lata de Refrigerante', icon: 'bi-cup-fill', type: 'metal' },
    { name: 'Lata de Conserva', icon: 'bi-archive', type: 'metal' },
    { name: 'Tampa de Metal', icon: 'bi-circle', type: 'metal' },
    { name: 'Papel Alumínio', icon: 'bi-square', type: 'metal' },
    
    // Itens de vidro
    { name: 'Garrafa de Vidro', icon: 'bi-cup', type: 'glass' },
    { name: 'Pote de Vidro', icon: 'bi-archive', type: 'glass' },
    { name: 'Frasco de Perfume', icon: 'bi-droplet', type: 'glass' },
    { name: 'Copo de Vidro', icon: 'bi-cup-fill', type: 'glass' },
    
    // Itens orgânicos
    { name: 'Casca de Banana', icon: 'bi-tree', type: 'organic' },
    { name: 'Restos de Comida', icon: 'bi-egg-fried', type: 'organic' },
    { name: 'Folhas Secas', icon: 'bi-tree-fill', type: 'organic' },
    { name: 'Borra de Café', icon: 'bi-cup-hot', type: 'organic' },
    
    // Itens não recicláveis
    { name: 'Papel Higiênico', icon: 'bi-file-x', type: 'non-recyclable' },
    { name: 'Fralda Descartável', icon: 'bi-person', type: 'non-recyclable' },
    { name: 'Copo de Isopor', icon: 'bi-cup', type: 'non-recyclable' },
    { name: 'Espelho Quebrado', icon: 'bi-square', type: 'non-recyclable' }
];

// Inicializa as funcionalidades quando o conteúdo da página é carregado
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    setupSmoothScroll();
});

// Configura a funcionalidade de arrastar e soltar (drag and drop)
function setupDragAndDrop() {
    const bins = document.querySelectorAll('.bin');
    
    bins.forEach(bin => {
        bin.addEventListener('dragover', handleDragOver);
        bin.addEventListener('drop', handleDrop);
        bin.addEventListener('dragleave', handleDragLeave);
        bin.addEventListener('dragenter', handleDragEnter);
    });
}

// Funções para controlar o evento de arrastar e soltar
function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.dataTransfer.setData('itemType', e.target.dataset.type);
    e.dataTransfer.setData('itemId', e.target.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    const bin = e.currentTarget;
    bin.classList.remove('drag-over');
    
    if (!gameActive) return false;
    
    const itemType = e.dataTransfer.getData('itemType');
    const itemId = e.dataTransfer.getData('itemId');
    const binType = bin.dataset.type;
    
    const draggedItem = document.getElementById(itemId);
    
    if (itemType === binType) {
        // Soltura correta
        score += 10;
        correct++;
        updateScore();
        showFeedback('Correto! +10 pontos', 'success');
        bin.classList.add('correct-drop');
        setTimeout(() => bin.classList.remove('correct-drop'), 500);
        
        // Remove o item
        if (draggedItem) {
            draggedItem.style.animation = 'fadeOut 0.5s';
            setTimeout(() => draggedItem.remove(), 500);
        }
        
        // Verifica se todos os itens foram sorteados
        checkGameComplete();
    } else {
        // Soltura errada
        lives--;
        updateScore();
        showFeedback('Errado! Tente novamente', 'error');
        bin.classList.add('wrong-drop');
        setTimeout(() => bin.classList.remove('wrong-drop'), 500);
        
        if (lives <= 0) {
            endGame();
        }
    }
    
    return false;
}

// Funções do Jogo
function startGame() {
    gameActive = true;
    score = 0;
    lives = 3;
    correct = 0;
    updateScore();
    
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = '';
    
    // Embaralha e seleciona itens aleatórios
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 8);
    
    selectedItems.forEach((item, index) => {
        const itemElement = createDraggableItem(item, index);
        itemsContainer.appendChild(itemElement);
    });
    
    showFeedback('Jogo iniciado! Arraste os itens para as lixeiras corretas', 'success');
}

function createDraggableItem(item, index) {
    const div = document.createElement('div');
    div.className = 'draggable-item fade-in';
    div.id = `item-${index}`;
    div.dataset.type = item.type;
    div.draggable = true;
    div.innerHTML = `<i class="bi ${item.icon}"></i> ${item.name}`;
    
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    // Suporte a toque (touch) para dispositivos móveis
    div.addEventListener('touchstart', handleTouchStart, { passive: false });
    div.addEventListener('touchmove', handleTouchMove, { passive: false });
    div.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return div;
}

// Suporte a toque para dispositivos móveis
let touchItem = null;

function handleTouchStart(e) {
    touchItem = e.target.closest('.draggable-item');
    if (!touchItem) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    touchItem.style.position = 'fixed';
    touchItem.style.zIndex = '1000';
    touchItem.style.left = touch.pageX - touchItem.offsetWidth / 2 + 'px';
    touchItem.style.top = touch.pageY - touchItem.offsetHeight / 2 + 'px';
    touchItem.classList.add('dragging');
}

function handleTouchMove(e) {
    if (!touchItem) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    touchItem.style.left = touch.pageX - touchItem.offsetWidth / 2 + 'px';
    touchItem.style.top = touch.pageY - touchItem.offsetHeight / 2 + 'px';
    
    // Verifica se está sobre uma lixeira
    const bins = document.querySelectorAll('.bin');
    bins.forEach(bin => bin.classList.remove('drag-over'));
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const binBelow = elementBelow?.closest('.bin');
    if (binBelow) {
        binBelow.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    if (!touchItem) return;
    
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const binBelow = elementBelow?.closest('.bin');
    
    if (binBelow && gameActive) {
        const itemType = touchItem.dataset.type;
        const binType = binBelow.dataset.type;
        
        binBelow.classList.remove('drag-over');
        
        if (itemType === binType) {
            // Soltura correta
            score += 10;
            correct++;
            updateScore();
            showFeedback('Correto! +10 pontos', 'success');
            binBelow.classList.add('correct-drop');
            setTimeout(() => binBelow.classList.remove('correct-drop'), 500);
            
            touchItem.remove();
            checkGameComplete();
        } else {
            // Soltura errada
            lives--;
            updateScore();
            showFeedback('Errado! Tente novamente', 'error');
            binBelow.classList.add('wrong-drop');
            setTimeout(() => binBelow.classList.remove('wrong-drop'), 500);
            
            if (lives <= 0) {
                endGame();
            }
        }
    }
    
    // Reseta o item de toque
    if (touchItem) {
        touchItem.style.position = '';
        touchItem.style.zIndex = '';
        touchItem.style.left = '';
        touchItem.style.top = '';
        touchItem.classList.remove('dragging');
    }
    touchItem = null;
    
    // Remove a classe 'drag-over' de todas as lixeiras
    document.querySelectorAll('.bin').forEach(bin => bin.classList.remove('drag-over'));
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('correct').textContent = correct;
}

function checkGameComplete() {
    const remainingItems = document.querySelectorAll('.draggable-item').length;
    if (remainingItems === 0) {
        endGame(true);
    }
}

function endGame(won = false) {
    gameActive = false;
    
    if (won) {
        showFeedback(`Parabéns! Você completou o jogo com ${score} pontos!`, 'success');
    } else {
        showFeedback(`Game Over! Você fez ${score} pontos. Tente novamente!`, 'error');
    }
    
    // Limpa os itens
    setTimeout(() => {
        const itemsContainer = document.getElementById('itemsContainer');
        itemsContainer.innerHTML = '<p class="text-center text-muted mb-0">Clique em "Iniciar Jogo" para jogar novamente</p>';
    }, 2000);
}

function resetGame() {
    gameActive = false;
    score = 0;
    lives = 3;
    correct = 0;
    updateScore();
    
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = '<p class="text-center text-muted mb-0">Clique em "Iniciar Jogo" para começar</p>';
    
    showFeedback('Jogo reiniciado', 'success');
}

// Filtra os pontos de coleta
function filterPoints(category) {
    const points = document.querySelectorAll('.collection-point');
    const buttons = document.querySelectorAll('#pontos-de-coleta .btn-outline-success');
    
    // Atualiza o botão ativo
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Todos') && category === 'all') {
            btn.classList.add('active');
        } else if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    // Filtra os pontos
    points.forEach(point => {
        if (category === 'all' || point.dataset.category === category) {
            point.style.display = 'block';
            point.classList.add('fade-in');
        } else {
            point.style.display = 'none';
        }
    });
}

// Mostra a notificação (toast) de feedback
function showFeedback(message, type) {
    const toastEl = document.getElementById('gameToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toastEl.classList.remove('success', 'error');
    toastEl.classList.add(type);
    
    const toast = new bootstrap.Toast(toastEl, {
        delay: 3000
    });
    toast.show();
}

// Configura a rolagem suave
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fecha o menu móvel, se estiver aberto
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });
}

// Opções do observador para animações ao rolar a página
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observa todos os cards para animá-los
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => observer.observe(card));
});

// Adiciona a animação de fadeOut dinamicamente via JS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0.5);
        }
    }
`;
document.head.appendChild(style);