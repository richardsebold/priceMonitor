// O catálogo é um usuário de sistema dono dos produtos do carrossel de ofertas.
// Ele não é uma pessoa: veja AD-001 em .specs/STATE.md.
export const CATALOG_USER_ID = "system-catalog";

// Produtos iniciais: ordenação "mais procurados" da KaBuM em 2026-09-23.
export const CATALOG_SEED_URLS: readonly string[] = [
  // Smartphones
  "https://www.kabum.com.br/produto/662346/smartphone-motorola-moto-g35-5g-256gb-coral-12gb-ram-boost-camera-50-mp-selfie-16mp-e-tela-6-7-android-14",
  "https://www.kabum.com.br/produto/921087/smartphone-samsung-galaxy-a07-preto-6-7-256gb-8gb-camera-dupla",
  "https://www.kabum.com.br/produto/925347/iphone-17-pro-apple-256gb-camera-tripla-fusion-de-48mp-tela-6-3-super-retina-xdr-laranja-cosmico",
  // Notebooks
  "https://www.kabum.com.br/produto/1037468/notebook-lenovo-ideapad-slim-3-amd-ryzen-5-7535hs-8gb-amd-radeon-graphics-ssd-512gb-15-3-wuxga-1920x1200-linux-83mms00300",
  "https://www.kabum.com.br/produto/649861/notebook-asus-vivobook-go-15-e1504fa-amd-ryzen-5-7520u-16gb-ram-512gb-ssd-linux-keepos-tela-15-6-led-fhd-black-nj1288",
  "https://www.kabum.com.br/produto/1048035/notebook-gamer-acer-nitro-v15-anv15-41-r6j0-amd-ryzen-7-7735hs-8gb-ram-512gb-ssd-rtx-4050-linux-15-6-",
  // TVs
  "https://www.kabum.com.br/produto/911480/smart-tv-4k-tcl-qd-mini-led-65-com-hdmi-2-1-dolby-vision-iq-subwoofer-144hz-vrr-e-wi-fi-65c6k-bivolt",
  "https://www.kabum.com.br/produto/935217/smart-tv-tcl-qled-32-full-hd-google-tv-32s5k",
  "https://www.kabum.com.br/produto/1036371/smart-tv-tcl-50-qled-4k-p7l-wifi-bluetooth-google-tv-hdr10-120-hz-vrr-aipq-50p7l",
  // Eletrodomésticos
  "https://www.kabum.com.br/produto/938426/frigobar-electrolux-90l-branco-efficient-em90",
  "https://www.kabum.com.br/produto/1006099/frigobar-brastemp-76l-br",
  "https://www.kabum.com.br/produto/957829/frigobar-hq-124-litros-branco-hq-124fb-220v",
];
