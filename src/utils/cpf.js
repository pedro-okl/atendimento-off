/**
 * Remove caracteres especiais do CPF
 */
export function cleanCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }
  return cpf.replace(/\D/g, '');
}

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
export function formatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) {
    return cleaned;
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida CPF verificando:
 * - Formato (11 dígitos)
 * - Sequências repetidas (como 111.111.111-11)
 * - Dígitos verificadores
 */
export function isValidCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }
  const cleaned = cleanCPF(cpf);

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return false;
  }

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Formata número de telefone/celular no padrão (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');

  // Se vazio, retorna vazio
  if (cleaned.length === 0) {
    return '';
  }

  // Formata de acordo com o comprimento
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  // Se tiver mais de 11, limita
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}
