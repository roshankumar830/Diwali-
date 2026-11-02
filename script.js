
"use strict";

/* ===== Helpers ===== */
const $ = id => document.getElementById(id);
const rnd = (a,b) => Math.random()*(b-a)+a;
const pick = a => a[Math.floor(Math.random()*a.length)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(pointer: coarse)").matches;

let toastT;

function toast(t){
    const e=$("toast");
    if(!e)return;
    e.textContent=t;
    e.classList.add("show");
    clearTimeout(toastT);
    toastT=setTimeout(()=>e.classList.remove("show"),2600);
}

/* ===== Theme ===== */
try{
    const t=localStorage.getItem("diwali-theme");
    if(t)document.documentElement.dataset.theme=t;
}catch(e){}

$("theme").onclick=()=>{
    const d=document.documentElement;
    const n=d.dataset.theme==="light"?"dark":"light";
    d.dataset.theme=n;
    try{
        localStorage.setItem("diwali-theme",n);
    }catch(e){}
    sfx("diya");
};

/* ===== Audio ===== */
let ac=null,musicOn=false,muted=false,mt=null,step=0;

function ctx(){
    if(!ac){
        try{
            ac=new (window.AudioContext||window.webkitAudioContext)();
        }catch(e){}
    }
    if(ac&&ac.state==="suspended")ac.resume();
    return ac;
}

function tone(f,d,type,v){
    const c=ctx();
    if(!c||muted)return;

    const o=c.createOscillator();
    const g=c.createGain();

    o.type=type||"sine";
    o.frequency.value=f;
    g.gain.setValueAtTime(v||.08,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);

    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime+d);
}

function sfx(k){
    if(k==="diya"){
        tone(880,.4,"sine",.1);
        setTimeout(()=>tone(1320,.5,"sine",.06),90);
    }else if(k==="boom"){
        tone(90,.5,"sawtooth",.12);
        tone(60,.7,"triangle",.1);
    }else{
        tone(660,.25,"triangle",.08);
    }
}

/* ===== Background Song ===== */
const SONG_URL=document.getElementById("bgmSrc").src;

let songLoaded=false,ytOk=true;
const bgm=$("bgm");

function loadSong(){
    if(songLoaded)return;

    songLoaded=true;

    bgm.play().then(()=>{
        musicOn=true;
        $("play").textContent="⏸";
    }).catch(()=>{
        musicOn=false;
        $("play").textContent="▶";
        toast("Tap ▶ to start the song.");
    });
}

function ringtone(){
    [523,659,784,659,880,784,988,1047].forEach((f,i)=>
        setTimeout(()=>tone(f,.45,"triangle",.09),i*230)
    );
}

$("play").onclick=()=>{
    if(!songLoaded){
        loadSong();
        return;
    }

    musicOn=!musicOn;
    $("play").textContent=musicOn?"⏸":"▶";

    if(musicOn)bgm.play();
    else bgm.pause();
};

$("mute").onclick=()=>{
    muted=!muted;
    $("mute").textContent=muted?"🔇":"🔊";
    bgm.muted=muted;
};

document.addEventListener("visibilitychange",()=>{
    if(!songLoaded)return;

    if(document.hidden){
        bgm.pause();
    }else if(musicOn){
        bgm.play().catch(()=>{});
    }
});

addEventListener("pagehide",()=>bgm.pause());

$("sshare").onclick=()=>window.open(
    "https://wa.me/?text="+encodeURIComponent(
        "🪔 Happy Diwali 2026! Listen to this song: "+SONG_URL
    ),
    "_blank",
    "noopener"
);

$("yopen").onclick=()=>window.open(SONG_URL,"_blank","noopener");

/* ===== Particle Engine ===== */
const cv=$("fx");
const g=cv.getContext("2d");

let W,H,P=[],run=false,ambient=0;

function size(){
    const r=Math.min(devicePixelRatio||1,2);
    W=innerWidth;
    H=innerHeight;
    cv.width=W*r;
    cv.height=H*r;
    g.setTransform(r,0,0,r,0,0);
}

addEventListener("resize",size);
size();

const COLORS=[
    "#ff3b3b",
    "#3b82ff",
    "#2ee66a",
    "#b04bff",
    "#ffd75e",
    "#ff8f3d",
    "#ff4f9a"
];

function burst(x,y,col,n){
    n=n||(isTouch?40:70);
    col=col||pick(COLORS);

    for(let i=0;i<n;i++){
        const a=Math.PI*2*i/n;
        const s=rnd(1,5.5);

        P.push({
            t:"s",
            x,y,
            vx:Math.cos(a)*s,
            vy:Math.sin(a)*s,
            l:1,
            d:rnd(.012,.025),
            c:col,
            r:2
        });
    }

    start();
}

function fire(){
    burst(rnd(W*.1,W*.9),rnd(H*.1,H*.5));
    sfx("boom");
}

function confetti(n){
    n=n||(isTouch?60:120);

    for(let i=0;i<n;i++){
        P.push({
            t:"c",
            x:rnd(0,W),
            y:rnd(-H*.3,0),
            vx:rnd(-1,1),
            vy:rnd(2,5),
            l:1,
            d:.004,
            c:pick(COLORS),
            w:rnd(5,10),
            rot:rnd(0,6),
            vr:rnd(-.2,.2)
        });
    }

    start();
}

