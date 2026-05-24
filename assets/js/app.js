if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js'));}
document.addEventListener('click',e=>{if(e.target.matches('[data-theme-toggle]'))document.body.classList.toggle('dark-mode');});
