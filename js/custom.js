var questions = [
 { "text": "Which of the following choices will you choose?",
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
    "options": ["a", "b", "c", "d", "efghijklmnopqrstuvwxyz"],
    "answer": "none",
    "explanation": "This question will always be answered wrong.  You are welcome."
}];
    var UP = 38,
        DOWN = 40,
        ENTER = 13,
        ESCAPE = 27,
        counter = 0,
        timeLeft = 0,
        gameOver = false,
        resetCounter = 0,
        timerCounter = 30,
        player = $("#player"),
        scoreNode = $('#score'),
        actionButton = $('#submit'),
        answersBlock = $('.answers'),
        questionTitle = $('.question h2'),
        errorMessage = $('#error_message'),
        questionNumber = $('#question_number'),
        controlsMessage = $('#controls_message'),
        answerTemplate = $('#answer_template').text(),
        gameRoot = 'https://vzw.firebaseio.com/game/scores/',
        gameDB = new Firebase(gameRoot),
        results = {answers: [], currentScore: 0}, thisPlayer = "",
        wrap = function(tag, text) {
            return '<{{0}}>{{1}}</{{0}}>'.replace(/\{\{0\}\}/g, tag)
                .replace(/\{\{1\}\}/g, text);
        },
        calculateScore = function(answers) {
            var correctCount = 0;
            answers.map(function(value, index) {
                if (value) correctCount += 1;
            });
            return correctCount;
            // % = Math.round(100 * correctCount / answers.length);
        },
        resetGame = function() {
            if (resetCounter++ > 1 || gameOver || confirm('Are you sure you want to reset the game?')) {
                counter = 0;
                gameOver = false;
                clearDB();
                results = {count: 0, answers: [], currentScore: 0};
                scoreNode.addClass('no_score').text('');
                nextQuestion();
            }
        },
        startGame = function() { timeSync(); },
        showResults = function() {
            answersBlock.empty();
            questionTitle.text('You answered ' + results.currentScore + ' of '
                + 'the questions correctly.');
            gameOver = true;
            actionButton.text('Play again');
            scoreChart();
        },
        scoreChart = function() {
            var data = [{name: 'You', score: results.currentScore}];
            gameDB.on("child_added",function(theData) {
                        data.push({name: theData.key(), score: theData.val()});
            });
            gameDB.once('value', function(scores) {
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
                 gameDB.off();
                //data.push({name: 'Everyone else', score: currentAverage});
                drawChart('.answers', data);
                $(".answers").addClass('rotate');
                $('.chart').show('slide', {direction: 'right'}, 400);
            });
        },
        pushScore = function() {
            if (thisPlayer) gameDB.child(thisPlayer).set(results.currentScore);
        },
        inputCheck = function() {
            if ($('.answer_radio:checked').length) {
                transitionEffect(gradeQuestion);
            }
            else {
                //overlayMessage(errorMessage, {borderRadius: '3px', width: '35%', left: '32%'}, 2000);
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
            $('.question').hide('slide', {direction: 'left'}, 200, function() {
                func();
                $('.question').show('slide', {direction: 'right'}, 200);
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
            var chosenAnswer = $('.answer_radio:checked + .answer').text(),
                correctAnswer = questions[counter-1].answer,
                explanation = questions[counter-1].explanation,
                correct = chosenAnswer === correctAnswer,
                correctText = correct ? 'Correct! ' : 'Incorrect! The correct answer is: ';

            results.answers.push(correct);
            results.currentScore = calculateScore(results.answers);
                            pushScore();
            scoreNode.removeClass('no_score')
                .text(results.currentScore + ' correct');
            questionTitle.html(correctText + wrap('span', correctAnswer)).addClass('show_answer');
            answersBlock.text(explanation);
            if (counter === questions.length) {
                actionButton.text('See results');
            } else {
                actionButton.text('Next question');
            }
        },
        nextQuestion = function() {
            var questionDetails = questions[counter];
            questionNumber.text((counter+1) + ' of ' + questions.length);
            questionTitle.text(questionDetails.text).removeClass('show_answer');
            answersBlock.empty();
            actionButton.text('Answer');
            for (var i = 0; i < questionDetails.options.length; i++) {
                var newQuestion = answerTemplate
                  .replace(/{{id}}/g, 'answer' + i)
                  .replace('{{text}}', questionDetails.options[i]);
                answersBlock.append($(newQuestion));
            }
            counter++;
        },
        controlsHelp = function() {
            $.blockUI({
                message: controlsMessage,
                css: { borderRadius: '3px',
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
            if (thisPlayer) {
                gameDB.child(thisPlayer).child('time').set(Firebase.ServerValue.TIMESTAMP);
            }
            else {
                thisPlayer = 'admin';
                gameDB.child(thisPlayer).child('time').set(Firebase.ServerValue.TIMESTAMP);
             }
            gameDB.once('value',function(timeShot) {
                var starttime = timeShot.val()['start'];
                time = timeShot.val()[thisPlayer].time;
                countDown = function() {
                    if (timeLeft == 0) {
                        clearTimeout(timerId);
                        $('h1.timer').hide();
                        if (thisPlayer) { nextQuestion; }
                        else { console.log("next"); }
                      } else {
                        $('h1.timer').text(timeLeft);
                        timeLeft--;
                      }
                    }
                if (!starttime) {
                    gameDB.child('start').set(Firebase.ServerValue.TIMESTAMP);
                    timeLeft = timerCounter;
                    elem = $('timer');
                    timerId = setInterval(countDown, 1000);
                    timerStart = true;
                    console.log(starttime, time, 'begin');
                }
                else {
                    remain = ((time - starttime) / 1000);
                    timeLeft = Math.floor(timerCounter - remain);
                    console.log(timeLeft + ' timeLeft');
                    elem = $('timer');
                    if (timeLeft > 0) { timerId = setInterval(countDown, 1000); }
                    else { console.log('game started already'); return; }
                    timerStart = true;
                    console.log(remain);
                    console.log(starttime, time, 'already');
                }
            });
        },
        init = function() {
            gameDB.on('child_added', function(children) {
                $('#' + children.key()).parent().addClass('taken');
                console.log('added', children.key() + children.val());
            });
            gameDB.on('child_removed', function(children) {
                $('#' + children.key()).parent().removeClass('taken');
                console.log('removed', children.key() + children.val());
            });
            gameDB.on('child_changed', function(children) {
                console.log('changed', children.key() + children.val());
            });
           
        },
        clearDB = function() {
         var onComplete = function(error) {
            if (error) {
                    console.log('remove failed');
                  } else {
                    console.log('remove succeeded');
                  }
                }
            gameDB.remove(onComplete);
         }
        keydownListener = function(e) {
            // Remove message if present
            if ($('.blockMsg:visible').length) {
                e.preventDefault();
                $.unblockUI();
                return;
            }
            if (e.keyCode === ENTER) {
                e.preventDefault();
                dispatchAction();
            } else if (e.keyCode === UP || e.keyCode === DOWN) {
                e.preventDefault();
                var answerCount = $('.answer_radio').length;
                if ($('.answer_radio:checked').length) {
                    var checkedID = $('.answer_radio:checked').attr('id'),
                        id = parseInt(checkedID.substring(6)),
                        direction = (e.keyCode === UP) ? -1 : 1;
                    // move ID number to next in answer range
                    id = (id + direction + answerCount) % answerCount;
                    $('#answer' + id).prop('checked', true);
                } else if (e.keyCode === DOWN) {
                    $('#answer0').prop('checked', true);
                } else if (e.keyCode === UP) {
                    $('#answer' + (answerCount - 1)).prop('checked', true);
                }
            }
        };

    $('#reset').click(resetGame);
    $('#start').click(startGame);
    $('#controls_help').click(controlsHelp);
    $(".answers").click(dispatchAction);
    $("#submit").click(dispatchAction);
    $(".avatar").click(function() {
        if (!thisPlayer) {
            thisPlayer = this.id;
            gameDB.child(thisPlayer).child('time').set(Firebase.ServerValue.TIMESTAMP);
            $(this).parent().addClass("taken");
        }
        else { }

    });
    $(document).keydown(keydownListener);

    // Load first question
    // nextQuestion();
    // Initialize
        init();


    // Draw d3.js chart with score data
    function drawChart(elementSelector, data) {

        var dataHeight = 55 * data.length;
        var chartHeight = dataHeight + (data.length - 1) * 5 + 5;
        var rangeHeight = 48 * data.length;

        var chart = d3.select(elementSelector).append('svg')
            .attr('class', 'chart')
            .attr('width', '100%')
            .attr('height', chartHeight)
          .append('g')
            .attr('transform', 'translate(10,20)');

        var x = d3.scale.linear()
            .domain([0, 100])
            .range(['0px', '90%']);

        var y = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeBands([0, rangeHeight]);

        var halfBarHeight = y.rangeBand() / 2;

        function barY(d, idx) {
            return y(idx) + idx * 5;
        }
        function barLabelY(d, idx) {
            return barY(d, idx) + halfBarHeight;
        }

        // Range lines
        chart.selectAll('line')
            .data(x.ticks(10))
          .enter().append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', dataHeight)
            .style('stroke', '#ccc');

        // Bars
        chart.selectAll('rect')
            .data(data)
          .enter().append('rect')
            .attr('y', barY)
            .attr('width', function(d) { return x(d.score); })
            .attr('height', y.rangeBand());

        // Bar labels
        chart.selectAll('text')
            .data(data)
          .enter().append('text')
            .attr('x', 0)
            .attr('y', barLabelY)
            .attr('dx', 5)
            .attr('dy', '.35em')
            .attr('text-anchor', 'start')
            .text(function(d) { return d.name; });

        // Range marker numbers
        chart.selectAll('.rule')
            .data(x.ticks(10))
          .enter().append('text')
            .attr('class', 'rule')
            .attr('x', x)
            .attr('y', 0)
            .attr('dy', -3)
            .attr('text-anchor', 'middle')
            .text(String);

        // Solid left line
        chart.append('line')
            .attr('y1', 0)
            .attr('y2', 120)
            .style('stroke', '#000');
    }