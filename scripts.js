// scripts.js

// Seletores
const form = document.getElementById('address-form');
const cepInput = document.getElementById('cep');
const logradouroInput = document.getElementById('logradouro');
const numeroInput = document.getElementById('numero');
const complementoInput = document.getElementById('complemento');
const bairroInput = document.getElementById('bairro');
const cidadeInput = document.getElementById('cidade');
const ufInput = document.getElementById('uf');
const clearBtn = document.getElementById('clear-btn');

const STORAGE_KEY = 'form-cep-autosave-v1';

// Função para formatar CEP enquanto digita (XXXXX-XXX)
function formatCep(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{1,3})/, '$1-$2')
    .slice(0, 9);
}

// Salva no localStorage
function saveToStorage() {
  const payload = {
    cep: cepInput.value,
    logradouro: logradouroInput.value,
    numero: numeroInput.value,
    complemento: complementoInput.value,
    bairro: bairroInput.value,
    cidade: cidadeInput.value,
    uf: ufInput.value,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// Restaura dados do localStorage
function restoreFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    cepInput.value = data.cep || '';
    logradouroInput.value = data.logradouro || '';
    numeroInput.value = data.numero || '';
    complementoInput.value = data.complemento || '';
    bairroInput.value = data.bairro || '';
    cidadeInput.value = data.cidade || '';
    ufInput.value = data.uf || '';
  } catch (err) {
    console.error('Erro ao restaurar dados do storage', err);
  }
}

// Limpa formulário e storage
function clearFormAndStorage() {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
}

// Busca ViaCEP com Fetch API
async function buscarCep(cep) {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return;

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!resp.ok) throw new Error('Erro na requisição');
    const data = await resp.json();
    if (data.erro) {
      alert('CEP não encontrado');
      return;
    }

    logradouroInput.value = data.logradouro || '';
    complementoInput.value = data.complemento || '';
    bairroInput.value = data.bairro || '';
    cidadeInput.value = data.localidade || '';
    ufInput.value = data.uf || '';

    saveToStorage();
  } catch (err) {
    console.error('Erro ao consultar ViaCEP:', err);
  }
}

// Eventos
cepInput.addEventListener('input', (e) => {
  const formatted = formatCep(e.target.value);
  e.target.value = formatted;

  saveToStorage();

  const digits = formatted.replace(/\D/g, '');
  if (digits.length === 8) {
    buscarCep(formatted);
  }
});

// Salva sempre que outros campos mudarem
[logradouroInput, numeroInput, complementoInput, bairroInput, cidadeInput, ufInput].forEach((el) => {
  el.addEventListener('input', saveToStorage);
});

clearBtn.addEventListener('click', () => {
  clearFormAndStorage();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Formulário preparado para envio (exemplo).');
});

// Ao carregar a página, restaura dados
window.addEventListener('DOMContentLoaded', () => {
  restoreFromStorage();
  const cepDigits = cepInput.value.replace(/\D/g, '');
  if (cepDigits.length === 8) {
    buscarCep(cepInput.value);
  }
});
