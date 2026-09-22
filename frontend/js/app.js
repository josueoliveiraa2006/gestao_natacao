import { Api } from './api.js';
import { Validators } from './validators.js';

// Estado global simples da aplicação
const state = {
  currentUser: null,
  currentView: 'view-dashboard',
  selectedProvaId: null
};

// Elementos Globais
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('form-login');
const logoutBtn = document.getElementById('btn-logout');
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('page-title');

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAuth();
  carregarProvas();
});

// Carregar Provas do php
async function carregarProvas() {
  const resposta = await fetch('backend/provas.php');
  const provas = await resposta.json();

  const select = document.getElementById('insc-prova');

  provas.forEach(prova => {
    const option = document.createElement('option');

    option.value = prova.id;
    option.textContent = prova.nome;

    select.appendChild(option);
  });
}

function setupEventListeners() {
  // Login
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  // Navegação do menu lateral
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      const title = link.getAttribute('data-title');
      navigateTo(targetView, title);
    });
  });

  // Alternância de Abas em Gerenciamento de Pessoas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentTabs = btn.closest('.panel-card');
      parentTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parentTabs.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.remove('hidden');
    });
  });

  // Formulários de Ação
  document.getElementById('form-competidor')?.addEventListener('submit', handleAddCompetidor);
  document.getElementById('form-arbitro')?.addEventListener('submit', handleAddArbitro);
  document.getElementById('form-prova')?.addEventListener('submit', handleAddProva);
  document.getElementById('form-inscricao')?.addEventListener('submit', handleAddInscricao);

  // Filtro de prova no painel de resultados
  document.getElementById('select-race-filter')?.addEventListener('change', (e) => {
    loadRaceResults(e.target.value);
  });
}

// === CONTROLE DE AUTENTICAÇÃO ===
function checkAuth() {
  const savedUser = sessionStorage.getItem('swim_user');
  if (savedUser) {
    state.currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLogin();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const role = document.getElementById('login-role').value;
  const alertBox = document.getElementById('login-alert');

  try {
    const authData = await Api.login({ username, password, role });
    sessionStorage.setItem('swim_user', JSON.stringify(authData.user));
    state.currentUser = authData.user;
    alertBox.classList.add('hidden');
    showApp();
  } catch (err) {
    alertBox.textContent = err.message || 'Erro ao realizar login.';
    alertBox.classList.remove('hidden');
  }
}

function handleLogout() {
  sessionStorage.removeItem('swim_user');
  state.currentUser = null;
  showLogin();
}

function showLogin() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
}

function showApp() {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  
  // Atualiza informações no sidebar
  document.getElementById('logged-user-name').textContent = state.currentUser.name;
  document.getElementById('logged-user-role').textContent = state.currentUser.role;

  // Carrega visão inicial
  navigateTo('view-dashboard', 'Painel Geral');
}

// === NAVEGAÇÃO ENTRE TELAS ===
export function navigateTo(viewId, title) {
  state.currentView = viewId;
  
  views.forEach(v => v.classList.add('hidden'));
  const current = document.getElementById(viewId);
  if (current) current.classList.remove('hidden');

  navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (title && pageTitle) {
    pageTitle.textContent = title;
  }

  // Carrega dados específicos da tela
  switch (viewId) {
    case 'view-dashboard':
      loadDashboard();
      break;
    case 'view-pessoas':
      loadPessoas();
      break;
    case 'view-provas':
      loadProvasEInscricoes();
      break;
    case 'view-resultados':
      loadResultadosView();
      break;
  }
}

