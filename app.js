'use strict';
const KEY='saion.prototype.m1.profile.v1';
const login=document.getElementById('loginScreen');
const profile=document.getElementById('profileScreen');
const home=document.getElementById('homeScreen');
const record=document.getElementById('recordScreen');
const bamboo=document.getElementById('bambooScreen');
const calendar=document.getElementById('calendarScreen');
const recheck=document.getElementById('recheckScreen');
const better=document.getElementById('betterScreen');
const share=document.getElementById('shareScreen');
const voiceRecommend=document.getElementById('voiceRecommendScreen');
const voicePlayer=document.getElementById('voicePlayerScreen');
const breatheRecommend=document.getElementById('breatheRecommendScreen');
const breathePlayer=document.getElementById('breathePlayerScreen');
const youInbox=document.getElementById('youInboxScreen');
const extraScreens=['signup','terms','settings','privacy','alerts','recheck','better','share','voiceRecommend','voicePlayer','breatheRecommend','breathePlayer','youInbox','youHistory','youCompose','youCard','youVoice','youReview','youComplete','youReceivedDetail','we','weBundleCreate','weBundlePick','weBundleView'];
let policyOrigin='signup';let privacyOrigin='settings';let settingsOrigin='home';let recheckOrigin='bamboo';let selectedRecipient='';let youOrigin='home';
const saveMessage=document.getElementById('saveMessage');
const nickname=document.getElementById('nickname');
const birthday=document.getElementById('birthday');
const gender=document.getElementById('gender');
let toastTimeout;
function notify(message){const toast=document.getElementById('toast');toast.textContent=message;toast.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.hidden=true,2200)}
function formatReminderTime(value){if(!value)return '오후 4:00';const [h,m]=String(value).split(':').map(Number);if(Number.isNaN(h)||Number.isNaN(m))return value;const ap=h<12?'오전':'오후';let hour=h%12;if(hour===0)hour=12;return `${ap} ${hour}:${String(m).padStart(2,'0')}`;}
function goRecheck(origin='bamboo'){recheckOrigin=origin;show('recheck')}
function goYouInbox(origin='home'){youOrigin=origin;show('youInbox')}
function show(screen){
 if(screen!=='youReceivedDetail' && typeof youReceivedCurrent!=='undefined' && youReceivedCurrent && 'speechSynthesis' in window)window.speechSynthesis.cancel();
 extraScreens.forEach(id=>document.getElementById(id+'Screen').hidden=screen!==id);
 if(screen!=='voicePlayer')stopVoiceDemo();
 if(screen!=='breathePlayer')stopBreatheDemo();
 if(screen==='alerts')restoreAlerts();
 login.hidden=screen!=='login';profile.hidden=screen!=='profile';home.hidden=screen!=='home';record.hidden=screen!=='record';bamboo.hidden=screen!=='bamboo';calendar.hidden=screen!=='calendar'; if(youInbox) youInbox.hidden=screen!=='youInbox';
 window.scrollTo(0,0);
 if(screen==='profile'){restore()}
 if(screen==='home'){renderHome()}
 if(screen==='record'){renderRecord()}
 if(screen==='bamboo'){renderBamboo()}
 if(screen==='calendar'){renderCalendar()}
 if(screen==='recheck'){renderRecheck()}
 if(screen==='better'){renderBetter()}
 if(screen==='share'){renderShare()}
 if(screen==='voicePlayer'){renderVoicePlayer()}
 if(screen==='breathePlayer'){renderBreathePlayer()}
 if(screen==='youHistory'){renderYouSentList()}
 if(screen==='youCompose'){renderYouCompose()}
 if(screen==='youCard'){renderYouCard()}
 if(screen==='youVoice'){renderYouVoice()}
 if(screen==='youReview'){renderYouReview()}
 if(screen==='youComplete'){renderYouComplete()}
 if(screen==='youReceivedDetail'){renderYouReceivedDetail()}
 if(screen==='we'){renderWe()}
 if(screen==='weBundleCreate'){renderWeBundleCreate()}
 if(screen==='weBundlePick'){renderWeBundlePick()}
 if(screen==='weBundleView'){renderWeBundleView()}
 updateSaionGlobalNav(screen);
 const currentScreen=document.getElementById(screen+'Screen');
 if(currentScreen){const inner=currentScreen.querySelector(':scope > .you-flow-main');if(inner)inner.scrollTop=0;}
}
function restore(){let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{};nickname.value=data?.nickname||'';birthday.value=data?.birthday||'';gender.value=data?.gender||'';saveMessage.textContent=''}
document.getElementById('joinFromLogin').addEventListener('click',()=>show('signup'));
document.getElementById('loginForm').addEventListener('submit',e=>{e.preventDefault();show('home')});
document.getElementById('profileSettingsButton').addEventListener('click',()=>{settingsOrigin='profile';show('settings')});
document.getElementById('backToLogin').addEventListener('click',()=>show('login'));
document.getElementById('showPassword').addEventListener('click',()=>{const p=document.getElementById('password');p.type=p.type==='password'?'text':'password'});
document.getElementById('profileForm').addEventListener('submit',e=>{e.preventDefault();if(!nickname.value.trim()){nickname.focus();notify('닉네임을 입력해 주세요.');return}if(!birthday.value){birthday.focus();notify('생년월일을 선택해 주세요.');return}if(!gender.value){gender.focus();notify('성별을 선택해 주세요.');return}const data={nickname:nickname.value.trim(),birthday:birthday.value,gender:gender.value};try{localStorage.setItem(KEY,JSON.stringify(data));saveMessage.textContent='저장되었습니다.';show('home');notify('프로필이 저장되었어요!')}catch{saveMessage.textContent='저장에 실패했습니다. 브라우저 저장 설정을 확인해 주세요.'}});
document.querySelectorAll('[data-pending]').forEach(el=>el.addEventListener('click',()=>notify(`${el.dataset.pending}는 다음 단계에서 연결할게요.`)));
document.querySelectorAll('[data-open-you]').forEach(el=>el.addEventListener('click',()=>goYouInbox('from-nav')));
document.getElementById('openOnmi').addEventListener('click',()=>openOnroom('hair'));
document.getElementById('openOnroom').addEventListener('click',()=>openOnroom('background'));
function openOnroom(tab){sessionStorage.setItem('saion.m2.profile.draft',JSON.stringify({nickname:nickname.value,birthday:birthday.value,gender:gender.value}));window.location.assign(new URL('onroom/?tab='+encodeURIComponent(tab), document.baseURI).href)}
function restoreDraft(){try{const draft=JSON.parse(sessionStorage.getItem('saion.m2.profile.draft')||'null');if(draft){nickname.value=draft.nickname||'';birthday.value=draft.birthday||'';gender.value=draft.gender||''}}catch{}}

// M16: YOU 너에게 첫 화면
document.getElementById('youInboxBack').addEventListener('click',()=>show(youOrigin==='from-nav'?'home':youOrigin||'home'));
document.getElementById('youInboxBell').addEventListener('click',()=>notify('알림 화면은 다음 단계에서 연결할게요.'));
let youHistoryFilter='all';
function youFilter(kind){
 youHistoryFilter=kind;
 document.querySelectorAll('[data-you-filter]').forEach(btn=>{const on=btn.dataset.youFilter===kind;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on))});
 renderYouSentList();
}
document.getElementById('youTabAll').addEventListener('click',()=>youFilter('all'));
document.getElementById('youTabText').addEventListener('click',()=>youFilter('text'));
document.getElementById('youTabVoice').addEventListener('click',()=>youFilter('voice'));
document.getElementById('youTabPhoto').addEventListener('click',()=>youFilter('photo'));


