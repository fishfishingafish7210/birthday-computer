/* The saved image is the exact same full-resolution artwork shown in the preview. */
const CertificateViewer=(()=>{
 const asset='assets/images/birthday-certificate.png',filename='小鱼的生日纪念证书.png';
 let openDialog=null;
 function show(){if(openDialog?.open)return;const dialog=document.createElement('dialog');openDialog=dialog;dialog.className='certificate-viewer';dialog.setAttribute('aria-label','生日纪念证书预览');dialog.innerHTML=`<header class="app-titlebar"><span>生日纪念证书 · 珍藏版</span><button aria-label="关闭证书预览" id="closeCertificate" autofocus>×</button></header><div class="certificate-image-wrap"><img src="${asset}" width="1600" height="2200" alt="生日纪念证书，献给最亲爱的爹爹妈妈。生日祝福课程完成度百分之百。" draggable="false"></div><footer class="certificate-viewer-footer"><p id="certificateSaveStatus" role="status">手机上可以长按证书图片，保存到相册。</p><div><a class="letter-small-button" href="${asset}" target="_blank" rel="noopener">查看原图</a><button class="letter-main-button" id="saveCertificateImage">保存图片 <span>↓</span></button></div></footer>`;document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();if(openDialog===dialog)openDialog=null});dialog.querySelector('#closeCertificate').onclick=()=>dialog.close();const status=dialog.querySelector('#certificateSaveStatus');let file=null;
 // Preload the file so a supported device can open its native share sheet directly on the tap.
 if(navigator.share&&navigator.canShare){fetch(asset).then(res=>{if(!res.ok)throw Error('certificate');return res.blob()}).then(blob=>{file=new File([blob],filename,{type:'image/png'})}).catch(()=>{})}
 function download(){const link=document.createElement('a');link.href=asset;link.download=filename;document.body.append(link);link.click();link.remove();status.textContent='已开始下载原尺寸图片。手机也可长按证书保存到相册。'}
 dialog.querySelector('#saveCertificateImage').onclick=async()=>{if(file&&navigator.share&&navigator.canShare?.({files:[file]})){try{status.textContent='可以在系统菜单里选择“保存图片”。';await navigator.share({files:[file]});return}catch(error){if(error.name==='AbortError'){status.textContent='也可以长按证书图片，保存到相册。';return}}}download()};dialog.showModal()}
 return {show};
})();
