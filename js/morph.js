var xmlns = "http://www.w3.org/2000/svg",
  select = function(s) {
    return document.querySelector(s);
  },
  selectAll = function(s) {
    return document.querySelectorAll(s);
  },
  container = select('.container')
  

//center the container cos it's pretty an' that
TweenMax.set(container, {
  position: 'absolute',
  top: '50%',
  left: '50%',
  xPercent: -50,
  yPercent: -50
})

TweenMax.set('svg', {
  visibility: 'visible'
})

TweenLite.defaultEase = Elastic.easeInOut.config(1, 0.82);
var tl = new TimelineMax({paused:false, repeat:-1, yoyo:false,repeatDelay:1 });
tl.to('#tenZero', 2, {
  morphSVG:{shape:'#nine', shapeIndex:6},
  delay:1
})
.to('#tenOne', 0.5, {
  alpha:0,
  ease:Power2.easeOut
}, '-=1.5')
.to('#tenZero', 2, {
  morphSVG:{shape:'#eight', shapeIndex:6},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#seven', shapeIndex:18},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#six', shapeIndex:18},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#five', shapeIndex:15},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#four', shapeIndex:1},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#three', shapeIndex:2},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#two', shapeIndex:2},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#one', shapeIndex:2},
  delay:1
})
.to('#tenZero', 2, {
  morphSVG:{shape:'#zero', shapeIndex:'auto'},
  delay:1
})
.to('#tenOne', 1, {
  alpha:1,
  ease:Power2.easeOut,
  delay:2
})
.from('#tenOne', 1, { 
  scale:0.3,
  immediateRender:false,
  transformOrigin:'50% 100%',
},'-=1')
.to('#tenZero', 1, {
  ease:Power2.easeOut,
  x:'+=45'
},'-=1')
tl.timeScale(2)

