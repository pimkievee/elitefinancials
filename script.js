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

    // Auto-sliding greeting, inspired by a chat invitation. The site doesn't
    // promise live chat: it opens the real existing contact options.
    const greeting=document.createElement('div');
    greeting.className='elite-contact-nudge';
    greeting.setAttribute('aria-label','Contact invitation');
    greeting.innerHTML='<img src="/assets/contact-smiling-headshot.jpg" width="42" height="42" alt="" class="elite-nudge-logo" referrerpolicy="no-referrer"><button type="button" class="elite-nudge-message" aria-label="Open contact options"><strong>Hi there! Have a question?</strong><span>Get in touch with us.</span></button><button type="button" class="elite-nudge-dismiss" aria-label="Dismiss contact invitation">×</button>';
    widget.insertBefore(greeting,open);
    const avatar=greeting.querySelector('.elite-nudge-logo');
    if(avatar)avatar.addEventListener('error',()=>{avatar.style.display='none';});


    const dismissGreeting=()=>{greeting.classList.add('is-dismissed');greeting.setAttribute('aria-hidden','true');greeting.querySelectorAll('button').forEach(el=>el.setAttribute('tabindex','-1'));};
    greeting.querySelector('.elite-nudge-message').addEventListener('click',()=>{
      dismissGreeting();toggle(true);panel.querySelector('.elite-contact-close').focus();
    });
    greeting.querySelector('.elite-nudge-dismiss').addEventListener('click',(e)=>{e.stopPropagation();dismissGreeting();});
    open.addEventListener('click',()=>{dismissGreeting();toggle(!panel.classList.contains('is-open'));});
    close.addEventListener('click',()=>{toggle(false);open.focus()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('is-open')){toggle(false);open.focus()}});
    document.addEventListener('pointerdown',e=>{if(!widget.contains(e.target)&&panel.classList.contains('is-open'))toggle(false)});
  });
})();

/* Count-up animation for verified About page metrics only. Empty data-count values remain unpublished. */
(function(){
 const stats=[...document.querySelectorAll('.elite-classic-counter[data-count]')].filter(el=>el.dataset.count.trim()!=='' && Number.isFinite(Number(el.dataset.count)) && Number(el.dataset.count)>=0);
 if(!stats.length)return;
 const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const animate=(el)=>{if(el.dataset.animated==='true')return;el.dataset.animated='true';const target=Number(el.dataset.count),suffix=el.dataset.suffix||'',format=x=>Math.round(x).toLocaleString('en-CA')+suffix;
 if(reduced||!('requestAnimationFrame' in window)){el.textContent=format(target);return;}
 const duration=1350,start=performance.now();
 const frame=(time)=>{const t=Math.min(1,(time-start)/duration),progress=1-Math.pow(1-t,3);el.textContent=format(target*progress);if(t<1)requestAnimationFrame(frame);};
 el.textContent='0';requestAnimationFrame(frame);
 };
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target);observer.unobserve(entry.target);}})},{threshold:.45});stats.forEach(el=>observer.observe(el));}else stats.forEach(animate);
})();
