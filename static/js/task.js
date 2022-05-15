// Movie watching + written recall (+surveys) mturk experiment
// hongmi lee 2019/6/18
/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var movienum = 10 // 1~10
var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
    "instructions/instruct-6.html",
	"instructions/instruct-7.html",
	"video.html",
	"recall.html",
	"recall_example.html",
    "descriptionprac.html",
    "questionnaires/delayquestionnaire1.html",
    "questionnaires/delayquestionnaire2.html",
    "questionnaires/postquestionnaire_sam.html",
    "questionnaires/postquestionnaire_psiq.html",
    "questionnaires/postquestionnaire_wm.html",
	"questionnaires/postquestionnaire_end.html",
    "movieinfo/movieinfo-1.html",
	"movieinfo/movieinfo-2.html",
	"movieinfo/movieinfo-3.html",
	"movieinfo/movieinfo-4.html",
	"movieinfo/movieinfo-5.html",
    "movieinfo/movieinfo-6.html",
	"movieinfo/movieinfo-7.html",
    "movieinfo/movieinfo-8.html",
    "movieinfo/movieinfo-9.html",
    "movieinfo/movieinfo-10.html"
];
psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html"
];

var prac_video_title = "practice_wildebeest"//
var prac_video_path = '/static/video/'+prac_video_title+'.mp4'
switch (movienum) {
  case 1:
    var targ_video_title = "1_paperman"; break;
  case 2:
    var targ_video_title = "2_inner_workings"; break;
  case 3:
    var targ_video_title = "3_purl"; break;
  case 4:
    var targ_video_title = "4_near_algodones"; break;
  case 5:
    var targ_video_title = "5_future_boyfriend"; break;
  case 6:
    var targ_video_title = "6_in_the_time_it_takes_to_get_there"; break;
  case 7:
    var targ_video_title = "7_the_lie_game"; break;
  case 8:
    var targ_video_title = "8_runner"; break;
  case 9:
    var targ_video_title = "9_zima_blue"; break;
  case 10:
    var targ_video_title = "10_from_life";
}
var targ_video_path = '/static/video/'+targ_video_title+'.mp4'

// Specify how long the instruction buttons are disabled for upon loading pages
var Instruct_Delay = 2000; // in milliseconds

//define minimum duration of picture description and recall (in milliseconds)
var Picture_Delay = 5000
var Recall_Delay = 60000

