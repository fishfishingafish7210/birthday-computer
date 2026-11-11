/* Birthday memory game. Questions preserve the author's order; retries keep progress. */
const QUIZ_QUESTIONS = [
 {id:'code',text:'先来对暗号：隧道隧道，_______！',answer:'一睡就到',type:'text',hint:'输入我们家的暗号'},
 {id:'distance',text:'我们之间现在的直线距离是：',options:['大约8000公里','大约7000公里','大约9000公里','大约10000公里'],correct:2},
 {id:'letter',text:'以下哪个意象没有出现在妈咪写给小鱼的中考加油信里？',options:['黄色床单','红色气球','窗外的阳光','小小鱼的笑声'],correct:0},
 {id:'writer',text:'曾有一位著名作家写出了一本书，内容关于她们一家三口的故事，文字清新动人，ta的名字是：',options:['毕淑敏','三毛','冰心','杨绛'],correct:3},
 {id:'food',text:'小鱼和妈咪都爱读一位美食家的书，他的名字是：',options:['蔡澜','白先勇','朱自清','汪曾祺'],correct:3},
 {id:'age',text:'我们仨现在的年龄加起来等于：',type:'text',answer:'121',hint:'输入年龄之和',numeric:true},
 {id:'oldbook',text:'在我们家所有陈年旧书中，小鱼最喜欢的一本是：',options:['《塞莱斯廷预言》','《高等数学》','《撒哈拉的故事》','《弗洛伊德心理学》'],correct:2},
 {id:'university',text:'妈咪最近读的书中的女科学家本科毕业于哪个大学：',options:['哈佛大学','普林斯顿大学','耶鲁大学','麻省理工'],correct:1},
 {id:'language',text:'爹最擅长的编程语言是：',options:['Java','Python','C++','老爹曾说过：一通百通。'],correct:3},
 {id:'shenzhen',text:'妈咪来深圳的根本原因是：',options:['我要看大海……','赚够十万就回家！','学习高新技术，争当时代好青年！','认识新朋友( ̀⌄ ́)'],correct:0},
 {id:'family',text:'世界名画：《我要抢镜头却被妈咪推开》的诞生地是',options:['厦门','三水','惠东','珠海'],correct:0,image:'assets/quiz/family-xiamen.jpg',alt:'一家三口戴着帽子和墨镜的合照'},
 {id:'swim',text:'世界名画：《矫健的游泳运动员》的诞生地是',options:['厦门','海南','三水','惠东'],correct:3,image:'assets/quiz/swimming-huidong.jpg',alt:'在蓝色海水中游泳的爸爸'},
 {id:'happy',text:'世界名画：《我觉得好幸福，因为有你们陪着我》的诞生地是',options:['厦门','珠海','三水','惠东'],correct:1,image:'assets/quiz/happy-zhuhai.jpg',alt:'妈妈记录小鱼觉得幸福的对话，以及一家人走过林荫路的回忆'}
];
const QuizGame=(()=>{
 const KEY='xiaoyu-birthday-quiz-v1',password='WyH11372';
 let state={stage:'welcome',index:0,revealed:false},root=null,onLetter=null,onCopy=null,selected=null,locked=false,feedbackTimer=null,renderVersion=0,restartDialog=null;
 try{const s=JSON.parse(sessionStorage.getItem(KEY));if(s&&Number.isInteger(s.index)&&s.index>=0&&s.index<=QUIZ_QUESTIONS.length&&['welcome','question','wrong','won'].includes(s.stage)&&((s.stage==='won')===(s.index===QUIZ_QUESTIONS.length)))state={stage:s.stage,index:s.index,revealed:!!s.revealed};}catch{}
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{}};
 const shuffled=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const keySVG=`<svg viewBox="0 0 70 32" aria-hidden="true" shape-rendering="crispEdges">
  <path fill="#624725" fill-rule="evenodd" d="M12 2h12v2h5v3h3v5h35v2h2v15H58v-5h-7v5H40v-6h-8v3h-3v3h-5v2H12v-2H7v-3H4v-5H2v-9h2V7h3V4h5zm3 10v2h-2v5h2v2h6v-2h2v-5h-2v-2z"/>
  <path fill="#d4a44d" fill-rule="evenodd" d="M12 4h12v2h5v3h2v5h36v13h-7v-5H49v5h-7v-6H31v3h-2v3h-5v2H12v-2H7v-3H6v-4H4v-8h2V8h2V6h4zm2 6v2h-2v2h-1v5h1v2h2v2h8v-2h2v-2h1v-5h-1v-2h-2v-2z"/>
  <path fill="#edc975" d="M12 6h13v2h4v4h-3v-1h-3V9H14v2h-3v3H9v6h2v4h4v3h-3v-2H8v-4H6v-8h2V9h4zm19 9h34v4H31zm13 7h4v4h-4zm17 0h4v4h-4z"/>
  <path fill="#fff0b2" d="M13 6h10v2H13zm-4 4h4v2H9zm23 5h31v2H32z"/>
  <path fill="#b08038" d="M16 25h8v-2h4v-4h2v5h-2v3h-5v2h-7zm14-6h34v2H49v1h-7v-1H30z"/>
 </svg>`;
 const fishSVG=`<svg class="memory-fish" viewBox="0 0 96 55" aria-hidden="true" shape-rendering="crispEdges">
  <g class="fish-tail">
   <path fill="#608eaa" d="M68 24h6v-4h4v-4h9v2h3v7h-3v4h-4v2h4v3h3v6h-3v3h-8v-3h-4v-4h-7z"/>
   <path fill="#a3d8db" d="M69 26h7v-4h4v-4h6v2h2v4h-3v4h-4v4h4v3h3v4h-2v2h-6v-3h-3v-4h-8z"/>
   <path fill="#d3f1ea" d="M80 19h6v3h-5v3h-3v-3h2z"/>
  </g>
  <path fill="#608eaa" d="M38 14v-5h4V6h10v2h4v3h5v4z"/>
  <path fill="#a3d8db" d="M40 14v-4h4V8h7v2h4v3h4v2z"/>
  <path fill="#608eaa" d="M32 13h9v-2h13v2h8v3h6v4h4v5h3v12h-3v5h-5v4h-7v3h-9v2H35v-2h-9v-3h-6v-4h-4v-5h-3V26h3v-5h4v-4h5v-2h7z"/>
  <path fill="#9fd2e6" d="M32 15h9v-2h13v2h8v3h5v4h3v4h3v10h-3v5h-5v3h-6v3h-9v2H36v-2h-9v-3h-6v-4h-3v-4h-3v-9h3v-5h4v-4h5v-2h5z"/>
  <path fill="#bde7ef" d="M31 17h12v-2h10v2h8v3h6v4h3v5h-6v4H24v-3h-6v-5h4v-4h4v-2h5z"/>
  <path fill="#d7f5f0" d="M31 18h12v-2h9v2h6v2H35v2h-7v-2h3z"/>
  <path fill="#e1f4eb" d="M18 37h6v3h8v2h23v-2h10v2h-7v3h-9v2H36v-2h-8v-3h-6v-3h-4z"/>
  <path fill="#77b3cb" d="M51 30h8v2h4v4h-3v3h-8v-2h-2v-5h1z"/>
  <path fill="#a0d4de" d="M52 32h6v2h3v2h-3v2h-5v-2h-1z"/>
  <path fill="#344e6b" d="M28 24h5v2h2v5h-2v2h-5v-2h-2v-5h2z"/>
  <path fill="#f5ffff" d="M28 25h2v2h-2z"/>
  <path fill="#e8a8b9" d="M35 33h6v1h2v3h-2v1h-6v-1h-2v-3h2z"/>
  <path class="fish-mouth" d="M16 33h3v3h5v-2h2" fill="none" stroke="#527d98" stroke-width="1.5"/>
 </svg>`;
 function fish(status=''){
  return `<div class="fish-scene ${status}" aria-hidden="true"><div class="fish-thought">Good Job!<i></i><b></b></div>
   <div class="water-line water-one"></div><div class="water-line water-two"></div>
   <div class="fish-swimmer">${fishSVG}<span class="mouth-key">${keySVG}</span></div>
   <i class="bubble b1"></i><i class="bubble b2"></i><i class="bubble b3"></i></div>`;
 }
 function frame(content,mode){let done=state.stage==='won'?QUIZ_QUESTIONS.length:state.index;root.innerHTML=`<section class="memory-game ${mode}"><nav class="quiz-menubar"><span>小鱼的回忆档案</span><span>Birthday Edition</span></nav><header class="quiz-progress"><span>回忆进度 <b>${String(done).padStart(2,'0')} / ${QUIZ_QUESTIONS.length}</b></span><div class="memory-meter" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="${QUIZ_QUESTIONS.length}" aria-valuenow="${done}"><span style="width:${done/QUIZ_QUESTIONS.length*100}%"></span></div></header>${content}<footer class="quiz-status"><i></i><span>${mode==='quiz-welcome'?'准备就绪 · 一起找回我们的回忆':mode==='quiz-won'?'钥匙已找回 · 回忆已保存':'答错也没关系，已经找回的回忆会一直保留。'}</span></footer></section>`}
 function render(){clearTimeout(feedbackTimer);feedbackTimer=null;const activeRender=++renderVersion;if(!root?.isConnected)return;selected=null;locked=false;
  if(state.stage==='welcome'){frame(`${fish()}<div class="quiz-intro"><span class="quiz-eyebrow">XIAOYU'S MEMORY ARCHIVE</span><h1>欢迎来到快问快答！</h1><p>全部答对才能获得打开信件的钥匙哦</p><div class="quiz-rules">记忆管理局里有一只小鱼游啊游…</div><button class="quiz-primary" id="quizStart">点击开始 <span>›</span></button></div>`,'quiz-welcome');root.querySelector('#quizStart').onclick=()=>{state.stage='question';save();render()};return}
  if(state.stage==='won'){renderWin();return}
  if(state.stage==='wrong'){renderWrong();return}
  const q=QUIZ_QUESTIONS[state.index];
  frame(`${fish()}<div class="quiz-question"><div class="question-label"><span>记忆 ${String(state.index+1).padStart(2,'0')}</span><span>${q.type==='text'?'填写答案':'单选题'}</span></div><h2 id="questionTitle">${q.text}</h2>${q.image?`<figure class="quiz-photo"><img src="${q.image}" alt="${q.alt}"><figcaption>我们的记忆 · 点开照片可以放大看</figcaption></figure>`:''}<form id="quizForm" aria-labelledby="questionTitle">${q.type==='text'?`<label class="quiz-fill-label" for="quizAnswer">你的答案</label><input class="quiz-fill" id="quizAnswer" placeholder="${q.hint}" ${q.numeric?'inputmode="numeric"':''} autocomplete="off" maxlength="50"><p class="quiz-empty" role="status"></p>`:`<div class="quiz-options">${shuffled(q.options.map((text,i)=>({text,i}))).map((o,i)=>`<button type="button" class="quiz-option" data-value="${o.i}" aria-pressed="false"><span class="option-letter">${'ABCD'[i]}</span><span>${o.text}</span><i></i></button>`).join('')}</div><p class="quiz-empty" role="status">选择一个答案，再点击确认。</p>`}<div class="quiz-submit-row"><span>不限时答题，答错也不罚钱</span><button class="quiz-primary" id="quizSubmit" ${q.type==='text'?'':'disabled'}>确认答案 <span>›</span></button></div></form></div>`,'quiz-question-screen');
  root.querySelectorAll('.quiz-option').forEach(b=>b.onclick=()=>{if(locked)return;selected=+b.dataset.value;root.querySelectorAll('.quiz-option').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));root.querySelector('#quizSubmit').disabled=false});
  root.querySelector('#quizForm').onsubmit=e=>{e.preventDefault();if(locked)return;const answer=q.type==='text'?root.querySelector('#quizAnswer').value.normalize('NFKC').trim().replace(/[\s，。！!,.]/g,''):selected;if(q.type==='text'&&!answer){root.querySelector('.quiz-empty').textContent='先写下你的答案吧。';root.querySelector('#quizAnswer').focus();return}locked=true;root.querySelector('#quizSubmit').disabled=true;const correct=q.type==='text'?answer===q.answer:answer===q.correct;if(correct){
   const form=root.querySelector('#quizForm');
   root.querySelector('.fish-scene').classList.add('fish-cheer');
   if(q.type==='text'){const input=root.querySelector('#quizAnswer');input.classList.add('answer-correct');input.readOnly=true}else root.querySelector(`.quiz-option[data-value="${selected}"]`).classList.add('answer-correct');
   root.querySelectorAll('.quiz-option').forEach(b=>b.disabled=true);
   root.querySelector('.quiz-empty').classList.add('correct-message');
   root.querySelector('.quiz-empty').textContent='答对啦！Good Job！';
   root.querySelector('#quizSubmit').textContent=state.index===QUIZ_QUESTIONS.length-1?'领取钥匙中…':'下一段回忆…';
   state.index++;state.stage=state.index===QUIZ_QUESTIONS.length?'won':'question';save();
   root.querySelector('.fish-scene').scrollIntoView({block:'nearest',behavior:'smooth'});
   feedbackTimer=setTimeout(()=>{feedbackTimer=null;if(renderVersion!==activeRender||root.querySelector('#quizForm')!==form)return;render();root.scrollIntoView({block:'start',behavior:'smooth'})},1700);
  }else{state.stage='wrong';save();render();root.scrollIntoView({block:'start',behavior:'smooth'})}};
  if(q.image)root.querySelector('.quiz-photo').onclick=()=>{const lightbox=document.createElement('dialog');lightbox.className='quiz-lightbox';lightbox.innerHTML=`<button aria-label="关闭大图">×</button><img src="${q.image}" alt="${q.alt}">`;document.body.append(lightbox);lightbox.querySelector('button').onclick=()=>lightbox.close();lightbox.addEventListener('close',()=>lightbox.remove());lightbox.onclick=e=>{if(e.target===lightbox)lightbox.close()};lightbox.showModal()};
 }
 function renderWrong(){frame(`${fish('fish-gulp')}<div class="quiz-intro quiz-wrong"><span class="quiz-eyebrow">小鱼暂时保管了钥匙</span><h1>啊哦！小鱼把钥匙吃掉了…</h1><p>再来一次把钥匙抢回来！</p><p class="quiz-reassure">前面答对的 ${state.index} 道题已经保存，<br>我们只重答这道题就好。</p><button class="quiz-primary" id="quizRetry">再答这道题 <span>↻</span></button></div>`,'quiz-failed');root.querySelector('#quizRetry').onclick=()=>{state.stage='question';save();render()}}
 function renderWin(){frame(`<div class="confetti" aria-hidden="true">${Array.from({length:28},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${i%7*.17}s;--r:${i*23}deg;--c:${['#f0c66a','#8bafda','#a5cfc6','#eab2a5'][i%4]}"></i>`).join('')}</div><div class="quiz-intro"><span class="quiz-eyebrow">ALL MEMORIES RESTORED</span><h1>我们仨的回忆，全部找回！</h1><p>${QUIZ_QUESTIONS.length} 段回忆，一把通往心里话的钥匙。</p>${state.revealed?`<div class="quiz-password"><p>用这个密码打开“写给你们的话”：</p><strong id="prizePassword">${password}</strong><button class="quiz-primary" id="copyPassword">一键复制密码</button><p id="copyStatus" role="status"></p><button class="xp-button hidden" id="openLetter">打开“写给你们的话”</button></div>`:`<button class="prize-key" id="prizeKey" aria-label="点击钥匙领取密码">${keySVG}</button><p class="key-instruction">点击钥匙！</p>`}<div class="quiz-restart-row"><button class="quiz-restart" id="quizRestart">重新开始</button></div></div>`,'quiz-won');
 root.querySelector('#quizRestart').onclick=confirmRestart;
 if(!state.revealed){root.querySelector('#prizeKey').onclick=()=>{state.revealed=true;save();renderWin()};return}
 root.querySelector('#copyPassword').onclick=async()=>{const status=root.querySelector('#copyStatus');let ok=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(password);ok=true}}catch{}if(root.querySelector('#copyStatus')!==status)return;if(!ok){const area=document.createElement('textarea');area.value=password;area.style.position='fixed';area.style.opacity='0';root.append(area);area.select();try{ok=document.execCommand('copy')}catch{}area.remove()}
 status.textContent=ok?'复制成功！现在打开“写给你们的话”文件夹吧！':'自动复制没有成功，请长按或选中上方密码复制。';root.querySelector('#openLetter').classList.remove('hidden');if(!ok){const r=document.createRange();r.selectNodeContents(root.querySelector('#prizePassword'));const s=window.getSelection();s.removeAllRanges();s.addRange(r)}else onCopy?.()};
 root.querySelector('#openLetter').onclick=()=>onLetter();
 }
 function confirmRestart(){
  if(restartDialog?.open)return;
  const dialog=document.createElement('dialog');restartDialog=dialog;dialog.className='quiz-reset-dialog';
  dialog.setAttribute('aria-labelledby','resetTitle');dialog.setAttribute('aria-describedby','resetDescription');
  dialog.innerHTML=`<header>记忆管理局 · 重新开始</header><div class="reset-body"><div class="reset-symbol" aria-hidden="true">!</div><h2 id="resetTitle">确定要重新开始吗？</h2><p id="resetDescription">进度会清空，已领取的钥匙也会收回。<br>需要重新答完全部 ${QUIZ_QUESTIONS.length} 道题。</p><div class="reset-actions"><button class="xp-button" id="keepProgress" autofocus>保留进度</button><button class="quiz-primary" id="confirmReset">确定，重新开始</button></div></div>`;
  document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();if(restartDialog===dialog)restartDialog=null});
  dialog.querySelector('#keepProgress').onclick=()=>dialog.close();
  dialog.querySelector('#confirmReset').onclick=()=>{clearTimeout(feedbackTimer);state={stage:'welcome',index:0,revealed:false};save();dialog.close();render();root.scrollIntoView({block:'start',behavior:'smooth'})};
  dialog.showModal();
 }
 return {mount(element,openLetter,passwordCopied){root=element;onLetter=openLetter;onCopy=passwordCopied;render()},isComplete:()=>state.stage==='won'};
})();
