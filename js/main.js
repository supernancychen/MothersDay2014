$(document).ready(function(){
var state = 3;
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

var leftID, rightID;
var leftEntryX;
var rightEntryX;
var leftDone;
var rightDone;
var leftDone2;
var rightDone2;

function resetState(stateNum) {
	if(stateNum === 2) {
		transformCSS(".front", 180, 'Y');
		transformCSS(".back", 0, 'Y');
		leftEntryX = rightEntryX = -999;
		leftDone = rightDone = leftDone2 = rightDone2 = false;
	}
	state = stateNum;
	$("body").children().hide();
	$(".state"+stateNum).show();
	if(stateNum === 3) {
	}
}

var controllerOptions = {enableGestures: true};
Leap.loop(controllerOptions, function(frame) {
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
			if(leftDone2 && rightDone2) resetState(3);
			else {
				// animate slide away. no more hand thing!		
				if(leftDone) {
					$('#doorLeft').css({
						left: function( index, value ) {
							if(parseFloat( value ) > -999) return parseFloat( value ) - 100;
							else leftDone2 = true;
						}
					});
				}
				if(rightDone) {
					$('#doorRight').css({
						left: function( index, value ) {
							if(parseFloat( value ) < 2000) return parseFloat( value ) + 100;
							else rightDone2 = true;
						}
					});
				}

				if(!leftDone || !rightDone)	{
					if(frame.hands.length > 0) {
						frame.hands.forEach(function(hand) {
							if(leftEntryX !== -999 && !leftDone) {
								// move div relative to this number
								if(hand.id === leftID) {
									var delta = hand.palmPosition[0]-leftEntryX;
									delta = (delta < 0) ? delta*2 : 0;
									$('#doorLeft').css({
										'left' : delta+"px"
						        	});
									if(delta < -150) leftDone = true;
								}
								
							}
							if(rightEntryX !== -999 && !rightDone) {
								// move div relative to this number
								if(hand.id === rightID) {
									var delta = hand.palmPosition[0]-rightEntryX;
									delta = (delta > 0) ? (150+delta*2) : 151;
									$('#doorRight').css({
										'left' : delta+"px"
						        	});
									if(delta > 300) rightDone = true;
								}
							}
						});
					}
					// Display Gesture object data
					if (frame.gestures.length > 0) {
						for (var i = 0; i < frame.gestures.length; i++) {
							var gesture = frame.gestures[i];
							if(gesture.type == "swipe") {
								//Classify swipe as either horizontal or vertical
								var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
								//Classify as right-left or up-down
								if(isHorizontal) {
									if(gesture.direction[0] > 0)  rightDone = true;
									else  leftDone = true;
								}
						   }
						 }
					}
				}
			}
			break;
		default:
	}
}).use('handEntry')
	.on('handFound', function(hand){
		if(state === 2) {
			if(hand.type === "left" && leftEntryX === -999) {
				leftEntryX = hand.palmPosition[0];
				leftID = hand.id;
			}
			else if(hand.type === "right" && rightEntryX === -999) {
				rightEntryX = hand.palmPosition[0];
				rightID = hand.id;
			}
		}
	})
	.on('handLost', function(hand){
    	if(state === 1) {	
    		if(Math.abs(hand.roll()) > 2)  resetState(2); 	// palm up: move to next state
    		else  resetState(1); 							// palm down: reset state 1
    	}
    	else if(state === 2) {
    		if(hand.id === leftID)
	    		leftEntryX = -999;
	    	else if(hand.id === rightID)
	    		rightEntryX = -999;
    	}
	})
});