function glitter(n){
    for(let i=0;i<n;i++){
        P.push({
            t:"g",
            x:rnd(0,W),
            y:rnd(-H*.2,0),
            vx:rnd(-.3,.3),
            vy:rnd(1,3),
            l:1,
            d:.005,
            c:"#ffd75e",
            r:rnd(1,2.5)
        });
    }

    start();
}

function petals(n){
    for(let i=0;i<n;i++){
        P.push({
            t:"p",
            x:rnd(0,W),
            y:-20,
            vx:rnd(-1,1),
            vy:rnd(1,2.5),
            l:1,
            d:.003,
            c:pick(["#ff7ab8","#ffb347","#ffd75e"]),
            r:rnd(5,9),
            rot:rnd(0,6),
            vr:rnd(-.05,.05)
        });
    }

    start();
}

function spark(x,y){
    P.push({
        t:"g",
        x,y,
        vx:rnd(-.8,.8),
        vy:rnd(-.8,.8),
        l:1,
        d:.03,
        c:"#ffd75e",
        r:rnd(1.5,3)
    });

    start();
}

function start(){
    if(!run){
        run=true;
        requestAnimationFrame(loop);
    }
}

function loop(){
    g.clearRect(0,0,W,H);

    P=P.filter(p=>p.l>0&&p.y<H+30);

    for(const p of P){
        p.x+=p.vx;
        p.y+=p.vy;
        p.l-=p.d;

        g.globalAlpha=Math.max(p.l,0);
        g.fillStyle=p.c;

        if(p.t==="s"){
            p.vy+=.05;
            p.vx*=.985;
            g.shadowBlur=8;
            g.shadowColor=p.c;
            g.beginPath();
            g.arc(p.x,p.y,p.r,0,6.3);
            g.fill();
            g.shadowBlur=0;
        }else if(p.t==="c"){
            p.rot+=p.vr;
            g.save();
            g.translate(p.x,p.y);
            g.rotate(p.rot);
            g.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);
            g.restore();
        }else if(p.t==="p"){
            p.rot+=p.vr;
            p.x+=Math.sin(p.y/30);
            g.save();
            g.translate(p.x,p.y);
            g.rotate(p.rot);
            g.beginPath();
            g.ellipse(0,0,p.r,p.r/2,0,0,6.3);
            g.fill();
            g.restore();
        }else{
            g.beginPath();
            g.arc(p.x,p.y,p.r,0,6.3);
            g.fill();
        }
    }

    g.globalAlpha=1;

    if(P.length||ambient>0){
        requestAnimationFrame(loop);
    }else{
        run=false;
        g.clearRect(0,0,W,H);
    }
}

/* Mouse and touch particles */
if(!reduce){
    addEventListener("mousemove",e=>{
        if(!isTouch&&Math.random()<.5){
            spark(e.clientX,e.clientY);
        }
    });

    addEventListener("touchstart",e=>{
        for(const t of e.touches){
            for(let i=0;i<6;i++){
                spark(t.clientX,t.clientY);
            }
        }
    },{passive:true});
}

/* ===== Welcome ===== */
$("enter").onclick=()=>{
    ctx();
    sfx("diya");
    $("welcome").classList.add("out");

    if(!reduce){
        fireworks(5);
        petals(25);
    }

    toast("Welcome! Tap the surprise buttons 🪔");
};

/* ===== Fireworks ===== */
function fireworks(n,gap){
    if(reduce)n=1;

    for(let i=0;i<n;i++){
        setTimeout(fire,i*(gap||350));
    }
}

/* ===== Navigation ===== */
$("burger").onclick=()=>{
    $("burger").classList.toggle("open");
    $("menu").classList.toggle("open");
};

$("menu").onclick=e=>{
    if(e.target.tagName==="A"){
        $("burger").classList.remove("open");
        $("menu").classList.remove("open");
    }
};

document.querySelectorAll("[data-go]").forEach(b=>{
    b.onclick=()=>{
        $(b.dataset.go).scrollIntoView({behavior:"smooth"});
        $("b1").click();
    };
});

/* ===== Seven Surprise Buttons ===== */
const bl=[
    "माँ लक्ष्मी आपके घर सुख-समृद्धि लेकर आएँ। 🙏",
    "आपके जीवन में दीपों की तरह उजाला बना रहे। 🪔",
    "हर दिन आपके लिए दिवाली जैसा जगमग हो। ✨",
    "स्वास्थ्य, धन और खुशियाँ आपके द्वार पर दस्तक दें। 🌸",
    "आपके सारे सपने उजाला बनकर चमकें। 🌟",
    "परिवार में प्रेम और मिठास हमेशा बनी रहे। 🍬"
];

const diyaBox=$("diyas");
let dsets=0;

for(let i=0;i<7;i++){
    const s=document.createElement("span");
    s.textContent="🪔";

    s.onclick=()=>{
        s.classList.toggle("on");
        sfx("diya");
    };

    diyaBox.appendChild(s);
}

function lightDiyas(){
    const ds=[...diyaBox.children];

    ds.forEach(d=>d.classList.remove("on"));

    ds.forEach((d,i)=>{
        setTimeout(()=>{
            d.classList.add("on");
            sfx("diya");
        },i*350);
    });
}

$("b1").onclick=()=>{
    confetti();
    fireworks(4,300);
    toast("Let the celebration begin! 🎉");
};

$("b2").onclick=()=>{
    lightDiyas();
    toast("Lighting the diyas one by one 🪔");
};

