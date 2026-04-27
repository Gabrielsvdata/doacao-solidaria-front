/**
 * Utilitários para formatação de datas
 * Centraliza a lógica de formatação para evitar duplicação de código
 */

/**
 * Formata uma data em string para formato brasileira legível
 * @param {string|Date} dataString - Data em formato YYYY-MM-DD, YYYY-MM-DD HH:mm:ss ou objeto Date
 * @returns {string} Data formatada em português (ex: "quarta-feira, 26 de abril de 2026")
 */
export const formatarData = (dataString) => {
  if (!dataString) return 'N/A';
  
  try {
    let data;
    
    // Se for string em formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
    if (typeof dataString === 'string') {
      if (dataString.includes('-')) {
        // Remover a hora se houver
        const datePart = dataString.split('T')[0] || dataString.split(' ')[0];
        const [ano, mes, dia] = datePart.split('-');
        data = new Date(ano, mes - 1, dia);
      } else if (dataString.includes('/')) {
        // Se vier em formato DD/MM/YYYY
        const partes = dataString.split('/');
        if (partes.length === 3) {
          data = new Date(partes[2], partes[1] - 1, partes[0]);
        } else {
          data = new Date(dataString);
        }
      } else {
        data = new Date(dataString);
      }
    } else {
      data = new Date(dataString);
    }
    
    if (isNaN(data.getTime())) {
      return 'N/A';
    }
    
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return 'N/A';
  }
};

/**
 * Formata um telefone brasileiro
 * @param {string} telefone - Telefone a formatar
 * @returns {string} Telefone formatado (ex: "(11) 98765-4321")
 */
export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  
  // Se já está formatado, retorna como está
  if (telefone.includes('(')) return telefone;
  
  // Caso contrário, formata
  const cleaned = telefone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return telefone;
};