/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and
* insert them into the document.
*
********************/    

    var play_video = function(phasename,videotitle,videopath,callbackfunc) {

            // Load the instructions
            psiTurk.showPage('video.html');

            // define video as variable
            var vid = document.getElementById("video");
            //create source variable
            var source = document.createElement('source');
            //define source video location
            /////change this to depend on counterbalancing
            source.setAttribute('src', videopath);
            //attach to video object
            vid.appendChild(source);
            //load video
            vid.load();

            // function that starts upon the video beginning to play
                // ref (https://www.w3schools.com/tags/av_event_play.asp)
            vid.onplay = function() {

                // define start time of video
            let $start_time = new Date().getTime(); // record start time

                // function that prevents scrubbing
                    // ref (https://stackoverflow.com/questions/11903545/how-to-disable-seeking-with-html5-video-tag)
                // define scrub time
                var supposedCurrentTime = 0;
                vid.addEventListener('timeupdate', function() { // look for scrubbing during movie play
                  if (!vid.seeking) {
                    supposedCurrentTime = vid.currentTime; // if yes, return to current time
                  }
                });

                // function that prevents user from seeking
                    // ref (https://stackoverflow.com/questions/11903545/how-to-disable-seeking-with-html5-video-tag)
                vid.addEventListener('seeking', function() {
                  // guard agains infinite recursion:
                  // user seeks, seeking is fired, currentTime is modified, seeking is fired, current time is modified, ....
                  var delta = vid.currentTime - supposedCurrentTime;
                  if (Math.abs(delta) > 0.01) {
                    console.log("Seeking is disabled");
                    vid.currentTime = supposedCurrentTime;
                  }
                });

                // define function that triggers when movie ends
                    // ref (https://stackoverflow.com/questions/2741493/detect-when-an-html5-video-finishes)
                vid.addEventListener('ended', function() {
                    let $end_time = new Date().getTime();
                    $video_duration = $end_time - $start_time; 
                    psiTurk.recordTrialData({
                        'phase': phasename,
                        'title': videotitle,
                        'video_path': videopath,
                        'video_starttime': $start_time,
                        'video_endtime': $end_time,
                        'video_duration': $video_duration});
                    currentview = new callbackfunc();
                    return;
                });
        };
    }; 
    
    var Practice_Recall = function() {

        psiTurk.showPage('recall_example.html');
        $("#next").click(function () {
            currentview = new Start_Task();
            return;
        });
    }; 

    var Start_Task = function() {

		psiTurk.showPage('instructions/instruct-4.html');
		$("#next").click(function () {
			currentview = new play_video("target_viewing",targ_video_title,targ_video_path,Start_Delaytasks);
			return;
		});
    }; 
 
    var Start_Delaytasks = function() {

		psiTurk.showPage('instructions/instruct-5.html');
		$("#next").click(function () {
			currentview = new Delay_Questionnaire1();
			return;
		});
    }; 

    var record_responses = function(phasename) {

        psiTurk.recordTrialData({'phase':phasename, 'status':'submit'});

		$('textarea').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
        $('select').each( function(i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
    };

    var record_likert_responses = function(phasename,surveyname,qnumbers) {

        for (n = 0; n < qnumbers.length; n++) {
            qid = surveyname+qnumbers[n];
            response = document.querySelector('input[name="'+qid+'"]:checked').value;

            psiTurk.recordTrialData({'phase':phasename, 'status':'submit-likert', 'question':qid, 'response':response});
        } 
    };

    var validate_responses = function(textid,selectid,likertid) {
        
        noresp = 0;
        if (textid.length > 0) {
            for (n = 0; n < textid.length; n++) {
                if (document.getElementById(textid[n]).value.length < 1) {
                    noresp = noresp + 1;
                }; 
            }; 
        };
        if (selectid.length > 0) {
            for (n = 0; n < selectid.length; n++) {
                if (document.getElementById(selectid[n]).options[document.getElementById(selectid[n]).selectedIndex].value == "") {
                    noresp = noresp + 1;
                }; 
            }; 
        };
        if (likertid.length > 0) {
            for (n = 0; n < likertid.length; n++) {
                if (document.querySelector('input[name="'+likertid[n]+'"]:checked') == null) {
                    noresp = noresp + 1;
                }; 
            }; 
        };  
        return noresp;
    };

    var Delay_Questionnaire1 = function() {

        // Load the task
		psiTurk.showPage('questionnaires/delayquestionnaire1.html');
        psiTurk.recordTrialData({'phase':'delayquestionnaire1', 'status':'begin'});

        // Define onclick function for next button
        $("#next").click(function () {
            
            // check missing responses
            noresp = validate_responses(["Age"],["Gender","English","TVfreq"],[]) 
            
            if (noresp > 0) {
                alert("You must answer all questions to continue.")
            }
            else {
                record_responses('delayquestionnaire1');
                psiTurk.saveData() // save data
                currentview = new Delay_Questionnaire2();
                return;
            }
         });
    };
    
    var Delay_Questionnaire2 = function() {

        // Load the task
		psiTurk.showPage('questionnaires/delayquestionnaire2.html');
        psiTurk.recordTrialData({'phase':'delayquestionnaire2', 'status':'begin'});

        // Define onclick function for next button
        $("#next").click(function () {
                        
            // check missing responses
            noresp = validate_responses([],[],["MWQ1","MWQ2","MWQ3","MWQ4","MWQ5"]) 
            
            if (noresp > 0) {
                alert("You must answer all questions to continue.")
            }
            else {
                record_likert_responses('delayquestionnaire2',"MWQ",[1,2,3,4,5]);
                psiTurk.saveData() // save data
                currentview = new Description_Prac();
                return;
            }
        });
    };
    
    var Description_Prac = function() {

		// Load the instructions
		psiTurk.showPage('descriptionprac.html');

		let $start_time = new Date().getTime(); // record start time

        $("#next").click(function () {
                
            let $end_time = new Date().getTime(); 
            $respduration = $end_time - $start_time; 
                
            let $description = document.getElementById('description_input').value

            psiTurk.recordTrialData({'phase':'descriptionprac', 
                                     'description': $description, 
                                     'start': $start_time, 
                                     'end': $end_time,
                                     'duration': $respduration,});
                
            psiTurk.saveData() // save data
            currentview = new Start_Targrecall();
            return;
        });        

    }; 
    
    var Start_Targrecall = function() {

		psiTurk.showPage('instructions/instruct-6.html');
		$("#next").click(function () {
			currentview = new Target_Recall();
			return;
		});
    }; 

    var Target_Recall = function() {

		// Load the instructions
		psiTurk.showPage('recall.html');

		let $start_time = new Date().getTime(); // record start time

			// Define function to record recall data
			record_recall = function() {

				//define variables
				let $recall_end_time = new Date().getTime(); // save movie end time as a variable
                $recall_duration = $recall_end_time - $start_time;
                    
				let $recall = document.getElementById('recall_input').value

				psiTurk.recordTrialData({'phase':'target_recall', 
                                         'title': targ_video_title, 
                                         'vidpath': targ_video_path, 
                                         'movienum': movienum,
                                         'recall': $recall, 
                                         'start': $start_time, 
                                         'end': $recall_end_time,
                                         'duration': $recall_duration });

			}; //EndOFunction record_recall

			// Define onclick function for next button
			$("#next").click(function () {
				record_recall();
				psiTurk.saveData() // save data
				currentview = new Start_Posttask();
				return;
			});

		};
    
    var Start_Posttask = function() {

		psiTurk.showPage('instructions/instruct-7.html');
		$("#next").click(function () {
			currentview = new Post_Questionnaire_SAM();
			return;
		});
    }; 

    var Post_Questionnaire_SAM = function() {

        // Load the task
		psiTurk.showPage('questionnaires/postquestionnaire_sam.html');
        window.scrollTo(0, 0);
        psiTurk.recordTrialData({'phase':'postquestionnaire_sam', 'status':'begin'});

        // Define onclick function for next button
        $("#next").click(function () {
                        
            // check missing responses
            qid = [];
            for (n = 1; n < 11; n++) {
                qid.push("SAM"+n);
            }
            noresp = validate_responses([],[],qid) 
            
            if (noresp > 0) {
                alert("You must answer all questions to continue.")
            }
            else {
                record_likert_responses('postquestionnaire_sam',"SAM",[1,2,3,4,5,6,7,8,9,10]);
                psiTurk.saveData() // save data
                currentview = new Post_Questionnaire_PsiQ();
                return;
            }
        });
    }; 
    
    var Post_Questionnaire_PsiQ = function() {

        // Load the task
		psiTurk.showPage('questionnaires/postquestionnaire_psiq.html');
        window.scrollTo(0, 0);
        psiTurk.recordTrialData({'phase':'postquestionnaire_psiq', 'status':'begin'});

        // Define onclick function for next button
        $("#next").click(function () {
                        
            // check missing responses
            qid = [];
            qnumbers = [];
            for (n = 1; n < 22; n++) {
                qid.push("PSIQ"+n);
                qnumbers.push(n);
            }
            noresp = validate_responses([],[],qid) 
            
            if (noresp > 0) {
                alert("You must answer all questions to continue.")
            }
            else {
                record_likert_responses('postquestionnaire_psiq',"PSIQ",qnumbers);
                psiTurk.saveData() // save data
                currentview = new Post_Questionnaire_End();
                return;
            }
        });        

    }; 
    
    var Post_Questionnaire_End = function() {

        // Load the task
		psiTurk.showPage('questionnaires/postquestionnaire_end.html');
        window.scrollTo(0, 0);
        psiTurk.recordTrialData({'phase':'postquestionnaire_end', 'status':'begin'});

        // Define onclick function for next button
        $("#next").click(function () {
            
            // check missing responses
            noresp = validate_responses(["moviethoughts"],["watchedbefore","issue","subj_attention"],[]) 
            
            if (noresp > 0) {
                alert("You must answer all questions to continue.")
            }
            else {
                record_responses('postquestionnaire_end');
                psiTurk.saveData() // save data
                currentview = new Post_Questionnaire_WM();
            return;
            }
        });

    };
      
	var Post_Questionnaire_WM = function() {

		// Load the questionnaire snippet
		psiTurk.showPage('questionnaires/postquestionnaire_wm.html');
        window.scrollTo(0, 0);
		psiTurk.recordTrialData({'phase':'postquestionnaire_wm', 'status':'begin'});

		$("#next").click(function () {
            
            record_responses('postquestionnaire_wm');
            psiTurk.saveData()
            currentview = new Show_Movieinfo();
            return;
		});

	}; 

	var Show_Movieinfo = function() {

		var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

		prompt_resubmit = function() {
			document.body.innerHTML = error_message;
			$("#resubmit").click(resubmit);
		};

		resubmit = function() {
			document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
			reprompt = setTimeout(prompt_resubmit, 10000);

			psiTurk.saveData({
				success: function() {
				    clearInterval(reprompt);
	                psiTurk.computeBonus('compute_bonus', function(){
	                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
	                });
				},
				error: prompt_resubmit
			});
		};

		// Load the questionnaire snippet
		psiTurk.showPage('movieinfo/movieinfo-'+movienum+'.html');
		psiTurk.recordTrialData({'phase':'movieinfo', 'status':'begin'});

		$("#next").click(function () {
            
            psiTurk.recordTrialData({'phase':'movieinfo', 'status':'submit'});
            psiTurk.saveData({
                success: function(){
                    psiTurk.computeBonus('compute_bonus', function() {
                        psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                    });
                },
                error: prompt_resubmit});
		});

	}; 

/*******************
 * Run Task
 ******************/

// Task object to keep track of the current phase
var currentview;

$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
        
        // start by playing practice video
    	function() { currentview = new play_video("practice_viewing", prac_video_title, prac_video_path, Practice_Recall); } 
//     	function() { currentview = new Post_Questionnaire_WM(); } 
    );
});