// === TELA 1: DASHBOARD ===
async function loadDashboard() {
  const [competidores, provas, inscricoes] = await Promise.all([
    Api.getCompetidores(),
    Api.getProvas(),
    Api.getInscricoes()
  ]);

  document.getElementById('kpi-competidores').textContent = competidores.length;
  document.getElementById('kpi-provas').textContent = provas.length;
  document.getElementById('kpi-inscricoes').textContent = inscricoes.length;

  // Renderiza últimas provas na tabela rápida
  const tbody = document.getElementById('table-recent-provas');
  if (tbody) {
    tbody.innerHTML = provas.slice(0, 5).map(p => `
      <tr>
        <td><strong>#${p.prova_id}</strong></td>
        <td>${p.nome}</td>
        <td>${new Date(p.data_hora).toLocaleString('pt-BR')}</td>
        <td><span class="badge badge-primary">Agendada</span></td>
      </tr>
    `).join('');
  }
}

// === TELA 2: GERENCIAMENTO DE PESSOAS ===
async function loadPessoas() {
  const [competidores, arbitros] = await Promise.all([
    Api.getCompetidores(),
    Api.getArbitros()
  ]);

  // Lista de Competidores
  const tbodyComp = document.getElementById('table-competidores-body');
  if (tbodyComp) {
    tbodyComp.innerHTML = competidores.length === 0 
      ? `<tr><td colspan="5" class="empty-state">Nenhum competidor cadastrado.</td></tr>`
      : competidores.map(c => `
        <tr>
          <td><strong>${c.matricula}</strong></td>
          <td>${c.nome}</td>
          <td>${c.sexo === 'M' ? 'Masculino' : 'Feminino'}</td>
          <td>${c.idade} anos</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="window.swimApp.deleteCompetidor('${c.matricula}')">
              Excluir
            </button>
          </td>
        </tr>
      `).join('');
  }

  // Lista de Árbitros
  const tbodyArb = document.getElementById('table-arbitros-body');
  if (tbodyArb) {
    tbodyArb.innerHTML = arbitros.length === 0
      ? `<tr><td colspan="4" class="empty-state">Nenhum árbitro cadastrado.</td></tr>`
      : arbitros.map(a => `
        <tr>
          <td><strong>#${a.arbitro_id}</strong></td>
          <td>${a.nome}</td>
          <td><span class="badge badge-warning">${a.credencial}</span></td>
          <td><span class="badge badge-success">Ativo</span></td>
        </tr>
      `).join('');
  }
}

async function handleAddCompetidor(e) {
  e.preventDefault();
  const matricula = document.getElementById('comp-matricula').value;
  const nome = document.getElementById('comp-nome').value;
  const sexo = document.getElementById('comp-sexo').value;
  const idade = Number(document.getElementById('comp-idade').value);
  const alertEl = document.getElementById('alert-competidor');

  // Validações
  if (!Validators.isValidMatricula(matricula)) {
    return showAlert(alertEl, 'A matrícula deve ter entre 4 e 20 caracteres.', 'danger');
  }
  if (!Validators.isValidNome(nome)) {
    return showAlert(alertEl, 'O nome deve ter entre 3 e 100 caracteres.', 'danger');
  }
  if (!Validators.isValidIdade(idade)) {
    return showAlert(alertEl, 'A idade deve estar entre 5 e 110 anos.', 'danger');
  }

  try {
    await Api.createCompetidor({ matricula, nome, sexo, idade });
    showAlert(alertEl, 'Competidor cadastrado com sucesso!', 'success');
    document.getElementById('form-competidor').reset();
    loadPessoas();
  } catch (err) {
    showAlert(alertEl, err.message, 'danger');
  }
}

async function handleAddArbitro(e) {
  e.preventDefault();
  const nome = document.getElementById('arb-nome').value;
  const credencial = document.getElementById('arb-credencial').value;
  const alertEl = document.getElementById('alert-arbitro');

  if (!Validators.isValidNome(nome)) {
    return showAlert(alertEl, 'Informe um nome válido para o árbitro.', 'danger');
  }

  try {
    await Api.createArbitro({ nome, credencial });
    showAlert(alertEl, 'Árbitro cadastrado com sucesso!', 'success');
    document.getElementById('form-arbitro').reset();
    loadPessoas();
  } catch (err) {
    showAlert(alertEl, err.message, 'danger');
  }
}

