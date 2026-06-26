// ═══ AURORA NEBULA PARTICLES ═══
(function(){
var AC=document.getElementById("auroraCanvas");
var X=AC.getContext("2d"),P=[],N=112,animId=null,running=false;
var CL=["rgba(124,92,231,","rgba(217,70,122,","rgba(13,164,168,","rgba(167,139,250,","rgba(245,158,172,","rgba(99,210,213,"];
var mx=null,my=null;
document.addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY});
document.addEventListener("mouseleave",function(){mx=null;my=null});
function resize(){AC.width=window.innerWidth;AC.height=window.innerHeight}
function initParticles(){
  P=[];resize();
  for(var i=0;i<N;i++)P.push({
    x:Math.random()*AC.width,y:Math.random()*AC.height,
    r:2.2+Math.random()*3.8,
    vx:.08+Math.random()*.22,vy:.04+Math.random()*.14,
    ph:Math.random()*Math.PI*2,sp:.006+Math.random()*.015,
    cl:CL[Math.floor(Math.random()*CL.length)]
  });
}
function draw(){
  X.clearRect(0,0,AC.width,AC.height);var t=Date.now()*.0004;
  for(var i=0;i<N;i++){
    var p=P[i];
    var sinY=Math.sin(t*p.sp*30+p.ph)*3;
    var sinX=Math.cos(t*p.sp*22+p.ph)*2;
    // Mouse: visible attraction (160px) + repulsion ring (160-350px) + massive glow amplification
    if(mx!==null&&my!==null){
      var dx=mx-p.x,dy=my-p.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<160){
        // Strong pull — particles visibly rush toward cursor
        var force=(1-dist/160)*1.6;
        p.x+=dx*force*.12;p.y+=dy*force*.12;
      }else if(dist<350){
        // Gentle outward push creates a flowing ring around cursor
        var repel=Math.min(1,(dist-160)/190)*0.5;
        p.x-=dx*repel*.035;p.y-=dy*repel*.035;
      }
    }
    p.x+=p.vx*.35+sinX;p.y+=p.vy*.35+sinY;
    if(p.y<-30)p.y=AC.height+30;if(p.y>AC.height+30)p.y=-30;
    if(p.x<-30)p.x=AC.width+30;if(p.x>AC.width+30)p.x=-30;
    var g=p.r*3.5;
    if(mx!==null&&my!==null){
      var md=Math.sqrt(Math.pow(mx-p.x,2)+Math.pow(my-p.y,2));
      if(md<120){g*=1+(1-md/120)*2.0;}
      else if(md<280){g*=1+(1-(md-120)/160)*0.8;}
    }
    var gd=X.createRadialGradient(p.x,p.y,0,p.x,p.y,g);
    gd.addColorStop(0,p.cl+".28)");gd.addColorStop(.25,p.cl+".15)");
    gd.addColorStop(.6,p.cl+".04)");gd.addColorStop(1,"rgba(250,248,255,0)");
    X.fillStyle=gd;X.beginPath();X.arc(p.x,p.y,g,0,2*Math.PI);X.fill();
  }
  animId=requestAnimationFrame(draw);
}
function startAurora(){if(running)return;running=true;initParticles();AC.style.opacity="1";draw()}
function stopAurora(){running=false;if(animId){cancelAnimationFrame(animId);animId=null}AC.style.opacity="0"}
window.addEventListener("resize",function(){if(running)resize()});

// Hook into music play/pause
var origUpdatePlayState=window.updatePlayState||function(){};
window.updatePlayState=function(playing){
  origUpdatePlayState(playing);
  if(playing)startAurora();else stopAurora();
};
initParticles();
// Aurora starts when music plays (via window.updatePlayState hook below)
})();

