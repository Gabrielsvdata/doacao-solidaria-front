/**
 * Exemplos de produtos para cada categoria de doação
 * Usado para melhorar a comunicação com doadores
 */

export const exemplosPorCategoria = {
  Higiene: {
    nome: 'Produtos de Higiene Pessoal',
    exemplos: [
      'Sabonete',
      'Shampoo',
      'Desodorante',
      'Escova de dentes',
      'Creme dental',
      'Papel higiênico',
      'Absorvente',
      'Lenço descartável'
    ],
    descricao: 'Itens essenciais para higiene pessoal e limpeza'
  },
  Alimentos: {
    nome: 'Alimentos e Bebidas',
    exemplos: [
      'Arroz',
      'Feijão',
      'Macarrão',
      'Óleo de cozinha',
      'Açúcar',
      'Sal',
      'Leite em pó',
      'Café'
    ],
    descricao: 'Alimentos não-perecíveis e bebidas'
  },
  Roupas: {
    nome: 'Vestuário e Calçados',
    exemplos: [
      'Camisetas',
      'Calças',
      'Jaquetas',
      'Meias',
      'Sapatos',
      'Botas',
      'Casacos',
      'Vestidos'
    ],
    descricao: 'Roupas e calçados em bom estado de conservação'
  },
  Medicamentos: {
    nome: 'Medicamentos e Saúde',
    exemplos: [
      'Dipirona',
      'Paracetamol',
      'Analgésico',
      'Antifebril',
      'Antácido',
      'Vitaminas',
      'Pomada cicatrizante',
      'Curativos'
    ],
    descricao: 'Medicamentos com validade vigente'
  },
  Limpeza: {
    nome: 'Produtos de Limpeza',
    exemplos: [
      'Detergente',
      'Desinfetante',
      'Sabão em pó',
      'Amaciante',
      'Pano de limpeza',
      'Vassoura',
      'Rodo',
      'Água sanitária'
    ],
    descricao: 'Produtos para limpeza de ambientes e roupas'
  },
  Educação: {
    nome: 'Materiais Educacionais',
    exemplos: [
      'Cadernos',
      'Lápis',
      'Canetas',
      'Borracha',
      'Régua',
      'Estojo',
      'Livros',
      'Mochilas'
    ],
    descricao: 'Materiais escolares e recursos educacionais'
  }
};

/**
 * Obtém exemplos formatados para uma categoria
 * @param {string} categoria - Nome da categoria
 * @returns {object} Objeto com nome, exemplos e descrição
 */
export function obterExemplosCategoria(categoria) {
  return exemplosPorCategoria[categoria] || {
    nome: categoria,
    exemplos: [],
    descricao: 'Categoria de doação'
  };
}

/**
 * Gera uma string formatada com exemplos de produtos
 * @param {string} categoria - Nome da categoria
 * @returns {string} String com exemplos formatados
 */
export function formatarExemplosProdutos(categoria) {
  const info = obterExemplosCategoria(categoria);
  if (info.exemplos.length === 0) return '';
  
  const primeiros = info.exemplos.slice(0, 5).join(', ');
  return `${primeiros}${info.exemplos.length > 5 ? ' e mais...' : ''}`;
}