// === TELA 3: GERENCIAMENTO DE PROVAS & INSCRIÇÕES ===
async function loadProvasEInscricoes() {
  const [provas, competidores, categorias, locais, arbitros, inscricoes] = await Promise.all([
    Api.getProvas(),
    Api.getCompetidores(),
    Api.getCategorias(),
    Api.getLocais(),
    Api.getArbitros(),
    Api.getInscricoes()
  ]);

  // Preencher selects
  populateSelect('prova-local', locais, 'local_id', 'nome');
  populateSelect('prova-arbitro', arbitros, 'arbitro_id', 'nome');
  populateSelect('prova-categoria', categorias, 'categoria_id', 'nome');
  populateSelect('insc-prova', provas, 'prova_id', 'nome');
  populateSelect('insc-competidor', competidores, 'matricula', 'nome');
  populateSelect('insc-categoria', categorias, 'categoria_id', 'nome');

  // Listar Provas
  const tbodyProvas = document.getElementById('table-provas-body');
  if (tbodyProvas) {
    tbodyProvas.innerHTML = provas.map(p => {
      const local = locais.find(l => l.local_id === Number(p.local_id))?.nome || 'Não definido';
      return `
        <tr>
          <td><strong>#${p.prova_id}</strong></td>
          <td>${p.nome}</td>
          <td>${new Date(p.data_hora).toLocaleString('pt-BR')}</td>
          <td>${local}</td>
          <td><span class="badge badge-primary">Confirmada</span></td>
        </tr>
      `;
    }).join('');
  }

  // Listar Inscrições
  const tbodyInsc = document.getElementById('table-inscricoes-body');
  if (tbodyInsc) {
    tbodyInsc.innerHTML = inscricoes.map(i => {
      const comp = competidores.find(c => c.matricula === String(i.matricula_competidor))?.nome || i.matricula_competidor;
      const prov = provas.find(p => p.prova_id === Number(i.prova_id))?.nome || `Prova #${i.prova_id}`;
      return `
        <tr>
          <td><strong>#${i.id_inscricao}</strong></td>
          <td>${comp}</td>
          <td>${prov}</td>
          <td><code>${i.tempo_max || '--:--:--'}</code></td>
          <td>${i.observacoes || '-'}</td>
        </tr>
      `;
    }).join('');
  }
}

async function handleAddProva(e) {
  e.preventDefault();
  const nome = document.getElementById('prova-nome').value;
  const data_hora = document.getElementById('prova-datahora').value;
  const local_id = Number(document.getElementById('prova-local').value);
  const arbitro_id = Number(document.getElementById('prova-arbitro').value);
  const categoria_id = Number(document.getElementById('prova-categoria').value);
  const alertEl = document.getElementById('alert-prova');

  try {
    await Api.createProva({ nome, data_hora, local_id, arbitro_id, categoria_id });
    showAlert(alertEl, 'Prova agendada com sucesso!', 'success');
    document.getElementById('form-prova').reset();
    loadProvasEInscricoes();
  } catch (err) {
    showAlert(alertEl, err.message, 'danger');
  }
}

async function handleAddInscricao(e) {
  e.preventDefault();
  const matricula_competidor = document.getElementById('insc-competidor').value;
  const prova_id = Number(document.getElementById('insc-prova').value);
  const categoria_id = Number(document.getElementById('insc-categoria').value);
  const tempo_max = document.getElementById('insc-tempo').value;
  const observacoes = document.getElementById('insc-obs').value;
  const alertEl = document.getElementById('alert-inscricao');

  // Validação da regra do banco: tempo_max <= '01:00:00'
  if (tempo_max && !Validators.isValidTempo(tempo_max)) {
    return showAlert(alertEl, 'Regra do Campeonato: O tempo registrado não pode ultrapassar 1 hora (01:00:00).', 'danger');
  }

  try {
    await Api.createInscricao({ matricula_competidor, prova_id, categoria_id, tempo_max, observacoes });
    showAlert(alertEl, 'Inscrição efetuada com sucesso!', 'success');
    document.getElementById('form-inscricao').reset();
    loadProvasEInscricoes();
  } catch (err) {
    showAlert(alertEl, err.message, 'danger');
  }
}