$("b3").onclick=()=>{
    fireworks(7,260);
};

let rg=false;

$("b4").onclick=()=>{
    rg=!rg;
    $("rangoli").style.display=rg?"block":"none";

    if(rg){
        petals(20);
        sfx("diya");
    }

    toast(rg?"Magic Rangoli revealed 🌸":"Rangoli hidden");
};

$("b5").onclick=()=>{
    const m=$("bless");
    m.style.animation="none";
    m.offsetHeight;
    m.style.animation="";
    m.textContent=pick(bl);
    glitter(40);
    sfx("diya");
};

$("b6").onclick=()=>{
    $("gift").click();
    $("gift").scrollIntoView({behavior:"smooth",block:"center"});
};

$("b7").onclick=()=>{
    mega();
};

function mega(){
    confetti(200);
    fireworks(10,250);
    lightDiyas();

    rg=true;
    $("rangoli").style.display="block";

    petals(40);
    glitter(80);
    toast("MEGA SURPRISE! 🌟🎆");

    setTimeout(()=>{
        $("final").classList.add("show");
        grand();
    },1500);
}

/* ===== Gift and Envelope ===== */
const gm=[
    "🎁 आपके लिए ढेर सारी मिठाइयाँ और खुशियाँ!",
    "🎁 इस साल आपकी किस्मत दीपक की तरह चमकेगी!",
    "🎁 एक गुप्त दुआ: जो चाहो वो मिले!"
];

const sm=[
    "💌 आप खास हैं, और यह दिवाली भी खास होगी।",
    "💌 आपकी मुस्कान से ही मेरी दिवाली जगमग है।",
    "💌 नया साल, नई उमंग, नए सपने मुबारक!",
    "💌 सबसे बड़ा तोहफ़ा: अपनों का साथ। शुभ दीपावली!"
];

function showMsg(t){
    const m=$("giftmsg");
    m.style.display="block";
    m.style.animation="none";
    m.offsetHeight;
    m.style.animation="";
    m.textContent=t;

    confetti(60);
    burst(innerWidth/2,innerHeight/2);
}

$("gift").onclick=()=>{
    $("gift").classList.remove("open");
    $("gift").offsetHeight;
    $("gift").classList.add("open");
    $("gift").textContent="🎊";

    setTimeout(()=>$("gift").textContent="🎁",1800);

    showMsg(pick(gm));
    sfx("diya");
};

$("env").onclick=()=>{
    $("env").textContent="📨";
    setTimeout(()=>$("env").textContent="💌",1800);

    showMsg(pick(sm));
    sfx("diya");
};

/* ===== Funny Zone ===== */
const fn=[
    "इस दिवाली इतनी मिठाई खाना कि वजन मशीन भी शुभकामनाएँ देने लगे!",
    "लक्ष्मी जी आपके घर आएँ और EMI देखकर वापस न जाएँ!",
    "आपकी जेब भी पटाखों की तरह हमेशा धमाका करती रहे!",
    "इस बार सफाई इतनी करना कि घर में लक्ष्मी जी भी रास्ता न भूलें… और रिश्तेदार भी न आ पाएँ! 😄",
    "दिवाली पर बोनस मिले न मिले, मिठाई का डिब्बा ज़रूर मिले!",
    "पटाखे कम फोड़ना, पड़ोसी की नींद कम टूटेगी… और आपकी जेब भी बचेगी! 😂",
    "इस दिवाली सारे गम जला दो, बस मिठाई का डिब्बा बचा लो!"
];

let fi=0;

$("funbtn").onclick=()=>{
    let n;

    do{
        n=Math.floor(Math.random()*fn.length);
    }while(n===fi);

    fi=n;

    const m=$("funmsg");
    m.style.animation="none";
    m.offsetHeight;
    m.style.animation="";
    m.textContent=fn[n];

    burst(innerWidth/2,innerHeight/3,null,30);
    sfx("diya");
};

/* ===== Family and Friends Wishes ===== */
const wc=[
    ["👨‍👩‍👧‍👦","Family","परिवार के सभी सदस्यों को दीपावली की हार्दिक शुभकामनाएँ। आपका घर खुशियों से जगमगाता रहे। 🪔"],
    ["🤝","Friends","दोस्त, तेरे जैसा यार हो तो हर दिन दिवाली है! शुभ दीपावली! 🎆"],
    ["🧑‍🤝‍🧑","Brother & Sister","भाई-बहन का प्यार मिठाई जैसा मीठा बना रहे। हैप्पी दिवाली! 🍬"],
    ["💖","Special Someone","तुम मेरी ज़िंदगी की सबसे जगमग दीपक हो। शुभ दीपावली, मेरे अपने! ❤️"],
    ["👩","Mom","माँ, आपके आशीर्वाद से ही हर दिन दिवाली है। शुभ दीपावली! 🙏"],
    ["👨","Dad","पापा, आप मेरी ताकत हैं। आपका जीवन खुशियों से जगमग रहे। शुभ दीपावली! 🪔"],
    ["💼","Colleagues","आपके काम में सफलता और जीवन में खुशियों की उजाला बनी रहे। शुभ दीपावली! ✨"],
    ["🏘️","Neighbours","पड़ोसियों को दीपावली की शुभकामनाएँ। मिठाई के साथ प्यार भी बाँटते रहें! 🍬"]
];

