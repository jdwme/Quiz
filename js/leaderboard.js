//Declare Variables
var fbref, badge = {},
    sort = {},
    quizCount = {},
    database = {},
    point = {},
    pointsort = {},
    display = document.getElementById("leaders"),
    faster = Faster(),
    fbref = new Firebase("http://vzw.firebaseio.com"),
    replaced = "";
$(document).load(
    function() { 
        if (fbref) {
        fbref.authAnonymously(
        function(data, error) { 
        if (!data) { console.log("Success Auth"); }
        else if (error) { console.log('error', error); }
        });
  }
});
var xyz;
//Handle click event on which avatar
$(".avatar").click(function(click) {
    //Read full target class
    var clickElClass = click.target.className;
        //Get the number from it
    var clickElNumber = clickElClass.split(" ")[1];
      //Log to console
    console.log(clickElNumber);
    //hide the row
    $(this).parents().find(".row .avatars").hide();
    fbref.child("game").child(clickElNumber).on("value", function(data) {
        countdown(data.val());
    })
});
function countdown(ThisNumber) {
    $(".youare").attr("data-num", ThisNumber);
    $(".youare").parent().show();
    $(".countdown").text('15..14...13');
    questions(1);
}
function questions(num) {
    q = getQuest(num)
    console.log(q);
    $(".question").text(num + ". " + q['q']);
    $(".question").after(" <button> " + q[1] + " </button> ");
    $(".question").after(" <button> " + q[2] + " </button> ");
    $(".question").after(" <button> " + q[3] + " </button> ");
    $(".question").after(" <button> " + q[4] + " </button> ");
}
function getQuest(num) {
    var questions = {};
    questions = {
        1: {
            "q":"Question Number One.",
            "1":"answer 1",
            "2":"answer 2",
            "3":"answer 3",
            "4":"correct"
        },
        2: {
            "q":"Question Number Two.",
            "1":"answer 1",
            "2":"answer 2",
            "3":"answer 3",
            "4":"correct"
        },
        3: {
            "q":"Question Number 3.",
            "1":"answer 1",
            "2":"answer 2",
            "3":"answer 3",
            "4":"correct"
        },
    }
    return questions[num];
}