// === TELA 4: FUNCIONALIDADE INOVADORA (PAINEL DE CRONOMETRAGEM & PÓDIO) ===
async function loadResultadosView() {
  const provas = await Api.getProvas();
  const select = document.getElementById('select-race-filter');
  
  select.innerHTML = '<option value="">-- Selecione uma Prova para Balizamento --</option>' +
    provas.map(p => `<option value="${p.prova_id}">${p.nome}</option>`).join('');

  if (provas.length > 0) {
    select.value = provas[0].prova_id;
    loadRaceResults(provas[0].prova_id);
  }
}

async function loadRaceResults(provaId) {
  if (!provaId) return;
  const [inscricoes, competidores] = await Promise.all([
    Api.getInscricoes(),
    Api.getCompetidores()
  ]);

  // Filtrar inscrições daquela prova com tempo
  const raceInsc = inscricoes
    .filter(i => i.prova_id === Number(provaId))
    .map(i => {
      const comp = competidores.find(c => c.matricula === String(i.matricula_competidor));
      return {
        ...i,
        atletaNome: comp ? comp.nome : i.matricula_competidor
      };
    })
    .sort((a, b) => (a.tempo_max || '99:99:99').localeCompare(b.tempo_max || '99:99:99'));

  // Atualiza Pódio
  document.getElementById('podium-1').textContent = raceInsc[0] ? `${raceInsc[0].atletaNome} (${raceInsc[0].tempo_max})` : '--';
  document.getElementById('podium-2').textContent = raceInsc[1] ? `${raceInsc[1].atletaNome} (${raceInsc[1].tempo_max})` : '--';
  document.getElementById('podium-3').textContent = raceInsc[2] ? `${raceInsc[2].atletaNome} (${raceInsc[2].tempo_max})` : '--';

  // Renderiza tabela com inputs para lançar tempo rápido
  const tbody = document.getElementById('table-results-body');
  tbody.innerHTML = raceInsc.map((item, idx) => `
    <tr>
      <td><strong>${idx + 1}º Lugar</strong></td>
      <td>${item.atletaNome}</td>
      <td><code>${item.matricula_competidor}</code></td>
      <td>
        <input 
          type="text" 
          value="${item.tempo_max || ''}" 
          placeholder="00:00:00" 
          class="time-input" 
          id="time-input-${item.id_inscricao}"
          style="max-width: 140px; display: inline-block;"
        />
        <button class="btn btn-primary btn-sm" onclick="window.swimApp.saveTime(${item.id_inscricao})">Salvar</button>
      </td>
      <td>${item.observacoes || 'Balizamento'}</td>
    </tr>
  `).join('');
}

// Helpers Utilitários
function populateSelect(selectId, items, valueField, textField) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = `<option value="">Selecione...</option>` +
    items.map(item => `<option value="${item[valueField]}">${item[textField]}</option>`).join('');
}

function showAlert(el, msg, type) {
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

// Expõe métodos globais para botões HTML inline
window.swimApp = {
  async deleteCompetidor(matricula) {
    if (confirm(`Excluir competidor de matrícula ${matricula}?`)) {
      await Api.deleteCompetidor(matricula);
      loadPessoas();
      loadDashboard();
    }
  },
  async saveTime(idInscricao) {
    const input = document.getElementById(`time-input-${idInscricao}`);
    const timeVal = input.value.trim();

    if (timeVal && !Validators.isValidTempo(timeVal)) {
      alert('Erro: O tempo deve estar no formato HH:MM:SS ou MM:SS e ser menor que 01:00:00!');
      return;
    }

    await Api.updateTempoInscricao(idInscricao, timeVal);
    alert('Tempo atualizado com sucesso!');
    const currentProva = document.getElementById('select-race-filter').value;
    loadRaceResults(currentProva);
  }
};