const nw={
    Family:"परिवार के सभी सदस्यों को दीपावली की हार्दिक शुभकामनाएँ। आपका घर प्रेम, हँसी और खुशियों के दीपों से हमेशा जगमगाता रहे। 🪔",
    Friends:"दोस्त, तेरे जैसा यार हो तो हर दिन दिवाली है! तेरी हर दुआ कबूल हो और ज़िंदगी में खुशियों के पटाखे फूटते रहें। शुभ दीपावली! 🎆",
    "Brother & Sister":"भाई-बहन का रिश्ता मिठाई जैसा मीठा और दीये जैसा जगमग रहे। नोक-झोंक भी चलती रहे और प्यार भी बढ़ता रहे। हैप्पी दिवाली! 🍬",
    "Special Someone":"तुम्हारे साथ हर पल मेरे लिए दिवाली है। हमारा रिश्ता दीपक की तरह जगमग और मज़बूत बना रहे। शुभ दीपावली! ❤️",
    Mom:"माँ, आपके आँचल की छाँव में ही मेरी सारी दिवाली है। आपका स्वास्थ्य और मुस्कान हमेशा बनी रहे। शुभ दीपावली! 🙏",
    Dad:"पापा, आप मेरी ताकत और मेरा हौसला हैं। आपके आशीर्वाद से मेरा हर दिन जगमग रहे। शुभ दीपावली! 🪔"
};

const sh={
    Family:"दीपों की क़तार हो, खुशियों की बहार हो,\nहर घर में सुख-शांति का उजियारा हर बार हो।\nपरिवार का हर सदस्य मुस्कुराता रहे,\nशुभ दीपावली! 🪔",
    Friends:"यारों की महफ़िल में हँसी का दीप जले,\nहर ग़म पटाखों की तरह दूर कहीं उड़ चले।\nदोस्त, तेरी ज़िंदगी में मिठास ही मिठास रहे,\nशुभ दीपावली मेरे यार! 🎆",
    "Brother & Sister":"बचपन की नोक-झोंक, मिठाई-सा प्यार,\nहर त्योहार पर जगमगाए अपना संसार।\nभाई-बहन का रिश्ता यूँ ही मुस्कुराता रहे,\nहैप्पी दिवाली! 🍬",
    "Special Someone":"तेरे साथ हर लम्हा त्योहार लगे,\nतेरी मुस्कान में दीपों की बहार लगे।\nयूँ ही साथ चलते रहें हम उम्र भर,\nशुभ दीपावली, मेरे अपने! ❤️",
    Mom:"माँ की दुआओं से बड़ा कोई दीप नहीं,\nउसके आँचल से प्यारा कोई गीत नहीं।\nमाँ, आपकी मुस्कान से ही मेरी दिवाली है,\nशुभ दीपावली! 🙏",
    Dad:"पापा के हौसले से हर मुश्किल आसान है,\nउनके साये में ही मेरी हर शान है।\nपापा, आपको दीपावली की ढेरों शुभकामनाएँ! 🪔",
    Colleagues:"मेहनत के दीप से सफलता की राह सजे,\nहर टीम में खुशियों के सुर बजे।\nआपको और परिवार को शुभ दीपावली! ✨",
    Neighbours:"मिल-जुलकर मनाएँ हम त्योहार की बहार,\nबाँटें मिठाई, बाँटें दिलों का प्यार।\nपड़ोसियों को दीपावली की हार्दिक शुभकामनाएँ! 🍬"
};

wc.forEach(w=>{
    if(sh[w[1]])w[2]=sh[w[1]];
});

wc.forEach(([e,t,m])=>{
    const d=document.createElement("div");
    d.className="glass wc";

    const icon=document.createElement("div");
    icon.className="e";
    icon.textContent=e;

    const heading=document.createElement("h3");
    heading.textContent=t;

    const p=document.createElement("p");
    p.className="hi";
    p.textContent="Tap to reveal";

    d.append(icon,heading,p);

    d.onclick=()=>{
        loadSong();
        if(!ytOk)ringtone();

        p.textContent=m;

        burst(
            d.getBoundingClientRect().left+d.offsetWidth/2,
            d.getBoundingClientRect().top,
            null,
            30
        );

        sfx("diya");
    };

    $("wcards").appendChild(d);
});

/* ===== Personalized Greeting Card ===== */
let greet="";

function makeText(n){
    return `प्रिय ${n} जी,

आपको एवं आपके पूरे परिवार को दीपावली की ढेर सारी शुभकामनाएँ।

माँ लक्ष्मी आपके जीवन में सुख, शांति, समृद्धि और खुशियाँ लेकर आएँ।

आपका घर हमेशा खुशियों के दीपों से जगमगाता रहे।

आपके सभी सपने पूरे हों और जीवन में सफलता मिले।

आप हमेशा मुस्कुराते रहें।

🪔 शुभ दीपावली! 🎆`;
}

$("gen").onclick=()=>{
    const n=$("nm").value.trim();

    if(!n){
        $("err").textContent="कृपया अपना नाम लिखें।";
        $("nm").focus();
        return;
    }

    $("err").textContent="";
    greet=makeText(n);

    const c=$("card");
    c.style.display="block";
    c.textContent="";

    const a=document.createElement("span");
    a.className="tp";
    a.textContent="🪔 ✦ 🪔";

    const body=document.createElement("div");
    body.textContent=greet;

    const b=document.createElement("span");
    b.className="tp";
    b.textContent="🎆 ✦ 🎇";

    c.append(a,body,b);

    $("actions").style.display="block";

    burst(innerWidth/2,innerHeight/2);
    confetti(80);
    sfx("diya");

    c.scrollIntoView({behavior:"smooth",block:"center"});
};