// ═══ UNIFIED PLAYER DRAG (minimized + expanded, XY-axis, 4-edge snap) ═══
(function(){
  var mp=null;
  var dragging=false,moved=false,preventClick=false;
  var startX,startY,startRight,startBottom;
  var DEAD=5; // deadzone px before drag activates

  function getmp(){if(!mp)mp=document.getElementById("musicPlayer");return mp;}

  // 4-edge XY snap for minimized state
  function snap4(){
    var el=getmp();if(!el)return;
    var pw=el.offsetWidth,ph=el.offsetHeight;
    var w=window.innerWidth,h=window.innerHeight;
    var GAP=20,TOPGAP=70;
    var curRight=parseFloat(el.style.right)||GAP;
    var curBottom=parseFloat(el.style.bottom)||GAP;
    // Snap X: left or right edge
    var posX=w-curRight-pw; // left edge position
    var snapRight=posX<w/2?(w-pw-GAP):GAP;
    // Snap Y: top or bottom edge
    var posY=h-curBottom-ph; // top edge position
    var snapBottom=posY<h/2?(h-ph-TOPGAP):GAP;
    el.style.transition="right .42s cubic-bezier(.22,.61,.36,1),bottom .42s cubic-bezier(.22,.61,.36,1)";
    el.style.right=snapRight+"px";
    el.style.bottom=snapBottom+"px";
    setTimeout(function(){el.style.transition=""},450);
    // update playlist popup
    var pp=document.getElementById("mpPlaylistPopup");
    if(pp&&pp.classList.contains("show"))positionPlaylistPopup(pp,el);
  }

  // Clamp for expanded state (no snap, free drag)
  function clampExpanded(){
    var el=getmp();if(!el)return;
    var pw=el.offsetWidth,ph=el.offsetHeight;
    var w=window.innerWidth,h=window.innerHeight;
    var curRight=parseFloat(el.style.right)||20;
    var curBottom=parseFloat(el.style.bottom)||20;
    var GAP=20,TOPGAP=70;
    el.style.right=Math.max(GAP,Math.min(w-pw-GAP,curRight))+"px";
    el.style.bottom=Math.max(GAP,Math.min(h-ph-TOPGAP,curBottom))+"px";
  }

  function onDown(e){
    var el=getmp();if(!el)return;
    var isMin=el.classList.contains("minimized");
    // For minimized: any non-button area is draggable
    // For expanded: only drag from the cover section or mini-row area (not controls)
    if(isMin){
      if(e.target.closest("button"))return;
    } else {
      // expanded: only drag from the cover section / header
      var dragHandle=e.target.closest(".mp-cover-section,.mp-mini-row");
      if(!dragHandle)return;
      if(e.target.closest("button"))return;
    }
    dragging=true;moved=false;preventClick=false;
    startX=e.touches?e.touches[0].clientX:e.clientX;
    startY=e.touches?e.touches[0].clientY:e.clientY;
    startRight=parseFloat(el.style.right)||20;
    startBottom=parseFloat(el.style.bottom)||20;
    el.style.transition="none";
    if(e.type==="mousedown")e.preventDefault();
  }

  function onMove(e){
    if(!dragging)return;
    var el=getmp();if(!el)return;
    var cx=e.touches?e.touches[0].clientX:e.clientX;
    var cy=e.touches?e.touches[0].clientY:e.clientY;
    var dx=cx-startX,dy=cy-startY;
    if(!moved&&Math.abs(dx)<DEAD&&Math.abs(dy)<DEAD)return;
    moved=true;preventClick=true;
    var pw=el.offsetWidth,ph=el.offsetHeight;
    var w=window.innerWidth,h=window.innerHeight;
    var GAP=20,TOPGAP=70;
    var newRight=Math.max(GAP,Math.min(w-pw-GAP,startRight-dx));
    var newBottom=Math.max(GAP,Math.min(h-ph-TOPGAP,startBottom-dy));
    el.style.right=newRight+"px";
    el.style.bottom=newBottom+"px";
    // sync playlist popup position during drag
    var pp=document.getElementById("mpPlaylistPopup");
    if(pp&&pp.classList.contains("show"))positionPlaylistPopup(pp,el);
    if(e.cancelable)e.preventDefault();
  }

  function onUp(e){
    if(!dragging)return;
    dragging=false;
    var el=getmp();if(!el)return;
    if(moved){
      if(el.classList.contains("minimized"))snap4();
      else clampExpanded();
    }
    // Reset preventClick flag after a short delay (let click event fire first)
    setTimeout(function(){preventClick=false;},50);
  }

  // Click handler: only expand when NOT dragging and in minimized state
  function onClick(e){
    var el=getmp();if(!el)return;
    if(!el.classList.contains("minimized"))return;
    if(preventClick)return;
    if(e.target.closest("button"))return;
    expandPlayer();
  }

  var el=getmp();
  if(el){
    el.addEventListener("mousedown",onDown);
    el.addEventListener("touchstart",onDown,{passive:true});
    el.addEventListener("click",onClick);
  }
  window.addEventListener("mousemove",onMove);
  window.addEventListener("touchmove",onMove,{passive:false});
  window.addEventListener("mouseup",onUp);
  window.addEventListener("touchend",onUp);
})();

// Click-outside handler (also handles playlist close for both mini and expanded):
// - If playlist popup is open and click is outside player+popup → close playlist
// - If expanded and playlist already closed → minimize player to mini mode with edge snap
document.addEventListener("click",function(e){
  if(!mpState)return;
  var pl=document.getElementById("musicPlayer");
  var pp=document.getElementById("mpPlaylistPopup");
  // Check if click is outside both player and popup
  var outside=pl&&!pl.contains(e.target)&&(!pp||!pp.contains(e.target));
  if(!outside)return;
  // Step 1: close playlist first
  if(pp&&pp.classList.contains("show")){togglePlaylist();return}
  // Step 2: if expanded and playlist closed → minimize
  if(mpState.expanded)minimizePlayer();
});
