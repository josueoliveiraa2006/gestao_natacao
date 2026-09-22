import { Validators } from '../js/validators.js';

/**
 * Runner simples de asserções em Vanilla JS
 */
export async function runTests(reporterEl) {
  let passed = 0;
  let failed = 0;
  const results = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
      results.push({ ok: true, message });
    } else {
      failed++;
      results.push({ ok: false, message });
    }
  }

  // --- BATERIA DE TESTES: MATRÍCULA ---
  assert(Validators.isValidMatricula('20260001') === true, 'Matrícula "20260001" deve ser válida');
  assert(Validators.isValidMatricula('123') === false, 'Matrícula com menos de 4 caracteres deve ser inválida');
  assert(Validators.isValidMatricula('') === false, 'Matrícula vazia deve ser inválida');
  assert(Validators.isValidMatricula(null) === false, 'Matrícula nula deve ser inválida');

  // --- BATERIA DE TESTES: NOME ---
  assert(Validators.isValidNome('Gabriel Silva') === true, 'Nome "Gabriel Silva" deve ser válido');
  assert(Validators.isValidNome('Ab') === false, 'Nome com menos de 3 letras deve ser inválido');

  // --- BATERIA DE TESTES: IDADE ---
  assert(Validators.isValidIdade(18) === true, 'Idade 18 anos deve ser válida');
  assert(Validators.isValidIdade(3) === false, 'Idade abaixo de 5 anos deve ser inválida');
  assert(Validators.isValidIdade(120) === false, 'Idade acima de 110 anos deve ser inválida');

  // --- BATERIA DE TESTES: TEMPO (Regra: <= 01:00:00) ---
  assert(Validators.isValidTempo('00:45:00') === true, 'Tempo "00:45:00" deve ser aceito');
  assert(Validators.isValidTempo('01:00:00') === true, 'Tempo limite "01:00:00" deve ser aceito');
  assert(Validators.isValidTempo('01:00:01') === false, 'Tempo "01:00:01" (> 1 hora) deve ser rejeitado');
  assert(Validators.isValidTempo('02:15:00') === false, 'Tempo "02:15:00" deve ser rejeitado');
  assert(Validators.isValidTempo('texto_invalido') === false, 'Formato inválido de tempo deve ser rejeitado');

  // --- BATERIA DE TESTES: FORMATADOR DE SEGUNDOS ---
  assert(Validators.formatSecondsToTime(65) === '00:01:05', '65 segundos devem formatar como "00:01:05"');
  assert(Validators.formatSecondsToTime(3600) === '01:00:00', '3600 segundos devem formatar como "01:00:00"');

  // Renderizar na tela
  reporterEl.innerHTML = `
    <div style="margin-bottom: 16px; font-weight: bold; font-size: 18px;">
      Resultado dos Testes: 
      <span style="color: #15803d;">${passed} passaram</span> | 
      <span style="color: #b91c1c;">${failed} falharam</span>
    </div>
    <ul style="list-style: none; padding: 0;">
      ${results.map(r => `
        <li style="padding: 8px 12px; margin-bottom: 6px; border-radius: 4px; background: ${r.ok ? '#dcfce7' : '#fee2e2'}; color: ${r.ok ? '#166534' : '#991b1b'};">
          ${r.ok ? '✅ PASSOU' : '❌ FALHOU'}: ${r.message}
        </li>
      `).join('')}
    </ul>
  `;
}