$("nm").addEventListener("keydown",e=>{
    if(e.key==="Enter")$("gen").click();
});

$("wa").onclick=()=>{
    if(!greet)return;

    window.open(
        "https://wa.me/?text="+encodeURIComponent(greet),
        "_blank",
        "noopener"
    );
};

$("cp").onclick=async()=>{
    if(!greet)return;

    try{
        await navigator.clipboard.writeText(greet);
    }catch(e){
        const t=document.createElement("textarea");
        t.value=greet;
        document.body.appendChild(t);
        t.select();

        try{
            document.execCommand("copy");
        }catch(_){
            toast("Copy failed. Please select the text manually.");
            t.remove();
            return;
        }

        t.remove();
    }

    toast("✅ Wishes copied successfully!");
    glitter(40);
};

function saveImg(el,name,btn){
    if(typeof html2canvas==="undefined"){
        toast("Image tool could not load. Check your internet connection.");
        return;
    }

    const old=btn.textContent;
    btn.textContent="⏳ Please wait...";

    (document.fonts?document.fonts.ready:Promise.resolve())
    .then(()=>html2canvas(el,{
        scale:2,
        backgroundColor:"#12041f",
        useCORS:true
    }))
    .then(cn=>{
        const a=document.createElement("a");
        a.download=name;
        a.href=cn.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast("⬇️ Card downloaded!");
    })
    .catch(()=>toast("Could not create the image. Please try again."))
    .finally(()=>btn.textContent=old);
}

$("dl").onclick=()=>{
    if(greet)saveImg($("card"),"diwali-card-2026.png",$("dl"));
};

$("wafab").onclick=e=>{
    e.preventDefault();

    window.open(
        "https://wa.me/?text="+encodeURIComponent(
            "🪔 Happy Diwali 2026! Join the magical celebration: "+location.href+"\n🎶 Song: "+SONG_URL
        ),
        "_blank",
        "noopener"
    );
};

/* ===== Photo Card ===== */
$("ph").onchange=e=>{
    const f=e.target.files[0];
    if(!f)return;

    if(!f.type.startsWith("image/")){
        toast("Please choose an image file.");
        return;
    }

    const r=new FileReader();

    r.onload=()=>{
        $("frame").style.backgroundImage=`url(${r.result})`;
        $("pcard").style.display="block";
        $("pdl").style.display="inline-block";
        confetti(60);
        toast("Photo added to your Diwali frame! 📷");
    };

    r.onerror=()=>toast("Could not read that photo.");
    r.readAsDataURL(f);
};

$("pdl").onclick=()=>{
    saveImg($("pcard"),"diwali-photo-card-2026.png",$("pdl"));
};

/* ===== Sunrise ===== */
const sr=$("sunrise");

new IntersectionObserver(es=>{
    es.forEach(en=>{
        if(en.isIntersecting){
            sr.classList.add("go");

            if(!sr.dataset.p){
                sr.dataset.p=1;
                glitter(40);
            }
        }else{
            sr.classList.remove("go");
        }
    });
},{threshold:.5}).observe(sr);

/* ===== Grand Finale ===== */
let ft=null;

function grand(){
    clearInterval(ft);
    let t=0;
    ambient=1;
    start();

    ft=setInterval(()=>{
        t+=400;
        fire();

        if(Math.random()<.6)fire();

        glitter(12);

        if(t%1200===0)petals(6);

        if(t>=8000){
            clearInterval(ft);

            for(let i=0;i<6;i++){
                setTimeout(fire,i*150);
            }

            ft=setInterval(()=>{
                if(!$("final").classList.contains("show")){
                    clearInterval(ft);
                    ambient=0;
                    return;
                }

                fire();
                glitter(8);
            },1500);
        }
    },400);
}

$("finalbtn").onclick=()=>{
    $("final").classList.add("show");
    grand();
};

$("fclose").onclick=()=>{
    $("final").classList.remove("show");
    clearInterval(ft);
    ambient=0;
};

cv.style.zIndex=96;

/* ===== Happy Diwali 300 Times ===== */
let wt=null;

function say(t){
    try{
        if(muted||!window.speechSynthesis)return;

        const u=new SpeechSynthesisUtterance(t);
        u.lang="en-IN";
        u.rate=1.05;

        speechSynthesis.speak(u);
    }catch(e){}
}

function wallStop(){
    clearInterval(wt);
    wt=null;

    try{
        window.speechSynthesis&&speechSynthesis.cancel();
    }catch(e){}

    $("wallstop").style.display="none";
}

$("wallstop").onclick=wallStop;

