(() => {
    const $ = (sel) => document.querySelector(sel);
    const telas = {
      inicio: $("#tela-inicio"),
      jogo: $("#tela-jogo"),
      resultado: $("#tela-resultado"),
    };
    const hud = {
      nivel: $("#nivel"),
      pontos: $("#pontos"),
      vidas: $("#vidas"),
      barra: $("#tempo"),
      enunciado: $("#enunciado"),
      opcoes: $("#opcoes"),
      resumo: $("#resumo"),
      tituloResultado: $("#titulo-resultado"),
    };
  

    let pontos = 0;
    let vidas = 3;
    let nivel = 1;
    let acertosSeguidos = 0;
    let tempoRestante = 100; 
    let timer = null;

    const microgames = [
        { q: "O que é um Arduino?", options: ["Uma placa eletrônica programável", "Um tipo de bateria", "Um motor elétrico", "Uma lâmpada"], correct: 0 },
        { q: "Para que serve o LED?", options: ["Emitir luz", "Fazer barulho", "Girar rodas", "Armazenar energia"], correct: 0 },
        { q: "Qual componente usamos para ligar e desligar um circuito manualmente?", options: ["Interruptor", "Motor", "Cabo USB", "Bateria"], correct: 0 },
        { q: "Qual fio geralmente usamos para o terra (GND)?", options: ["Preto", "Vermelho", "Amarelo", "Azul"], correct: 0 },
        { q: "Com o Arduino podemos controlar:", options: ["LEDs e motores", "Apenas lâmpadas", "Somente pilhas", "Somente cabos"], correct: 0 },
        { q: "Qual é a função da porta USB no Arduino?", options: ["Conectar ao computador", "Acender LED", "Medir distância", "Tocar música"], correct: 0 },
        { q: "O que usamos para armazenar energia em um robô?", options: ["Bateria", "LED", "Sensor", "Interruptor"], correct: 0 },
        { q: "Qual destes é um sensor de luz?", options: ["LDR", "Motor", "Bateria", "Botão"], correct: 0 },
        { q: "O que acontece se ligarmos o polo positivo e negativo da bateria direto?", options: ["Curto-circuito", "Liga normalmente", "Acende LED", "Nada"], correct: 0 },
        { q: "Qual comando acende um LED no Arduino?", options: ["digitalWrite(pino, HIGH);", "digitalRead(pino);", "analogRead(pino);", "pinMode(pino, INPUT);"], correct: 0 },
        { q: "Um motor é usado para:", options: ["Gerar movimento", "Gerar luz", "Armazenar energia", "Controlar corrente"], correct: 0 },
        { q: "O que é GND em um circuito?", options: ["Terra (0 volts)", "Energia positiva", "Um motor", "Um LED"], correct: 0 },
        { q: "Com qual peça o Arduino recebe energia?", options: ["Fonte ou bateria", "Motor", "LED", "Sensor"], correct: 0 },
        { q: "Qual pino usamos para ligar um LED simples?", options: ["Qualquer pino digital configurado como saída", "Somente A0", "Somente D13", "Somente VIN"], correct: 0 },
        { q: "Para não queimar um LED usamos:", options: ["Resistor", "Mais baterias", "Outro LED", "Motor"], correct: 0 },
        { q: "Módulo Bluetooth clássico para Arduino:", options: ["HC-05", "NRF24L01", "ESP8266", "ULN2003"], correct: 0 },
      ];
  

    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
  
    function trocarTela(qual) {
      Object.values(telas).forEach(t => t.classList.remove('ativa'));
      telas[qual].classList.add('ativa');
    }
  
    function atualizarHUD() {
      hud.nivel.textContent = `Nível ${nivel}`;
      hud.pontos.textContent = `Pontos: ${pontos}`;
      hud.vidas.textContent = `Vidas: ${"❤️".repeat(vidas)}${"🤍".repeat(Math.max(0, 3-vidas))}`;
    }
  
    function tempoDoNivel() {
      const t = Math.max(3000, 7000 - (nivel - 1) * 300);
      return t;
    }
  
    let fila = [];
    function prepararFila() {
      fila = shuffle([...microgames]).slice(0, 10 + Math.min(10, nivel)); 
    }
  
    let atual = null;
    function proximaPergunta() {
      if (vidas <= 0) return fimDeJogo();
      if (fila.length === 0) prepararFila();
      atual = fila.pop();
      mostrarPergunta(atual);
      iniciarTimer(tempoDoNivel());
    }
  
    function mostrarPergunta(p) {
      hud.enunciado.textContent = p.q;
      hud.opcoes.innerHTML = "";
      const embaralhadas = p.options.map((txt, idx) => ({txt, idx}));
      shuffle(embaralhadas).forEach((opt, pos) => {
        const b = document.createElement("button");
        b.innerHTML = `<strong>${pos+1}.</strong> ${opt.txt}`;
        b.dataset.idx = opt.idx;
        b.addEventListener('click', () => responder(opt.idx));
        hud.opcoes.appendChild(b);
      });
    }
  
    function iniciarTimer(ms) {
      pararTimer();
      let inicio = performance.now();
      tempoRestante = 100;
      hud.barra.style.width = "100%";
      timer = setInterval(() => {
        const decorrido = performance.now() - inicio;
        const restante = Math.max(0, ms - decorrido);
        tempoRestante = Math.round(restante / ms * 100);
        hud.barra.style.width = tempoRestante + "%";
        if (restante <= 0) {
          pararTimer();
          // Tempo esgotado = erro
          feedback(false);
        }
      }, 100);
    }
    function pararTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }
  
    function responder(idxEscolhido) {
      if (!atual) return;
      pararTimer();
      const correta = idxEscolhido === atual.correct;
      feedback(correta, idxEscolhido);
    }
  
    function feedback(correta, idxEscolhido = null) {
      const botoes = [...hud.opcoes.querySelectorAll('button')];
      botoes.forEach(b => {
        const idx = parseInt(b.dataset.idx, 10);
        if (idx === atual.correct) b.classList.add('correta');
        if (idxEscolhido !== null && idx === idxEscolhido && !correta) b.classList.add('errada');
        b.disabled = true;
      });
  
      if (correta) {
        const bonusTempo = Math.ceil(tempoRestante / 10); // até +10
        acertosSeguidos += 1;
        const combo = acertosSeguidos >= 3 ? 5 : 0;
        const ganho = 10 + bonusTempo + combo;
        pontos += ganho;
      } else {
        acertosSeguidos = 0;
        vidas -= 1;
      }
  
      atualizarHUD();
  
      setTimeout(() => {
        if (vidas <= 0) fimDeJogo();
        else {
          // A cada 5 acertos totais, subir de nível para acelerar o jogo
          const alvoNivel = 1 + Math.floor(pontos / 120);
          if (alvoNivel > nivel) nivel = alvoNivel;
          atualizarHUD();
          proximaPergunta();
        }
      }, 650);
    }
  
    function fimDeJogo() {
      trocarTela('resultado');
      hud.tituloResultado.textContent = vidas <= 0 ? "Game Over 😵" : "Fim do ciclo!";
      hud.resumo.innerHTML = `Você fez <strong>${pontos}</strong> pontos no nível <strong>${nivel}</strong>.<br>
        Dica: treine os atalhos 1–4 e tente manter combos de acertos para ganhar bônus.`;
    }
  
    function resetar() {
      pontos = 0;
      vidas = 3;
      nivel = 1;
      acertosSeguidos = 0;
      prepararFila();
      atualizarHUD();
    }
  
    // Controles
    $("#btn-comecar").addEventListener('click', () => {
      resetar();
      trocarTela('jogo');
      proximaPergunta();
    });
    $("#btn-recomecar").addEventListener('click', () => {
      resetar();
      trocarTela('jogo');
      proximaPergunta();
    });
  
    // Atalhos de teclado 1–4
    window.addEventListener('keydown', (ev) => {
      const n = parseInt(ev.key, 10);
      if (!isNaN(n) && n >= 1 && n <= 4 && telas.jogo.classList.contains('ativa')) {
        const btn = hud.opcoes.querySelectorAll('button')[n-1];
        if (btn && !btn.disabled) btn.click();
      }
      if (ev.key === 'Enter' && telas.inicio.classList.contains('ativa')) {
        $("#btn-comecar").click();
      }
      if (ev.key.toLowerCase() === 'r' && telas.resultado.classList.contains('ativa')) {
        $("#btn-recomecar").click();
      }
    });
  })();