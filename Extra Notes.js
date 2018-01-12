extraHook = function(){
	goals.setGoal("oil",Math.floor(gamePage.resPool.get("oil").maxValue-7500));
	goals.setGoal("uranium",Math.floor(gamePage.resPool.get("uranium").maxValue-250));
	goals.setGoal("unobtainium",Math.floor(gamePage.resPool.get("unobtainium").maxValue-1000));
	goals.setGoal("steamworks",goals.getGoal("magneto"));
	if(gamePage.calendar.festivalDays<=40000&&gamePage.resPool.get("manpower").value>=15000&&gamePage.resPool.get("culture").value>=50000&&gamePage.resPool.get("parchment").value>=25000){
		var btn=gamePage.villageTab.festivalBtn;
		btn.model.x10Link.handler(btn,callback=function(result){if(result)btn.update();});
		if(goals.getGoal("log")!=0)
			console.log("Extended festival for 10 years.");
	}
	if((gamePage.bld.getBuildingExt("aiCore").meta.effects["aiLevel"] || 0) >= goals.getGoal("aiLevel"))
		gamePage.space.getBuilding("entangler").on = gamePage.space.getBuilding("entangler").val;
	else
		gamePage.space.getBuilding("entangler").on = 0;
}

makeNiceString = function(num){
	num = num.toFixed(3);
	num = num.toString();
	var decimal = num.substr(num.indexOf("."));
	if(decimal == ".000")
		num = num.substr(0,num.indexOf("."));
	for(var i = (num.indexOf(".") != -1 ? num.indexOf(".") - 3 : num.length - 3); i > 0; i -= 3)
		num = num.substr(0,i) + "," + num.substr(i);
	return num;
}

getCraftTime = function(resName,goal,log=false,returnString=true,numIndent=1){
	var res = gamePage.resPool.get(resName);
	var origIndent = new Array(numIndent).join("\t");
	var indent = new Array(numIndent+1).join("\t");
	var indeNt = "\n\t" + indent;
	if(res!=false){
		var resCraft = gamePage.workshop.getCraft(resName);
		if(resCraft == null){
			var income = gamePage.getResourcePerTick(resName,true) * gamePage.getRateUI();
			var whatsLeft = goal > res.value ? goal - res.value : 0;
			var timeLeft = whatsLeft / income;
			if(log){
				console.log(indent + resName + indeNt + "Needed: " + makeNiceString(goal) + indeNt + "To go: " + (whatsLeft != 0 ? makeNiceString(whatsLeft) : "Done")
				+ " | Time until goal: " + gamePage.toDisplaySeconds(timeLeft));
			}
			if(returnString)
				return gamePage.toDisplaySeconds(timeLeft);
			else
				return timeLeft;
		}
		else{
			if(log){
				console.log(origIndent + resName + "\n" + indent + "Needed: " + makeNiceString(goal) + "\n" + indent + "To go: " + (res.value < goal ? makeNiceString(goal - res.value) : "0"));
			}
			var prices = gamePage.workshop.getCraftPrice(resCraft);
			var numToCraft = goal - res.value;
			numToCraft /= 1 + gamePage.getResCraftRatio({name:resName});
			var longest = 0;
			for(var i in prices){
				var priceVal = prices[i].val * numToCraft;
				var resPrice = gamePage.resPool.get(prices[i].name);
				var priceTime = 0;
				if(resPrice.value < priceVal){
					var timeToGo = getCraftTime(prices[i].name,priceVal - resPrice.value,log,false,numIndent+1);
					if(timeToGo > longest)
						longest = timeToGo;
				}
				else{
					if(log){
						console.log(indent + prices[i].name + indeNt + "Needed: " + makeNiceString(priceVal) + indeNt + "To go: Done | Time until goal: 0")
					}
				}
			}
			if(returnString)
				return gamePage.toDisplaySeconds(longest);
			else
				return longest;
		}
	}
	else{
		if(returnString)
			return "Invalid resource name.";
		else
			return 0;
	}
}

getUraniumForThoriumReactors = function(){
	var needed = 250 * .1875 * gamePage.bld.getBuildingExt("reactor").meta.val;
	needed /= 1 + gamePage.getResCraftRatio({name:"thorium"});
	var actual = gamePage.resPool.get("uranium").perTickCached;
	actual += gamePage.getResourcePerTickConvertion("uranium");
	actual *= gamePage.getRateUI();
	var difference = needed > actual ? needed - actual : actual - needed;
	needed = Math.round(needed * 1000) / 1000;
	actual = Math.round(actual * 1000) / 1000;
	difference = Math.round(difference * 1000) / 1000;
	var change = needed > actual ? "\n To go: " : "\n Extra income: ";
	return "Current: " + actual + "\n Needed: " + needed + change + difference;
}

getBlueprintCraft = function(){//ALTERNATIVELY, just do 1 + gamePage.getResCraftRatio({name:"blueprint"});. This is just working through the formula again. Completely unnecessary.
	/*global ratio: gamePage.getCraftRatio()
	CAD ratio: (library + academy + observatory + biolab) * .01 // .01 is from gamePage.getEffect("cadBlueprintCraftRatio");
	blueprints are (global ratio + cad ratio + (Agrum? 25% | 0%) ) * (1 + (Agrum? 5% | 0%))*/
	var globalRatio = gamePage.getCraftRatio();
	var CADAmount = gamePage.bld.get("library").val + gamePage.bld.get("academy").val;
	CADAmount += gamePage.bld.get("observatory").val + gamePage.bld.get("biolab").val;
	var bpRatio = gamePage.getEffect("cadBlueprintCraftRatio");
	globalRatio += CADAmount * bpRatio;
	var bpCraftRatio = game.getEffect("blueprintCraftRatio") || 0;
	var finalResult = (globalRatio + bpCraftRatio);
	finalResult *= (1 + (gamePage.getEffect("blueprintGlobalCraftRatio") || 0));
	finalResult += 1;
	return finalResult; // How many blueprints you get per individual craft
}

