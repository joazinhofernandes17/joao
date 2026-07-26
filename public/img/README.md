# Imagens próprias

## Fotografia do hero (primeira página)

Coloque aqui o ficheiro com o nome exato:

    hero-showroom.jpg

É o primeiro endereço que a página tenta, por isso basta pousar o ficheiro nesta
pasta — não é preciso mexer no código.

Se o ficheiro não existir, a página passa automaticamente para as fotografias de
reserva (showrooms de stock), pela ordem indicada em `data-fallback` no `<img
id="heroImg">` de `public/ignicao-dinamica.html`. O hero nunca fica vazio.

### Recomendações

- **Formato:** JPG (ou WebP, mudando a extensão no `src`).
- **Resolução:** 2400–3840 px de largura. A imagem ocupa o ecrã todo, por isso
  vale a pena ser generoso — mas comprima bem.
- **Peso:** até ~600 KB. É a primeira coisa que carrega na página.
- **Enquadramento:** o texto do hero fica em baixo à esquerda, sobre um
  gradiente escuro. Convém que a zona inferior esquerda da fotografia não tenha
  detalhe importante, ou fique naturalmente mais escura.

## Outras imagens

As restantes fotografias do site vêm de endereços externos (Unsplash). Para usar
fotografias próprias, coloque-as aqui e troque o `src` do `<img>` respetivo por
`img/nome-do-ficheiro.jpg`.