// M41: 기억 묶음. Only curated WE demo posts are eligible; private journals/ONDI chat excluded.
const WE_RELATIONS_KEY='saion.m41.we.relations';
let weMemorySelected=new Set();let weMemoryMood='';let weMemoryBundle=null;
const WE_MOODS=[['행복해요','lamp_01.png'],['무난해요','lamp_02.png'],['활기차요','lamp_03.png'],['화가나요','lamp_04.png'],['우울해요','lamp_05.png'],['지쳐요','lamp_06.png']];
function weGetBundles(){return safeGet(WE_BUNDLE_KEY,[])}
function weRelationOptions(){const el=document.getElementById('weBundleRelation');const current=el.value;el.querySelectorAll('option[data-custom]').forEach(x=>x.remove());safeGet(WE_RELATIONS_KEY,[]).forEach(value=>{const opt=document.createElement('option');opt.value=value;opt.textContent=value;opt.dataset.custom='1';el.insertBefore(opt,el.querySelector('[value=custom]'));});if([...el.options].some(x=>x.value===current))el.value=current}
function renderWeBundleCreate(){weRelationOptions();const box=document.getElementById('weBundleSavedList');const bundles=weGetBundles();box.innerHTML=bundles.length?bundles.map((b,i)=>`<button class="we-memory-saved-row" data-bundle-index="${i}"><span>▣ ${weHtmlSafe(b.title)}</span><small>${weHtmlSafe(b.relation||'관계 미지정')} · ${(b.posts||[]).length}개 기록 ›</small></button>`).join(''):'<p class="we-memory-empty">만든 기억 묶음이 아직 없어요.</p>';box.querySelectorAll('[data-bundle-index]').forEach(b=>b.addEventListener('click',()=>{weMemoryBundle=bundles[Number(b.dataset.bundleIndex)];show('weBundleView')}))}
function renderWeBundlePick(){document.getElementById('weBundlePickSubtitle').textContent=document.getElementById('weBundleTitle').value.trim()||'새 기억 묶음';const moodBox=document.getElementById('weBundleMoodFilter');moodBox.innerHTML=WE_MOODS.map(([m,l])=>`<button type="button" class="we-memory-mood ${weMemoryMood===m?'selected':''}" data-memory-mood="${m}" aria-pressed="${weMemoryMood===m}"><img src="assets/emotion-lamps/${l}" alt="${m}"/></button>`).join('');moodBox.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{weMemoryMood=weMemoryMood===b.dataset.memoryMood?'':b.dataset.memoryMood;renderWeBundlePick()}));const start=document.getElementById('weBundleStartDate').value,end=document.getElementById('weBundleEndDate').value;const entries=weDemoPosts.filter(p=>(!weMemoryMood||p.mood===weMemoryMood)&&weDateMatches(p.date,start,end));const list=document.getElementById('weBundlePickList');list.innerHTML=entries.map(p=>`<button type="button" class="we-memory-pick ${weMemorySelected.has(p.id)?'selected':''}" data-mpick="${p.id}" aria-pressed="${weMemorySelected.has(p.id)}"><img src="assets/we/${p.photo}" alt=""/><span><small>${Number(p.date.slice(5,7))}월 ${Number(p.date.slice(8))}일</small><strong>${weHtmlSafe(p.title)}</strong><em>${weHtmlSafe(p.group)} · ${weHtmlSafe(p.preview)}</em></span><b class="we-memory-check">${weMemorySelected.has(p.id)?'✓':''}</b></button>`).join('')||'<p class="we-memory-empty">선택한 조건의 기록이 없어요.</p>';list.querySelectorAll('[data-mpick]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.mpick;if(weMemorySelected.has(id))weMemorySelected.delete(id);else weMemorySelected.add(id);renderWeBundlePick()}));document.getElementById('weBundleConfirm').textContent=`선택한 기록 ${weMemorySelected.size}개 묶기`}
function renderWeBundleView(){const b=weMemoryBundle;if(!b){show('we');return;}const posts=(b.posts||[]).map(id=>weDemoPosts.find(p=>p.id===id)).filter(Boolean);document.getElementById('weBundleViewTitle').textContent=b.title;document.getElementById('weBundleViewMeta').textContent=`${b.relation||'우리'} · 기록 ${posts.length}개`;document.getElementById('weBundleCover').src=`assets/we/${posts.find(x=>x.types.includes('photo'))?.photo||posts[0]?.photo||'kitchen.webp'}`;const list=document.getElementById('weBundleViewList');list.innerHTML=posts.map(p=>`<article class="we-memory-view-card"><img src="assets/we/${p.photo}" alt="${weHtmlSafe(p.title)}"/><div><small>${Number(p.date.slice(5,7))}월 ${Number(p.date.slice(8))}일</small><strong>${weHtmlSafe(p.title)}</strong><p>${weHtmlSafe(p.preview)}</p></div></article>`).join('')||'<p class="we-memory-empty">이 묶음에는 기록이 없어요.</p>'}
document.getElementById('weBundleCreateBack').addEventListener('click',()=>show('we'));
document.getElementById('weBundlePickBack').addEventListener('click',()=>show('weBundleCreate'));
document.getElementById('weBundleViewBack').addEventListener('click',()=>show('weBundleCreate'));
document.getElementById('weBundleHome').addEventListener('click',()=>show('we'));
document.getElementById('weBundleBell').addEventListener('click',()=>notify('알림은 다음 단계에서 연결할게요.'));
document.querySelectorAll('.we-memory-bell:not(#weBundleBell)').forEach(b=>b.addEventListener('click',()=>notify('알림은 다음 단계에서 연결할게요.')));
document.getElementById('weBundleRelation').addEventListener('change',e=>{document.getElementById('weBundleCustom').hidden=e.target.value!=='custom'});
document.getElementById('weBundleCustomAdd').addEventListener('click',()=>{const inp=document.getElementById('weBundleCustomInput');const val=inp.value.trim();if(!val){notify('추가할 관계 이름을 입력해 주세요.');return;}const saved=new Set(safeGet(WE_RELATIONS_KEY,[]));saved.add(val);localStorage.setItem(WE_RELATIONS_KEY,JSON.stringify([...saved]));weRelationOptions();document.getElementById('weBundleRelation').value=val;document.getElementById('weBundleCustom').hidden=true;inp.value='';notify('새로운 관계가 추가됐어요.');});
document.getElementById('weBundleGoPick').addEventListener('click',()=>{if(!document.getElementById('weBundleTitle').value.trim()){notify('묶음 이름을 입력해 주세요.');document.getElementById('weBundleTitle').focus();return;}if(document.getElementById('weBundleRelation').value==='custom'){notify('새 관계를 추가하거나 기존 관계를 선택해 주세요.');return;}show('weBundlePick')});
['weBundleStartDate','weBundleEndDate'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{
 const a=document.getElementById('weBundleStartDate').value,b=document.getElementById('weBundleEndDate').value;
 if(weCheckRange(a,b))renderWeBundlePick();
}));
document.getElementById('weBundleDateClear').addEventListener('click',()=>{document.getElementById('weBundleStartDate').value='';document.getElementById('weBundleEndDate').value='';renderWeBundlePick();});
document.getElementById('weBundleConfirm').addEventListener('click',()=>{if(!weMemorySelected.size){notify('묶을 기록을 하나 이상 골라 주세요.');return;}const b={title:document.getElementById('weBundleTitle').value.trim(),relation:document.getElementById('weBundleRelation').value,posts:[...weMemorySelected],created:new Date().toISOString()};try{const old=weGetBundles();old.push(b);localStorage.setItem(WE_BUNDLE_KEY,JSON.stringify(old));weMemoryBundle=b;show('weBundleView');notify('기억 묶음을 만들었어요!');}catch{notify('저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.')}});

const initialHash=location.hash;restore();

// M3: 홈에서는 온미/온룸 편집기와 정확히 같은 저장 키를 읽고 레이어를 재사용합니다.
const onroomKey='saion-onroom-v12';
const onroomDefault={hair:0,face:0,outfit:0,background:0,mood:0};
const two=n=>String(n).padStart(2,'0');
function readOnroom(){let v={...onroomDefault};try{let saved=JSON.parse(localStorage.getItem(onroomKey)||'null');if(saved)for(const k of Object.keys(v)){if(Number.isInteger(saved[k]))v[k]=saved[k]}}catch{}return v}
function renderHome(){
 const data=readOnroom(), base='onroom/assets/';
 const file=(t,n,ext)=>base+t+'/'+two(n+1)+'.'+ext;
 const img=(id,src,visible=true)=>{const node=document.getElementById(id);node.style.display=visible?'block':'none';if(visible)node.src=src;};
 img('homeBg',base+'backgrounds/bg_'+two(Math.max(0,data.background)+1)+'.jpg');
 img('homeHairBack',file('hair/back',data.hair,'svg'),data.hair>=0);
 img('homeOutfit',file('outfits',data.outfit,'svg'),data.outfit>=0);
 img('homeFace',file('faces',data.face,'svg'),data.face>=0);
 img('homeHairFront',file('hair/front',data.hair,'svg'),data.hair>=0);
 img('homeMood',base+'moods/mood_'+two(Math.max(0,data.mood)+1)+'.png?v=m9');
 let p=null;try{p=JSON.parse(localStorage.getItem(KEY)||'null')}catch{};
 document.getElementById('homeGreeting').textContent=(p?.nickname?p.nickname+'님, ':'')+'오늘도 나에게 ON';
 const selected=localStorage.getItem('saion.m3.home.feeling');
 document.querySelectorAll('[data-feeling]').forEach(b=>{b.classList.toggle('selected',b.dataset.feeling===selected);b.setAttribute('aria-pressed',String(b.dataset.feeling===selected))});
}
document.getElementById('homeBack').addEventListener('click',()=>show('profile'));
document.getElementById('homeSettings').addEventListener('click',()=>{settingsOrigin='home';show('settings')});
document.getElementById('homeEditRoom').addEventListener('click',()=>openOnroom('hair'));
document.getElementById('homeInbox').addEventListener('click',()=>goYouInbox('home'));
document.getElementById('homeRecord').addEventListener('click',()=>show('record'));
document.getElementById('homeOndi').addEventListener('click',()=>show('bamboo'));
document.getElementById('homeCalendar').addEventListener('click',()=>{calendarSelected=localToday();calendarCursor=monthOf(calendarSelected);show('calendar')});
document.querySelectorAll('[data-feeling]').forEach(b=>b.addEventListener('click',()=>{
 localStorage.setItem('saion.m3.home.feeling',b.dataset.feeling);renderHome();notify(b.dataset.feeling+' 감정등이 선택됐어요. 기록하기를 눌러주세요.');
}));
// 홈에서 온룸 편집 후에는 저장 시 홈으로 복귀합니다.