function Faster() {
    var fragment = document.createDocumentFragment();

    function create(node) {
        fragment.appendChild(node);
    }

    function reWrite(top) {
        var top = top || document.body;
        top.appendChild(fragment);
    }
    return {
        "create": create,
        "reWrite": reWrite
    }
}
function HTMLFORJOHN(NAME, IMAGE, NUMBEROFQUIZZES, NUMBEROFPOINTS) {
    //There will be a lot of activity going on here, so try to keep it simple like this:

    innerHTML =
        "<li class='collection-item avatar'><img class='circle'  src=" + IMAGE + "-/preview/100x100/-/setfill/000/-/crop/50x50/center/\">" +
        "<span class='title'>" + NAME + "</span>" +
        "<p>" +
        "<span><p id='quiz'>" + NUMBEROFQUIZZES + " Quizzes Completed" + "</span>" +
        "<p class='secondary-content' id='points'>" + NUMBEROFPOINTS + "</p>" +
        "</p>" +
        "</li>";



    return innerHTML;
}
leaderboard = {
        initial: function() {
            fbref.child('users').once("value", function(initial) {
                database = initial.val();
                initial.forEach(function(db) {
                    TheKey = db.key();
                    if (db.val().badge) {
                        quizCount[db.key()] = Object.keys(db.val().badge).length;
                    }
                    else if (!db.val().badge) { quizCount[db.key()]=0; }
                    if (db.val().points) {
                        point[db.val().points] = TheKey;
                    }
                });
                leaderboard.sorts(point);

            });
        },
        display: function() {
           var $MTotal = $('ul#leaders');
           var $Lis = $('ul#leaders>li');
           var $pPoint = $('ul#leaders>li #points');
        },
        sorts: function(obj) {
            var pointsort = Object.keys(obj).reverse();
            pointsort.forEach(function(i, f) {
                TheKey = obj[i];
                if (document.getElementById(TheKey)) {
                    loader = document.getElementById(TheKey);
                    replaced = true;
                } else {
                    loader = document.createElement('li');
                    loader.setAttribute("id", TheKey);
                }

                loader.innerHTML = HTMLFORJOHN(database[obj[i]].name, database[obj[i]].image, quizCount[obj[i]], i);
                if (replaced == true) {
                    replaced = "";
                    return;
                } else {
                    faster.create(loader);
                     faster.reWrite(display);
                }

            });
            leaderboard.update();

        },
        verify: function() {
        
        },
        update: function() {
            fbref.child('users').on("child_changed", function(db) {
                if ($("#" + db.key()).length == 0) {
                    var UiD = db.key();
                    var pTs = db.points;
                    if (database[UiD].points != db.val().points) {
                        point[database[UiD].points] = UiD;
                        htmltoinput = HTMLFORJOHN(db.name, db.image, quizCount[db.key()], db.val().points);
                        TheElement = document.getElementById(db.key());
                        if (quizCount[db.key()] == null) { quizCount[db.key()]=0; }
                        try { if (quizCount[db.key()] != Object.keys(db.val().badge).length) { quizCount[db.key()]=Object.keys(db.val().badge).length; } }
                        catch(err) { quizCount[db.key()]=0; }
                        $(TheElement).find("#points").html(db.val().points);
                        if (db.val().badge != null) {
                       try { $(TheElement).find("#quiz").html(Object.keys(db.val().badge).length + " Quizzes completed"); }
                       catch(err) { $(TheElement).find("#quiz").html("0 Quizzes completed"); }
                }
                        
                    }
                } else {
                    if (db.val().points) {
                        TheKey=db.key();
                        point[db.val().points] = db.key();
                        if (quizCount[db.key()] == null) { quizCount[db.key()]=0; }
                        $("#leaders").append(
                            HTMLFORJOHN(db.name, db.image, quizCount[db.key()], db.val().points)
                        );
             

                    }
                }
            
               sortThis();
            });
        }
    }

leaderboard.initial();
        
    function sortThis() {
        var $Ul = $('ul#leaders');
        $Ul.css({position:'relative',height:$Ul.height()});
        var iLnH;
        var $Li = $('ul#leaders>li');
        $Li.each(function(i,el){
            var iY = $(el).position().top;
            $.data(el,'li',iY);
            if (i===1) iLnH = iY;
        });
        $Li.tsort('#points',{order:'desc'}).each(function(i,el){
            var $El = $(el);
            var iFr = $.data(el,'li');
            var iTo = i*iLnH;
            $El.css({top:iFr}).animate({top:iTo},500);
        });
    }