getPraiseLoss = function(tier,perc){//tier as goal tier, perc as 100 for 100%. Returns how much is required, how much you'd have, how much you'd lose, and the % of the loss versus original.
	var tt=game.religion.getTranscendenceRatio(tier)-game.religion.getTranscendenceRatio(tier-1);
	var before = Math.round(game.religion.getTriValueReligion(tt*perc/100)*100);
	var after = Math.round(game.religion.getTriValueReligion(tt*(perc-100)/100)*100);
	var loss = Math.round(before - after);
	var lossRatio = Math.round((100*loss/before)*1000)/1000;
	var str = "Before: ";
	var num = before.toString();
	for(var i = num.length-3;i>0;i-=3){
		num = num.substr(0,i) + "," + num.substr(i);
	}
	str += num;
	str += "%\n After: ";
	num = after.toString();
	for(var i = num.length-3;i>0;i-=3){
		num = num.substr(0,i) + "," + num.substr(i);
	}
	str += num;
	str += "%\n Loss: ";
	num = loss.toString();
	for(var i = num.length-3;i>0;i-=3){
		num = num.substr(0,i) + "," + num.substr(i);
	}
	str += num;
	str += "%\n Loss ratio: ";
	num = lossRatio.toString();
	str += num;
	str += "%";
	return str;
}

getRelicTime = function(goal,log=false){//Time until enough relics for goal
	var relicsPerDay = game.getEffect("relicPerDay");
	var current = gamePage.resPool.get("relic").value;
	var secondsPerDay = 2;
	if(log)//If you wanted to see relics per second
		console.log("Relics per second income: " + (relicsPerDay / secondsPerDay));
	return game.toDisplaySeconds((goal-current) / relicsPerDay * secondsPerDay);
}

getMockParagon = function(ratio,cost){ // ratio is paragon boost% in decimal form by sephiroths, cost is how much the next one costs. % is given like .05 if you had Malkuth, a 5% bonus.
	var result = 20 * cost * (1 + ratio) + cost;//cost of the sephirot, ratio is the ratio before buying it (like .05 if you had Malkuth already)
	return result;
}

//===========================================================================================
//Notes for functions to keep in mind
//===========================================================================================

gamePage.getHyperbolicEffect(75000,100); // Gets diminishing returns. Input actual, limit to approach, and result will come out.
1 + gamePage.getResCraftRatio({name:"blueprint"}); // Gets how many of resource are produced per individual craft

//===========================================================================================
//Autoshatter script for Xeno, unnecessary now - integrated with base script
//===========================================================================================

shatterAmount=0;
autoShatter = function(){
	if(game.time.heat == 0 && game.resPool.get("timeCrystal").value>=1){
		if(gamePage.timeTab.visible){
			if(gamePage.timeTab.children[2].visible){
				var btn=gamePage.timeTab.children[2].children[0].children[0];
				if(btn.model==undefined){
					curTab=gamePage.ui.activeTabId;
					gamePage.ui.activeTabId = "Time";
					gamePage.ui.render();
					gamePage.ui.activeTabId = curTab;
					gamePage.ui.render();
				}
				if(shatterAmount==1)
					btn.controller.buyItem(btn.model,1,callback=function(result){if(result)btn.update();});
				else if(shatterAmount!=0)
					btn.controller.doShatterX5(btn.model,1,callback=function(result){if(result)btn.update();});
			}
		}
	}
}
gamePage.timer.addEvent(autoShatter,1);

//===========================================================================================
//Quick chart of basic praise loss rates on transcending - ratio is consistent between tiers
//===========================================================================================

//Chart generated by running getPraiseLoss(20,<percentage>)

Upgrade to TT 20			Before			 After			Loss	   Ratio
  100% matching		  451,142,254%	            0%	451,142,254%	100.000%
  125% matching		  504,392,374%	  225,571,124%	278,821,250%	 55.279%
  150% matching		  552,534,163%	  319,005,745%	233,528,417%	 42.265%
  175% matching		  596,805,107%	  390,700,652%	206,104,454%	 34.535%
  200% matching		  638,011,496%	  451,142,254%	186,869,242%	 29.289%

  300% matching		  781,401,309%	  638,011,496%	143,389,812%	 18.350%
  400% matching		  902,284,513%	  781,401,309%	120,883,204%	 13.397%
  500% matching		1,008,784,754%	  902,284,513%	106,500,240%	 10.557%
  600% matching		1,105,068,332%	1,008,784,754%	 96,283,578%	  8.713%
  700% matching		1,193,610,219%	1,105,068,332%	 88,541,887%	  7.418%
  800% matching		1,276,022,998%	1,193,610,219%	 82,412,779%	  6.459%
  900% matching		1,353,426,773%	1,276,022,998%	 77,403,775%	  5.719%
 1000% matching		1,426,637,083%	1,353,426,772%	 73,210,310%	  5.132%

 2000% matching		2,017,569,514%	1,966,483,513%	 51,086,001%	  2.532%
 3000% matching		2,471,007,916%	2,429,475,413%	 41,532,503%	  1.681%
 4000% matching		2,853,274,171%	2,817,382,501%	 35,891,670%	  1.258%
 5000% matching		3,190,057,503%	3,157,995,810%	 32,061,693%	  1.005%

10000% matching		4,511,422,588%	4,488,808,799%	 22,613,789%	  0.501%