// M4: 개인 감정은 가족·그룹에 공유하지 않습니다. 기록과 대나무숲은 별도 저장 키를 사용합니다.
const journalKey='saion.m4.private.journal';
const bambooKey='saion.m4.private.bamboo';
function safeGet(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function selectedMood(){return localStorage.getItem('saion.m3.home.feeling')||''}
function renderRecord(){
 const mood=selectedMood();
 document.getElementById('recordFeelingText').textContent=mood?`선택한 감정등: ${mood}`:'감정등을 선택하지 않았어요. 홈에서 선택해 주세요.';
 const today=new Date().toLocaleDateString('sv-SE');
 const saved=safeGet(journalKey,[]).find(r=>r.date===today);
 const textarea=document.getElementById('recordNote');
 textarea.value=saved?.note||'';
 document.getElementById('recordCount').textContent=textarea.value.length;
 document.getElementById('recordSaveStatus').textContent=saved?'오늘 기록이 저장되어 있어요. 수정할 수 있어요.':'';
}
// M5: 기존 M4 단일 입력형 데이터도 보존하면서 채팅 메시지로 업그레이드합니다.
function loadChat(){
 const stored=safeGet(bambooKey,{});
 const messages=Array.isArray(stored.messages)?stored.messages:[];
 return messages.flatMap(m=>{
  if(!m||typeof m!=='object')return [];
  const text=String(m.text??m.content??'').trim();
  return text?[{role:m.role==='ondi'?'ondi':'user',text:text.slice(0,500),at:m.at||m.createdAt||new Date().toISOString()}]:[];
 });
}
function writeChat(messages,draft=''){
 localStorage.setItem(bambooKey,JSON.stringify({messages:messages.slice(-250),draft}));
}
function chatTime(value){
 const d=new Date(value);
 return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'});
}
function addChatBubble(item){
 const wrap=document.createElement('div');wrap.className='chat-row '+(item.role==='user'?'mine':'theirs');
 if(item.role==='ondi'){
  const avatar=document.createElement('img');avatar.className='chat-avatar';avatar.src='assets/record-ondi.png';avatar.alt='';wrap.appendChild(avatar);
 }
 const block=document.createElement('div');block.className='chat-block';
 if(item.role==='ondi'){
  const name=document.createElement('div');name.className='chat-name';name.textContent='온디';block.appendChild(name);
 }
 const line=document.createElement('div');line.className='chat-bubble-line';
 const bubble=document.createElement('div');bubble.className='chat-bubble';bubble.textContent=item.text;
 const time=document.createElement('time');time.className='chat-time';time.textContent=chatTime(item.at);
 if(item.role==='user'){line.append(time,bubble)}else{line.append(bubble,time)}
 block.appendChild(line);wrap.appendChild(block);
 return wrap;
}
function refreshChat(){
 const node=document.getElementById('chatMessages');node.replaceChildren();
 const messages=loadChat();
 if(messages.length===0){node.appendChild(addChatBubble({role:'ondi',text:'안녕하세요! 저는 온디예요. 🌱\n여기는 우리 둘만의 대나무숲이에요. 오늘은 어떤 이야기를 나누고 싶으세요?',at:new Date().toISOString()}))}
 else messages.forEach(m=>node.appendChild(addChatBubble(m)));
 const thread=document.getElementById('chatThread');requestAnimationFrame(()=>thread.scrollTop=thread.scrollHeight);
}
function syncChatDraft(){
 const textarea=document.getElementById('bambooNote');
 document.getElementById('bambooCount').textContent=textarea.value.length+' / 500';
 textarea.style.height='auto';textarea.style.height=Math.min(96,Math.max(38,textarea.scrollHeight))+'px';
}
function renderBamboo(){
 const old=safeGet(bambooKey,{});
 const textarea=document.getElementById('bambooNote');textarea.value=typeof old.draft==='string'?old.draft.slice(0,500):'';
 syncChatDraft();refreshChat();
}
function demoReply(text){
 const t=text.replace(/\s+/g,' ').trim();
 if(/죽고 싶|자살|스스로 해치|극단적 선택/.test(t)) return '지금 많이 힘든 마음이 느껴져요. 혼자 견디지 않아도 돼요. 당장 위험하다면 119 또는 112에 연락하고, 가까운 사람에게 곁에 있어 달라고 말해 주세요. 지금 안전한 곳에 계신가요?';
 if(/고마|감사|행복|좋았|기쁘|즐거/.test(t)) return '기분 좋은 순간을 들려줘서 저도 좋아요. 💛\n오늘 그중에서 가장 오래 기억하고 싶은 장면은 뭐였나요?';
 if(/화나|짜증|억울|서운|다퉜|속상/.test(t)) return '그런 일이 있었다면 마음이 복잡했겠어요. 🌿\n어떤 순간에 가장 서운하거나 화가 났는지 조금 더 들려주실래요?';
 if(/불안|걱정|무서|두려|긴장/.test(t)) return '걱정이 머릿속에 가득한 느낌일 수 있겠어요.\n지금 가장 크게 신경 쓰이는 한 가지는 무엇인가요?';
 if(/힘들|피곤|지쳐|우울|슬프|외로|눈물/.test(t)) return '오늘 많이 지치셨군요. 여기서는 서둘러 괜찮아질 필요 없어요. 🌱\n오늘 마음이 가장 무거웠던 순간부터 이야기해볼까요?';
 if(/엄마|아빠|가족|친구|연인/.test(t)) return '소중한 사람에 관한 이야기군요. 💛\n그 사람에게 전하지 못한 마음이 있다면 여기서 편하게 말해도 괜찮아요.';
 const replies=[
  '이야기해 줘서 고마워요. 🌱\n그때 어떤 마음이 들었는지 조금 더 들려주실래요?',
  '온디가 듣고 있어요. 💛\n지금 가장 필요한 건 공감일까요, 아니면 생각을 함께 정리하는 걸까요?',
  '그 순간이 마음에 남아 있군요.\n여기서는 편한 속도로 이어서 이야기해도 좋아요.'
 ];
 return replies[loadChat().filter(m=>m.role==='user').length%replies.length];
}
document.getElementById('recordBack').addEventListener('click',()=>show('home'));
document.getElementById('bambooBack').addEventListener('click',()=>show('record'));
document.getElementById('recordNote').addEventListener('input',e=>document.getElementById('recordCount').textContent=e.target.value.length);
document.getElementById('recordSave').addEventListener('click',()=>{
 const note=document.getElementById('recordNote').value.trim();
 const mood=selectedMood();
 if(!mood){notify('먼저 홈에서 감정등을 선택해 주세요.');return}
 if(!note){notify('오늘의 마음을 짧게 적어 주세요.');document.getElementById('recordNote').focus();return}
 const date=localToday();
 const records=safeGet(journalKey,[]).filter(r=>r.date!==date);
 records.push({date,mood,note,updatedAt:new Date().toISOString()});
 try{localStorage.setItem(journalKey,JSON.stringify(records));calendarSelected=date;calendarCursor=monthOf(date);show('calendar');notify('오늘의 마음을 저장했어요! 캘린더에서 확인해 보세요.')}catch{notify('저장하지 못했어요. 브라우저 설정을 확인해 주세요.')}
});
document.getElementById('recordToBamboo').addEventListener('click',()=>show('bamboo'));
document.getElementById('bambooToRecheck').addEventListener('click',()=>goRecheck('bamboo'));
document.getElementById('bambooNote').addEventListener('input',e=>{
 syncChatDraft();
 try{writeChat(loadChat(),e.target.value)}catch{}
});
document.querySelectorAll('[data-suggestion]').forEach(button=>button.addEventListener('click',()=>{
 const textarea=document.getElementById('bambooNote');
 const phrase=button.dataset.suggestion;
 textarea.value=phrase==='오늘 있었던 일'?'오늘 있었던 일을 이야기하고 싶어요. ':phrase==='지금 느끼는 감정'?'지금 저는 이런 기분이에요. ':'요즘 고민이 있어요. ';
 textarea.dispatchEvent(new Event('input'));textarea.focus();
}));
document.getElementById('bambooPrivacy').addEventListener('click',()=>notify('대나무숲 메시지는 이 기기의 브라우저에만 저장되며 가족과 자동 공유되지 않아요.'));
document.getElementById('bambooChatForm').addEventListener('submit',e=>{
 e.preventDefault();
 const textarea=document.getElementById('bambooNote');
 const content=textarea.value.trim();if(!content)return;
 const now=new Date().toISOString();
 const messages=loadChat();messages.push({role:'user',text:content,at:now});
 const reply={role:'ondi',text:demoReply(content),at:new Date().toISOString()};
 messages.push(reply);
 try{writeChat(messages,'');textarea.value='';syncChatDraft();refreshChat();textarea.focus()}
 catch{notify('메시지를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.')}
});
document.getElementById('bambooNote').addEventListener('keydown',e=>{
 if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();document.getElementById('bambooChatForm').requestSubmit()}
});