(function(b){var o=!1,d=null,u=parseFloat,j=String.fromCharCode,q=Math.min,l=/(-?\d+\.?\d*)$/g,g,a=[],h,m,t=9472,f={},c;for(var p=32,k=j(p),r=255;p<r;p++,k=j(p).toLowerCase()){if(a.indexOf(k)!==-1){a.push(k)}}a.sort();b.tinysort={id:"TinySort",version:"1.3.25",copyright:"Copyright (c) 2008-2012 Ron Valstar",uri:"http://tinysort.sjeiti.com/",licenced:{MIT:"http://www.opensource.org/licenses/mit-license.php",GPL:"http://www.gnu.org/licenses/gpl.html"},defaults:{order:"asc",attr:d,data:d,useVal:o,place:"start",returns:o,cases:o,forceStrings:o,sortFunction:d,charOrder:g}};b.fn.extend({tinysort:function(V,L){if(V&&typeof(V)!="string"){L=V;V=d}var T=b.extend({},b.tinysort.defaults,L),v,Q=this,z=b(this).length,ae={},W=!(!V||V==""),H=!(T.attr===d||T.attr==""),ah=T.data!==d,J=W&&V[0]==":",C=J?Q.filter(V):Q,F=T.sortFunction,s=T.order=="asc"?1:-1,P=[];if(T.charOrder!=g){g=T.charOrder;if(!T.charOrder){m=false;t=9472;f={};c=h=d}else{h=a.slice(0);m=false;for(var S=[],B=function(i,ai){S.push(ai);f[T.cases?i:i.toLowerCase()]=ai},N="",X="z",aa=g.length,ac,Z,ad=0;ad<aa;ad++){var x=g[ad],ab=x.charCodeAt(),I=ab>96&&ab<123;if(!I){if(x=="["){var D=S.length,M=D?S[D-1]:X,w=g.substr(ad+1).match(/[^\]]*/)[0],R=w.match(/{[^}]*}/g);if(R){for(ac=0,Z=R.length;ac<Z;ac++){var O=R[ac];ad+=O.length;w=w.replace(O,"");B(O.replace(/[{}]/g,""),M);m=true}}for(ac=0,Z=w.length;ac<Z;ac++){B(M,w[ac])}ad+=w.length+1}else{if(x=="{"){var G=g.substr(ad+1).match(/[^}]*/)[0];B(G,j(t++));ad+=G.length+1;m=true}else{S.push(x)}}}if(S.length&&(I||ad===aa-1)){var E=S.join("");N+=E;b.each(E,function(i,ai){h.splice(h.indexOf(ai),1)});var A=S.slice(0);A.splice(0,0,h.indexOf(X)+1,0);Array.prototype.splice.apply(h,A);S.length=0}if(ad+1===aa){c=new RegExp("["+N+"]","gi")}else{if(I){X=x}}}}}if(!F){F=T.order=="rand"?function(){return Math.random()<0.5?1:-1}:function(av,at){var au=o,am=!T.cases?n(av.s):av.s,ak=!T.cases?n(at.s):at.s;if(!T.forceStrings){var aj=am&&am.match(l),aw=ak&&ak.match(l);if(aj&&aw){var ar=am.substr(0,am.length-aj[0].length),aq=ak.substr(0,ak.length-aw[0].length);if(ar==aq){au=!o;am=u(aj[0]);ak=u(aw[0])}}}var ai=s*(am<ak?-1:(am>ak?1:0));if(!au&&T.charOrder){if(m){for(var ax in f){var al=f[ax];am=am.replace(ax,al);ak=ak.replace(ax,al)}}if(am.match(c)!==d||ak.match(c)!==d){for(var ap=0,ao=q(am.length,ak.length);ap<ao;ap++){var an=h.indexOf(am[ap]),i=h.indexOf(ak[ap]);if(ai=s*(an<i?-1:(an>i?1:0))){break}}}}return ai}}Q.each(function(ak,al){var am=b(al),ai=W?(J?C.filter(al):am.find(V)):am,an=ah?ai.data(T.data):(H?ai.attr(T.attr):(T.useVal?ai.val():ai.text())),aj=am.parent();if(!ae[aj]){ae[aj]={s:[],n:[]}}if(ai.length>0){ae[aj].s.push({s:an,e:am,n:ak})}else{ae[aj].n.push({e:am,n:ak})}});for(v in ae){ae[v].s.sort(F)}for(v in ae){var ag=ae[v],K=[],Y=z,af=[0,0],ad;switch(T.place){case"first":b.each(ag.s,function(ai,aj){Y=q(Y,aj.n)});break;case"org":b.each(ag.s,function(ai,aj){K.push(aj.n)});break;case"end":Y=ag.n.length;break;default:Y=0}for(ad=0;ad<z;ad++){var y=e(K,ad)?!o:ad>=Y&&ad<Y+ag.s.length,U=(y?ag.s:ag.n)[af[y?0:1]].e;U.parent().append(U);if(y||!T.returns){P.push(U.get(0))}af[y?0:1]++}}Q.length=0;Array.prototype.push.apply(Q,P);return Q}});function n(i){return i&&i.toLowerCase?i.toLowerCase():i}function e(v,x){for(var w=0,s=v.length;w<s;w++){if(v[w]==x){return !o}}return o}b.fn.TinySort=b.fn.Tinysort=b.fn.tsort=b.fn.tinysort})(jQuery);



