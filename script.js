const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

const serverConfig = {
  // Add the FiveM server identifier here once the server is hosted.
  endpoint: ''
};

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (event) => {
  if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach((section) => observer.observe(section));

const revealObserver = new IntersectionObserver((entries, currentObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    currentObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section.reveal').forEach((section) => revealObserver.observe(section));

const statusText = document.querySelector('[data-server-status]');
const statusMessage = document.querySelector('[data-server-message]');
const statusUpdated = document.querySelector('[data-server-updated]');
const statusIcon = document.querySelector('[data-status-icon]');
const statusRefresh = document.querySelector('[data-status-refresh]');
const statusPlayers = document.querySelector('[data-server-players]');

const setServerStatus = (state, message, players = '--') => {
  statusText.textContent = state;
  statusMessage.textContent = message;
  statusPlayers.textContent = players;
  statusIcon.className = `status-icon status-icon-${state === 'Online' ? 'online' : 'pending'}`;
  statusUpdated.textContent = `Sidst opdateret: ${new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}`;
};

const loadServerStatus = async () => {
  if (!serverConfig.endpoint) {
    setServerStatus('Serveren er under udvikling', 'Vi tester scripts og finpudser byen. Status bliver live, så snart serveren er klar.');
    return;
  }

  setServerStatus('Tjekker status', 'Et øjeblik, vi henter den seneste serverstatus.');
  try {
    const response = await fetch(serverConfig.endpoint);
    if (!response.ok) throw new Error('Status request failed');
    const server = await response.json();
    const players = server.Data?.clients ?? 0;
    setServerStatus('Online', `${players}/${server.Data?.svMaxclients ?? 0} spillere er online lige nu.`, players);
  } catch {
    setServerStatus('Offline', 'Serveren svarer ikke lige nu. Prøv igen senere eller følg med på Discord.');
  }
};

statusRefresh.addEventListener('click', loadServerStatus);
loadServerStatus();
