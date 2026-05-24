const UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER='abcdefghijklmnopqrstuvwxyz';
const NUMBERS='0123456789';
const SYMBOLS='!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIG='O0Il1|';
const ADJECTIVES=['Purple','Silver','Crimson','Cobalt','Golden','Jade','Coral','Azure','Ivory','Onyx','Frost','Storm','Ember','Sage','Dawn','Echo','Nova'];
const ANIMALS=['Tiger','Falcon','Dolphin','Wolf','Panda','Raven','Otter','Lynx','Cobra','Fox','Bear','Eagle','Koala','Owl','Hawk','Lion'];
const WORDS=['moon','river','cactus','galaxy','train','ocean','forest','storm','stone','cloud','flame','frost','crane','bloom','drift','ridge','vale','peak','brook','meadow','pine','cove','reef','dune','fern','haze'];

let currentMode='random';
let vault=[];

const $=id=>document.getElementById(id);
const pwOutput=$('pwOutput');
const lenSlider=$('lenSlider');
const lenDisp=$('lenDisp');
const strFill=$('strFill');
const strLabel=$('strLabel');
const cpyBtn=$('cpyBtn');
const genBtn=$('genBtn');
const saveBtn=$('saveBtn');
const fillBtn=$('fillBtn');
const toggleRow=$('toggles');
const modeRow=$('modeRow');

function loadVault(){
  try{const r=localStorage.getItem('pw-vault');if(r)vault=JSON.parse(r)}catch{vault=[]}
}
function saveVault(){localStorage.setItem('pw-vault',JSON.stringify(vault))}

function getCharset(){
  const s={};
  toggleRow.querySelectorAll('.toggle-btn').forEach(t=>{s[t.dataset.char]=t.classList.contains('active')});
  let c='';
  if(s.upper&&!s.noambig)c+=UPPER;else if(s.upper)c+=UPPER.split('').filter(x=>!AMBIG.includes(x)).join('');
  if(s.lower&&!s.noambig)c+=LOWER;else if(s.lower)c+=LOWER.split('').filter(x=>!AMBIG.includes(x)).join('');
  if(s.numbers&&!s.noambig)c+=NUMBERS;else if(s.numbers)c+=NUMBERS.split('').filter(x=>!AMBIG.includes(x)).join('');
  if(s.symbols)c+=SYMBOLS;
  if(s.spaces)c+=' ';
  return c;
}

function generateRandom(){
  const len=parseInt(lenSlider.value);
  let chars=getCharset();
  if(!chars.length)chars=UPPER+LOWER+NUMBERS;
  let pw='';
  for(let i=0;i<len;i++)pw+=chars[Math.floor(Math.random()*chars.length)];
  const active=Array.from(toggleRow.querySelectorAll('.toggle-btn.active')).map(t=>t.dataset.char).filter(k=>['upper','lower','numbers','symbols'].includes(k));
  const sets={upper:UPPER,lower:LOWER,numbers:NUMBERS,symbols:SYMBOLS};
  active.forEach(t=>{
    const idx=Math.floor(Math.random()*len);
    const s=sets[t];
    pw=pw.substring(0,idx)+s[Math.floor(Math.random()*s.length)]+pw.substring(idx+1);
  });
  return pw;
}

function generateMemorable(){
  return ADJECTIVES[Math.floor(Math.random()*ADJECTIVES.length)]+ANIMALS[Math.floor(Math.random()*ANIMALS.length)]+Math.floor(Math.random()*90+10)+'!@#$%^&*'[Math.floor(Math.random()*8)];
}

function generatePIN(){
  const len=Math.max(4,Math.min(8,parseInt(lenSlider.value)));
  let pw='';
  for(let i=0;i<len;i++)pw+=Math.floor(Math.random()*10);
  return pw;
}

function generatePassphrase(){
  const c=Math.floor((parseInt(lenSlider.value))/8)+1;
  const w=[];
  for(let i=0;i<Math.min(c,8);i++)w.push(WORDS[Math.floor(Math.random()*WORDS.length)]);
  return w.join('-');
}

function generate(){
  if(currentMode==='memorable')return generateMemorable();
  if(currentMode==='pin')return generatePIN();
  if(currentMode==='passphrase')return generatePassphrase();
  return generateRandom();
}

function entropy(s){
  const l=s.length;let p=0;
  if(/[A-Z]/.test(s))p+=26;if(/[a-z]/.test(s))p+=26;if(/[0-9]/.test(s))p+=10;
  if(/[^A-Za-z0-9]/.test(s))p+=32;if(/\s/.test(s))p+=1;
  if(currentMode==='pin')p=10;
  if(currentMode==='memorable'||currentMode==='passphrase')p=0;
  return l*Math.log2(p||1);
}

function analyze(s){
  const e=entropy(s);
  let sc=Math.min(e/1.4,100);
  if(/(.)\1{2,}/.test(s)||/012|123|234|345|456|567|678|789|890/.test(s)||/qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm/i.test(s))sc*=0.7;
  if(['password','123456','qwerty','letmein','admin','welcome','monkey','dragon','login','abc123'].some(w=>s.toLowerCase().includes(w)))sc*=0.5;
  if(currentMode==='memorable')sc=Math.max(sc,75);
  if(currentMode==='passphrase')sc=Math.max(sc,85);
  if(currentMode==='pin')sc=Math.min(sc,40);
  return{score:Math.round(sc),label:sc>=80?'Excellent':sc>=60?'Strong':sc>=40?'Fair':sc>=20?'Weak':'Very Weak',entropy:e};
}

