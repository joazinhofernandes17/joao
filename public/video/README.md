# Vídeo do hero

Coloque aqui o vídeo de fundo da primeira página com o nome:

    showroom.mp4

É o primeiro endereço tentado pela página (`video/showroom.mp4` em
`public/ignicao-dinamica.html`), por isso basta pousar o ficheiro nesta pasta —
não é preciso mexer no código.

Se o ficheiro não existir, a página tenta uma lista de vídeos de stock e, se
nenhum estiver disponível, mantém a fotografia de fundo. O hero nunca fica vazio.

## Recomendações para o ficheiro

- **Formato:** MP4 (H.264) — o mais compatível. Opcionalmente também WebM.
- **Resolução:** 1920×1080 chega para fundo. 4K só se o vídeo for o foco.
- **Duração:** 8 a 15 segundos, em loop, sem corte visível.
- **Peso:** até ~5 MB. Acima disso o carregamento nota-se.
- **Som:** irrelevante — o vídeo é reproduzido sem som (exigência dos browsers
  para autoplay).
- **Enquadramento:** o texto do hero fica à esquerda e por baixo, portanto
  convém que a ação do vídeo não fique nessa zona.

## Como trocar por outro endereço

Em `public/ignicao-dinamica.html`, no início do `<script>`, edite a lista
`HERO_VIDEO`. É tentada por ordem e fica o primeiro que conseguir reproduzir.
