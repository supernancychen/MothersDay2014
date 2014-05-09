$(document).ready(function(){
var state = 1;

var photoNum = 0;
var hasHand = false;
var imgLocs = [
	"img/1.jpg",
	"img/2.jpg",
	"img/3.jpg",
	"img/4.jpg"
];

var msgs = [
	"Mom, thank you for being my guardian angel since you gave me life.",
	"Thank you for being my source of wisdom.",
	"Thank you for selflessly and tirelessly holding our family together. We are blessed.",
	"Despite the distance, you are my mother and my soul sister. I love you with all my heart."
];


resetState(state);

function transformCSS (className, degree, axis) {
	var style = {
		"-webkit-transform": "rotate"+axis+"("+degree+"deg)",
		"-moz-transform": "rotate"+axis+"("+degree+"deg)",
		"transform": "rotate"+axis+"("+degree+"deg)"
	}
	$(className).css(style);
}

// based on how much the hand rolls, CSS transform the card to flip accordingly
// hasHand (boolean): whether a hand exists in the field of view or not
// handType (string): "left" or "right"
// degree: hand.roll in radian
function cardFlip(hasHand, handType, rollRadian) {
	var degree = rollRadian * (180 / Math.PI);

	if(hasHand) {
	    transformCSS(".front", 0-degree, 'Y');			// front card should roll from 0 to 180

		if(handType === "left") transformCSS(".back", -degree-180, 'Y');	 // roll: 0 to 180deg. back card should roll from -180 to 0
		else transformCSS(".back", -180-degree, 'Y');	// roll: 0 to -180deg. back card should roll from -180 to 0
	}
	else {
		transformCSS(".front", 0, 'Y');
		transformCSS(".back", -180, 'Y');
	}
}

var sound_file_url = "riverflowsinyou.mp3";

function resetState(stateNum) {
	if(stateNum === 2) {
		transformCSS(".front", 180, 'Y');
		transformCSS(".back", 0, 'Y');
		photoNum = 0;
		$(".panel").fadeTo("slow", 0);
	}
	else
	$("body").children().hide();
	state = stateNum;
	$(".state"+stateNum).show();
	if(stateNum === 3) {
	}
}

//var controllerOptions = {enableGestures: true};
Leap.loop({enableGestures: true}, function(frame) {
	// state machine
	switch(state) {
		case 1:
			if(frame.hands.length > 0) {
				var hand = frame.hands[0];
				var roll = hand.roll();
				cardFlip(true, hand.type, roll);

				if(Math.abs(roll) > Math.PI-0.1)  {
					// record the x position of the hand for state2
					if(hand.type === "left") {
						leftEntryX = hand.palmPosition[0];
						leftID = hand.id;
					}
					else {
						rightEntryX = hand.palmPosition[0];
						rightID = hand.id;
					}
					resetState(2);
				}
			}
			else  cardFlip(false, "", 0);		// if there are no hands detected, reset the rotations to 0	
		  break;
		case 2:	
			if(frame.hands.length > 0) {
				if (frame.gestures.length > 0) {
				    frame.gestures.forEach(function(gesture) {
				      if(gesture.type === "circle" && gesture.state === "stop") {
				      	var clockwise = false;
						var pointableID = gesture.pointableIds[0];
						var direction = frame.pointable(pointableID).direction;
						var dotProduct = Leap.vec3.dot(direction, gesture.normal);

						if (dotProduct  >  0) clockwise = true;

						if(!clockwise) {
							resetState(2);
							//break;
						}
				      }
					});
			  	}
				// just got the hand! 
				if(!hasHand) {
					// get the current text div and fade it
					if(photoNum !== 0) {
						$(".slideshow > p").fadeTo( "slow", 0);
					}

					// go to the next set of things
					photoNum++;
					if(photoNum > imgLocs.length) {
						resetState(3);
						break;
					}

					// get the next image
					$(".slideshow").append("<img src='img/"+photoNum+".jpg' />");

					// show the next image but set its opacity to 0
					$(".slideshow > img").css({"opacity": 0});
					
					hasHand = true;

				} else {
					// map img's opacity to the hand's proximity to the center of Leap
					var hand = frame.hands[0];
					var x = hand.palmPosition[0];
					var z = hand.palmPosition[2];
					var distance = Math.sqrt(x*x + z*z);
					// distance goes from 0 to 200, fade goes from 1 to 0
					var fade = 1-distance/150;
					$(".slideshow > img").fadeTo( 0, fade);
				}
			}
			else {
				// just lost the hand!
				if(hasHand) {
					// hide photo
					$(".slideshow").empty();

					if(photoNum === 0) photoNum = 1;
					// fade in text
					$(".slideshow").append("<p>"+msgs[photoNum-1]+"</>");
					$(".slideshow > p").css({"opacity": 0});
					$(".slideshow > p").fadeTo( "slow", 1);

					hasHand = false;
				}
			}
			break;
		case 3:	
		

		default:
	}
}).use('handEntry')
	.on('handLost', function(hand){
    	if(state === 1) {	
    		if(Math.abs(hand.roll()) > 2)  resetState(2); 	// palm up: move to next state
    		else  resetState(1); 							// palm down: reset state 1
    	}
	})
});