function updateStrength(){
  const a=analyze(pwOutput.value);
  strFill.style.width=a.score+'%';
  const colors=['#ef4444','#f59e0b','#eab308','#3fb950','#00d4ff'];
  const idx=a.score>=80?4:a.score>=60?3:a.score>=40?2:a.score>=20?1:0;
  strFill.style.background=colors[idx];
  strLabel.textContent=a.label;
  strLabel.style.color=colors[idx];
}

function updatePw(){
  pwOutput.value=generate();
  updateStrength();
}

lenSlider.addEventListener('input',()=>{
  lenDisp.textContent=lenSlider.value;
  updatePw();
});

toggleRow.addEventListener('click',e=>{
  const btn=e.target.closest('.toggle-btn');
  if(!btn)return;
  if(btn.dataset.char==='noambig'){btn.classList.toggle('active');updatePw();return}
  const isActive=btn.classList.contains('active');
  if(['upper','lower','numbers','symbols'].includes(btn.dataset.char)){
    const essential=Array.from(toggleRow.querySelectorAll('.toggle-btn.active[data-char]')).filter(t=>['upper','lower','numbers','symbols'].includes(t.dataset.char));
    if(essential.length<=1&&isActive){btn.classList.add('active');return}
  }
  btn.classList.toggle('active');
  updatePw();
});

modeRow.addEventListener('click',e=>{
  const btn=e.target.closest('button');
  if(!btn)return;
  modeRow.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentMode=btn.dataset.mode;
  const isRandom=currentMode==='random';
  toggleRow.style.display=isRandom?'grid':'none';
  document.querySelector('.row').style.display=isRandom||currentMode==='pin'?'flex':'none';
  if(currentMode==='pin'){lenSlider.max='8';lenSlider.value='6';lenDisp.textContent='6'}
  else{lenSlider.max='128';lenSlider.value='24';lenDisp.textContent='24'}
  updatePw();
});

cpyBtn.addEventListener('click',()=>{
  if(!pwOutput.value)return;
  navigator.clipboard.writeText(pwOutput.value).then(()=>{
    cpyBtn.classList.add('copied','ripple');
    cpyBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(()=>{
      cpyBtn.classList.remove('copied','ripple');
      cpyBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    },1500);
  }).catch(()=>{});
});

genBtn.addEventListener('click',updatePw);

fillBtn.addEventListener('click',()=>{
  chrome.tabs?.query({active:true,currentWindow:true},tabs=>{
    if(!tabs||!tabs[0])return;
    chrome.tabs.sendMessage(tabs[0].id,{action:'fillPassword',password:pwOutput.value}).then(r=>{
      if(r?.success)$('fieldStatus').textContent='Filled ✓';
      else $('fieldStatus').textContent='No password field found';
    }).catch(()=>{$('fieldStatus').textContent='No password field found'});
  });
});

saveBtn.addEventListener('click',()=>{
  vault.push({id:Date.now(),password:pwOutput.value,created:new Date().toISOString()});
  saveVault();
  renderVault();
  $('fieldStatus').textContent='Saved to vault ✓';
});

// Vault
$('vSearch').addEventListener('input',renderVault);

function renderVault(){
  const q=$('vSearch').value.toLowerCase();
  const f=vault.filter(e=>e.password.toLowerCase().includes(q));
  const el=$('vList');
  if(!f.length){
    el.innerHTML='<div class="vault-empty">No saved passwords yet</div>';
    return;
  }
  el.innerHTML=f.map(e=>`<div class="v-item" data-id="${e.id}">
    <div class="vi-c" style="background:rgba(0,212,255,.1);color:#00d4ff">#</div>
    <div class="vi-t">
      <div class="vi-n">${e.password.substring(0,20)}${e.password.length>20?'…':''}</div>
      <div class="vi-s">${new Date(e.created).toLocaleDateString()}</div>
    </div>
    <button class="vi-del" data-id="${e.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
  </div>`).join('');
  el.querySelectorAll('.vi-del').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const id=parseInt(b.dataset.id);
      vault=vault.filter(i=>i.id!==id);
      saveVault();
      renderVault();
    });
  });
  el.querySelectorAll('.v-item').forEach(item=>{
    item.addEventListener('click',e=>{
      if(e.target.closest('.vi-del'))return;
      const id=parseInt(item.dataset.id);
      const entry=vault.find(i=>i.id===id);
      if(entry){pwOutput.value=entry.password;updateStrength();switchView('gen')}
    });
  });
}

// Navigation
function switchView(view){
  document.getElementById('viewGen').style.display=view==='gen'?'block':'none';
  document.getElementById('viewVault').style.display=view==='vault'?'block':'none';
  document.getElementById('viewSettings').style.display=view==='settings'?'block':'none';
  document.querySelectorAll('.extras button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  document.getElementById('viewTitle').textContent=view==='gen'?'Generator':view==='vault'?'Vault':'Settings';
  if(view==='vault')renderVault();
}

document.querySelectorAll('.extras button').forEach(b=>{
  b.addEventListener('click',()=>switchView(b.dataset.view));
});

// Check for input fields on page
function checkActiveField(){
  chrome.tabs?.query({active:true,currentWindow:true},tabs=>{
    if(!tabs||!tabs[0])return;
    chrome.tabs.sendMessage(tabs[0].id,{action:'checkField'}).then(r=>{
      if(r?.hasField)$('fieldStatus').textContent='Password field detected';
      else $('fieldStatus').textContent='No input focused';
    }).catch(()=>{$('fieldStatus').textContent='No input focused'});
  });
}

loadVault();
updatePw();
renderVault();
checkActiveField();
