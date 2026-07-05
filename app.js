const female=Array.from({length:42},(_,i)=>({n:i+2,gender:'female',cartoon:i+2>=35}));
const male=Array.from({length:35},(_,i)=>i+1).filter(n=>![5,23].includes(n)).map(n=>({n,gender:'male',cartoon:n>=31}));
const avatars=[...female,...male];let filter='all',limit=12,query='';
const grid=document.querySelector('#avatarGrid'),more=document.querySelector('#loadMore');
const label=a=>`${a.gender==='female'?'女性':'男性'}数字人 ${a.n}号`;
function visible(){return avatars.filter(a=>(filter==='all'||a.gender===filter||(filter==='cartoon'&&a.cartoon))&&(!query||String(a.n).includes(query)))}
function render(){const list=visible();grid.innerHTML='';list.slice(0,limit).forEach(a=>{const card=document.createElement('article');card.className='card';card.innerHTML=`<div class="card-media"></div><div class="card-body"><b>${label(a)}</b><span>${a.cartoon?'卡通':'真人'}</span></div>`;card.onclick=()=>openPreview(a);grid.append(card)});more.hidden=list.length<=limit}
document.querySelectorAll('.filters button').forEach(btn=>btn.onclick=()=>{document.querySelector('.filters .active').classList.remove('active');btn.classList.add('active');filter=btn.dataset.filter;limit=12;render()});
document.querySelector('#search').oninput=e=>{query=e.target.value.trim();limit=12;render()};more.onclick=()=>{limit+=12;render()};
const dialog=document.querySelector('#preview'),canvas=document.querySelector('#previewCanvas'),ctx=canvas.getContext('2d');
function paint(){canvas.width=720;canvas.height=900;const g=ctx.createRadialGradient(480,220,10,360,420,700);g.addColorStop(0,'#57a7bb');g.addColorStop(.5,'#263d70');g.addColorStop(1,'#0f1930');ctx.fillStyle=g;ctx.fillRect(0,0,720,900);ctx.fillStyle='#ffffff22';ctx.textAlign='center';ctx.font='800 34px Microsoft YaHei';for(let y=120;y<900;y+=180)ctx.fillText('灵境数字人 · 客户预览',360,y);ctx.fillStyle='#fff';ctx.font='700 26px Microsoft YaHei';ctx.fillText('视频素材将在防下载处理后接入',360,450)}
function openPreview(a){document.querySelector('#previewTitle').textContent=label(a);paint();dialog.showModal()}
document.querySelector('.close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};document.querySelector('#playDemo').onclick=()=>openPreview(female[18]);document.querySelector('.inquire').onclick=()=>dialog.close();document.addEventListener('contextmenu',e=>e.preventDefault());render();