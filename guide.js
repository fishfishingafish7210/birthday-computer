/* The optional desktop walkthrough follows actions, not window order. */
const BirthdayGuide=(()=>{
 const dialog=document.querySelector('#birthdayGuide');
 const windowTitle=dialog.querySelector('#guideWindowTitle');
 const title=dialog.querySelector('#guideTitle');
 const content=dialog.querySelector('#guideContent');
 const acknowledge=dialog.querySelector('#guideOkay');
 const close=dialog.querySelector('#closeGuide');
 const reminderDelay=10*60*1000;
 let onAccept=null,onDismiss=null,reminder=null;
 let musicShown=false,photoStep='albums',remindAboutQuiz=false,quizOpened=false;

 function show(heading,paragraphs,{accept,dismiss,caption='生日限定电脑操作指南'}={}){
  windowTitle.textContent=caption;
  title.textContent=heading;
  content.replaceChildren(...paragraphs.map(text=>{
   const p=document.createElement('p');
   p.textContent=text;
   return p;
  }));
  onAccept=accept;
  onDismiss=dismiss;
  if(!dialog.open)dialog.showModal();
  acknowledge.focus();
 }
 function dismiss(){
  const action=onDismiss;
  onAccept=null;
  onDismiss=null;
  dialog.close();
  action?.();
 }
 acknowledge.onclick=()=>{const action=onAccept;dismiss();action?.()};
 close.onclick=dismiss;
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss()});

 function welcome(){
  show('欢迎来到生日限定电脑🎂！',[
   '这是来自遥远的日不落帝国的小鱼同学的定制款，全世界仅此一台哦！',
   '接下来，我会教你如何使用这台电脑^-^',
   '一起跟着教程探索吧！',
   '准备好了请点击下方按钮哟',
  ],{accept:musicInvitation,caption:'生日限定电脑 · 欢迎使用'});
 }
 function musicInvitation(){
  show('先给今天选一首歌',[
   '在这个特殊的日子里，小鱼想送给你们一首歌',
   '但她不知道你们爱听哪首…',
   '所以自己选吧！',
   '点击下方按钮并打开「音乐」软件。',
  ]);
 }
 function musicStarted(){
  if(musicShown||photoStep!=='albums'||quizOpened)return;
  musicShown=true;
  show('有了音乐，就可以开启我们的生日之旅了…',[
   '播放键和音量键都可以正常使用哦。',
   '关掉音乐窗口后，歌曲也会在后台继续播放。',
   '点击下方按钮，再打开桌面上的「照片」。',
  ]);
 }

 function insertTip(anchor,message,action){
  const tip=document.createElement('aside');
  tip.className='birthday-guide-tip';
  tip.setAttribute('aria-label','照片操作指南');
  tip.innerHTML='<span aria-hidden="true">i</span><p role="status"></p>';
  tip.querySelector('p').textContent=message;
  if(action){
   const button=document.createElement('button');
   button.type='button';
   button.className='xp-button';
   button.textContent='知道了！';
   button.onclick=()=>{tip.remove();action()};
   tip.append(button);
  }
  anchor.before(tip);
 }
 function resetReminder(delay=reminderDelay){
  clearTimeout(reminder);
  if(remindAboutQuiz&&!quizOpened)reminder=setTimeout(showReminder,delay);
 }
 function showReminder(){
  if(document.hidden||document.querySelector('dialog[open]:not(#appWindow)')){
   resetReminder(15000);
   return;
  }
  show('还有其他软件可以玩哦！',[
   '你可以继续访问桌面上的「快问快答」。',
  ],{dismiss:resetReminder});
 }
 function appOpened(name){
  if(name==='quiz')quizOpened=true;
  resetReminder();
 }
 function photoExplore(){
  if(photoStep!=='viewer')return;
  photoStep='done';
  show('请自由探索吧！',['你也可以继续访问桌面的「快问快答」。'],{
   dismiss:()=>{
    remindAboutQuiz=true;
    resetReminder();
   },
  });
 }
 const photos={
  attachAlbumTip(root){
   const layout=root.querySelector('.archive-layout');
   if(photoStep==='albums')insertTip(layout,'先在「照片收藏夹」里点开一个相册。');
   if(photoStep==='thumbnails')insertTip(layout,'相册里显示的是照片预览。点一张照片，就能打开大图。');
  },
  selectAlbum(){if(photoStep==='albums')photoStep='thumbnails'},
  attachViewerTip(viewer){
   if(photoStep==='done')return;
   photoStep='viewer';
   insertTip(viewer.querySelector('.photo-image-mat'),'点照片窗口右上角的 ×，就能关闭大图。',photoExplore);
  },
  closeViewer:photoExplore,
 };
 function passwordCopied(){
  show('钥匙已经复制好了！',['现在打开「写给你们的话」文件夹吧！']);
 }
 return {welcome,musicInvitation,musicStarted,appOpened,photos,passwordCopied};
})();
