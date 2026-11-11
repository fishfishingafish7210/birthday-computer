const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const tracks=[
 {name:'蝴蝶飞呀',artist:'小虎队',file:'小虎队 - 蝴蝶飞呀.mp3',time:'04:34'},
 {name:'My Love',artist:'Westlife',file:'Westlife - My Love.mp3',time:'03:52'},
 {name:'天空',artist:'王菲',file:'王菲 - 天空.mp3',time:'04:20'},
 {name:'海阔天空',artist:'Beyond',file:'Beyond - 海阔天空.mp3',time:'05:22'},
 {name:'情非得已',artist:'庾澄庆',file:'庾澄庆 - 情非得已.mp3',time:'04:29'},
 {name:"Don't Break My Heart",artist:'黑豹乐队',file:"黑豹乐队 - Don't Break My Heart.mp3",time:'05:12'}
];
const player=new Audio();player.volume=.8;let songIndex=-1;
const transportIcons={
 previous:'<path d="M11 5 2 12l9 7zm10 0-9 7 9 7z"/>',
 play:'<path class="transport-play" d="M8 5l12 7-12 7z"/><path class="transport-pause" d="M7 5h4v14H7zm6 0h4v14h-4z"/>',
 next:'<path d="m3 5 9 7-9 7zm10 0 9 7-9 7z"/>',
};
const transportIcon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${transportIcons[name]}</svg>`;
setTimeout(startDesktop,5000);
function startDesktop(){
 const boot=$('#boot'),desktop=$('#desktop');
 desktop.classList.remove('hidden');
 const finish=()=>{
  boot.classList.add('hidden');
  desktop.inert=false;
  BirthdayGuide.welcome();
 };
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
 const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
 if(!context){finish();return}
 const columns=canvas.width=Math.ceil(boot.clientWidth/11);
 const rows=canvas.height=Math.ceil(boot.clientHeight/11);
 const backdrop=context.createLinearGradient(0,0,0,rows);
 const bootColors=getComputedStyle(boot);
 for(const [offset,stop] of [[0,'top'],[.56,'middle'],[1,'bottom']]){
  backdrop.addColorStop(offset,bootColors.getPropertyValue('--boot-'+stop).trim());
 }
 const radius=Math.hypot(columns,rows)/2;
 const sky=['#93b9e1','#bdd6eb','#d6e6f5'];
 const grass=['#91a963','#afc28b','#d3ddb1'];
 const cells=Array.from({length:columns*rows},(_,i)=>{
  const x=i%columns,y=Math.floor(i/columns);
  const noise=((x*37+y*59+x*y*13)%31)/31;
  return {x,y,at:.74*Math.hypot(x-columns/2,y-rows/2)/radius+.16*noise,
   color:(y<rows*.58?sky:grass)[Math.floor(noise*3)]};
 });
 canvas.setAttribute('aria-hidden','true');
 boot.replaceChildren(canvas);
 boot.classList.add('boot-dissolve');
 let start;
 const draw=now=>{
  start??=now;
  const progress=(now-start)/1050;
  context.fillStyle=backdrop;
  context.fillRect(0,0,columns,rows);
  for(const cell of cells)if(progress>=cell.at)context.clearRect(cell.x,cell.y,1,1);
  for(const cell of cells)if(progress>=cell.at&&progress<cell.at+.1){
   context.fillStyle=cell.color;
   context.fillRect(cell.x,cell.y,1,1);
  }
  if(progress<1)requestAnimationFrame(draw);
  else finish();
 };
 draw(performance.now());
}
function clock(){ $('#weekday').textContent=new Intl.DateTimeFormat('zh-CN',{weekday:'long'}).format(new Date()); $('#clock').textContent=new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date()) }clock();setInterval(clock,30000);
$('#openWelcome').onclick=BirthdayGuide.welcome;
$('#openGuide').onclick=BirthdayGuide.musicInvitation;
const app=$('#appWindow');$('.app-close').onclick=()=>app.close();$('.minimize').onclick=()=>app.close();
function openApp(name){if(name==='cake'&&!LetterExperience.hasRead())return;BirthdayGuide.appOpened(name);if(name!=='letter')LetterExperience.unmount();if(name!=='cake')CakeExperience.unmount();let title=$('#appTitle'),body=$('#appBody');if(!app.open)app.showModal();app.classList.toggle('quiz-window',name==='quiz');app.classList.toggle('photo-window',name==='photos');app.classList.toggle('letter-window',name==='letter');app.classList.toggle('cake-window',name==='cake');
 if(name==='music'){
  title.textContent='iPod — 音乐播放清单';
  body.innerHTML=`<div class="ipod"><div class="ipod-heading">iPod</div><div class="ipod-top"><div><div class="transport"><button class="round-control" id="prev" aria-label="上一首">${transportIcon('previous')}</button><button class="round-control" id="play" aria-label="播放">${transportIcon('play')}</button><button class="round-control" id="next" aria-label="下一首">${transportIcon('next')}</button></div><label class="volume-line">◖ <input id="volume" type="range" min="0" max="1" step=".05" value=".8" aria-label="音量"> ◗</label></div><div class="ipod-display">★</div><div><div class="search-tools"><input id="search" placeholder="Search" aria-label="搜索歌曲"><button class="browse-button" aria-label="浏览">◉</button></div><span class="browse-label">Browse</span></div></div><div class="playlist-wrap"><table class="playlist"><thead><tr><th class="track-col">Song</th><th class="time-col">Time</th><th class="artist-col">Artist</th></tr></thead><tbody>${tracks.map((t,i)=>`<tr data-row="${i}"><td><button class="song-play" data-song="${i}">♫　${t.name}</button></td><td>${t.time}</td><td>${t.artist}</td></tr>`).join('')}</tbody></table></div><div class="ipod-bottom"><button id="shuffle" title="随机播放">⤨</button><span class="now-playing" id="nowPlaying">选择一首歌，开始生日之旅</span><button id="repeat" title="循环播放">↻</button></div></div>`;
  const playButton=body.querySelector('#play'),nowPlaying=body.querySelector('#nowPlaying');
  const rows=body.querySelectorAll('.playlist tbody tr');
  function update(){
   if(!playButton.isConnected)return;
   playButton.setAttribute('aria-label',player.paused?'播放':'暂停');
   playButton.classList.toggle('is-playing',!player.paused);
   nowPlaying.textContent=songIndex>=0?`正在播放：${tracks[songIndex].name} — ${tracks[songIndex].artist}`:'选择一首歌，开始生日之旅';
   rows.forEach((row,i)=>row.classList.toggle('playing',i===songIndex));
  }
  function resume(showGuide){
   player.play().then(()=>{
    update();
    if(showGuide&&app.open&&playButton.isConnected)BirthdayGuide.musicStarted();
   }).catch(error=>{
    if(playButton.isConnected&&error.name!=='AbortError')nowPlaying.textContent='点击播放按钮开始播放';
   });
  }
  function play(i,showGuide=true){
   songIndex=(i+tracks.length)%tracks.length;
   player.src='assets/music/'+encodeURIComponent(tracks[songIndex].file);
   resume(showGuide);
   update();
  }
  body.querySelectorAll('.song-play').forEach(button=>button.onclick=()=>play(+button.dataset.song));
  playButton.onclick=()=>{
   if(songIndex<0)play(0);
   else if(player.paused)resume(true);
   else{player.pause();update()}
  };
  $('#prev').onclick=()=>play(songIndex<0?tracks.length-1:songIndex-1);$('#next').onclick=()=>play(songIndex+1);
  $('#volume').value=player.volume;$('#volume').oninput=e=>player.volume=+e.target.value;
  $('#search').oninput=e=>{const q=e.target.value.toLowerCase();rows.forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(q))};
  $('#shuffle').onclick=()=>play(Math.floor(Math.random()*tracks.length));
  $('#repeat').onclick=()=>player.loop=!player.loop;
  player.onended=()=>{if(!player.loop)play(songIndex+1,false)};
  update();
 }
 if(name==='photos'){title.textContent='我的照片 · 小鱼家的影像档案';PhotoAlbum.mount(body,BirthdayGuide.photos)}
 if(name==='quiz'){title.textContent='快问快答 · 小鱼的回忆档案';QuizGame.mount(body,()=>openApp('letter'),()=>{if(app.open&&app.classList.contains('quiz-window'))BirthdayGuide.passwordCopied()})}
 if(name==='letter'){title.textContent='写给你们的话 · 小鱼的私人邮局';LetterExperience.mount(body,syncCakeEntry)}
 if(name==='cake'){title.textContent='吃蛋糕吧 · 生日小剧场';CakeExperience.mount(body,{music:player,onFinish:stopSoundtrack=>{app.close();BirthdayFinale.show({onClose:stopSoundtrack})}})}
}
$$('.shortcut').forEach(b=>b.onclick=()=>openApp(b.dataset.app));

$$("[data-open]").forEach(b=>b.onclick=()=>openApp(b.dataset.open));

function syncCakeEntry(){const icon=document.querySelector('[data-app="cake"]');const visible=LetterExperience.hasRead();icon.classList.toggle('hidden',!visible);if(visible)icon.classList.add('cake-arrival')}
syncCakeEntry();
app.addEventListener('close',()=>{LetterExperience.unmount();CakeExperience.unmount()});
window.addEventListener('pagehide',()=>CakeExperience.unmount({keepSoundtrack:false}));
