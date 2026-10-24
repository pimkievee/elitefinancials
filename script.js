document.querySelectorAll("#year").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealTargets = document.querySelectorAll(
  ".section, .stats, .dark-section, .trusted-partners, .cta, .card, .trusted-logo-card, .form, .resource-card, .article-aside, .article-inline-cta, .article-related-bottom, .local-proof"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("in-view"));
}

/* Animated sections across every Elit Global Partners page. */
(function(){
  const reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    const targets=[...document.querySelectorAll('main section, .elite-feature-card, .elite-service-tile, .elite-step-grid article, .mp-card, .mp-section, .elite-footer')];
    targets.forEach((el,i)=>{el.setAttribute('data-elite-reveal','');if(el.classList.contains('elite-feature-card')||el.classList.contains('elite-service-tile'))el.style.setProperty('--elite-delay',((i%3)*70)+'ms');});
    if('IntersectionObserver' in window){
      const reveal=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('elite-visible');reveal.unobserve(e.target)}})},{threshold:.06,rootMargin:'0px 0px -18px 0px'});
      targets.forEach(e=>reveal.observe(e));
    } else targets.forEach(e=>e.classList.add('elite-visible'));
  }
  document.querySelectorAll('[data-contact-widget]').forEach(widget=>{
    const open=widget.querySelector('[data-contact-open]'),close=widget.querySelector('[data-contact-close]'),panel=widget.querySelector('.elite-contact-panel');
    if(!open||!close||!panel)return;
    const toggle=(isOpen)=>{panel.classList.toggle('is-open',isOpen);panel.setAttribute('aria-hidden',String(!isOpen));open.setAttribute('aria-expanded',String(isOpen));open.setAttribute('aria-label',isOpen?'Close contact options':'Open contact options');panel.querySelectorAll('a,button').forEach(el=>{if(!isOpen)el.setAttribute('tabindex','-1');else el.removeAttribute('tabindex')});};
    toggle(false);
    open.addEventListener('click',()=>toggle(!panel.classList.contains('is-open')));
    close.addEventListener('click',()=>{toggle(false);open.focus()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('is-open')){toggle(false);open.focus()}});
    document.addEventListener('pointerdown',e=>{if(!widget.contains(e.target)&&panel.classList.contains('is-open'))toggle(false)});
  });
})();
