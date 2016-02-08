
var questions = [
{
    "text": "Who founded Chipotle?",
    "options": ["Matt Lauer", "Ray Kroc", "Steve Ells", "Richard McDonald"],
    "answer": "Steve Ells",
    "explanation": "Steve Ells founded Chipotle in 1993."
}, {
    "text": "Where was the first Chipotle?",
    "options": ["San Francisco\, CA", "Denver\, CO", "Toledo\, OH", "Broomfield\, CO"],
    "answer": "Denver\, CO",
    "explanation": "Chipotle was first opened in Denver\, using a $75k loan from his Dad."
}, {
    "text": "In order for Steve to repay his Dad, how many burritos must he sell per day?",
    "options": ["114", "208", "94", "961"],
    "answer": "114",
    "explanation": "He ended up selling over 1000 per day."
}, {
    "text": "In 1996, Steve Ells' parents raise how much money to expand?",
    "options": ["$600k", "$1.3m", "$2.9m", "$32m"],
    "answer": "$1.3m",
    "explanation": "They were hustling to make that green."
}, {
    "text": "What company invests 50 million into Chipotle in 1998?",
    "options": ["Prez", "Boston Market", "McDonalds", "Fazoli's"],
    "answer": "McDonalds",
    "explanation": "McDonalds wanted to show investors that they were diversified in financial planning."
}, {
    "text": "What was the organization name after McDonalds investments?",
    "options": ["Ronald Food", "Whole Foods", "Food with Integrity", "Diversified Foods"],
    "answer": "Food with Integrity",
    "explanation": "They later shut it down due to competition with McDonalds."
}, {
    "text": "What year did Chipotle go public?",
    "options": ["March 2\, 2003", "Jan 26\, 2006", "Feb 2\, 1993", "December 3\, 1999"],
    "answer": "Jan 26\, 2006",
    "explanation": "Jan 26\, 2006 is when they went public with stock as IPO."
}, {
    "text": "What is the intial stock price of IPO?",
    "options": ["$22", "$23", "$25", "$44"],
    "answer": "$22",
    "explanation": "On the first day\, it doubles to $44."
}];
var
counter = 0,
timeLeft = 0,
gameOver = false,
resetCounter = 0,
timerCounter = 15,
timerStart = false,
player = $("#player"),
scoreNode = $('#score'),
actionButton = $('#submit'),
answersBlock = $('.answers'),
questionTitle = $('.question h1'),
errorMessage = $('#error_message'),
questionNumber = $('#question_number'),
answerTemplate = $('#answer_template').text(),
gameRoot = 'https://vzw.firebaseio.com/game/',
game = {DB: new Firebase(gameRoot), player: ""},
waitTime = 10,
results = {answers: [], currentScore: 0},
wrap = function(tag, text) {
    return '<{{0}}>{{1}}</{{0}}>'.replace(/\{\{0\}\}/g, tag)
    .replace(/\{\{1\}\}/g, text);
},
calculateScore = function(answers) {
    var correctCount = 0;
    answers.map(function(value, index) {
        if (value) correctCount += 100;
    });
    return correctCount;
},
resetGame = function() {
    if (resetCounter++ > 1 || gameOver || confirm('Are you sure you want to reset the game?')) {
        counter = 0;
        gameOver = false;
        clearDB();
        results = {count: 0, answers: [], currentScore: 0};
        $('h1.timer').show();
        $('.timer-box').show();
        $('h1.waiting').txt("Waiting for players \n to join the room.")
        scoreNode.addClass('no_score').text('');
    }
},
startGame = function() {
    already = function (data,err) { if (!data) { return {time: Firebase.ServerValue.TIMESTAMP}; } if (err) { console.log(err);} };
    game.DB.child('begin').transaction(already);
},
showResults = function() {
    answersBlock.empty();
    gameOver = true;
    actionButton.text('Play again');
    scoreChart();
    clearTimeout(timerId2);
},
scoreChart = function() {
    var data = [{name: 'You', score: results.currentScore}];
    game.DB.on("child_added",function(theData) {
        data.push({name: theData.key(), score: theData.val()});
    });
    game.DB.once('value', function(scores) {
        var sum = 0,
        count = 0,
        currentAverage = 0,
        currentScores = scores.val();
        for (var i in currentScores) {
            if (currentScores.hasOwnProperty(i)) {
                count += 1;
                sum += currentScores[i];
            }
        }
        currentAverage = sum / count;
                //data.push({name: 'Everyone else', score: currentAverage});
                //drawChart('.answers', data);
                $("#scoring").show();
                $('#playing').hide();
                $("#answerQuestion").hide();
                $("#questionAnswer").hide();
                $("#answers").hide();
            });
},
pushScore = function() {
    if (game.player) { game.DB.child(game.player + '/score').set(results.currentScore); }
},
inputCheck = function() {
    if ($('.answer_radio:checked').length) {
        transitionEffect(gradeQuestion);
    }
    else {
        /*overlayMessage(errorMessage, {borderRadius: '3px', width: '35%', left: '32%'}, 2000);*/
    }
},
transitionEffect = function(func) {
    $('.question').hide('slow', function() {
        func();
        $('.question').show();
    });
},
dispatchAction = function() {
    var action = actionButton.text();
    if (action === 'Answer') {
        inputCheck();
    } else if (action === 'Next question') {
        transitionEffect(nextQuestion);
    } else if (action === 'Start Over') {
        transitionEffect(resetgame);
    } else {
        transitionEffect(showResults);
    }
},
gradeQuestion = function() {
    var chosenAnswer = $("#playing").find('.clicked').text();
    //var chosenAnswer = $(this).find('#choice').text(),
    correctAnswer = questions[counter-1].answer,
    explanation = questions[counter-1].explanation,
    correct = chosenAnswer === correctAnswer,
    iconClass = correct ? 'right' : 'wrong';
    /*
    if the variable correct equals true then make answerQuestionClass = main teal animated fadeInLeft,
    otherwise if correct equals false, return main sky animated fadeInLeft.
    Then, $("#answerQuestion").addClass(answerQuestionClass) will be the same as you adding that class to #answerQuestion.
    But we are going to remove the class first.  so $("#answerQuestion").removeClass().addClass(answerQuestionClass).show();

    
    */
    answerQuestionClass = correct ? 'main teal animated fadeInLeft' : 'main sky animated fadeInLeft';
    correctPoints = correct ? '100' : '0';
    if (isPlaying() && !$("#answerQuestion").is(':visible')) {
        $("#playing").hide();
        $("#answerQuestion").find("#answered").text(chosenAnswer);
        $("#answerQuestion").find("#icon").removeClass().addClass(iconClass);
        $("#answerQuestion").find(".points").text(correctPoints + ' points.');

        $("#answerQuestion").removeClass().addClass(answerQuestionClass).show();

    }
    else if (!isPlaying()) {
        $("#questionAnswer #text").text(correctAnswer);
        $("#questionAnswer #explanation_text").text(explanation);
        $("#questionAnswer").addClass("animated fadeInRight").show();
        $("#playing").hide();
    }
    results.answers.push(correct);
    results.currentScore = calculateScore(results.answers);
    pushScore();
    if (counter === questions.length) {
        setTimeout(function() {
            $("#scoring").show();
            $("#answers").hide();
            $("#playing").hide();
            $("#answerQuestion").hide();
            $("#questionAnswer").hide();
            clearTimeout(timerId2);
            showResults();
        }, 5000);
    }
    scoreNode.removeClass('no_score')
    .text(results.currentScore + ' correct');
    /*questionTitle.html(correctText + wrap('span', correctAnswer)).addClass('show_answer');*/
    answersBlock.text(explanation);
},
isPlaying = function(player) {
    return player ? player.substring(0,6) === 'avatar' : game.player.substring(0,6) === 'avatar';
},
nextQuestion = function() {
    $("#questionAnswer").hide();
    var questionDetails = questions[counter];
    questionNumber.text((counter+1) + ' of ' + questions.length);
    questionTitle.text(questionDetails.text).removeClass('show_answer');
    $('#answers').find('.clicked').removeClass('clicked');
    answersBlock.empty();
    actionButton.text('Answer');
    for (var i = 0; i < questionDetails.options.length; i++) {
        var newQuestion = $('#answers').find('#answer' + i + ' #choice')
        .text(questionDetails.options[i]).addClass('fadeInRight');
        answersBlock.append($(newQuestion));
    }
    counter++;
    if (isPlaying()) {
        $("#answerQuestion").removeClass('animated fadeInLeft').hide();
        $("#answers").removeClass('fadeOutRight').addClass("fadeInRight");
        $("#playing").show(); $("#waiting").hide();
        //$("#questionAnswer").removeClass('animated fadeInLeft');
        timeSync2();
    }
    else if (!isPlaying()) {
        $("#answers").removeClass('fadeOutRight').addClass("fadeInRight");
        $("#playing").show();
        $("#waiting").hide();
        timeSync2();
        /*$("#scoring").show();*/
    }
},
timeSync = function() {
    if (isPlaying()) {
        game.DB.child(game.player).child('time').set(Firebase.ServerValue.TIMESTAMP);
    }
    else if (!game.player) {
        getTime = game.DB.push({time: Firebase.ServerValue.TIMESTAMP});
        game.player = getTime.key();
    }
    game.DB.once('value',function(timeShot) {
        starttime = timeShot.child('begin/time').val();
        time = timeShot.child(game.player + '/time').val();
        if (time) {               
            countDown = function() {
                switch (timeLeft) {
                    /*case 14: $(".waiting").text("Ready"); break;
                    case 13: $(".waiting").text("Ready."); break;
                    case 12: $(".waiting").text("Ready.."); break;
                    case 11: $(".waiting").text("Ready..."); break;
                    case 10: $(".waiting").text("Ready...Set"); break;
                    case 9: $(".waiting").text("Ready...Set."); break;
                    case 8: $(".waiting").text("Ready...Set.."); break;
                    case 7: $(".waiting").text("Ready...Set..."); break;
                    case 6: $(".waiting").text("Ready...Set.."); break;*/
                    case 5: $(".waiting").text("Ready."); break;
                    /*                    case 4: $(".waiting").text("Ready...Set.."); break;*/
                    case 3: $(".waiting").text("Ready.  Set."); break;
                    /*                    case 2: $(".waiting").text("Ready...Set...GO!"); break;*/
                    case 1: $(".waiting").text("Ready.  Set.  GO!"); break;
                    default: break;
                }
                if (timeLeft === 0) {
                    clearTimeout(timerId);
                    timerStart = false;
                    $('h1.timer').hide();
                    $('.timer-box').hide();
                    nextQuestion(); 
                }
                else {
                    if (timeLeft < 0) {
                        game.DB = game.DB.parent().push({time: Firebase.ServerValue.TIMESTAMP});
                        init();
                        $('h1.waiting').text('Waiting for players to join'); 
                        game.player = '';
                        clearTimeout(timerId);
                        $('h1.timer').hide();
                        $('.timer-box').hide();
                    }
                    else {
                        $('h1.timer').text(timeLeft);
                        if (!$('.timer-box').is(':visible')) { $('.timer-box').show(); }
                        timeLeft--;
                    }
                }
            }
            timeLeft = timerCounter;
            remain = ((time - starttime) / 1000);
            timeLeft = Math.floor( timerCounter - remain );
            elem = $('timer');
            if (!timerStart) { timerId = setInterval(countDown, 1000); timerStart = true; }
        }
    });
},
timeSync2 = function() {
    timeOut = waitTime;
    countDown2 = function() {
        $('.timer2').text(timeOut);
        timeOut--
        $('.timer-box2').show();
        if (timeOut == -1  && counter <= questions.length) {
            setTimeout(gradeQuestion(), 5000);
            clearTimeout(timerId2);
            timerId2 = setTimeout(nextQuestion, 5000);
            $('.timer-box2').hide();
        }
    }
    timerId2 = setInterval(countDown2, 1000);
},
updatePlayer = function(avatar, key, value) {
    if (avatar.substring(0,6) === 'avatar') {
        if (key == 'time') {
            $('#' + avatar).addClass('taken');
            /* $('#' + avatar).hasClass('taken') ? $('#' + avatar).removeClass('taken') : */
        }
        if (key == 'name') {
            elem = $('#' + avatar).next().attr('data-name', key).html('<h2>' + value +'</h2>');
            elem = $('#' + avatar.replace('avatar_','')).find(".score_name p").text(value);
        }
        if (key == 'score') {
            $('#' + avatar.replace('avatar_','')).find('.score_bar').css('min-height',(value + 50) + 'px');
            $('#' + avatar.replace('avatar_','')).find('h1').text(value);
        }
    }
    else if (avatar == 'begin' && !timerStart) {
        if (timeLeft >= 0) { timeSync(); }
        else { }
    }
},
clearDB = function() {
   var onComplete = function(error) { success = (!error) ? console.log('db reset.') : error; }
   game.DB.remove(onComplete);
},
init=function() {
    initFunc = function(children){game.DB[children.key()]=children.val();children.forEach(function(each){updatePlayer(children.key(),each.key(),each.val());})};
    game.DB.limitToLast(1).once("child_added", function(data) {
        game.DB = game.DB.child(data.key());
        game.DB.on('child_added', initFunc);
        game.DB.on('child_changed', initFunc);
        game.DB.on('child_removed', function(gZ) {
            if (isPlaying(gZ.key())) {
                $('#'+gZ.key()).removeClass('taken').parent().find('h2').text('Player '+gZ.key().replace('avatar_',''));
                if(gZ.key() === game.player) game.player = '';
            }
        });
    });
};
$('#reset').click(resetGame);
$('#start').click(startGame);
$('.answer').click(
    function() {
        $('#answers').find('.clicked').removeClass('clicked');
        $(this).addClass('clicked');
    });
   //isPlaying() ? '' : gradeQuestion
   $('.answers').click(dispatchAction);
   $('#submit').click(dispatchAction);
   $('.avatar').click(function() {
    if (!game.player) {
        game.player = this.id;
        game.DB.child(game.player).child('time').set(Firebase.ServerValue.TIMESTAMP);
        game.DB.child(game.player).onDisconnect().remove();
        name = prompt('Enter your name or initials.') || 'Player ' + this.id.replace('avatar_','');
        if (name.length > 16) name = name.substring(0,16);
        name ? $(this).next().attr('id',name).find('h2').text(name) : name = 'Player ' + this.id.replace('avatar_','');
        game.DB.child(game.player + '/name').transaction(function(data) { return name });
    }
    else {  }

});
   init();

//jquery add on to add break back to the waiting text http://stackoverflow.com/questions/4535888/jquery-text-and-newlines
(function() { $.fn.txt = function(txt){ this.text(txt);this.html(this.html().replace(/\n/g,'<br/>'));return this;}})(jQuery);