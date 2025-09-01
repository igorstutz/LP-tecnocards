// ================== Utils ==================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function show(el){ el?.removeAttribute("hidden"); }
function hide(el){ el?.setAttribute("hidden", ""); }

// ================== Header / Menu ==================
(function mobileMenu(){
  const btn = $('.menu-btn');
  const menu = $('#menu');
  if(!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  menu.addEventListener('click', (e) => {
    if(e.target.matches('a')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ================== Carousel ==================
(function carousel(){
  const carousels = $$('[data-carousel]');
  carousels.forEach(c => {
    const track = $('.track', c);
    const slides = $$('.slide', c);
    const prev = $('[data-prev]', c);
    const next = $('[data-next]', c);
    let index = 0;
    let autoplayId = null;

    function update(){ track.style.transform = `translateX(${-index * 100}%)`; }
    function goPrev(){ index = (index - 1 + slides.length) % slides.length; update(); }
    function goNext(){ index = (index + 1) % slides.length; update(); }
    function startAutoplay(){ stopAutoplay(); autoplayId = setInterval(goNext, 5000); }
    function stopAutoplay(){ if(autoplayId){ clearInterval(autoplayId); autoplayId = null; } }

    prev?.addEventListener('click', goPrev);
    next?.addEventListener('click', goNext);

    c.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowLeft') goPrev();
      if(e.key === 'ArrowRight') goNext();
    });

    c.addEventListener('mouseenter', stopAutoplay);
    c.addEventListener('mouseleave', startAutoplay);
    c.addEventListener('touchstart', stopAutoplay, {passive:true});
    c.addEventListener('touchend', startAutoplay);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!media.matches) startAutoplay();
  });
})();

// ================== Footer Year ==================
(function setYear(){
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ================== Form Flow ==================
(function formFlow(){
  const form = $('#lead-form');
  const linkBox = $('#linkbox');
  const linkInput = $('#purchase-link');
  const btnCopy = $('#copy-link');
  const btnOpen = $('#open-link');
  const btnFinish = $('#finish-flow');

  const toast = $('#toast');
  const modal = $('#modal');
  const closeModal = $('#close-modal');

  if(!form || !linkBox) return;

  function isValid(){
    const empresa = $('#empresa').value.trim();
    const whats = $('#whats').value.trim();
    return empresa.length >= 2 && whats.length >= 8;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!isValid()){
      form.reportValidity?.();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const base = 'https://checkout.tecnocards.com/placa-nfc';
    const params = new URLSearchParams({ empresa: data.empresa || '', whats: data.whats || '', insta: data.instagram || '' });
    const url = `${base}/${slugify(data.empresa)}?${params.toString()}`;

    linkInput.value = url;
    hide(form);
    show(linkBox);
    linkBox.scrollIntoView({behavior:'smooth', block:'center'});
  });

  btnCopy?.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(linkInput.value);
      toast.textContent = 'Link copiado.';
    }catch{
      toast.textContent = 'Não foi possível copiar.';
    }
    show(toast);
    setTimeout(() => hide(toast), 2200);
  });

  btnOpen?.addEventListener('click', () => {
    if(linkInput.value) window.open(linkInput.value, '_blank', 'noopener,noreferrer');
  });

  btnFinish?.addEventListener('click', () => {
    show(modal);
    $('#close-modal')?.focus();
  });

  closeModal?.addEventListener('click', () => {
    hide(modal);
    form.reset();
    show(form);
    hide(linkBox);
    form.scrollIntoView({behavior:'smooth', block:'start'});
    $('#empresa')?.focus();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal && !modal.hasAttribute('hidden')){
      closeModal?.click();
    }
  });
})();

// ================== Video Fullscreen ==================
(function videoDemo(){
  const btnDemo = document.querySelector('a[href="#video"]');
  const video = document.querySelector('#video video');
  if(!btnDemo || !video) return;

  btnDemo.addEventListener('click', (e) => {
    e.preventDefault();
    if(video.requestFullscreen){
      video.requestFullscreen();
    } else if(video.webkitRequestFullscreen){
      video.webkitRequestFullscreen();
    } else if(video.msRequestFullscreen){
      video.msRequestFullscreen();
    }
    video.play();
  });
})();
