const female = Array.from({length: 42}, (_, i) => i + 2).map(n => ({n, gender:'female', cartoon:n>=35, src:`女视频/女${n}${n>=35?'卡通':''}.mp4`}));
const male = Array.from({length:35},(_,i)=>i+1).filter(n=>![5,23].includes(n)).map(n => ({n, gender:'male', cartoon:n>=31, src:`男视频/男${n}${n>=31?'卡通':''}.mp4`}));
const avatars=[...female,...male]; let filter='all', limit=12, query='';
const grid=document.querySelector('#avatarGrid'), more=document.querySelector('#loadMore');

function label(a){return `${a.gender==='female'?'女性':'男性'}数字人 ${a.n}号`}
function visible(){return avatars.filter(a=>(filter==='all'||a.gender===filter||(filter==='cartoon'&&a.cartoon))&&(!query||String(a.n).includes(query)))}
function render(){
  const list=visible(); grid.innerHTML='';
  list.slice(0,limit).forEach(a=>{
    const card=document.createElement('article'); card.className='card';
    card.innerHTML=`<div class="card-media"><video muted loop playsinline preload="metadata" src="${a.src}"></video></div><div class="card-body"><b>${label(a)}</b><span>${a.cartoon?'卡通':'真人'}</span></div>`;
    const vid=card.querySelector('video');
    vid.addEventListener('loadedmetadata',()=>{vid.currentTime=.05},{once:true});
    card.addEventListener('mouseenter',()=>vid.play().catch(()=>{})); card.addEventListener('mouseleave',()=>{vid.pause();vid.currentTime=0});
    card.addEventListener('click',()=>openPreview(a)); grid.append(card);
  });
  more.hidden=list.length<=limit;
}
document.querySelectorAll('.filters button').forEach(btn=>btn.onclick=()=>{
  document.querySelector('.filters .active').classList.remove('active');btn.classList.add('active');filter=btn.dataset.filter;limit=12;render();
});
document.querySelector('#search').oninput=e=>{query=e.target.value.trim();limit=12;render()};
more.onclick=()=>{limit+=12;render()};

const backgrounds={
  office:['#0f1930','#263d70','#57a7bb'],
  studio:['#25170f','#75452d','#d69b5c'],
  blue:['#101c59','#2449c7','#628cff']
};
function compositor(video,canvas,getScene){
  const ctx=canvas.getContext('2d',{willReadFrequently:true}),off=document.createElement('canvas'),ox=off.getContext('2d',{willReadFrequently:true}); let raf;
  function draw(){
    const w=video.videoWidth||720,h=video.videoHeight||900;if(canvas.width!==w){canvas.width=w;canvas.height=h;off.width=w;off.height=h}
    const g=ctx.createRadialGradient(w*.65,h*.25,10,w*.5,h*.45,w*.8), colors=backgrounds[getScene()];
    g.addColorStop(0,colors[2]);g.addColorStop(.45,colors[1]);g.addColorStop(1,colors[0]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.globalAlpha=.23;ctx.strokeStyle='#fff';for(let x=-h;x<w+h;x+=110){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-h,h);ctx.stroke()}ctx.restore();
    if(video.readyState>=2){
      ox.drawImage(video,0,0,w,h);
      const image=ox.getImageData(0,0,w,h),d=image.data;
      for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const green=g-Math.max(r,b);if(g>65&&green>15)d[i+3]=Math.max(0,255-(green-15)*5)}
      ctx.drawImage(off,0,0);
    }
    ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-Math.PI/10);ctx.textAlign='center';ctx.font=`800 ${Math.max(18,w/28)}px Microsoft YaHei`;ctx.fillStyle='rgba(255,255,255,.22)';ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=2;
    for(let y=-h;y<=h;y+=h/3.7){for(let x=-w;x<=w;x+=w*.72){ctx.strokeText('天宇设计 · 客户预览',x,y);ctx.fillText('天宇设计 · 客户预览',x,y)}}ctx.restore();
    raf=requestAnimationFrame(draw);
  } draw(); return ()=>cancelAnimationFrame(raf);
}
const hv=document.querySelector('#heroVideo'),hc=document.querySelector('#heroCanvas');let stopHero;
hv.addEventListener('loadeddata',()=>{hv.play().catch(()=>{});stopHero?.();stopHero=compositor(hv,hc,()=>'office')});

const dialog=document.querySelector('#preview'),pv=document.querySelector('#previewVideo');
function openPreview(a){
  document.querySelector('#previewTitle').textContent=label(a);pv.src=a.src;dialog.showModal();
  pv.onloadeddata=()=>pv.play().catch(()=>{});
}
document.querySelector('.close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{pv.pause();pv.removeAttribute('src');pv.load()});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.querySelector('#playDemo')?.addEventListener('click',()=>openPreview(female.find(a=>a.n===20)));
document.querySelector('.inquire').onclick=()=>{dialog.close();document.querySelector('#contact').scrollIntoView({behavior:'smooth'})};
render();
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('dragstart',e=>e.preventDefault());
