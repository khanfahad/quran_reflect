(function () {
  var V = window.VERSES, app = document.getElementById('app');
  var MOODS = [['anxious','Anxious'],['overwhelmed','Overwhelmed'],['grief','Grieving'],['lonely','Lonely'],
    ['ashamed','Ashamed or guilty'],['hopeless','Hopeless'],['disappointed','Disappointed'],['distant','Distant from Allah']];
  var KEY = 'quranReflect.journal.v1';

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch(e){return false}}
  function byRef(r){return V.filter(function(v){return v.ref===r})[0]}
  function today(){var d=new Date();return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
  function daily(){return V[today()%V.length]}

  function card(v){
    return '<a class="card link" href="#/verse/'+v.ref+'"><div class="ref">'+esc(v.surah)+' '+v.ref+' · '+esc(v.theme)+'</div>'+
      '<div class="trans" style="text-align:left;margin:8px 0 0">'+esc(v.translation.length>170?v.translation.slice(0,170)+'…':v.translation)+'</div></a>';
  }

  function home(mood){
    var h='<h1>Let the verse speak to you.</h1>';
    var d=daily();
    h+='<div class="card"><div class="ref">Verse for today</div><div class="arabic">'+d.arabic+'</div>'+
       '<p class="translit">'+esc(d.theme)+'</p><p style="text-align:center"><a class="btn" href="#/verse/'+d.ref+'">Reflect on this verse</a></p></div>';
    h+='<h2>Or, how are you feeling?</h2><div class="chips">'+MOODS.map(function(m){
      return '<button class="chip'+(mood===m[0]?' on':'')+'" data-mood="'+m[0]+'">'+m[1]+'</button>'}).join('')+'</div>';
    if(mood){
      var list=V.filter(function(v){return v.moods.indexOf(mood)>-1});
      h+='<p class="lede">These verses may speak to that feeling:</p>'+list.map(card).join('');
    }
    app.innerHTML=h;
    Array.prototype.forEach.call(app.querySelectorAll('[data-mood]'),function(b){
      b.onclick=function(){home(mood===b.dataset.mood?null:b.dataset.mood)};
    });
  }

  function browse(){
    app.innerHTML='<h1>Verses</h1><p class="lede">Twenty verses on struggle, mercy and nearness to Allah.</p>'+V.map(card).join('');
  }

  function verseBlock(v){
    return '<div class="card verse-box"><div class="ref" style="text-align:center">'+esc(v.surah)+' ('+esc(v.surahMeaning)+') · '+v.ref+'</div>'+
      '<div class="arabic" lang="ar">'+v.arabic+'</div><p class="translit">'+esc(v.transliteration)+'</p>'+
      '<p class="trans">'+esc(v.translation)+'</p></div>';
  }

  function verse(ref,step){
    var v=byRef(ref); if(!v) return home();
    step=step||0;
    var h='<div class="steps">'+[0,1,2,3].map(function(i){return '<span class="'+(i<=step?'on':'')+'"></span>'}).join('')+'</div>';
    if(step===0){
      h+='<h1>Arrive</h1><p class="lede">Take a slow breath. Let your shoulders drop. For the next few minutes, you are not reading about someone else. You are being addressed.</p>'+
        '<div class="breath" aria-hidden="true"></div><p style="text-align:center" class="quote">Breathe in. Breathe out. Say: <em>Bismillah</em>.</p>'+
        '<div class="row"><a class="btn ghost" href="#/browse">Back</a><button class="btn" data-go="1">I am here</button></div>';
    } else if(step===1){
      h+='<h1>Read</h1>'+verseBlock(v)+'<details class="card ctx"><summary>About this verse</summary><p>'+esc(v.context)+'</p></details>'+
        '<p class="quote">'+esc(v.intro)+'</p>'+
        '<p class="small">Read it once slowly in Arabic if you can, then once in translation, as though it were said to you personally.</p>'+
        '<div class="row"><button class="btn ghost" data-go="0">Back</button><button class="btn" data-go="2">Reflect</button></div>';
    } else if(step===2){
      var draft=draftFor(ref);
      h+='<h1>Reflect</h1><p class="lede">'+esc(v.theme)+'. Write whatever comes, honestly. No one else will read this.</p>'+
        v.questions.map(function(q,i){return '<div class="q"><label for="q'+i+'">'+esc(q)+'</label><textarea id="q'+i+'" data-i="'+i+'">'+esc(draft[i]||'')+'</textarea></div>'}).join('')+
        '<div class="row"><button class="btn ghost" data-go="1">Back</button><button class="btn" data-go="3">Continue</button></div>';
    } else {
      h+='<h1>Carry it with you</h1><div class="card"><p class="quote">'+esc(v.intention)+'</p>'+
        '<label for="own">Your own intention in your words (optional)</label><textarea id="own"></textarea></div>'+
        '<div class="row"><button class="btn ghost" data-go="2">Back</button><button class="btn" id="save">Save to my journal</button></div>';
    }
    app.innerHTML=h;
    Array.prototype.forEach.call(app.querySelectorAll('[data-go]'),function(b){b.onclick=function(){verse(ref,+b.dataset.go)}});
    Array.prototype.forEach.call(app.querySelectorAll('textarea[data-i]'),function(t){
      t.oninput=function(){var d=draftFor(ref);d[t.dataset.i]=t.value;drafts[ref]=d}});
    var s=document.getElementById('save');
    if(s) s.onclick=function(){
      var d=draftFor(ref), all=load();
      all.unshift({ref:ref,date:new Date().toISOString(),answers:v.questions.map(function(q,i){return{q:q,a:d[i]||''}}),
        intention:(document.getElementById('own').value||v.intention)});
      delete drafts[ref];
      var ok=save(all);
      app.innerHTML='<h1>'+(ok?'Saved.':'Could not save')+'</h1><p class="lede">'+(ok?'Your reflection is stored privately on this device. May Allah put ease in your heart.':'Your browser blocked local storage. Your reflection was not saved.')+'</p><p><a class="btn" href="#/journal">Open journal</a> <a class="btn ghost" href="#/">Home</a></p>';
    };
  }
  var drafts={};
  function draftFor(ref){return drafts[ref]||(drafts[ref]=[])}

  function journal(){
    var all=load();
    var h='<h1>Journal</h1><p class="lede">Stored only in this browser. Clearing site data will erase it.</p>';
    if(!all.length) h+='<p>Nothing here yet. <a href="#/">Start a reflection.</a></p>';
    all.forEach(function(e,i){
      var v=byRef(e.ref)||{};
      h+='<div class="card entry"><div class="ref">'+esc(v.surah||'')+' '+esc(e.ref)+'</div><div class="entry-date">'+new Date(e.date).toLocaleString()+'</div>'+
        e.answers.filter(function(a){return a.a}).map(function(a){return '<p><strong>'+esc(a.q)+'</strong></p><blockquote>'+esc(a.a)+'</blockquote>'}).join('')+
        '<p class="quote">'+esc(e.intention)+'</p><button class="danger" data-del="'+i+'">Delete</button></div>';
    });
    if(all.length) h+='<p><button class="btn ghost" id="exp">Download as text</button></p>';
    app.innerHTML=h;
    Array.prototype.forEach.call(app.querySelectorAll('[data-del]'),function(b){b.onclick=function(){
      if(!confirm('Delete this entry? This cannot be undone.'))return;
      var a=load();a.splice(+b.dataset.del,1);save(a);journal()}});
    var x=document.getElementById('exp');
    if(x) x.onclick=function(){
      var t=all.map(function(e){return e.ref+' ('+e.date+')\n'+e.answers.map(function(a){return a.q+'\n'+a.a}).join('\n\n')+'\nIntention: '+e.intention}).join('\n\n-----\n\n');
      var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.download='quran-reflect-journal.txt';a.click();
    };
  }

  function route(){
    var p=location.hash.replace(/^#\/?/,'').split('/');
    var nav=p[0]==='browse'||p[0]==='verse'?'browse':p[0]==='journal'?'journal':'home';
    Array.prototype.forEach.call(document.querySelectorAll('nav a'),function(a){a.classList.toggle('on',a.dataset.nav===nav)});
    if(p[0]==='verse') verse(decodeURIComponent(p[1]||''));
    else if(p[0]==='browse') browse();
    else if(p[0]==='journal') journal();
    else home();
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',route);
  route();
})();
