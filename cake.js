/* Microphone audio stays on the device; only waveform amplitude is inspected. */
class BirthdayBlowDetector{
 constructor({onLevel,onBlow,onError}){Object.assign(this,{onLevel,onBlow,onError});this.version=0;this.stream=null;this.context=null;this.frame=null}
 async start(){this.stop();const version=this.version;if(!navigator.mediaDevices?.getUserMedia)throw new Error('这个浏览器暂时不能使用麦克风，可以长按蜡烛来熄灭。');const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:false},video:false});if(version!==this.version){stream.getTracks().forEach(t=>t.stop());return false}this.stream=stream;
 try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('浏览器暂不支持音量检测。');this.context=new Context();await this.context.resume();if(version!==this.version)return false;const analyser=this.context.createAnalyser();analyser.fftSize=2048;const source=this.context.createMediaStreamSource(stream);source.connect(analyser);const samples=new Uint8Array(analyser.fftSize);let baseline=.009,calibrationStart=performance.now(),previous=calibrationStart,above=0;const tick=now=>{if(version!==this.version)return;analyser.getByteTimeDomainData(samples);const rms=BirthdayBlowDetector.rms(samples);const calibrating=now-calibrationStart<700;if(calibrating)baseline=baseline*.9+Math.min(rms,.065)*.1;const threshold=Math.max(.075,Math.min(.20,baseline*3.2+.018));this.onLevel(Math.min(1,rms/threshold),calibrating);const dt=Math.max(0,Math.min(60,now-previous));previous=now;if(!calibrating&&rms>threshold)above+=dt;else above=Math.max(0,above-dt*1.7);if(above>=160){this.stop();this.onBlow();return}this.frame=requestAnimationFrame(tick)};stream.getAudioTracks().forEach(t=>t.onended=()=>{if(version===this.version){this.stop();this.onError?.('麦克风已断开，可以重新开启或长按蜡烛。')}});this.frame=requestAnimationFrame(tick);return true}catch(error){this.stop();throw error}
 }
 static rms(samples){let sum=0;for(const sample of samples){const x=(sample-128)/128;sum+=x*x}return Math.sqrt(sum/samples.length)}
 stop(){this.version++;if(this.frame!==null)cancelAnimationFrame(this.frame);this.frame=null;this.stream?.getTracks().forEach(t=>{t.onended=null;t.stop()});this.stream=null;const context=this.context;this.context=null;if(context&&context.state!=='closed')context.close().catch(()=>{})}
}
const CakeExperience=(()=>{
 let root=null,music=null,onFinish=()=>{},phase='candles',mode='choose',out=[false,false,false],bites=0,version=0,micVersion=0,timers=new Set(),hold=null,mic=null,background=null;
 const birthday=new Audio('assets/music/'+encodeURIComponent('网易云音乐 - 生日快乐.mp3'));birthday.preload='metadata';
 birthday.loop=true;
 const wishSeconds=10;
 let continueBirthday=false;
 const cakeImage='assets/images/simple-birthday-cake-plain.png';
 let pendingBites=0, serving=false;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const later=(fn,ms)=>{const v=version;const id=setTimeout(()=>{timers.delete(id);if(v===version&&root?.isConnected)fn()},ms);timers.add(id);return id};
 function cancelHold(button, pointerId) {
  if (!hold || (button && hold.button !== button)) return;
  if (pointerId !== undefined && hold.pointerId !== pointerId) return;
  clearTimeout(hold.timer);
  hold.button.classList.remove('is-holding');
  hold = null;
 }
 function stopMic(){micVersion++;mic?.stop();mic=null}
 function restoreMusic(){if(!background)return;const previous=background;background=null;if(previous.playing&&previous.audio.src)previous.audio.play().catch(()=>{})}
 function stopSoundtrack(){birthday.pause();restoreMusic()}
 function clearWishHandlers(){birthday.ontimeupdate=null;birthday.onloadedmetadata=null;birthday.onerror=null}
 function unmount({keepSoundtrack=phase==='finished'}={}){
  version++;
  timers.forEach(clearTimeout);
  timers.clear();
  pendingBites=0;
  serving=false;
  cancelHold();
  stopMic();
  clearWishHandlers();
  if(!keepSoundtrack)stopSoundtrack();
  root=null;
 }
 function mount(element,{music:player,onFinish:finish,startAtServing=false}) {
  unmount({keepSoundtrack:false});
  root=element;
  music=player;
  onFinish=finish;
  if(startAtServing||phase==='finished'||phase==='leaving'){
   phase=startAtServing?'eating':'candles';
   out=[false,false,false];
   bites=0;
   mode='choose';
   birthday.currentTime=0;
   continueBirthday=false;
  }
  if(phase==='candles'&&out.every(Boolean))phase='wish';
  render();
  if(phase==='eating'&&continueBirthday){
   const sceneVersion=version;
   playBirthday().catch(()=>{if(version===sceneVersion)stopSoundtrack()});
  }
 }

 // Shared cut lines meet at the projected center of the top icing.
 const center=[449,228,247,340,414,517];
 const left=[104,356,372,491,565,665];
 const right=[839,348,363,446,524,610];
 const back=[393,7,25,112,181,290];
 const sectors=[
  '104,752 104,356 449,228 839,348 839,752',
  '0,0 393,0 393,7 449,228 104,356 104,752 0,752',
  '393,0 897,0 897,752 839,752 839,348 449,228 393,7',
 ];
 const layers=['#fbead0','#f5ca76','#8fbae0','#e9b45e'];
 function cutFace(edge, name) {
  const bands=layers.map((color,i)=>{
   const top=i+1, bottom=i+2;
   return `<polygon fill="${color}" points="${center[0]},${center[top]} ${edge[0]},${edge[top]} ${edge[0]},${edge[bottom]} ${center[0]},${center[bottom]}"/>`;
  }).join('');
  const flecks=Array.from({length:34},(_,i)=>{
   const t=(i*17%37+1)/39;
   const layer=i%3===0?4:2;
   const span=(i*13%29+5)/39;
   const x=Math.round(center[0]+t*(edge[0]-center[0]));
   const top=center[layer]+t*(edge[layer]-center[layer]);
   const bottom=center[layer+1]+t*(edge[layer+1]-center[layer+1]);
   const y=Math.round(top+span*(bottom-top));
   return `<rect x="${x}" y="${y}" width="${i%3+5}" height="${i%2+4}" fill="${i%2?'#fff2c1':'#ab733f'}" opacity=".29"/>`;
  }).join('');
  return `<g class="cake-cut-face cake-cut-face-${name}">${bands}
   <path d="M${center[0]} ${center[1]}L${edge[0]} ${edge[1]}" fill="none" stroke="#fff8e5" stroke-width="7"/>
   <path d="M${center[0]} ${center[5]}L${edge[0]} ${edge[5]}" fill="none" stroke="#ae774c" stroke-width="6"/>
   ${flecks}
  </g>`;
 }
 function knife(edge, name, mirrored=false) {
  const angle=Math.atan2(edge[1]-center[1],edge[0]-center[0])*180/Math.PI;
  const length=Math.hypot(edge[0]-center[0],edge[1]-center[1]);
  return `<path class="cake-seam cake-seam-${name}" d="M${edge[0]} ${edge[1]}L449 228" pathLength="1"/>
   <g class="cake-knife cake-knife-${name}"><g transform="translate(449 228) rotate(${angle}) scale(${length/403} ${mirrored?-1:1})">
    <path fill="url(#cakeKnifeSteel)" stroke="#718899" stroke-width="4" stroke-linejoin="round" d="M0 0h13l22-17 36-11 280 1 42 8v27H49L20 6H6z"/>
    <path fill="none" stroke="#fafcfc" stroke-width="3" d="M36 -13l35-11 266 1m-283 27h333"/>
    <path fill="#9bafb9" d="M370 -26h24v37h-24z"/>
    <path fill="#536e8e" stroke="#45617f" stroke-width="4" stroke-linejoin="round" d="M393 -27h101l14 8v24l-11 8H393z"/>
    <path fill="#839cb5" d="M399 -22h94l8 5v5H399z"/><path fill="#3d5571" d="M401 4h94l5-4v7l-8 3h-91z"/>
    <path fill="#dfcfaa" d="M415 -11h11v11h-11zm55 0h11v11h-11z"/><path fill="#fff0c6" d="M415 -11h7v4h-7zm55 0h7v4h-7z"/>
   </g></g>`;
 }
 function cakePieces() {
  if(phase!=='eating')return `<img class="simple-cake-pieces cake-whole" src="${cakeImage}" alt="">`;
  return `<svg class="simple-cake-pieces cake-sliced ${bites>=1?'has-front-cut':''} ${bites>=2?'has-back-cut':''}" viewBox="0 0 897 752" aria-hidden="true">
   <defs>
    ${sectors.map((points,i)=>`<clipPath id="cakeSector${i}"><polygon points="${points}"/></clipPath>`).join('')}
    <linearGradient id="cakeKnifeSteel" x2="0" y2="1">
     <stop stop-color="#a6bed1"/><stop offset=".45" stop-color="#f7fafd"/><stop offset=".72" stop-color="#d3e0e8"/><stop offset="1" stop-color="#8aa1b0"/>
    </linearGradient>
   </defs>
   ${[2,1,0].map(i=>`<g class="cake-sector piece-${i} ${bites>i?'piece-served':''}">
    <image href="${cakeImage}" width="897" height="752" clip-path="url(#cakeSector${i})"/>
    ${i===1?cutFace(left,'front'):i===2?cutFace(back,'back')+cutFace(right,'front'):''}
   </g>`).join('')}
   <image class="cake-uncut" href="${cakeImage}" width="897" height="752"/>
   ${knife(left,'left',true)}${knife(right,'right')}${knife(back,'back')}
  </svg>`;
 }
 function art(){
  const candles = phase==='eating'?'':out.map((gone, i) => `<button type="button" class="interactive-candle candle-${i} ${gone ? 'is-out' : ''}"
    data-candle="${i}" aria-label="${gone ? '已熄灭' : '长按熄灭'}第${i + 1}根蜡烛" ${gone || phase !== 'candles' ? 'disabled' : ''}>
    <span class="flame-halo"></span>
    <img class="candle-flame" src="assets/icons/candle-flame.svg" alt="" draggable="false">
    <img class="candle-stick" src="assets/icons/candle-body.svg" alt="" draggable="false">
    <span class="candle-socket" aria-hidden="true"></span>
    <span class="candle-smoke"><i></i><i></i><i></i></span>
    <svg class="candle-hold-ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22"/></svg>
  </button>`).join('');
  return `<div class="cake-artboard ${phase === 'eating' ? 'can-eat' : ''}">
    <div class="cake-table-glow"></div>
    <div class="cake-dessert">
      <div class="cake-serving-plate"></div>
      ${cakePieces()}
      ${candles?`<div class="candle-row">${candles}</div>`:''}
      ${phase === 'eating' ? '<button class="cake-eat-target" id="eatCake" aria-label="吃一口蛋糕"></button>' : ''}
      <div class="cake-crumbs" aria-hidden="true">${Array.from({length:8}, (_, i) => `<i style="--n:${i}"></i>`).join('')}</div>
    </div>
  </div>`;
 }
 function render(){if(!root)return;cancelHold();const title=phase==='candles'?'跟我一起，吹个蜡烛吧。':phase==='wish'?'许个愿望吧！':phase==='eating'?'来吃蛋糕喽！':'把这个生日，好好收进心里。';root.innerHTML=`<section class="birthday-room room-${phase}"><nav class="birthday-menubar"><span>小鱼的生日小剧场</span><span>MAKE A WISH · WITH LOVE</span></nav><div class="birthday-room-body"><div class="birthday-overline">${phase==='candles'?'THREE LITTLE CANDLES':phase==='wish'?'A WISH BETWEEN US':'A LITTLE SWEETNESS'}</div><h1 id="cakeHeading">${title}</h1><div class="birthday-stars" aria-hidden="true"><i>✧</i><i>✧</i><i>✦</i></div>${art()}<div class="cake-interaction" aria-live="polite">${phase==='candles'?`<p id="cakeInstruction">可以对着麦克风吹气，也可以长按蜡烛掐灭。</p><div class="cake-methods"><button id="useMic" class="letter-main-button">我要吹蜡烛！</button><button id="useHand" class="letter-small-button">我要掐灭蜡烛！</button></div><div class="cake-mic-strip hidden" id="micStrip"><span id="micLabel">麦克风准备中</span><div class="cake-mic-meter" role="meter" aria-label="麦克风音量" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="micLevel"></i></div><button id="stopMic" aria-label="关闭麦克风">关闭</button></div><p class="cake-live-status" id="cakeStatus">三根蜡烛，三个小小的心愿。</p>`:phase==='wish'?`<p class="wish-message">愿你们健康，快乐，也永远被爱包围。</p><div class="wish-audio-controls"><span id="birthdayTime" aria-label="许愿时间"></span></div><p class="cake-live-status" id="cakeStatus">许愿十秒，接着一起切蛋糕。</p><button class="letter-small-button hidden" id="wishAudioRetry">重新播放生日歌</button><button class="letter-small-button hidden" id="wishWithoutAudio">继续吃蛋糕</button>`:phase==='eating'?`<p>点击蛋糕三下，全部吃掉！</p><div class="cake-bite-progress" aria-label="已经吃掉${bites}口，共三口">${[0,1,2].map(i=>`<i class="${bites>i?'bite-done':''}"></i>`).join('')}</div><p class="cake-live-status" id="cakeStatus">${bites?'好吃！还有 '+(3-bites)+' 口。':'第一口，留给今天的寿星。'}</p>`:'<p>这份甜，隔着 9000 公里也能尝到。</p>'}</div></div></section>`;
 root.scrollTop=0;const dialog=root.closest('dialog');if(dialog)dialog.scrollTop=0;
 if(phase==='candles'){root.querySelector('#useMic').onclick=enableMic;root.querySelector('#useHand').onclick=()=>{stopMic();mode='hand';root.querySelector('#micStrip').classList.add('hidden');root.querySelector('#cakeInstruction').textContent='长按每根蜡烛约一秒，圆圈转满就会熄灭。';root.querySelector('#cakeStatus').textContent='按住蜡烛，替小鱼轻轻掐灭它。'};root.querySelector('#stopMic').onclick=()=>{stopMic();root.querySelector('#micStrip').classList.add('hidden');root.querySelector('#cakeStatus').textContent='麦克风已关闭，也可以长按蜡烛。'};root.querySelectorAll('[data-candle]').forEach(button => {
   const index = Number(button.dataset.candle);
   button.onpointerdown = event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    beginHold(button, index, event.pointerId);
    try { button.setPointerCapture(event.pointerId); } catch {}
   };
   const release = event => cancelHold(button, event?.pointerId);
   button.onpointerup = release;
   button.onpointercancel = release;
   button.onlostpointercapture = release;
   button.oncontextmenu = event => event.preventDefault();
   button.onkeydown = event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!event.repeat) beginHold(button, index);
   };
   button.onkeyup = event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    cancelHold(button);
   };
   button.onblur = () => {
    if (hold?.pointerId === undefined) cancelHold(button);
   };
  });
 }

 if(phase==='wish')startWish();if(phase==='eating')root.querySelector('#eatCake').onclick=eat;
 }
 function beginHold(button, index, pointerId) {
  if (phase !== 'candles' || out[index]) return;
  cancelHold();
  button.classList.add('is-holding');
  const press = {button, pointerId, timer: null};
  hold = press;
  press.timer = setTimeout(() => {
   if (hold !== press) return;
   cancelHold(button, pointerId);
   extinguish(index);
  }, 900);
 }
 function extinguish(index){if(phase!=='candles'||out[index]||!root)return;out[index]=true;const button=root.querySelector(`[data-candle="${index}"]`);button.classList.add('is-out');button.disabled=true;button.setAttribute('aria-label',`已熄灭第${index+1}根蜡烛`);root.querySelector('#cakeStatus').textContent=out.every(Boolean)?'蜡烛熄灭啦，现在把愿望放在心里。':`熄灭 ${out.filter(Boolean).length} / 3 根蜡烛。`;if(out.every(Boolean)){stopMic();cancelHold();later(()=>{phase='wish';render()},700)}}
 async function enableMic(){stopMic();const token=micVersion;mode='mic';root.querySelector('#micStrip').classList.remove('hidden');root.querySelector('#cakeStatus').textContent='允许使用麦克风后，朝它吹一口气。只检测音量，不录音。';root.querySelector('#micLabel').textContent='等待麦克风';mic=new BirthdayBlowDetector({onLevel:(level,calibrating)=>{if(!root||token!==micVersion)return;root.querySelector('#micLevel').style.transform=`scaleX(${level})`;root.querySelector('.cake-mic-meter').setAttribute('aria-valuenow',Math.round(level*100));root.querySelector('#micLabel').textContent=calibrating?'听一下周围的声音…':'准备好了，轻轻吹气';},onBlow:()=>{if(!root||token!==micVersion||phase!=='candles')return;root.querySelector('#cakeStatus').textContent='收到你的风了！';[0,1,2].forEach(i=>later(()=>extinguish(i),i*150));},onError:message=>{if(root&&token===micVersion)root.querySelector('#cakeStatus').textContent=message;}});
 try{const started=await mic.start();if(started&&root&&token===micVersion)root.querySelector('#cakeInstruction').textContent='对着麦克风吹气，让三根蜡烛一起熄灭。'}catch(error){if(!root||token!==micVersion)return;const names={NotAllowedError:'麦克风没有获准使用，可以重新允许，也可以长按蜡烛。',NotFoundError:'没有找到麦克风，长按蜡烛也能完成仪式。',NotReadableError:'麦克风暂时被其他软件占用，可以先长按蜡烛。'};root.querySelector('#cakeStatus').textContent=names[error.name]||error.message;root.querySelector('#micLabel').textContent='暂时没有听到声音';}
 }
 function playBirthday() {
  if(!background){
   background={audio:music,playing:!!music&&!music.paused};
   music?.pause();
  }
  birthday.volume=music?.volume??.8;
  return birthday.play();
 }
 function startWish() {
  const sceneVersion=version;
  const isWish=()=>root&&phase==='wish'&&version===sceneVersion;
  const retry=root.querySelector('#wishAudioRetry');
  const skip=root.querySelector('#wishWithoutAudio');
  const status=root.querySelector('#cakeStatus');
  const updateTime=()=>{
   if(!isWish())return;
   if(!birthday.paused&&birthday.currentTime>=wishSeconds){
    finishWish(true);
    return;
   }
   root.querySelector('#birthdayTime').textContent=`0:${String(Math.min(wishSeconds,Math.floor(birthday.currentTime))).padStart(2,'0')} / 0:${wishSeconds}`;
  };
  const fail=()=>{
   if(!isWish())return;
   status.textContent='生日歌暂时没播放出来，可以重试，或带着愿望继续吃蛋糕。';
   retry.classList.remove('hidden');
   skip.classList.remove('hidden');
  };
  const play=()=>playBirthday().then(()=>{
   if(!isWish())return;
   retry.classList.add('hidden');
   skip.classList.add('hidden');
   status.textContent='许愿十秒，接着一起切蛋糕。';
   updateTime();
  }).catch(fail);
  birthday.ontimeupdate=birthday.onloadedmetadata=updateTime;
  birthday.onerror=fail;
  retry.onclick=()=>{if(birthday.error)birthday.load();return play()};
  skip.onclick=()=>finishWish(false);
  updateTime();
  play();
 }
 function finishWish(keepPlaying) {
  if(!root||phase!=='wish')return;
  clearWishHandlers();
  continueBirthday=keepPlaying;
  if(!keepPlaying)stopSoundtrack();
  phase='eating';
  render();
 }
 function eat() {
  if(phase!=='eating'||bites+pendingBites>=3)return;
  pendingBites++;
  if(!serving)serveNextPiece();
 }
 function serveNextPiece() {
  serving=true;
  const index=bites;
  const scene=root.querySelector('.cake-sliced');
  const cut=index===0?'cutting-front':index===1?'cutting-back':'';
  const still=reduced();
  if(cut&&!still)scene.classList.add(cut);
  const lift=()=>{
   if(cut)scene.classList.remove(cut);
   if(index===0)scene.classList.add('has-front-cut');
   if(index===1)scene.classList.add('has-back-cut');
   root.querySelector('.piece-'+index).classList.add('piece-eaten');
   const crumbs=root.querySelector('.cake-crumbs');
   crumbs.classList.remove('crumbs-pop');
   void crumbs.offsetWidth;
   crumbs.classList.add('crumbs-pop');
   if(still)finishPiece();
   else later(finishPiece,630);
  };
  if(cut&&!still)later(lift,index===0?980:560);
  else lift();
 }
 function finishPiece() {
  const index=bites++;
  pendingBites--;
  serving=false;
  root.querySelector('.piece-'+index).classList.add('piece-served');
  const progress=root.querySelector('.cake-bite-progress');
  progress.children[index].classList.add('bite-done');
  progress.setAttribute('aria-label',`已经吃掉${bites}口，共三口`);
  root.querySelector('#cakeStatus').textContent=bites<3?'好吃！还有 '+(3-bites)+' 口。':'吃完啦，这个生日有一点点甜。';
  if(bites===3){
   phase='leaving';
   root.querySelector('#eatCake').disabled=true;
   root.querySelector('#cakeHeading').textContent='这份甜，会留在我们心里。';
   root.querySelector('.birthday-room').classList.add('cake-farewell');
   later(()=>{phase='finished';onFinish(stopSoundtrack)},reduced()?180:1800);
  }else if(pendingBites)serveNextPiece();
 }
 return {mount,unmount};
})();