$("wallbtn").onclick=()=>{
    const n=$("nm").value.trim();

    if(!n){
        $("err").textContent="कृपया अपना नाम लिखें।";
        $("nm").focus();
        return;
    }

    $("err").textContent="";
    wallStop();

    const w=$("wall");
    w.style.display="block";
    w.textContent="";
    $("wallstop").style.display="inline-block";

    const em=["🪔","🎆","🎇","✨","🎉","🌟","🪷","🎁"];
    let i=0;

    const step=()=>{
        const f=document.createDocumentFragment();

        for(let k=0;k<2&&i<300;k++){
            i++;

            const d=document.createElement("div");
            d.textContent=i+". "+n+" – Happy Diwali "+em[i%em.length];

            f.appendChild(d);

            if(i%10===1)say("Happy Diwali");
        }

        w.appendChild(f);
        w.scrollTop=w.scrollHeight;

        if(i%25===0){
            burst(rnd(W*.2,W*.8),rnd(H*.2,H*.5),null,25);
        }

        if(i>=300){
            clearInterval(wt);
            wt=null;
            $("wallstop").style.display="none";
            toast("🎉 300 Happy Diwali wishes printed!");
            confetti(100);
        }
    };

    w.scrollIntoView({behavior:"smooth",block:"center"});

    if(reduce){
        while(i<300)step();
    }else{
        wt=setInterval(step,40);
    }
};

/* ==========================================
   REWARD SHARE SYSTEM
   MOBILE + LAPTOP FIX
   DEMO / PRANK ONLY
   ========================================== */

(function(){

    const card=$("rcard");

    if(!card)return;

    const TOTAL=5;
    const STORAGE_KEY="diwali_share_attempt";
    const COUNT_KEY="diwali_share_count";

    let cnt=0;
    let tm=null;
    let sv=0;
    let processing=false;

    const msgs=[
        "Demo verification शुरू हो रहा है...",
        "आपके demo details चेक हो रहे हैं...",
        "Final demo step तैयार हो रहा है...",
        "Demo verification लगभग पूरा है..."
    ];

    const txt=
        "🪔 Diwali का सुनहरा Fun Offer! यह एक Fun Demo है 🎁 ";

    const svLabels=[
        "✅ पात्रता जांचें",
        "✅ Details Confirm करें",
        "✅ Final Verification"
    ];

    const svTexts=[
        "यह पहला demo verification step है।",
        "अच्छा! अब दूसरा demo step पूरा करें।",
        "बस एक आखिरी demo step बाकी है!"
    ];

    const shareButton=$("rshare");

    /* Floating coins */
    if(!card.dataset.coinsAdded){

        card.dataset.coinsAdded="true";

        for(let i=0;i<8;i++){
            const c=document.createElement("span");

            c.className="coin";
            c.textContent=i%2?"🪙":"💰";
            c.style.left=(5+i*12)+"%";
            c.style.animationDelay=(i*.6)+"s";

            card.appendChild(c);
        }
    }

    function setText(id,value){
        const el=$(id);
        if(el)el.textContent=value;
    }

    function setWidth(id,value){
        const el=$(id);
        if(el)el.style.width=value+"%";
    }

    function updateCounter(){
        setText("rcnt",cnt+"/"+TOTAL);
        setWidth("rbar",cnt*20);
    }

    function showStep(id){
        ["rstep1","rstep2","rstep3"].forEach(step=>{
            const el=$(step);
            if(el)el.style.display="none";
        });

        const el=$(id);
        if(el)el.style.display="block";
    }

    /* Restore counter after browser return */
    try{
        cnt=Math.min(
            TOTAL,
            Math.max(0,Number(sessionStorage.getItem(COUNT_KEY))||0)
        );
    }catch(e){
        cnt=0;
    }

    updateCounter();

    /* Claim */
    const claim=$("claim");

    if(claim){
        claim.addEventListener("click",()=>{
            showStep("rstep2");

            confetti(80);

            burst(
                innerWidth/2,
                innerHeight/2,
                "#ffd75e",
                50
            );

            sfx("diya");
        });
    }

    /* Save a pending attempt before opening WhatsApp */
    function saveAttempt(){
        try{
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    time:Date.now()
                })
            );
            return true;
        }catch(e){
            toast("Browser storage उपलब्ध नहीं है।");
            return false;
        }
    }

    /* WhatsApp share */
    function shareOnWhatsApp(){

        if(cnt>=TOTAL){
            toast("आपके 5 demo attempts पूरे हो गए!");
            return;
        }

        if(processing)return;

        if(sessionStorage.getItem(STORAGE_KEY)){
            toast("पहले WhatsApp से वापस वेबसाइट पर आइए।");
            return;
        }

        const url=
            "https://wa.me/?text="+
            encodeURIComponent(txt+location.href);

        /* Save before leaving */
        if(!saveAttempt())return;

        setText(
            "rsvtext",
            "WhatsApp खुल रहा है। वापस वेबसाइट पर आइए।"
        );

        toast("WhatsApp पर शेयर करें और फिर वापस आएँ।");

        if(isTouch){

            /* Mobile: same tab */
            location.href=url;

        }else{

            /* Laptop: new tab */
            const newTab=window.open(url,"_blank");

            /* Popup blocked fallback */
            if(!newTab){
                location.href=url;
            }
        }
    }

    if(shareButton){
        shareButton.addEventListener("click",shareOnWhatsApp);
    }

    /* Complete one demo attempt */
    function counted(){

        if(cnt>=TOTAL||processing)return;

        cnt++;

        try{
            sessionStorage.setItem(COUNT_KEY,String(cnt));
        }catch(e){}

        updateCounter();

        sfx("diya");

        burst(
            rnd(W*.3,W*.7),
            rnd(H*.3,H*.6),
            "#ffd75e",
            35
        );

        setText(
            "rsvtext",
            "Demo share attempt "+cnt+"/"+TOTAL+" complete!"
        );

        toast("Demo attempt "+cnt+"/"+TOTAL+" complete!");

        if(cnt>=TOTAL){

            if(shareButton){
                shareButton.disabled=true;
            }

            setTimeout(()=>{
                showStep("rstep3");
                svInit();
            },700);
        }
    }

    /* Detect return from WhatsApp */
    function checkReturn(){

        if(document.visibilityState!=="visible")return;

        const saved=sessionStorage.getItem(STORAGE_KEY);

        if(!saved)return;

        let attempt;

        try{
            attempt=JSON.parse(saved);
        }catch(e){
            sessionStorage.removeItem(STORAGE_KEY);
            return;
        }

        if(!attempt||!attempt.time)return;

        const elapsed=Date.now()-attempt.time;

        /* Avoid counting immediate accidental return */
        if(elapsed<2500)return;

        /* Remove first to prevent duplicate events */
        sessionStorage.removeItem(STORAGE_KEY);

        counted();
    }

    document.addEventListener("visibilitychange",()=>{
        if(document.visibilityState==="visible"){
            setTimeout(checkReturn,500);
        }
    });

    window.addEventListener("focus",()=>{
        setTimeout(checkReturn,500);
    });

    window.addEventListener("pageshow",()=>{
        setTimeout(checkReturn,700);
    });

    /* Initial UI state */
    if(cnt>=TOTAL){
        showStep("rstep3");
        shareButton.disabled=true;
        svInit();
    }

    /* Demo verification */
    function svInit(){
        sv=0;
        svDraw();
    }

    function svDraw(){

        setText("rsvtext",svTexts[sv]);
        setText("rsvlabel","Step "+(sv+1)+"/3");

        setWidth("rbar2",(sv/3)*100);

        const button=$("rsvbtn");

        if(button){
            button.textContent=svLabels[sv];
        }
    }

    const verifyButton=$("rsvbtn");

    if(verifyButton){
        verifyButton.addEventListener("click",()=>{

            if(sv>=3||processing)return;

            sv++;

            confetti(40);
            sfx("diya");

            if(sv>=3){

                setWidth("rbar2",100);

                setTimeout(proc,600);

            }else{

                svDraw();

            }
        });
    }

    /* Demo processing */
    function proc(){

        if(processing)return;

        processing=true;

        const overlay=$("rwproc");

        if(!overlay){
            processing=false;
            pop();
            return;
        }

        overlay.classList.add("show");

        let t=5;

        setText("rwtime","00:05");
        setText("rwmsg",msgs[0]);

        clearInterval(tm);

        tm=setInterval(()=>{

            t--;

            setText(
                "rwtime",
                "00:"+String(t).padStart(2,"0")
            );

            const index=Math.min(
                3,
                Math.floor((5-t)/2)
            );

            setText("rwmsg",msgs[index]);

            if(t<=0){

                clearInterval(tm);

                overlay.classList.remove("show");

                processing=false;

                pop();
            }

        },1000);
    }

    /* Demo popup */
    function pop(){

        const popup=$("rwpop");

        if(popup){
            popup.classList.add("show");
        }

        confetti(150);
        fireworks(6,250);
        glitter(60);
        sfx("boom");
    }

    /* Reset */
    function reset(){

        cnt=0;
        sv=0;
        processing=false;

        clearInterval(tm);

        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(COUNT_KEY);

        updateCounter();

        showStep("rstep1");

        setWidth("rbar2",0);

        if(shareButton){
            shareButton.disabled=false;
        }

        setText("rsvtext","Demo फिर से शुरू करें।");
    }

    /* Back button */
    const backButton=$("rback");

    if(backButton){
        backButton.addEventListener("click",()=>{

            $("rwpop")?.classList.remove("show");

            $("rwproc")?.classList.remove("show");

            reset();

            $("wishes")?.scrollIntoView({
                behavior:"smooth"
            });
        });
    }

    /* Try again */
    const againButton=$("ragain");

    if(againButton){
        againButton.addEventListener("click",()=>{

            $("rwpop")?.classList.remove("show");

            $("rwproc")?.classList.remove("show");

            reset();

            $("reward")?.scrollIntoView({
                behavior:"smooth"
            });
        });
    }

})();

