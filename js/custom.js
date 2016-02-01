var questions = [
{
    "text": "Which of the following choices will you choose?",
    "options": ["one", "two", "three", "I like them all."],
    "answer": "I like them all.",
    "explanation": "The ladder would be discrimination."
}, {
    "text": "Which of the following is not a mobile OS?",
    "options": ["iOS", "Cocoa Touch", "Android", "Palm OS"],
    "answer": "Cocoa Touch",
    "explanation": "Cocoa Touch is the kernel in which iOS runs on top of."
}, {
    "text": "Who is the most powerful person in the universe?",
    "options": ["Me", "You", "Superman", "Batman"],
    "answer": "Me",
    "explanation": "Believe in yourself."
}, {
    "text": "How many cups of coffee per day is considered healthy?",
    "options": ["Twelve", "Nineteen", "Fourty Four", "Thirteen"],
    "answer": "Twelve",
    "explanation": "Process of elimination tells you lower would be better."
}, {
    "text": "What is Object Based Programming?",
    "options": ["Language with hiearchy levels", "Not requiring a class", "A language including an object", "Implicit Inheritance & Subtype Support"],
    "answer": "Not requiring a class",
    "explanation": "Object Based Programming lanaguges do not require a class, while object oriented does."
}, {
    "text": "By whom was the first computer created?",
    "options": ["Bill Nye the Science Guy", "Bill Gates", "Charles Babbage", "Steve Jobs"],
    "answer": "Charles Babbage",
    "explanation": "Google said it was Charles Babbage who made the first computer.."
}, {
    "text": "Android was first mobile operating system.",
    "options": ["True", "False"],
    "answer": "True",
    "explanation": "I bet you can't prove otherwise."
}, {
    "text": "Which of the following choices is not a real answer?",
    "options": ["a", "b", "c", "d"],
    "answer": "none",
    "explanation": "This question will always be answered wrong.  You are welcome."
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
controlsMessage = $('#controls_message'),
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
        scoreNode.addClass('no_score').text('');
    }
},
startGame = function() {
    already = function (data) { if (!data) { console.log('startiong now'); return {time: Firebase.ServerValue.TIMESTAMP}; } else { timeSync(); console.log('started already'); } };
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
overlayMessage = function(message, css, timeout) {
    $.blockUI({ message: message, css: css });
    if (timeout) {
        setTimeout(function() {
            $.unblockUI();
        }, timeout);
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
    var chosenAnswer = $(this).find('#choice').text(),
    correctAnswer = questions[counter-1].answer,
    explanation = questions[counter-1].explanation,
    correct = chosenAnswer === correctAnswer,
    theClass = correct ? 'fa fa-check fa-5x green' : 'fa fa-times fa-5x red-primary';
    correctPoints = correct ? '100' : '0';
    if (isPlaying() && !$("#answerQuestion").is(':visible')) {
        $("#playing").hide();
        $("#answerQuestion").find("#answered").text(chosenAnswer);
        $("#answerQuestion").find(".icon").removeClass().addClass(theClass);
        $("#answerQuestion").find(".points").text(correctPoints + ' points.');
        $("#answerQuestion").addClass("animated fadeInLeft").show();

    }
    else if (!isPlaying()) {
        $("#questionAnswer #text").text(correctAnswer);
        $("#questionAnswer").addClass("animated fadeInRight").show();
        $("#playing").hide();
    }
    results.answers.push(correct);
    results.currentScore = calculateScore(results.answers);
    pushScore();
    if (counter === questions.length) {
        $("#scoring").show();
        $("#answers").hide();
        $("#playing").hide();
        $("#answerQuestion").hide();
        $("#questionAnswer").hide();
        clearTimeout(timerId2);
        showResults();
    }
    scoreNode.removeClass('no_score')
    .text(results.currentScore + ' correct');
    /*questionTitle.html(correctText + wrap('span', correctAnswer)).addClass('show_answer');*/
    answersBlock.text(explanation);
},
isPlaying = function() {
    return game.player.substring(0,6) == 'avatar' ? true : false;
},
nextQuestion = function() {
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
    $("#questionAnswer").hide();
    var questionDetails = questions[counter];
    questionNumber.text((counter+1) + ' of ' + questions.length);
    questionTitle.text(questionDetails.text).removeClass('show_answer');
    answersBlock.empty();
    actionButton.text('Answer');
    for (var i = 0; i < questionDetails.options.length; i++) {
        var newQuestion = $('#answers').find('#answer' + i + ' #choice')
            .text(questionDetails.options[i]).addClass('fadeInRight scale');
        answersBlock.append($(newQuestion));
    }
    counter++;
},
controlsHelp = function() {
    $.blockUI({
        message: controlsMessage,
        css: {
            borderRadius: '3px',
            width: '65%',
            top: '20%',
            left: '17%' },
            onBlock: function() {
                $(document).click(function() {
                    $.unblockUI();
                    $(document).unbind('click');
                });
            }
        });
},
timeSync = function() {
    if (isPlaying()) {
        game.DB.child(game.player).child('time').set(Firebase.ServerValue.TIMESTAMP);
    }
    else {
        getTime = game.DB.push({time: Firebase.ServerValue.TIMESTAMP});
        game.player = getTime.key();
        console.log(game.player);
    }
    game.DB.once('value',function(timeShot) {
        console.log(timeShot);
        starttime = timeShot.child('begin/time').val();
        time = timeShot.child(game.player + '/time').val();
        if (time) {                
            countDown = function() {
                switch (timeLeft) {
                    case 14: $(".waiting").text("Ready"); break;
                    case 13: $(".waiting").text("Ready."); break;
                    case 12: $(".waiting").text("Ready.."); break;
                    case 11: $(".waiting").text("Ready..."); break;
                    case 10: $(".waiting").text("Ready...Set"); break;
                    case 9: $(".waiting").text("Ready...Set."); break;
                    case 8: $(".waiting").text("Ready...Set.."); break;
                    case 7: $(".waiting").text("Ready...Set..."); break;
                    case 6: $(".waiting").text("Ready...Set.."); break;
                    case 5: $(".waiting").text("Ready...Set."); break;
                    case 4: $(".waiting").text("Ready...Set.."); break;
                    case 3: $(".waiting").text("Ready...Set..."); break;
                    case 2: $(".waiting").text("Ready...Set...GO!"); break;
                    case 1: $(".waiting").text("Ready...Set...GO!"); break;
                    default: break;
                }
                if (timeLeft <= 0) {
                    clearTimeout(timerId);
                    timerStart = false;
                    $('h1.timer').hide();
                    $('.timer-box').hide();
                    nextQuestion(); 
                }
                else {
                    $('h1.timer').text(timeLeft);
                    timeLeft--;
                }
            }
            timeLeft = timerCounter;
            remain = ((time - starttime) / 1000);
            timeLeft = Math.floor( timerCounter - remain );
            console.log(timeLeft + ' timeLeft');
            elem = $('timer');
            if (timeLeft <= 0 && !timerStart) { timerId = setInterval(countDown, 1000); timerStart = true; }
            else { console.log('no countdown'); return; }
        }
    });
},
timeSync2 = function() {
    countDown2 = function() {
        console.log('countdown2');
        if (timeOut <= 0) {
            gradeQuestion();
            clearTimeout(timerId2);
            timerId2 = setTimeout(nextQuestion, 5000);
            $('.timer-box2').hide();
        }
        $('.timer-box2').show();
        $('.timer2').text(timeOut);
        timeOut--
    }
    timeOut = waitTime;

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
        }
        if (key == 'score') {
            console.log(avatar + ' has ' + value)
            $('#' + avatar.substr(-1)).find('h1').text(value);
            /*remove elem.children('.avatar').removeClass('taken'), elem.children('.name').html('<h2>Player ' + avatar.substr(-1) +'</h2>');*/
        }
    }
    else if (avatar == 'begin' && !timerStart) {
       
        timeSync();
    }
},
init = function() {
    game.DB.on('child_added', function(children) {
        game.DB[children.key] = children.val();
        children.forEach(function(one) {
            updatePlayer(children.key(), one.key(), one.val());
        })
    });
    game.DB.on('child_removed', function(children) {
        if (children.key().substring(0,6) === 'avatar') {
            $('#' + children.key()).removeClass('taken')
            .next().html('<h2>Player ' + children.key().substr(-1) + '</h2>');
            if (children.key() == game.player) { game.player = '';}
        }
        /*children.key() === game.player ? game.player = '' : console.log('?');*/
        console.log('removed', children.key().split('_') + ' ', children.val());
    });
    game.DB.on('child_changed', function(children) {
        children.forEach(function(one) {
            updatePlayer(children.key(), one.key(), one.val());
        });
    });
    game.DB.once('value', function(results) {
    });

},
clearDB = function() {
 var onComplete = function(error) { success = (!error) ? console.log('removed everything') : console.log('error' + error); }
 game.DB.remove(onComplete);
}
retur = function() { console.log('not playing dummy'); return; };

$('#reset').click(resetGame);
$('#start').click(startGame);
$('.answer').click( isPlaying() ? retur : gradeQuestion );
$('#controls_help').click(controlsHelp);
$('.answers').click(dispatchAction);
$('#submit').click(dispatchAction);
$('.avatar').click(function() {
    if (!game.player) {
        game.player = this.id;
        game.DB.child(game.player).child('time').set(Firebase.ServerValue.TIMESTAMP);
        game.DB.child(game.player).onDisconnect().remove();
        name = prompt('Enter your name or initials.')
        name ? $(this).next().attr('id',name).html('<h2>'+ name +'</h2>') : name = 'Player ' + this.id.substr(-1);
        game.DB.child(game.player + '/name').transaction(function(data) { return name });
    }

    else {         }

});
init();