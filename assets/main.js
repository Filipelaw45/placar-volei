const fullscreenBtn = document.getElementById('fullscreen-btn');
const content = document.querySelector('.container');

function toggleFullscreen() {
  const doc = document;
  const fullScreenElement = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
  const requestFullScreen = content.requestFullscreen || content.mozRequestFullScreen || content.webkitRequestFullscreen || content.msRequestFullscreen;
  const exitFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!fullScreenElement) {
    fullscreenBtn.innerHTML = `<i class="ri-fullscreen-exit-line"></i>`
    requestFullScreen.call(content);
  } else {
    fullscreenBtn.innerHTML = `<i class="ri-fullscreen-line"></i>`
    exitFullScreen.call(doc);
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

function updateScore(team, increment) {
  const scoreElement = document.querySelector(`.team-${team}`);
  const victoryElement = document.querySelector(`.victory-${team}`);
  let score = parseInt(scoreElement.textContent);
  const otherTeam = team === 'red' ? 'blue' : 'red';
  const otherScore = parseInt(document.querySelector(`.team-${otherTeam}`).textContent);

  // Limite configurável
  let limit = setPointLimit;

  // Prorrogação: se ambos >= limit-1, só vence com diferença de 2
  if (score >= limit - 1 && otherScore >= limit - 1) {
    if (increment) score++;
    else score = Math.max(score - 1, 0);
    scoreElement.textContent = score.toString().padStart(2, '0');

    // Vitória só se diferença >=2 e >= limit
    if (score >= limit && score - otherScore >= 2) {
      const victoryCount = parseInt(localStorage.getItem(`${team}-victory`)) || 0;
      localStorage.setItem(`${team}-victory`, victoryCount + 1);
      victoryElement.textContent = victoryCount + 1;
      document.querySelectorAll('.increment, .decrement').forEach(button => {
        button.removeEventListener('click', incrementDecrementHandler);
      });
    }
    return;
  }

  // Normal: até o limite
  if (score < limit) {
    score = increment ? score + 1 : Math.max(score - 1, 0);
    scoreElement.textContent = score.toString().padStart(2, '0');

    if (score === limit && otherScore < limit - 1) {
      const victoryCount = parseInt(localStorage.getItem(`${team}-victory`)) || 0;
      localStorage.setItem(`${team}-victory`, victoryCount + 1);
      victoryElement.textContent = victoryCount + 1;
      document.querySelectorAll('.increment, .decrement').forEach(button => {
        button.removeEventListener('click', incrementDecrementHandler);
      });
    }
  }
}

function incrementDecrementHandler(event) {
  const button = event.target;
  const team = button.parentElement.classList.contains('red') ? 'red' : 'blue';
  const increment = button.classList.contains('increment');
  updateScore(team, increment);
}

document.querySelectorAll('.increment, .decrement').forEach(button => {
  button.addEventListener('click', incrementDecrementHandler);
});

const resetBtn = document.getElementById('reset-btn');

function resetScores() {
  const reset = window.confirm("Tem certeza que deseja reiniciar o placar?")
  if (!reset) return;
  
  document.querySelectorAll('.score').forEach(scoreElement => {
    scoreElement.textContent = '00';
  });
  
  // Reatribui os eventos de clique aos botões de incremento e decremento
  document.querySelectorAll('.increment, .decrement').forEach(button => {
    button.addEventListener('click', incrementDecrementHandler);
  });
  
  // Renderiza os valores salvos do placar e dos contadores de vitória
  renderScoresFromLocalStorage();
}

resetBtn.addEventListener('click', resetScores);

window.onload = function() {
  function resizeFont() {
    const placares = document.querySelectorAll('.placar');

    placares.forEach(placar => {
      const score = placar.querySelector('.score');
      const width = placar.offsetWidth;
      const height = placar.offsetHeight;
      const fontSize = Math.min(width * 0.8, height * 0.8);
      score.style.fontSize = fontSize + 'px';
    });
  }

  window.addEventListener('resize', resizeFont);

  resizeFont();

  renderScoresFromLocalStorage();
};


function renderScoresFromLocalStorage() {
  const redVictory = localStorage.getItem('red-victory') || '0';
  const blueVictory = localStorage.getItem('blue-victory') || '0';
  
  document.querySelector('.victory-red').textContent = redVictory;
  document.querySelector('.victory-blue').textContent = blueVictory;
}


const cleanBtn = document.getElementById('clean');

function cleanLocalStorageAndReset() {
  // Exibe um prompt de confirmação
  const confirmClean = confirm("Tem certeza que deseja limpar o placar?");
  
  // Verifica se o usuário confirmou
  if (confirmClean) {
    // Limpa os valores relevantes do localStorage
    localStorage.removeItem('red-score');
    localStorage.removeItem('blue-score');
    localStorage.removeItem('red-victory');
    localStorage.removeItem('blue-victory');

    // Reseta os valores na tela
    document.querySelectorAll('.score').forEach(scoreElement => {
      scoreElement.textContent = '00';
    });
    document.querySelectorAll('.victory-red, .victory-blue').forEach(victoryElement => {
      victoryElement.textContent = '0';
    });
  }
}

cleanBtn.addEventListener('click', cleanLocalStorageAndReset);

let setPointLimit = parseInt(localStorage.getItem('set-point-limit')) || 15;

const modal = document.getElementById('modal-config');
const openConfigBtn = document.getElementById('open-config');
const closeModalBtn = document.getElementById('close-modal');
const saveConfigBtn = document.getElementById('save-config');
const setPointInput = document.getElementById('set-point-limit');

openConfigBtn.onclick = () => {
  setPointInput.value = setPointLimit;
  modal.style.display = 'flex';
};
closeModalBtn.onclick = () => modal.style.display = 'none';
saveConfigBtn.onclick = () => {
  setPointLimit = parseInt(setPointInput.value) || 15;
  localStorage.setItem('set-point-limit', setPointLimit);
  modal.style.display = 'none';
  resetScores();
};