// M6 | 감정 캘린더. M4/M5와 동일한 비공개 저장 키를 읽습니다.
// 테스트 날짜는 기기의 현지 날짜 기준입니다. 기존 기록은 수정·삭제하지 않습니다.
const moodPalette={'행복해요':'#ed91a8','무난해요':'#f3bf55','활기차요':'#a8c981','화가나요':'#ef8476','우울해요':'#bca3df','지쳐요':'#bcb8b3'};
function localToday(){const d=new Date();return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`}
function monthOf(iso){const [y,m]=iso.split('-').map(Number);return new Date(y,m-1,1)}
let calendarCursor=monthOf(localToday());
let calendarSelected=localToday();
function readJournal(){const records=safeGet(journalKey,[]);return Array.isArray(records)?records:[]}
function renderCalendar(){
 const year=calendarCursor.getFullYear(),month=calendarCursor.getMonth();
 document.getElementById('calendarMonthLabel').textContent=`${year}년 ${month+1}월`;
 const entries=readJournal();const byDay=new Map(entries.map(r=>[r.date,r]));
 const board=document.getElementById('calendarDays');board.replaceChildren();
 const weekday=new Date(year,month,1).getDay();
 const days=new Date(year,month+1,0).getDate();
 for(let i=0;i<weekday;i++){const blank=document.createElement('span');blank.className='calendar-empty';board.append(blank)}
 for(let d=1;d<=days;d++){
  const date=`${year}-${two(month+1)}-${two(d)}`;const record=byDay.get(date);
  const button=document.createElement('button');button.type='button';button.className='calendar-day';
  button.setAttribute('role','gridcell');button.setAttribute('aria-label',`${month+1}월 ${d}일${record?' '+record.mood+' 기록 있음':' 기록 없음'}`);
  button.setAttribute('aria-pressed',String(date===calendarSelected));
  if(date===calendarSelected)button.classList.add('active');
  if(date===localToday())button.classList.add('today');
  const number=document.createElement('span');number.textContent=d;number.className='calendar-day-num';button.append(number);
  const dot=document.createElement('span');dot.className='calendar-dot';
  if(record){dot.style.setProperty('--mood-color',moodPalette[record.mood]||'#c9b9a2');button.classList.add('has-record')}
  else dot.classList.add('empty');
  button.append(dot);button.addEventListener('click',()=>{calendarSelected=date;renderCalendar()});board.append(button);
 }
 const record=byDay.get(calendarSelected);
 const [sy,sm,sd]=calendarSelected?calendarSelected.split('-').map(Number):[year,month+1,0];
 document.getElementById('calendarDetailHeading').textContent=calendarSelected?`${sm}월 ${sd}일 · ${record?record.mood:'기록 없음'}`:'날짜를 선택해 주세요';
 const content=document.getElementById('calendarDetailContent');content.replaceChildren();
 const edit=document.getElementById('calendarEdit');edit.hidden=true;
 if(record){
   const chip=document.createElement('div');chip.className='calendar-feeling-tag';
   const dot=document.createElement('span');dot.className='calendar-detail-dot';dot.style.background=moodPalette[record.mood]||'#c9b9a2';
   chip.append(dot,document.createTextNode(record.mood));
   const note=document.createElement('p');note.className='calendar-note';note.textContent=record.note||'(작성된 글이 없어요)';
   content.append(chip,note);
   if(calendarSelected===localToday())edit.hidden=false;
 } else {
   content.textContent='이날은 아직 기록이 없어요. 감정을 기록하면 날짜 아래에 작은 색 점이 나타나요.';
 }
}
document.getElementById('calendarPrev').addEventListener('click',()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);calendarSelected='';renderCalendar()});
document.getElementById('calendarNext').addEventListener('click',()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);calendarSelected='';renderCalendar()});
document.getElementById('calendarBack').addEventListener('click',()=>show('home'));
document.getElementById('calendarHome').addEventListener('click',()=>show('home'));
document.getElementById('calendarSettings').addEventListener('click',()=>{settingsOrigin='calendar';show('settings')});
document.getElementById('calendarEdit').addEventListener('click',()=>show('record'));

document.querySelectorAll('[data-goto]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.goto)));


// M10 회원가입: 실제 회원 서버가 아닌 화면 체험용 흐름입니다. 비밀번호는 보관하지 않습니다.
const signupKey='saion.m10.signup.demo';
const alertsKey='saion.m10.alerts.preferences';
const $=id=>document.getElementById(id);
function goTerms(from){policyOrigin=from;show('terms')}
function goPrivacy(from){privacyOrigin=from;show('privacy')}
$('signupBackLogin').addEventListener('click',()=>show('login'));
$('agreeAll').addEventListener('change',e=>{document.querySelectorAll('.required-consent').forEach(c=>c.checked=e.target.checked)});
document.querySelectorAll('.required-consent').forEach(c=>c.addEventListener('change',()=>{$('agreeAll').checked=Array.from(document.querySelectorAll('.required-consent')).every(el=>el.checked)}));
$('signupViewTerms').addEventListener('click',()=>goTerms('signup'));
$('signupViewPrivacy').addEventListener('click',()=>goPrivacy('signup'));
$('signupForm').addEventListener('submit',e=>{
 e.preventDefault();
 const nick=$('signupNickname').value.trim(), email=$('signupEmail').value.trim();
 const pw=$('signupPassword').value, confirm=$('signupConfirm').value;
 if(!nick){notify('닉네임을 입력해 주세요.');$('signupNickname').focus();return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notify('이메일 형식을 확인해 주세요.');$('signupEmail').focus();return}
 if(pw.length<8){notify('비밀번호를 8자 이상 입력해 주세요.');$('signupPassword').focus();return}
 if(pw!==confirm){notify('비밀번호가 일치하지 않아요.');$('signupConfirm').focus();return}
 if(!$('agreeTerms').checked||!$('agreePrivacy').checked){notify('필수 약관에 동의해 주세요.');return}
 try{localStorage.setItem(signupKey,JSON.stringify({nickname:nick,email,consents:{terms:true,privacy:true},createdAt:new Date().toISOString()}))}catch{notify('저장에 실패했어요.');return}
 $('signupPassword').value='';$('signupConfirm').value='';show('profile');nickname.value=nick;
 notify('가입 체험이 완료됐어요! 프로필을 설정해 주세요.');
});
$('termsBack').addEventListener('click',()=>show(policyOrigin==='signup'?'signup':'settings'));
$('termsConfirm').addEventListener('click',()=>show(policyOrigin==='signup'?'signup':'settings'));
$('termsPrivacy').addEventListener('click',()=>goPrivacy('terms'));
$('expandTerms').addEventListener('click',()=>{$('policyPaper').innerHTML='<div class="policy-paper-icon">▤</div><h2>서비스 이용약관</h2><p>서비스에서 서로를 존중하며 이용하고, 감정 기록은 본인만 열람한다는 원칙을 안내하는 시안입니다.</p><p class="policy-placeholder">정식 약관은 서비스 출시 전에 별도 확정되어야 합니다.</p>'});
$('expandConsent').addEventListener('click',()=>{const data=safeGet(signupKey,null);$('policyPaper').replaceChildren();const h=document.createElement('h2');h.textContent='동의 내역';const p=document.createElement('p');p.textContent=data?.consents?.terms?'서비스 이용약관 · 개인정보 처리방침 모두 동의함':'현재 브라우저에 저장된 동의 내역이 없어요.';$('policyPaper').append(h,p)});
$('settingsBack').addEventListener('click',()=>show(settingsOrigin));
$('settingsProfile').addEventListener('click',()=>show('profile'));
$('settingsAlerts').addEventListener('click',()=>show('alerts'));
$('settingsPrivacy').addEventListener('click',()=>goPrivacy('settings'));
$('settingsTerms').addEventListener('click',()=>goTerms('settings'));
$('settingsReturnHome').addEventListener('click',()=>show('home'));
$('privacyBack').addEventListener('click',()=>show(privacyOrigin==='signup'?'signup':privacyOrigin==='terms'?'terms':'settings'));
$('privacySave').addEventListener('click',()=>show(privacyOrigin==='signup'?'signup':privacyOrigin==='terms'?'terms':'settings'));
$('privacyPolicy').addEventListener('click',()=>{notify('개인정보는 시연용으로 이 브라우저에만 저장돼요. 실제 처리방침은 출시 전에 별도 작성이 필요해요.')});
$('privacyConsents').addEventListener('click',()=>{policyOrigin='settings';goTerms('settings');$('expandConsent').click()});
$('disclosure').addEventListener('change',()=>{localStorage.setItem('saion.m10.privacy.disclosure','private');notify('개인 감정 기록은 비공개로 유지돼요.')});
$('alertsBack').addEventListener('click',()=>show('settings'));
$('previewRecheck').addEventListener('click',()=>goRecheck('alerts'));
$('quietToggle').addEventListener('click',()=>{const expanded=$('quietToggle').getAttribute('aria-expanded')==='true';$('quietToggle').setAttribute('aria-expanded',String(!expanded));$('quietPanel').hidden=expanded});
function restoreAlerts(){
 const p=safeGet(alertsKey,{});
 for(const [id,key] of [['alertHeart','heart'],['alertGroup','group'],['alertRecheck','recheck']]) $(id).checked=p[key]!==false;
 $('alertAll').checked=['alertHeart','alertGroup','alertRecheck'].every(id=>$(id).checked);
 $('reminderTime').value=p.time||'16:00';$('quietEnabled').checked=p.quiet===true;
 $('quietFrom').value=p.from||'22:00';$('quietTo').value=p.to||'08:00';
}
$('alertAll').addEventListener('change',e=>{document.querySelectorAll('.alert-item').forEach(c=>c.checked=e.target.checked)});
document.querySelectorAll('.alert-item').forEach(c=>c.addEventListener('change',()=>{$('alertAll').checked=Array.from(document.querySelectorAll('.alert-item')).every(el=>el.checked)}));
$('alertsSave').addEventListener('click',()=>{
 const p={heart:$('alertHeart').checked,group:$('alertGroup').checked,recheck:$('alertRecheck').checked,time:$('reminderTime').value,quiet:$('quietEnabled').checked,from:$('quietFrom').value,to:$('quietTo').value};
 localStorage.setItem(alertsKey,JSON.stringify(p));show('settings');notify('알림 설정이 저장됐어요. 실제 알림 발송은 아직 연결 전이에요.');
});


// M11: 기분 다시 묻기 -> 3갈래 분기 시나리오
function latestJournalEntry(){const records=readJournal().slice().sort((a,b)=>String(b.updatedAt||b.date).localeCompare(String(a.updatedAt||a.date)));return records[0]||null}
function latestUserChat(){const msgs=loadChat().filter(m=>m.role==='user');return msgs[msgs.length-1]||null}
function latestSummaryText(){const journal=latestJournalEntry();if(journal?.note)return journal.note;const chat=latestUserChat();if(chat?.text)return chat.text;return '오늘 마음을 차분히 돌아보고 있어요.'}
function renderRecheck(){const prefs=safeGet(alertsKey,{});const label=document.getElementById('recheckReminderText');label.textContent=`마음 다시 묻기 · ${formatReminderTime(prefs.time||'16:00')}`;}
function renderBetter(){document.getElementById('betterSummary').textContent=latestSummaryText();}
function renderShare(){document.getElementById('shareSummary').textContent=latestSummaryText();document.querySelectorAll('.recipient').forEach(btn=>btn.classList.toggle('selected',btn.dataset.recipient===selectedRecipient));}
function renderVoicePlayer(){voiceState.current=0;voiceState.playing=false;updateVoiceUI();}
function renderBreathePlayer(){breatheState.remaining=180;breatheState.playing=true;updateBreatheUI();startBreatheDemo();}

document.getElementById('recheckBack').addEventListener('click',()=>show(recheckOrigin==='alerts'?'alerts':'bamboo'));
document.getElementById('recheckSettings').addEventListener('click',()=>{settingsOrigin='recheck';show('settings')});
document.getElementById('optionBetter').addEventListener('click',()=>show('better'));
document.getElementById('optionSame').addEventListener('click',()=>show('voiceRecommend'));
document.getElementById('optionHarder').addEventListener('click',()=>show('breatheRecommend'));

document.getElementById('betterBack').addEventListener('click',()=>show('recheck'));
document.getElementById('betterSettings').addEventListener('click',()=>{settingsOrigin='better';show('settings')});
document.getElementById('goShareFeeling').addEventListener('click',()=>show('share'));
document.getElementById('betterStay').addEventListener('click',()=>{show('home');notify('오늘 마음을 잘 돌봤어요.');});

document.getElementById('shareBack').addEventListener('click',()=>show('better'));
document.getElementById('shareSettings').addEventListener('click',()=>{settingsOrigin='share';show('settings')});
document.querySelectorAll('.recipient[data-recipient]').forEach(btn=>btn.addEventListener('click',()=>{selectedRecipient=btn.dataset.recipient;renderShare();}));
document.getElementById('addRecipient').addEventListener('click',()=>notify('연락처 추가는 다음 단계에서 연결할게요.'));
document.getElementById('sendFeeling').addEventListener('click',()=>{if(!selectedRecipient){notify('마음을 전할 대상을 선택해 주세요.');return;} notify(`${selectedRecipient}에게 마음을 보내는 흐름을 체험했어요.`);show('home');});

document.getElementById('voiceRecommendBack').addEventListener('click',()=>show('recheck'));
document.getElementById('voiceRecommendSettings').addEventListener('click',()=>{settingsOrigin='voiceRecommend';show('settings')});
document.getElementById('openVoicePlayer').addEventListener('click',()=>show('voicePlayer'));
document.getElementById('voiceOtherTips').addEventListener('click',()=>show('breatheRecommend'));

document.getElementById('voicePlayerBack').addEventListener('click',()=>show('voiceRecommend'));
document.getElementById('voicePlayerSettings').addEventListener('click',()=>{settingsOrigin='voicePlayer';show('settings')});
const voiceState={duration:92,current:0,playing:false,timer:null};
function formatSecs(sec){const s=Math.max(0,Math.floor(sec));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function updateVoiceUI(){const fill=document.getElementById('voiceTrackFill');fill.style.width=`${(voiceState.current/voiceState.duration)*100}%`;document.getElementById('voiceTimeLabel').textContent=`${formatSecs(voiceState.current)} / ${formatSecs(voiceState.duration)}`;const symbol=voiceState.playing?'❚❚':'▶';document.getElementById('voicePlayPause').textContent=symbol;document.getElementById('voiceMiniPlay').textContent=symbol;}
function startVoiceDemo(){if(voiceState.timer)clearInterval(voiceState.timer);voiceState.playing=true;updateVoiceUI();voiceState.timer=setInterval(()=>{voiceState.current++;if(voiceState.current>=voiceState.duration){voiceState.current=voiceState.duration;stopVoiceDemo(false);}updateVoiceUI();},1000);}
function stopVoiceDemo(resetPlay=true){if(voiceState.timer)clearInterval(voiceState.timer);voiceState.timer=null;if(resetPlay)voiceState.playing=false;updateVoiceUI();}
function toggleVoiceDemo(){voiceState.playing?stopVoiceDemo():startVoiceDemo();}
document.getElementById('voicePlayPause').addEventListener('click',toggleVoiceDemo);
document.getElementById('voiceMiniPlay').addEventListener('click',toggleVoiceDemo);
document.getElementById('voiceBack15').addEventListener('click',()=>{voiceState.current=Math.max(0,voiceState.current-15);updateVoiceUI();});
document.getElementById('voiceForward15').addEventListener('click',()=>{voiceState.current=Math.min(voiceState.duration,voiceState.current+15);updateVoiceUI();});

document.getElementById('breatheRecommendBack').addEventListener('click',()=>show('recheck'));
document.getElementById('breatheRecommendSettings').addEventListener('click',()=>{settingsOrigin='breatheRecommend';show('settings')});
document.getElementById('openBreathePlayer').addEventListener('click',()=>show('breathePlayer'));
document.getElementById('breatheRest').addEventListener('click',()=>{show('home');notify('조금 쉬어가도 괜찮아요.');});

document.getElementById('breathePlayerBack').addEventListener('click',()=>show('breatheRecommend'));
document.getElementById('breathePlayerSettings').addEventListener('click',()=>{settingsOrigin='breathePlayer';show('settings')});
const breatheState={remaining:180,playing:false,timer:null};
function updateBreatheUI(){
  const timeEl=document.getElementById('breatheTimeLabel'); if(timeEl) timeEl.textContent=formatSecs(breatheState.remaining);
  const btn=document.getElementById('breathePlayPause'); if(btn) btn.textContent='';
  const live=document.getElementById('breatheLiveIndicator'); if(live) live.textContent=breatheState.playing ? '진행 중' : '일시정지';
  const circle=document.getElementById('breatheCircle');
  if(circle){const progress=(180-breatheState.remaining)/180;circle.style.setProperty('--breath-progress',progress.toFixed(3));}
}
function startBreatheDemo(){if(breatheState.timer)clearInterval(breatheState.timer);breatheState.playing=true;updateBreatheUI();breatheState.timer=setInterval(()=>{if(!breatheState.playing)return;breatheState.remaining=Math.max(0,breatheState.remaining-1);if(breatheState.remaining===0){stopBreatheDemo();notify('3분 호흡이 끝났어요. 수고했어요.');}updateBreatheUI();},1000);}
function stopBreatheDemo(){if(breatheState.timer)clearInterval(breatheState.timer);breatheState.timer=null;breatheState.playing=false;updateBreatheUI();}
function toggleBreatheDemo(){if(breatheState.playing){breatheState.playing=false;stopBreatheDemo();}else{startBreatheDemo();}}
document.getElementById('breathePlayPause').addEventListener('click',toggleBreatheDemo);


// M23: YOU 보내기 - 받는 사람 선택 → 배경/문구 → 선택 음성 → 감정 선택 → 최종 확인
const youDemoOutboxKey='saion.m23.you.demo.outbox';
const youDraftDefault=()=>({recipient:'민서',background:'tulip',message:'오늘 함께해 줘서 고마워.',voice:false,emotion:'행복해요'});
let youDraft=youDraftDefault();
const youBackgroundNames={tulip:'튤립',sunset:'노을 하늘',desk:'책과 머그컵',cat:'잠든 고양이'};

const youContactsKey='saion.m28.you.contacts';
const youDefaultContacts=[{name:'민서',relation:'친구'},{name:'엄마',relation:'가족'},{name:'민수',relation:'친구'}];
function readYouContacts(){const c=safeGet(youContactsKey,null);return Array.isArray(c)&&c.length?c:youDefaultContacts.slice();}
function renderYouContactList(){
 const list=document.getElementById('youPersonList');list.replaceChildren();
 const contacts=readYouContacts();
 for(const c of contacts){
  const button=document.createElement('button');button.type='button';button.className='you-person-card';button.dataset.youRecipient=c.name;button.setAttribute('aria-pressed',String(youDraft.recipient===c.name));
  const avatar=document.createElement('span');avatar.className='avatar avatar-minseo';avatar.textContent=c.name.slice(0,1);
  const label=document.createElement('span');label.className='label-wrap';const strong=document.createElement('strong');strong.textContent=c.name;
  const relation=document.createElement('small');relation.textContent=c.relation||'가족·친구';label.append(strong,relation);
  const dot=document.createElement('span');dot.className='radio-dot';dot.setAttribute('aria-hidden','true');button.append(avatar,label,dot);list.append(button);
 }
}
// MediaRecorder: real microphone capture; IndexedDB preserves the blob after reload.
const youAudio={recorder:null,stream:null,blob:null,url:null,timeout:null};
let detailAudioUrl=null;
function clearYouAudio(){
 if(youAudio.recorder?.state==='recording')youAudio.recorder.stop();
 if(youAudio.stream)youAudio.stream.getTracks().forEach(t=>t.stop());
 if(youAudio.timeout)clearTimeout(youAudio.timeout);
 if(youAudio.url)URL.revokeObjectURL(youAudio.url);
 youAudio.recorder=null;youAudio.stream=null;youAudio.blob=null;youAudio.url=null;youAudio.timeout=null;youDraft.voice=false;
}
async function startRecording(){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){notify('마이크는 HTTPS 또는 localhost에서만 사용 가능해요.');return}
 try{
  clearYouAudio();const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const rec=new MediaRecorder(stream);const chunks=[];youAudio.stream=stream;youAudio.recorder=rec;
  rec.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data)};
  rec.onstop=()=>{
   const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
   stream.getTracks().forEach(t=>t.stop());youAudio.stream=null;youAudio.recorder=null;
   if(blob.size){youAudio.blob=blob;youAudio.url=URL.createObjectURL(blob);youDraft.voice=true}
   renderYouVoice();
  };
  rec.start();youAudio.timeout=setTimeout(()=>{if(rec.state==='recording'){rec.stop();notify('최대 2분 녹음을 마쳤어요.')}},120000);renderYouVoice();
 }catch(err){console.error(err);notify('녹음을 시작할 수 없어요. 마이크 권한을 확인해 주세요.');}
}
function stopRecording(){if(youAudio.recorder?.state==='recording'){youAudio.recorder.stop();if(youAudio.timeout)clearTimeout(youAudio.timeout);}}
function openYouAudioDb(){return new Promise((res,rej)=>{const request=indexedDB.open('saion-you-audio-m28',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('clips'))request.result.createObjectStore('clips');};request.onsuccess=()=>res(request.result);request.onerror=()=>rej(request.error);});}
async function putYouAudio(id,blob){const db=await openYouAudioDb();return new Promise((res,rej)=>{const tx=db.transaction('clips','readwrite');tx.objectStore('clips').put(blob,id);tx.oncomplete=()=>{db.close();res()};tx.onerror=()=>{db.close();rej(tx.error)};});}
async function getYouAudio(id){const db=await openYouAudioDb();return new Promise((res,rej)=>{const tx=db.transaction('clips','readonly');const q=tx.objectStore('clips').get(id);q.onsuccess=()=>{db.close();res(q.result||null)};q.onerror=()=>{db.close();rej(q.error)};});}

function resetYouDraft(){youDraft=youDraftDefault();clearYouAudio();}
function updateBackgroundClass(node,bg){if(!node)return;node.classList.remove('bg-tulip','bg-sunset','bg-desk','bg-cat');node.classList.add('bg-'+bg);}
function updateYouPersonSelection(){document.querySelectorAll('[data-you-recipient]').forEach(btn=>btn.classList.toggle('active',btn.dataset.youRecipient===youDraft.recipient));}
function renderYouCompose(){renderYouContactList();updateYouPersonSelection();}
function renderYouCard(){
 updateYouPersonSelection();
 const recipient=document.getElementById('youCardRecipient'); if(recipient) recipient.textContent=youDraft.recipient;
 const area=document.getElementById('youCardMessage'); if(area && area.value!==youDraft.message) area.value=youDraft.message;
 const previewText=document.getElementById('youCardPreviewText'); if(previewText) previewText.textContent=youDraft.message||'카드 문구를 적어보세요.';
 updateBackgroundClass(document.getElementById('youCardPreview'),youDraft.background);
 document.querySelectorAll('[data-you-bg]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.youBg===youDraft.background));
}
function renderYouVoice(){
 const recipient=document.getElementById('youVoiceRecipient'); if(recipient) recipient.textContent=youDraft.recipient;
 const previewText=document.getElementById('youVoicePreviewText'); if(previewText) previewText.textContent=youDraft.message||'카드 문구를 적어보세요.';
 updateBackgroundClass(document.getElementById('youVoiceCardPreview'),youDraft.background);
 const panel=document.getElementById('youVoicePanelMock');panel.hidden=!youAudio.blob;
 const toggle=document.getElementById('youVoiceToggle');toggle.textContent=youAudio.recorder?.state==='recording'?'■ 녹음 종료':'● 녹음 시작';
 const status=document.getElementById('youRecordStatus');
 status.textContent=youAudio.recorder?.state==='recording'?'녹음 중이에요. 종료 버튼을 눌러 마무리해 주세요.':youAudio.blob?'음성을 녹음했어요. 재생 버튼으로 확인할 수 있어요.':'아직 녹음한 음성이 없어요.';
 const playback=document.getElementById('youVoicePlayback');if(youAudio.url && playback.src!==youAudio.url)playback.src=youAudio.url;
}
function renderYouReview(){
 const recipient=document.getElementById('youReviewRecipient'); if(recipient) recipient.textContent=youDraft.recipient;
 const message=document.getElementById('youReviewMessage'); if(message) message.textContent=youDraft.message||'카드 문구를 적어보세요.';
 updateBackgroundClass(document.getElementById('youReviewCardPreview'),youDraft.background);
 const voice=document.getElementById('youReviewVoice');voice.hidden=!youAudio.blob;
 const audio=document.getElementById('youReviewAudio');if(youAudio.url && audio.src!==youAudio.url)audio.src=youAudio.url;
 document.querySelectorAll('[data-you-emotion]').forEach(btn=>{const checked=btn.dataset.youEmotion===youDraft.emotion;btn.classList.toggle('selected',checked);btn.setAttribute('aria-checked',String(checked));});
}
function goYouReceive(){show('youHistory');}
document.getElementById('youStartSend').addEventListener('click',()=>{renderYouCompose();show('youCompose');});
document.getElementById('youWelcomeReceive').addEventListener('click',()=>show('youHistory'));
document.getElementById('youOpenHistory').addEventListener('click',()=>show('youHistory'));
document.getElementById('youHistoryStartSend').addEventListener('click',()=>{show('youCompose');});
document.getElementById('youHistoryBack').addEventListener('click',()=>show('youInbox'));
document.getElementById('youHistoryBell').addEventListener('click',()=>notify('알림 화면은 다음 단계에서 연결할게요.'));
document.getElementById('youComposeBack').addEventListener('click',()=>show('youInbox'));
document.getElementById('youComposeGoReceive').addEventListener('click',goYouReceive);
document.getElementById('youComposeSettings').addEventListener('click',()=>notify('설정 화면은 다음 단계에서 연결할게요.'));
document.getElementById('youCardBack').addEventListener('click',()=>show('youCompose'));
document.getElementById('youCardSettings').addEventListener('click',()=>notify('설정 화면은 다음 단계에서 연결할게요.'));
document.getElementById('youVoiceBack').addEventListener('click',()=>show('youCard'));
document.getElementById('youVoiceSettings').addEventListener('click',()=>notify('설정 화면은 다음 단계에서 연결할게요.'));
document.getElementById('youReviewBack').addEventListener('click',()=>show('youVoice'));
document.getElementById('youReviewSettings').addEventListener('click',()=>notify('설정 화면은 다음 단계에서 연결할게요.'));

document.getElementById('youPersonList').addEventListener('click',e=>{
 const btn=e.target.closest('[data-you-recipient]');if(!btn)return;
 youDraft.recipient=btn.dataset.youRecipient;renderYouCompose();
});
document.getElementById('youAddContact').addEventListener('click',()=>{const form=document.getElementById('youAddContactForm');form.hidden=!form.hidden; if(!form.hidden)document.getElementById('youNewContactName').focus();});
document.getElementById('youSaveContact').addEventListener('click',()=>{
 const input=document.getElementById('youNewContactName');const name=input.value.trim().slice(0,16);const relation=document.getElementById('youNewContactRelation').value;
 if(!name){notify('추가할 사람 이름을 입력해 주세요.');input.focus();return}
 const contacts=readYouContacts();if(contacts.some(c=>c.name===name)){notify('이미 목록에 있는 이름이에요.');return}
 contacts.push({name,relation});localStorage.setItem(youContactsKey,JSON.stringify(contacts));youDraft.recipient=name;
 input.value='';document.getElementById('youAddContactForm').hidden=true;renderYouCompose();notify(`${name}님을 받는 사람에 추가했어요.`);
});
document.getElementById('youComposeNext').addEventListener('click',()=>{if(!youDraft.recipient){notify('받는 사람을 선택해 주세요.');return;} show('youCard');});
const youCardMessage=document.getElementById('youCardMessage');
youCardMessage.addEventListener('input',()=>{youDraft.message=youCardMessage.value.slice(0,120);renderYouCard();});
document.querySelectorAll('[data-you-bg]').forEach(btn=>btn.addEventListener('click',()=>{youDraft.background=btn.dataset.youBg;renderYouCard();}));
document.getElementById('youCardNext').addEventListener('click',()=>{if(!youDraft.message.trim()){notify('카드에 전할 마음을 적어 주세요.');youCardMessage.focus();return;} show('youVoice');});
document.getElementById('youVoiceToggle').addEventListener('click',()=>youAudio.recorder?.state==='recording'?stopRecording():startRecording());
document.getElementById('youVoiceDelete').addEventListener('click',()=>{clearYouAudio();renderYouVoice();});
document.getElementById('youAudioUpload').addEventListener('change',e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(!file.type.startsWith('audio/')){notify('음성 파일을 선택해 주세요.');return}
 clearYouAudio();youAudio.blob=file;youAudio.url=URL.createObjectURL(file);youDraft.voice=true;renderYouVoice();
});
document.getElementById('youVoiceSkip').addEventListener('click',()=>{if(youAudio.recorder?.state==='recording'){notify('녹음을 먼저 종료해 주세요.');return;}clearYouAudio();show('youReview');});
document.getElementById('youVoiceNext').addEventListener('click',()=>{if(youAudio.recorder?.state==='recording'){notify('녹음을 먼저 종료해 주세요.');return;}show('youReview');});
document.querySelectorAll('[data-you-emotion]').forEach(btn=>btn.addEventListener('click',()=>{youDraft.emotion=btn.dataset.youEmotion;renderYouReview();}));
// M29: 감정등 중심으로 받거나 보낸 모든 마음을 한 목록에 표시
const youEmotionLamps={
 '행복해요':'lamp_01.png','무난해요':'lamp_02.png','활기차요':'lamp_03.png',
 '화가나요':'lamp_04.png','우울해요':'lamp_05.png','지쳐요':'lamp_06.png'
};
const youDemoReceived=[
 {id:'sample-1',at:'2026-11-18T10:24:00',to:'나',from:'민서',direction:'received',emotion:'행복해요',summary:'지수야\n오늘 함께해줘서\n고마워',mode:'text',backgroundKey:'pink-tulips',demoVoice:true},
 {id:'sample-2',at:'2026-11-18T09:10:00',to:'나',from:'수아',direction:'received',emotion:'활기차요',summary:'새로운 아이디어가 떠올랐어! 내 이야기를 들어줘.',mode:'voice',backgroundKey:'sunset',demoVoice:true},
 {id:'sample-3',at:'2026-11-17T20:11:00',to:'나',from:'민수',direction:'received',emotion:'우울해요',summary:'조금 속상한 일이 있었어… 그래도 네가 생각났어.',mode:'photo',backgroundKey:'cat',demoVoice:false}
];
function youHistoryMode(entry){return entry.mode|| (entry.voice?'voice':entry.backgroundKey?'photo':'text')}
function lampOf(emotion){return 'assets/emotion-lamps/'+(youEmotionLamps[emotion]||'lamp_02.png')}
function youFormatDate(value){const d=new Date(value);return Number.isNaN(d.getTime())?'날짜 미상':`${d.getMonth()+1}월 ${d.getDate()}일`}
function youFormatClock(value){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n}
function historyCard(entry){
 const type=youHistoryMode(entry);
 const card=el('button','you-history-card');card.type='button';
 const figure=el('span','you-history-emotion');const img=document.createElement('img');img.src=lampOf(entry.emotion);img.alt=`${entry.emotion} 감정등`;figure.append(img);
 const body=el('span','you-history-body');
 const title=el('span','you-history-title');
 const who=entry.direction==='sent'?`나 → ${entry.to}`:`${entry.from} ←`;
 title.append(el('strong','',who),el('time','',youFormatClock(entry.at)));
 const mood=el('span','you-history-mood',entry.emotion);
 const summary=el('span','you-history-summary',entry.summary);
 body.append(title,mood,summary);
 const right=el('span','you-history-right');
 const dot=el('i','you-history-new');dot.setAttribute('aria-hidden','true');
 const icon=el('span','you-history-type-icon');icon.setAttribute('aria-label',({text:'글',voice:'음성',photo:'사진'}[type]||'글')+' 카드');
 // SVG line icons rather than platform-dependent emojis
 const markup={text:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',voice:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4M8 22h8"/>',photo:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="M4 18l6-6 4 4 3-3 4 4"/>'};
 icon.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${markup[type]||markup.text}</svg>`;
 right.append(dot,icon);card.append(figure,body,right);
 card.addEventListener('click',()=>{
  if(entry.direction==='sent')openSentDetail(entry);
  else openReceivedDetail(entry);
 });
 return card;
}
function renderYouSentList(){
 const board=document.getElementById('youHistoryCards');if(!board)return;
 const sent=safeGet(youDemoOutboxKey,[]).map(e=>({...e,direction:'sent',mode:youHistoryMode(e)}));
 const entries=[...youDemoReceived,...sent].filter(e=>youHistoryFilter==='all'||youHistoryMode(e)===youHistoryFilter)
  .sort((a,b)=>new Date(b.at)-new Date(a.at));
 board.replaceChildren();let lastDate='';
 if(!entries.length){board.append(el('p','you-history-empty','해당하는 마음이 아직 없어요.'));return}
 for(const item of entries){
  const date=youFormatDate(item.at);
  if(date!==lastDate){lastDate=date;const heading=el('h2','you-history-date');heading.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 14h.01M12 14h.01"/></svg>';heading.append(document.createTextNode(date));board.append(heading)}
  board.append(historyCard(item));
 }
}
async function openSentDetail(entry){
 const dialog=document.getElementById('youSentDetailDialog');const art=document.getElementById('youSentDetailArt');
 updateBackgroundClass(art,entry.backgroundKey||'tulip');
 document.getElementById('youSentDetailTo').textContent=`To. ${entry.to} · ${entry.emotion}`;
 document.getElementById('youSentDetailMessage').textContent=entry.summary;
 const audio=document.getElementById('youSentDetailAudio');audio.pause();audio.removeAttribute('src');audio.hidden=true;
 if(entry.audioId){
  try{const blob=await getYouAudio(entry.audioId);if(blob){if(detailAudioUrl)URL.revokeObjectURL(detailAudioUrl);detailAudioUrl=URL.createObjectURL(blob);audio.src=detailAudioUrl;audio.hidden=false;}}
  catch{notify('저장된 음성을 열 수 없어요.');}
 }
 dialog.hidden=false;
}
let lastYouSentRecipient='민서';
function renderYouComplete(){
 const other=lastYouSentRecipient!=='민서';document.getElementById('youCompleteCustomName').hidden=!other;
 document.getElementById('youCompleteTo').textContent=lastYouSentRecipient;
}
document.getElementById('youCompleteBack').addEventListener('click',()=>show('youInbox'));
document.getElementById('youCompleteList').addEventListener('click',()=>show('youHistory'));
document.getElementById('youCompleteYou').addEventListener('click',()=>show('youInbox'));
document.getElementById('youCompleteBell').addEventListener('click',()=>notify('알림 화면은 다음 단계에서 연결할게요.'));
// M37: 이전 이미지형 하단 네비 버튼은 M35에서 제거됨. 전역 네비게이션으로 통일.
// 남아 있는 선택적 버튼이 있을 때만 이벤트를 연결합니다.
document.getElementById('youFooterCurrent')?.addEventListener('click',()=>show('youInbox'));
document.getElementById('youSentDetailClose').addEventListener('click',()=>{document.getElementById('youSentDetailAudio').pause();document.getElementById('youSentDetailDialog').hidden=true;});
document.getElementById('youFinalSend').addEventListener('click',async()=>{
 if(!youDraft.message.trim()){notify('카드 문구를 확인해 주세요.');show('youCard');return}
 const btn=document.getElementById('youFinalSend');btn.disabled=true;btn.textContent='확인 중…';
 const entry={id:'saion-'+Date.now()+'-'+Math.random().toString(36).slice(2),to:youDraft.recipient,summary:youDraft.message.trim(),background:youBackgroundNames[youDraft.background],backgroundKey:youDraft.background,voice:!!youAudio.blob,emotion:youDraft.emotion,at:new Date().toISOString()};
 try{
  if(youAudio.blob){entry.audioId=entry.id;await putYouAudio(entry.audioId,youAudio.blob);}
  const entries=safeGet(youDemoOutboxKey,[]);entries.push(entry);localStorage.setItem(youDemoOutboxKey,JSON.stringify(entries.slice(-100)));
  lastYouSentRecipient=entry.to;resetYouDraft();show('youComplete');
 }catch(err){console.error(err);notify('저장에 실패했어요. 브라우저 저장 설정을 확인해 주세요.');}
 finally{btn.disabled=false;btn.textContent='확인 버튼';}
});

// M30: 받은 마음 상세 - 감정등, 그림 배경, 데모 음성, 마음 담기, 답장하기
const youReceivedSavedKey='saion.m30.you.received.saved';
let youReceivedCurrent=null;
function openReceivedDetail(entry){youReceivedCurrent=entry;show('youReceivedDetail')}
function stopReceivedVoice(){
 if('speechSynthesis' in window)window.speechSynthesis.cancel();
 const btn=document.getElementById('youReceivedAudioPlay');if(btn){btn.textContent='▶';btn.setAttribute('aria-label','음성 재생')}
}
function renderYouReceivedDetail(){
 stopReceivedVoice();const entry=youReceivedCurrent;if(!entry)return;
 document.getElementById('youReceivedLamp').src=lampOf(entry.emotion);
 document.getElementById('youReceivedLamp').alt=entry.emotion+' 감정등';
 document.getElementById('youReceivedTitle').textContent=entry.from+'에게서 온 마음';
 const date=new Date(entry.at);document.getElementById('youReceivedTime').textContent=Number.isNaN(date.getTime())?'날짜 미상':`${date.getMonth()+1}월 ${date.getDate()}일 ${youFormatClock(entry.at)}`;
 document.getElementById('youReceivedMood').textContent=entry.emotion+' ♡';
 document.getElementById('youReceivedMessage').textContent=entry.summary;
 const art=document.getElementById('youReceivedArt');
 const artMap={'pink-tulips':'assets/you-received-pink-tulips.png',tulip:'assets/you-bg-tulip.webp',sunset:'assets/you-bg-sunset.webp',desk:'assets/you-bg-desk.webp',cat:'assets/you-bg-cat.webp'};
 art.src=artMap[entry.backgroundKey]||artMap.tulip;art.alt=(entry.backgroundKey==='pink-tulips'?'분홍 튤립':entry.backgroundKey||'마음카드')+' 배경 그림';
 const box=document.getElementById('youReceivedAudioBox');
 box.hidden=!entry.demoVoice;document.getElementById('youReceivedAudioLength').textContent=entry.id==='sample-1'?'00:18':'데모';
 const saved=safeGet(youReceivedSavedKey,[]).includes(entry.id);
 const save=document.getElementById('youReceivedSave');save.textContent=saved?'♥ 마음 담았어요':'♡ 마음 담기';save.setAttribute('aria-pressed',String(saved));
 document.getElementById('youReceivedScroller').scrollTop=0;
}
document.getElementById('youReceivedBack').addEventListener('click',()=>{stopReceivedVoice();show('youHistory')});
document.getElementById('youReceivedNavYou').addEventListener('click',()=>{stopReceivedVoice();show('youInbox')});
document.getElementById('youReceivedBell').addEventListener('click',()=>notify('알림은 다음 단계에서 연결할게요.'));
document.getElementById('youReceivedAudioPlay').addEventListener('click',()=>{
 if(!youReceivedCurrent?.demoVoice)return;
 if(!('speechSynthesis' in window)){notify('이 브라우저는 시연용 음성 읽어주기를 지원하지 않아요.');return}
 if(window.speechSynthesis.speaking){stopReceivedVoice();return}
 const msg=youReceivedCurrent.id==='sample-1'?'지수야, 오늘 함께해줘서 고마워.':youReceivedCurrent.summary;
 const utterance=new SpeechSynthesisUtterance(msg);utterance.lang='ko-KR';utterance.rate=.85;
 const button=document.getElementById('youReceivedAudioPlay');button.textContent='❚❚';button.setAttribute('aria-label','음성 정지');
 utterance.onend=()=>stopReceivedVoice();utterance.onerror=()=>stopReceivedVoice();
 window.speechSynthesis.speak(utterance);
});
document.getElementById('youReceivedSave').addEventListener('click',()=>{
 if(!youReceivedCurrent)return;const id=youReceivedCurrent.id;const all=new Set(safeGet(youReceivedSavedKey,[]));
 if(all.has(id))all.delete(id);else all.add(id);
 localStorage.setItem(youReceivedSavedKey,JSON.stringify([...all]));renderYouReceivedDetail();
 notify(all.has(id)?'이 마음을 마음의 서랍에 담았어요.':'마음 담기를 취소했어요.');
});
document.getElementById('youReceivedReply').addEventListener('click',()=>{
 if(!youReceivedCurrent)return;const person=youReceivedCurrent.from;
 let contacts=readYouContacts();if(!contacts.some(c=>c.name===person)){contacts.push({name:person,relation:'친구'});localStorage.setItem(youContactsKey,JSON.stringify(contacts))}
 resetYouDraft();youDraft.recipient=person;stopReceivedVoice();show('youCompose');
});

// M18: 화면 본문만 스크롤하게 하고 하단 네비게이션은 화면 프레임 밖으로 움직이지 않게 분리.

function installFixedFooterLayout(){
 document.querySelectorAll('.screen').forEach(screen=>{
  if(screen.classList.contains('chat-screen')||screen.classList.contains('reference-screen')||screen.classList.contains('you-v17-screen')||screen.classList.contains('you-compose-screen')||screen.classList.contains('you-received-detail-screen'))return;
  const nav=Array.from(screen.children).find(el=>el.classList.contains('bottom-nav'));
  if(!nav)return;
  const scroller=document.createElement('div');
  scroller.className='screen-scroll-area';
  for(const node of Array.from(screen.children)){
   if(node!==nav)scroller.appendChild(node);
  }
  screen.insertBefore(scroller,nav);
  screen.classList.add('fixed-footer-screen');
 });
}
installFixedFooterLayout();

// M35: single global bottom navigation, not per-screen variants.
function updateSaionGlobalNav(screen){
 const dock=document.getElementById('saionGlobalNav');
 if(!dock)return;
 dock.hidden=['login','signup'].includes(screen);
 const homeTabs=new Set(['profile','home','record','calendar','settings','privacy','alerts','terms']);
 const youTabs=new Set(['youInbox','youHistory','youCompose','youCard','youVoice','youReview','youComplete','youReceivedDetail','share']);
 const active=['we','weBundleCreate','weBundlePick','weBundleView'].includes(screen)?'we':homeTabs.has(screen)?'home':youTabs.has(screen)?'youInbox':'bamboo';
 for(const btn of dock.querySelectorAll('[data-saion-tab]')){
  const isActive=btn.dataset.saionTab===active;
  btn.classList.toggle('active',isActive);
  if(isActive)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
 }
}
document.querySelectorAll('#saionGlobalNav [data-saion-tab]').forEach(btn=>btn.addEventListener('click',()=>{
 const tab=btn.dataset.saionTab;
 if(tab==='we'){show('we');return;}
 if(tab==='youInbox'){goYouInbox('from-nav');return;}
 show(tab);
}));


// M40: WE 우리의 이야기 — demo social-feed data only. Never pull private journal or ONDI chats.
const WE_BOOKMARK_KEY='saion.m40.we.bookmarks';
const WE_BUNDLE_KEY='saion.m40.we.bundles';
// 관계별 데모 피드: 사용자가 실제 게시한 기록이 아닌 시연용 예시입니다.
const weDemoPosts=[
 {id:'p1',date:'2026-11-07',month:'2026년 11월',group:'엄마와 나',title:'발표를 마친 날의 응원',person:'엄마',mood:'행복해요',types:['text','voice'],photo:'presentation.webp',text:'한 달 동안 정말 고생했어. 네가 자랑스러워.',preview:'엄마의 목소리 · 00:32',count:'글 2 · 목소리 1'},
 {id:'p2',date:'2026-11-02',month:'2026년 11월',group:'엄마와 나',title:'주말 식탁 이야기',person:'엄마',mood:'무난해요',types:['photo'],photo:'kitchen.webp',text:'엄마랑 같이 밥을 만들고 소소한 이야기를 나눴던 따뜻한 주말.',preview:'사진 3',count:'사진 3'},
 {id:'m3',date:'2026-10-23',month:'2026년 10월',group:'엄마와 나',title:'엄마가 챙겨준 따뜻한 차',person:'엄마',mood:'지쳐요',types:['photo','text'],photo:'presentation.webp',text:'힘든 날엔 따뜻한 차 한 잔 마시고 푹 쉬라는 엄마의 메시지.',preview:'엄마의 다정한 한마디',count:'글 1 · 사진 1'},
 {id:'p3',date:'2026-11-01',month:'2026년 11월',group:'민수♥나',title:'산책길에 만난 가을',person:'민수',mood:'활기차요',types:['photo'],photo:'autumn.webp',text:'민수와 노란 낙엽을 밟으며 걸었던 가을 산책. 오늘도 함께 걸어서 좋았어.',preview:'사진 1',count:'사진 1'},
 {id:'l2',date:'2026-11-16',month:'2026년 11월',group:'민수♥나',title:'우리만의 늦은 밤 데이트',person:'민수',mood:'행복해요',types:['text','photo'],photo:'kitchen.webp',text:'늦게 만났지만 같이 먹은 저녁 덕분에 오늘이 특별해졌어. 다음 주에도 만나자 ♥',preview:'함께여서 더 좋았던 저녁',count:'글 1 · 사진 1'},
 {id:'l3',date:'2026-10-28',month:'2026년 10월',group:'민수♥나',title:'서로에게 힘이 되어준 하루',person:'민수',mood:'무난해요',types:['text','voice'],photo:'autumn.webp',text:'오늘도 수고했어. 많이 바빴지? 다음엔 내가 맛있는 거 사줄게.',preview:'민수의 응원 · 시연 음성',count:'글 1 · 목소리 1'},
 {id:'f1',date:'2026-11-19',month:'2026년 11월',group:'절친',title:'친구들과 수다 떨던 오후',person:'수아',mood:'행복해요',types:['photo','text'],photo:'kitchen.webp',text:'끝없이 웃고 수다 떨었던 우리! 다음에는 파자마 파티로 모이자.',preview:'우리끼리 웃음 가득했던 날',count:'사진 2 · 글 1'},
 {id:'f2',date:'2026-11-10',month:'2026년 11월',group:'절친',title:'새 출발을 위한 응원',person:'지수',mood:'활기차요',types:['voice','text'],photo:'presentation.webp',text:'우리 모두 각자 자리에서 잘 해내고 있어! 힘내자!',preview:'지수의 응원 · 시연 음성',count:'글 1 · 목소리 1'},
 {id:'f3',date:'2026-10-19',month:'2026년 10월',group:'절친',title:'가을 단풍 나들이',person:'수아, 지수',mood:'우울해요',types:['photo'],photo:'autumn.webp',text:'기분이 울적한 날 친구들이랑 걸으니 조금은 마음이 가벼워졌어.',preview:'사진 3',count:'사진 3'}
].sort((a,b)=>b.date.localeCompare(a.date));
const weState={mood:'',search:'',group:'all',startDate:'',endDate:'',current:null};
const weDateMatches=(date,start,end)=>(!start||date>=start)&&(!end||date<=end);
function weCheckRange(start,end){if(start&&end&&start>end){notify('종료일은 시작일과 같거나 나중이어야 해요.');return false;}return true;}
const weHtmlSafe=(str)=>String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function weBookmarks(){return new Set(safeGet(WE_BOOKMARK_KEY,[]));}
function weToggleBookmark(id){const set=weBookmarks();if(set.has(id))set.delete(id);else set.add(id);localStorage.setItem(WE_BOOKMARK_KEY,JSON.stringify([...set]));renderWe();notify(set.has(id)?'기억 묶음에 담았어요.':'저장을 취소했어요.');}
function weFiltered(){let term=weState.search.replace(/\s+/g,'').toLowerCase();return weDemoPosts.filter(p=>{
  const corpus=[p.title,p.person,p.group,p.date,p.date.replaceAll('-','.'),p.date.replaceAll('-',''),p.text,p.mood].join(' ').replace(/\s+/g,'').toLowerCase();
  return (!weState.mood||p.mood===weState.mood)&&(!term||corpus.includes(term))&&(weState.group==='all'||p.group===weState.group)&&weDateMatches(p.date,weState.startDate,weState.endDate);
});}
function renderWe(){
 const feed=document.getElementById('weFeedList');if(!feed)return;
 document.querySelectorAll('[data-we-mood]').forEach(b=>{const on=weState.mood===b.dataset.weMood;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 const results=weFiltered(),bookmarks=weBookmarks();
 if(!results.length){feed.innerHTML='<div class="we-no-results">해당 조건의 이야기가 아직 없어요.<br><small>다른 감정등이나 필터를 선택해 보세요.</small></div>';return;}
 let oldMonth='';const parts=[];
 for(const p of results){
  if(p.month!==oldMonth){parts.push(`<h2 class="we-month-title">▦ &nbsp; ${weHtmlSafe(p.month)}</h2>`);oldMonth=p.month;}
  const saved=bookmarks.has(p.id);
  parts.push(`<article class="we-story-card" aria-label="${weHtmlSafe(p.title)}">
    <button type="button" class="we-story-open" data-we-open="${p.id}" aria-label="${weHtmlSafe(p.title)} 상세 보기">
      <img class="we-story-thumb" src="assets/we/${p.photo}" alt="${weHtmlSafe(p.title)}의 추억 사진"/>
      <span class="we-story-info"><time>${p.date.slice(5).replace('-','.')} · ${weHtmlSafe(p.group)}</time><strong>${weHtmlSafe(p.title)}</strong>
      ${p.types.includes('voice')?`<span class="we-audio-preview">▶ &nbsp; ${weHtmlSafe(p.preview)}</span><span class="we-quote">“${weHtmlSafe(p.text)}”</span>`:''}
      <small>${weHtmlSafe(p.count)}</small></span>
    </button>
    <button type="button" class="we-bookmark ${saved?'saved':''}" data-we-save="${p.id}" aria-label="${saved?'저장 취소':'기억 담기'}">${saved?'▮':'♧'}</button>
  </article>`);
 }
 feed.innerHTML=parts.join('');
 feed.querySelectorAll('[data-we-open]').forEach(b=>b.addEventListener('click',()=>openWeDetail(b.dataset.weOpen)));
 feed.querySelectorAll('[data-we-save]').forEach(b=>b.addEventListener('click',()=>weToggleBookmark(b.dataset.weSave)));
}
function openWeDetail(id){const p=weDemoPosts.find(p=>p.id===id);if(!p)return;weState.current=p;
 const body=document.getElementById('weDetailBody');
 body.innerHTML=`<img class="we-dialog-photo" src="assets/we/${p.photo}" alt="${weHtmlSafe(p.title)}"/><h2 id="weDetailTitle">${weHtmlSafe(p.title)}</h2><p class="we-dialog-sub">${weHtmlSafe(p.person)} · ${weHtmlSafe(p.group)} · ${weHtmlSafe(p.date)} · ${weHtmlSafe(p.mood)}</p><p class="we-dialog-text">${weHtmlSafe(p.text)}</p>${p.types.includes('voice')?'<button type="button" class="we-dialog-play" id="weVoiceDemo">▶ 시연용 음성 읽어주기</button>':''}`;
 document.getElementById('weDetailDialog').hidden=false;
 const play=document.getElementById('weVoiceDemo');if(play)play.addEventListener('click',()=>{if(!('speechSynthesis' in window)){notify('이 브라우저는 음성 읽어주기를 지원하지 않아요.');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(p.text);utterance.lang='ko-KR';utterance.rate=.9;speechSynthesis.speak(utterance);});
}
function closeWeDetail(){document.getElementById('weDetailDialog').hidden=true;if('speechSynthesis' in window)speechSynthesis.cancel();}
document.querySelectorAll('[data-open-we]').forEach(b=>b.addEventListener('click',()=>{closeWeDetail();show('we')}));
document.getElementById('weBell').addEventListener('click',()=>notify('WE 알림은 다음 단계에서 연결할게요.'));
document.getElementById('weSearch').addEventListener('input',e=>{weState.search=e.target.value;renderWe()});
document.querySelectorAll('[data-we-mood]').forEach(b=>b.addEventListener('click',()=>{weState.mood=weState.mood===b.dataset.weMood?'':b.dataset.weMood;renderWe();}));
document.getElementById('weFilterToggle').addEventListener('click',()=>{const panel=document.getElementById('weFilterPanel');panel.hidden=!panel.hidden;document.getElementById('weFilterToggle').setAttribute('aria-expanded',String(!panel.hidden));});
document.getElementById('weGroupFilter').addEventListener('change',e=>{weState.group=e.target.value;document.getElementById('weFilterLabel').textContent=weState.group==='all'?'모든 우리':weState.group;renderWe();});
document.getElementById('weDateApply').addEventListener('click',()=>{
 const start=document.getElementById('weStartDate').value,end=document.getElementById('weEndDate').value;
 if(!weCheckRange(start,end))return;
 weState.startDate=start;weState.endDate=end;renderWe();
 document.getElementById('weFilterLabel').textContent=start||end?`${start||'처음'} ~ ${end||'현재'}`:'전체 기간';
 notify('선택한 기간의 기록을 표시해요.');
});
document.getElementById('weDateClear').addEventListener('click',()=>{
 document.getElementById('weStartDate').value='';document.getElementById('weEndDate').value='';
 weState.startDate='';weState.endDate='';renderWe();document.getElementById('weFilterLabel').textContent='전체 기간';
});
document.getElementById('weFilterReset').addEventListener('click',()=>{
 weState.group='all';weState.startDate='';weState.endDate='';weState.mood='';weState.search='';
 document.getElementById('weGroupFilter').value='all';document.getElementById('weStartDate').value='';document.getElementById('weEndDate').value='';
 document.getElementById('weFilterLabel').textContent='전체';document.getElementById('weSearch').value='';renderWe();
});
document.getElementById('weDetailClose').addEventListener('click',closeWeDetail);
document.getElementById('weDetailDialog').addEventListener('click',e=>{if(e.target.id==='weDetailDialog')closeWeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeWeDetail()});
document.getElementById('weCreateBundle').addEventListener('click',()=>{weMemorySelected=new Set();weMemoryMood='';document.getElementById('weBundleStartDate').value='';document.getElementById('weBundleEndDate').value='';show('weBundleCreate');});

const initialScreen=initialHash==='#profile'?'profile':initialHash==='#home'?'home':initialHash==='#bamboo'?'bamboo':initialHash==='#youInbox'?'youInbox':initialHash==='#we'?'we':'login';
show(initialScreen);
if(initialHash==='#profile'){restoreDraft();history.replaceState(null,'',location.pathname)}
if(['#home','#bamboo','#youInbox','#we'].includes(initialHash)){history.replaceState(null,'',location.pathname)}