/* ===== Dancing Ring ===== */
(function(){

    const r=$("ring");

    for(let i=0;i<8;i++){
        const a=Math.PI*2*i/8;
        const b=document.createElement("button");

        b.className="dn";
        b.textContent=i%2?"🕺":"💃";
        b.setAttribute("aria-label","Dancer");
        b.style.left=(50+42*Math.cos(a))+"%";
        b.style.top=(50+42*Math.sin(a))+"%";

        b.onclick=()=>{
            const m=$("dmsg");
            m.style.animation="none";
            m.offsetHeight;
            m.style.animation="";
            m.textContent="🪔 Happy Diwali! 🎆";

            const q=b.getBoundingClientRect();

            burst(q.left+29,q.top+29,null,35);
            sfx("diya");
            say("Happy Diwali");
        };

        r.appendChild(b);
    }
})();

/* ===== Diwali Quiz ===== */
const qz=[
    ["Diwali is known as the festival of…",["Lights","Kites","Boats","Snow"],0],
    ["Which goddess is worshipped on Diwali evening?",["Saraswati","Lakshmi","Durga","Parvati"],1],
    ["How many days does the Diwali festival last?",["1","3","5","10"],2],
    ["What are the small clay lamps called?",["Diyas","Matkas","Thalis","Kalash"],0],
    ["What is the colourful floor art at the doorstep called?",["Mehndi","Rangoli","Tilak","Alpana"],1]
];

