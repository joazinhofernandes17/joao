# Imagens

## `hero-showroom.jpg`

Fotografia do showroom usada a toda a largura na primeira página.

Está em 1536×1024, que é a resolução do original — ampliar não acrescentaria
detalhe, só peso. Em ecrãs muito grandes nota-se ligeiramente suave; se um dia
houver uma versão em maior resolução, basta substituir o ficheiro pelo mesmo
nome.

Para trocar por outra fotografia: guarde-a com este nome exato. Se o ficheiro
faltar, a página passa sozinha para fotografias de showroom de reserva, pela
ordem indicada em `data-fallback` no `<img id="heroImg">` de
`../ignicao-dinamica.html`. O hero nunca fica vazio.

Recomendações para uma substituição: JPG, 2000–3000 px de largura, até ~600 KB.
O texto do hero assenta em baixo à esquerda sobre um painel escurecido, por isso
convém que essa zona da fotografia não tenha detalhe importante.

## `logo-original.jpg`

O logótipo da marca tal como foi fornecido (150×150, fundo branco). **Não é
usado no site** — fica como referência.

O logótipo que aparece nas páginas é desenhado em SVG, dentro do próprio HTML:
a onda azul encostada ao topo direito da assinatura. Foi feito assim por duas
razões: o original tem resolução baixa de mais para os tamanhos em que aparece,
e tem fundo branco, que não assentaria sobre o hero escuro nem sobre o rodapé.

As cores do site foram medidas a partir deste ficheiro e estão nas variáveis CSS
`--brand` (azul da onda), `--brand-2` (azul sobre fundo escuro) e `--brand-ink`
(verde-azulado da assinatura).
