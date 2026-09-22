/**
 * validators.js
 * Módulo de validação pura (sem dependência de DOM), facilitando testes unitários.
 */

export const Validators = {
  /**
   * Valida se a matrícula é válida (não vazia e alfanumérica simples)
   */
  isValidMatricula(matricula) {
    if (!matricula || typeof matricula !== 'string') return false;
    const clean = matricula.trim();
    return clean.length >= 4 && clean.length <= 20;
  },

  /**
   * Valida o nome da pessoa
   */
  isValidNome(nome) {
    if (!nome || typeof nome !== 'string') return false;
    return nome.trim().length >= 3 && nome.trim().length <= 100;
  },

  /**
   * Valida a idade do competidor (ex: entre 5 e 110 anos)
   */
  isValidIdade(idade) {
    const num = Number(idade);
    return Number.isInteger(num) && num >= 5 && num <= 110;
  },

  /**
   * Valida o tempo máximo registrado da prova.
   * Regra do Banco de Dados: CHECK (tempo_max <= '01:00:00')
   * Aceita formato 'HH:MM:SS' ou 'MM:SS'
   */
  isValidTempo(tempoStr) {
    if (!tempoStr || typeof tempoStr !== 'string') return false;
    
    // Expressão regular para HH:MM:SS
    const regexFull = /^(\d{2}):([0-5]\d):([0-5]\d)$/;
    const regexShort = /^([0-5]\d):([0-5]\d)$/;

    let horas = 0;
    let minutos = 0;
    let segundos = 0;

    if (regexFull.test(tempoStr)) {
      const parts = tempoStr.split(':').map(Number);
      horas = parts[0];
      minutos = parts[1];
      segundos = parts[2];
    } else if (regexShort.test(tempoStr)) {
      const parts = tempoStr.split(':').map(Number);
      minutos = parts[0];
      segundos = parts[1];
    } else {
      return false;
    }

    // Calcula total em segundos (máximo 1h = 3600 segundos)
    const totalSegundos = (horas * 3600) + (minutos * 60) + segundos;
    return totalSegundos > 0 && totalSegundos <= 3600;
  },

  /**
   * Converte segundos para o formato HH:MM:SS
   */
  formatSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].join(':');
  }
};