let qi=0,qs=0;

function qshow(){
    const b=$("qbox");
    b.textContent="";

    if(qi>=qz.length){
        const h=document.createElement("h3");
        h.textContent="Your score: "+qs+"/"+qz.length;

        const p=document.createElement("p");
        p.textContent=qs>=4?"Superb! 🎆":"Nice try! 🪔";

        const r=document.createElement("button");
        r.className="btn";
        r.textContent="Play Again";

        r.onclick=()=>{
            qi=0;
            qs=0;
            qshow();
        };

        b.append(h,p,r);

        if(qs>=4){
            confetti(100);
            fireworks(3);
        }

        return;
    }

    const [q,o,a]=qz[qi];
    const p=document.createElement("p");
    p.textContent="Q"+(qi+1)+"/"+qz.length+". "+q;
    b.appendChild(p);

    o.forEach((t,i)=>{
        const x=document.createElement("button");
        x.className="btn";
        x.textContent=t;

        x.onclick=()=>{
            b.querySelectorAll("button").forEach(y=>y.disabled=true);

            if(i===a){
                qs++;
                x.textContent="✅ "+t;
                burst(innerWidth/2,innerHeight/2,null,30);
                sfx("diya");
            }else{
                x.textContent="❌ "+t;
                toast("Correct answer: "+o[a]);
            }

            qi++;
            setTimeout(qshow,1100);
        };

        b.appendChild(x);
    });
}

qshow();

/* ===== Countdown ===== */
const TARGET=new Date(2026,10,8,0,0,0);

function tick(){
    const el=$("cd");

    if(!el)return;

    const d=TARGET-new Date();

    if(d<=0){
        el.textContent="🪔 Happy Diwali! 🪔";
        return;
    }

    const totalSeconds=Math.floor(d/1000);

    const values=[
        ["Days",Math.floor(totalSeconds/86400)],
        ["Hours",Math.floor((totalSeconds%86400)/3600)],
        ["Minutes",Math.floor((totalSeconds%3600)/60)],
        ["Seconds",totalSeconds%60]
    ];

    el.innerHTML=values.map(([label,value])=>
        `<div class="glass cb"><b>${String(value).padStart(2,"0")}</b><span>${label}</span></div>`
    ).join("");
}

tick();
setInterval(tick,1000);

/* ===== Card Themes ===== */
const cth={
    purple:"radial-gradient(circle at 50% 0,#4a1a80,#12041f 75%)",
    red:"radial-gradient(circle at 50% 0,#a31d1d,#2a0505 75%)",
    green:"radial-gradient(circle at 50% 0,#0f7a52,#03160f 75%)",
    blue:"radial-gradient(circle at 50% 0,#1f56c9,#050f2a 75%)"
};

document.querySelectorAll("[data-ct]").forEach(b=>{
    b.onclick=()=>{
        $("card").style.background=cth[b.dataset.ct];
        sfx("diya");
    };
});

/* ===== Diwali Facts ===== */
const facts=[
    "Diwali is a five-day festival: Dhanteras, Naraka Chaturdashi, Lakshmi Puja, Govardhan Puja and Bhai Dooj.",
    "Lakshmi Puja is the main evening ritual of Diwali, held on the new moon night.",
    "Diyas are traditionally lit with oil or ghee to welcome light and prosperity.",
    "Rangoli patterns at the doorstep are made to welcome Goddess Lakshmi.",
    "Sharing sweets and gifts with family and neighbours is a core Diwali tradition."
];

let fk=-1;

$("factbtn").onclick=()=>{
    let n;

    do{
        n=Math.floor(Math.random()*facts.length);
    }while(n===fk);

    fk=n;

    const m=$("fact");
    m.style.animation="none";
    m.offsetHeight;
    m.style.animation="";
    m.textContent=facts[n];

    glitter(30);
    sfx("diya");
};

/* ===== Back To Top ===== */
$("topbtn").onclick=()=>{
    scrollTo({top:0,behavior:"smooth"});
};

addEventListener("scroll",()=>{
    $("topbtn").classList.toggle("show",scrollY>500);
},{passive:true});

/* ===== Random Toast ===== */
const notes=[
    "🪔 A diya just lit up somewhere!",
    "🍬 Time for sweets!",
    "✨ Make a wish!",
    "🎆 Tap Mega Surprise!",
    "🌸 Happy Diwali!"
];

setInterval(()=>{
    if(!document.hidden&&$("welcome").classList.contains("out")){
        toast(pick(notes));
    }
},25000);

/* ===== Invitation 3D Effect ===== */
const inv=$("invite");

if(!isTouch&&!reduce){
    inv.addEventListener("mousemove",e=>{
        const r=inv.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;

        inv.style.transform=
            `perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
    });

    inv.addEventListener("mouseleave",()=>{
        inv.style.transform="";
    });
}

/* ===== Footer Particles ===== */
const ft2=$("foot");

for(let i=0;i<18;i++){
    const p=document.createElement("i");

    p.className="fp";
    p.style.left=rnd(0,100)+"%";
    p.style.bottom=rnd(0,30)+"px";
    p.style.animationDelay=rnd(0,6)+"s";
    p.style.animationDuration=rnd(4,8)+"s";

    ft2.appendChild(p);
}
