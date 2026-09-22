/**
 * api.js
 * Camada de integração pronta para Fetch API.
 * 
 * Durante o protótipo frontend sem backend ligado, utiliza dados iniciais sincronizados no localStorage.
 * Quando o backend estiver pronto, basta trocar USE_MOCK para false ou configurar a BASE_URL!
 */

const BASE_URL = 'http://localhost:3000/api';
const USE_MOCK = true;

// Dados iniciais espelhando as tabelas e dados reais inseridos no banco SQL
const INITIAL_DATA = {
  competidores: [
    { matricula: '20260001', nome: 'Gabriel Silva', sexo: 'M', idade: 21 },
    { matricula: '20260002', nome: 'Beatriz Costa', sexo: 'F', idade: 19 },
    { matricula: '20260003', nome: 'Lucas Rocha', sexo: 'M', idade: 17 },
    { matricula: '20260004', nome: 'Mariana Lima', sexo: 'F', idade: 22 },
    { matricula: '20260005', nome: 'Carlos Eduardo', sexo: 'M', idade: 28 }
  ],
  arbitros: [
    { arbitro_id: 1, nome: 'Roberto Alves', credencial: 'ARB-CBDA-001' },
    { arbitro_id: 2, nome: 'Fernanda Oliveira', credencial: 'ARB-CBDA-002' },
    { arbitro_id: 3, nome: 'Julio Santos', credencial: 'ARB-CBDA-003' }
  ],
  locais: [
    { local_id: 1, nome: 'Parque Aquático Municipal', descricao: 'Piscina Olímpica 50m' },
    { local_id: 2, nome: 'Clube dos Oficiais', descricao: 'Piscina Semi-olímpica 25m' }
  ],
  categorias: [
    { categoria_id: 1, nome: 'Máster', descricao: 'Atletas a partir de 25 anos' },
    { categoria_id: 2, nome: 'Principiante', descricao: 'Atletas iniciantes' },
    { categoria_id: 3, nome: 'Júnior', descricao: 'Atletas até 19 anos' },
    { categoria_id: 4, nome: 'Absoluto', descricao: 'Categoria geral' }
  ],
  provas: [
    { prova_id: 1, nome: '50 metros Livre', data_hora: '2026-10-15T09:00', local_id: 1, arbitro_id: 1, categoria_id: 4 },
    { prova_id: 2, nome: '100 metros Peito', data_hora: '2026-10-15T10:30', local_id: 1, arbitro_id: 2, categoria_id: 1 },
    { prova_id: 3, nome: '200 metros Borboleta', data_hora: '2026-10-16T14:00', local_id: 2, arbitro_id: 3, categoria_id: 3 }
  ],
  inscricoes: [
    { id_inscricao: 1, matricula_competidor: '20260001', prova_id: 1, categoria_id: 4, tempo_max: '00:24:85', observacoes: 'Raia 4' },
    { id_inscricao: 2, matricula_competidor: '20260002', prova_id: 1, categoria_id: 4, tempo_max: '00:26:10', observacoes: 'Raia 5' },
    { id_inscricao: 3, matricula_competidor: '20260005', prova_id: 2, categoria_id: 1, tempo_max: '01:05:00', observacoes: 'Tempo de balizamento' }
  ]
};

// Inicializa localStorage para persistência de protótipo
function initStorage() {
  if (!localStorage.getItem('swim_app_data')) {
    localStorage.setItem('swim_app_data', JSON.stringify(INITIAL_DATA));
  }
}
initStorage();

function getStorage() {
  return JSON.parse(localStorage.getItem('swim_app_data'));
}

function setStorage(data) {
  localStorage.setItem('swim_app_data', JSON.stringify(data));
}

/**
 * Cliente API modular com suporte nativo a Fetch API
 */
export const Api = {
  // === AUTENTICAÇÃO ===
  async login(credentials) {
    if (USE_MOCK) {
      // Simula delay de rede e sucesso
      await new Promise(r => setTimeout(r, 400));
      if (credentials.username && credentials.password) {
        return {
          token: 'mock-jwt-token-natacao-2026',
          user: {
            name: credentials.username === 'admin' ? 'Administrador do Evento' : credentials.username,
            role: credentials.role || 'Organizador'
          }
        };
      }
      throw new Error('Credenciais inválidas.');
    }

    // Exemplo real com Fetch API:
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Falha ao autenticar.');
    return await response.json();
  },

  // === COMPETIDORES (Pessoas) ===
  async getCompetidores() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 150));
      return getStorage().competidores;
    }
    const res = await fetch(`${BASE_URL}/competidores`);
    return await res.json();
  },

  async createCompetidor(competidor) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      const db = getStorage();
      const exists = db.competidores.some(c => c.matricula === competidor.matricula);
      if (exists) throw new Error('Já existe um competidor com esta matrícula.');
      db.competidores.push(competidor);
      setStorage(db);
      return competidor;
    }

    const res = await fetch(`${BASE_URL}/competidores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(competidor)
    });
    return await res.json();
  },

  async deleteCompetidor(matricula) {
    if (USE_MOCK) {
      const db = getStorage();
      db.competidores = db.competidores.filter(c => c.matricula !== matricula);
      setStorage(db);
      return { success: true };
    }
    const res = await fetch(`${BASE_URL}/competidores/${matricula}`, { method: 'DELETE' });
    return await res.json();
  },

  // === ÁRBITROS (Pessoas) ===
  async getArbitros() {
    if (USE_MOCK) return getStorage().arbitros;
    const res = await fetch(`${BASE_URL}/arbitros`);
    return await res.json();
  },

  async createArbitro(arbitro) {
    if (USE_MOCK) {
      const db = getStorage();
      arbitro.arbitro_id = Date.now();
      db.arbitros.push(arbitro);
      setStorage(db);
      return arbitro;
    }
    const res = await fetch(`${BASE_URL}/arbitros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arbitro)
    });
    return await res.json();
  },

  // === PROVAS (Eventos/Serviços) ===
  async getProvas() {
    if (USE_MOCK) return getStorage().provas;
    const res = await fetch(`${BASE_URL}/provas`);
    return await res.json();
  },

  async createProva(prova) {
    if (USE_MOCK) {
      const db = getStorage();
      prova.prova_id = Date.now();
      db.provas.push(prova);
      setStorage(db);
      return prova;
    }
    const res = await fetch(`${BASE_URL}/provas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prova)
    });
    return await res.json();
  },

  // === INSCRIÇÕES E TEMPOS ===
  async getInscricoes() {
    if (USE_MOCK) return getStorage().inscricoes;
    const res = await fetch(`${BASE_URL}/inscricoes`);
    return await res.json();
  },

  async createInscricao(inscricao) {
    if (USE_MOCK) {
      const db = getStorage();
      inscricao.id_inscricao = Date.now();
      db.inscricoes.push(inscricao);
      setStorage(db);
      return inscricao;
    }
    const res = await fetch(`${BASE_URL}/inscricoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inscricao)
    });
    return await res.json();
  },

  async updateTempoInscricao(id_inscricao, tempo_max) {
    if (USE_MOCK) {
      const db = getStorage();
      const item = db.inscricoes.find(i => i.id_inscricao === Number(id_inscricao));
      if (item) {
        item.tempo_max = tempo_max;
        setStorage(db);
      }
      return item;
    }
    const res = await fetch(`${BASE_URL}/inscricoes/${id_inscricao}/tempo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempo_max })
    });
    return await res.json();
  },

  // Dados auxiliares
  async getLocais() { return getStorage().locais; },
  async getCategorias() { return getStorage().categorias; }
};
