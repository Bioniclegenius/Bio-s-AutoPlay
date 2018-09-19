extraHook = function(){
	goals.setGoal("oil",Math.floor(gamePage.resPool.get("oil").maxValue-Math.max(7500,gamePage.resPool.get("oil").perTickCached)));
	goals.setGoal("uranium",Math.floor(gamePage.resPool.get("uranium").maxValue-Math.max(250,gamePage.resPool.get("uranium").perTickCached)));
	goals.setGoal("unobtainium",Math.floor(gamePage.resPool.get("unobtainium").maxValue-Math.max(1000,gamePage.resPool.get("unobtainium").perTickCached)));
	goals.setGoal("steamworks",goals.res["magneto"].val);
	goals.setGoal("ziggurat",goals.res["magneto"].val);
	goals.res.parchment.manVal = 1000000000000000000;
	goals.res.manuscript.manVal = goals.res.parchment.manVal;
	goals.res.compedium.manVal = goals.res.parchment.manVal;
	//goals.setGoal("observatory",goals.res["biolab"].val);
	gamePage.bld.getBuildingExt("biolab").meta.on=0;
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
	if(getZebraTitaniumTrades() <= Math.floor(gamePage.resPool.get("manpower").maxValue / 50) && getZebraTitaniumTrades() >= 0){
		var tit = gamePage.resPool.get("titanium");
		if(tit.maxValue - tit.value >= 5 * tit.perTickCached)
			goals.setGoal("zebras6",-1 * getZebraTitaniumTrades());
		else
			goals.setGoal("zebras6",0);
	}
	else if(goals.getGoal("zebras6")<0)
		goals.setGoal("zebras6",0);
	goals.setGoal("autoApoReset",parseInt(getReligionProductionBonusCap())-10);
	//if(gamePage.resPool.get("catnip").perTickCached <= 5)
		//autoClick(0,"bonfire");// - this has an issue, needs resolving
}

makeNiceString = function(num, numDigits = 3){
	if(typeof(num) == "number" && num != Infinity){
		num = num.toFixed(numDigits);
		num = num.toString();
		var decimal = num.substr(num.indexOf("."));
		if(decimal == "." + Array(numDigits + 1).join("0"))
			num = num.substr(0,num.indexOf("."));
		for(var i = (num.indexOf(".") != -1 ? num.indexOf(".") - 3 : num.length - 3); i > 0; i -= 3)
			num = num.substr(0,i) + "," + num.substr(i);
	}
	else
		num = num.toString();
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
			if(numToCraft > 0){
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

getPraiseLoss = function(tier=-1,perc=-1){//tier as goal tier, perc as 100 for 100%. Returns how much is required, how much you'd have, how much you'd lose, and the % of the loss versus original.
	if(tier == -1)
		tier = gamePage.religion.getTranscendenceLevel() + 1;
	var tt=game.religion.getTranscendenceRatio(tier)-game.religion.getTranscendenceRatio(tier-1);
	if(perc == -1)
		perc = gamePage.religion.faithRatio / tt * 100;
	var before = Math.round(gamePage.religion.getTriValueReligion(tt * perc / 100) * 100);
	var after = Math.round(game.religion.getTriValueReligion(tt * (perc - 100) / 100) * 100);
	var loss = Math.round(before - after);
	var lossRatio = 100 * loss / before;
	var str = "To tier: ";
	str += tier;
	str += "\n Progress: ";
	str += makeNiceString(perc);
	str += "%\n Before: ";
	str += makeNiceString(before);
	str += "%\n After: ";
	str += makeNiceString(after);
	str += "%\n Loss: ";
	str += makeNiceString(loss);
	str += "%\n Loss ratio: ";
	str += makeNiceString(lossRatio);
	str += "%";
	return str;
}

getRelicTime = function(goal,log=false){//Time until enough relics for goal
	var relicsPerDay = game.getEffect("relicPerDay");
	var current = gamePage.resPool.get("relic").value;
	var secondsPerDay = 2;
	if(log)//If you wanted to see relics per second
		console.log("Relics per second income: " + (relicsPerDay / secondsPerDay));
	var relicTime = Math.max((goal-current) / relicsPerDay * secondsPerDay, 0);
	return game.toDisplaySeconds(relicTime);
}

getMockParagon = function(ratio,cost){ // ratio is paragon boost% in decimal form by sephiroths, cost is how much the next one costs. % is given like .05 if you had Malkuth, a 5% bonus.
	var result = 20 * cost * (1 + ratio) + cost;//cost of the sephirot, ratio is the ratio before buying it (like .05 if you had Malkuth already)
	return result;
	//Chart of results at bottom
}

getParagonProd = function(preRatio,cost,log = false){//gets paragon production percent tipping point before/after buying a sephirot
	var step = Math.floor(cost / 2);
	if(step == 0)
		step = 1;
	var curVal = cost;
	var dir = 1;
	var before;
	var after;
	while(step > 0){
		before = gamePage.getHyperbolicEffect(curVal * .01 * (1 + preRatio), 1 + 2 * preRatio);
		after = gamePage.getHyperbolicEffect((curVal - cost) * .01 * (1 + preRatio + .05), 1 + 2 * (preRatio + .05));
		if(log)
			console.log("Step: " + step + "\ncurVal: " + curVal + "\ndir: " + dir + "\nbefore: " + before + "\nafter: " + after);
		if(after < before){
			curVal += step;
			if(dir == -1)
				step = Math.floor(step / 2);
			dir = 1;
		}
		else if(after > before){
			curVal -= step;
			if(dir == 1)
				step = Math.floor(step / 2);
			dir = -1;
		}
		else
			step = 0;
	}
	before = gamePage.getHyperbolicEffect(curVal * .01 * (1 + preRatio), 1 + 2 * preRatio);
	after = gamePage.getHyperbolicEffect((curVal - cost) * .01 * (1 + preRatio + .05), 1 + 2 * (preRatio + .05));
	while(after < before){
		curVal += 1;
		before = gamePage.getHyperbolicEffect(curVal * .01 * (1 + preRatio), 1 + 2 * preRatio);
		after = gamePage.getHyperbolicEffect((curVal - cost) * .01 * (1 + preRatio + .05), 1 + 2 * (preRatio + .05));
		if(log)
			console.log("Still under, stepping up.\ncurVal: " + curVal + "\nbefore: " + before + "\nafter: " + after);
	}
	return "Tipping point: " + curVal;
	//Chart of results at bottom
}

getNecrocornTime = function(log = false){//true to also output necrocorns per second
	var numAlicorns = gamePage.resPool.get("alicorn").value;
	var curCorruption = gamePage.religion.corruption;
	var corruptionRate = 1;
	if(gamePage.resPool.get("necrocorn").value > 0)
		corruptionRate = 0.25 * (1+ gamePage.getEffect("corruptionBoostRatio"));
	corruptionRate *= gamePage.getEffect("corruptionRatio");
	if(numAlicorns <= 0){
		curCorruption = 0;
		corruptionRate = 0;
	}
	if(log)
		console.log("Current corruption rate: " + (corruptionRate * gamePage.getRateUI()) + "/sec");
	return gamePage.toDisplaySeconds( (1 + corruptionRate - curCorruption) / (corruptionRate * gamePage.getRateUI()) );
}

getLeviChance = function(log = false){//Odds of leviathans showing up per year
	var numPyramids = gamePage.religion.getZU("blackPyramid").val;
	var numMarkers = gamePage.religion.getZU("marker").val;
	var chance = roundThisNumber(35 * numPyramids * (1 + 0.1 * numMarkers) / 10);
	if(log){
		console.log("Number of markers: " + numMarkers + "\nSingle marker effect per pyramid: 1.1x\nTotal marker effect per pyramid: " + roundThisNumber((1 + 0.1 * numMarkers))
			+ "x\nBase pyramid effect: 3.5%\nPyramid individual effect with markers: "
			+ roundThisNumber(35 * (1 + 0.1 * numMarkers) / 10) + "%\nNumber of pyramids: " + numPyramids + "\nTotal chance: " + chance + "%");
	}
	return chance + "%";
}

getReligionProductionBonusCap = function(mockTT = -1, mockNumObe = -1, mockAeth = -1){
	var transcendTier = (mockTT == -1 ? gamePage.religion.getTranscendenceLevel() : mockTT);
	var numObelisks = (mockNumObe == -1 ? gamePage.religion.getTU("blackObelisk").val : mockNumObe);
	var atheismBonus = 0;
	if((gamePage.challenges.getChallenge("atheism").researched || mockAeth == 1) && mockAeth != 0)
		atheismBonus = gamePage.religion.getTranscendenceLevel() * 0.1;
	var result = 1000 * (transcendTier * numObelisks * .005 + atheismBonus + 1);
	return result + "%";
}

getPrices = function(bldName,quantity = -1,bldType = undefined){
	var prices = [];
	var bld = undefined;
	var type = bldType;
	for(var i in gamePage.religion.zigguratUpgrades)//ziggurat unicorn buildings
		if(gamePage.religion.zigguratUpgrades[i].name == bldName){
			bld = gamePage.religion.zigguratUpgrades[i];
			type = "ziggurat";
		}
	if(!bld || bldType == "religion")
		for(var i in gamePage.religion.religionUpgrades)//religious upgrades
			if(gamePage.religion.religionUpgrades[i].name == bldName){
				bld = gamePage.religion.religionUpgrades[i];
				type = "religion";
			}
	if(!bld || bldType == "transcend")
		for(var i in gamePage.religion.transcendenceUpgrades)//cryptotheology
			if(gamePage.religion.transcendenceUpgrades[i].name == bldName){
				bld = gamePage.religion.transcendenceUpgrades[i];
				type = "transcend";
			}
	if(!bld || bldType == "space")//space
		for(var i in gamePage.space.meta)
			for(var j in gamePage.space.meta[i].meta)
				if(gamePage.space.meta[i].meta[j].name == bldName){
					bld = gamePage.space.meta[i].meta[j];
					type = "space";
				}
	if(!bld || bldType == "workshop")//workshop
		for(var i in gamePage.workshop.meta[0].meta)
			if(gamePage.workshop.meta[0].meta[i].name == bldName){
				bld = gamePage.workshop.meta[0].meta[i];
				type = "workshop";
			}
	if(!bld || bldType == "craft")//crafts
		if(gamePage.workshop.getCraft(bldName)){
			bld = gamePage.workshop.getCraft(bldName);
			type = "craft";
		}
	if(!bld || bldType == "time")//time
		for(var i in gamePage.time.meta)
			for(var j in gamePage.time.meta[i].meta)
				if(gamePage.time.meta[i].meta[j].name == bldName){
					bld = gamePage.time.meta[i].meta[j];
					type = "time";
				}
	if(!bld || bldType == "metaphysics")//metaphysics
		for(var i in gamePage.prestige.meta[0].meta)
			if(gamePage.prestige.meta[0].meta[i].name == bldName){
				bld = gamePage.prestige.meta[0].meta[i];
				type = "metaphysics";
			}
	if(!bld || bldType == "science")//science
		for(var i in gamePage.science.metaCache)
			if(gamePage.science.metaCache[i].name == bldName){
				bld = gamePage.science.metaCache[i];
				type = "science";
			}
	if(!bld || bldType == "trade")//trade
		for(var i in gamePage.diplomacy.races)
			if(gamePage.diplomacy.races[i].name == bldName){
				bld = gamePage.diplomacy.races[i];
				type = "trade";
			}
	if(!bld || bldType == "building")//bonfire buildings
		if(gamePage.bld.getBuildingExt(bldName)){
			/*prices = gamePage.bld.getPricesWithAccessor(gamePage.bld.getBuildingExt(bldName));
			for(var i in prices)
				prices[i].displayVal = gamePage.getDisplayValueExt(prices[i].val);
			return prices;*///Easy way, doesn't allow quantity
			bld = gamePage.bld.getBuildingExt(bldName).meta;
			type = "building";			
		}
	if(bld){
		var ratio = bld.priceRatio || 1;
		if(type == "building" && bld)//Exception for bonfire buildings, which have a different system for price ratio
			ratio = gamePage.bld.getPriceRatio(bldName);
		var amount = (quantity < 0 ? (bld.val || bld.value || 0) : quantity);
		var bldPrices = (bld.prices ? bld.prices : bld.buys);
		for (var i in bldPrices){
			prices.push({
				val: bldPrices[i].val * Math.pow(ratio, amount),
				name: bldPrices[i].name
			});
		}
	}
	if(type == "science" || type == "workshop")
		prices = gamePage.village.getEffectLeader("scientist", prices);
	if(type == "religion")
		prices = gamePage.village.getEffectLeader("wise", prices);
	if(type == "trade"){
		var tempPrices = [];
		for(var i in prices)
			tempPrices.push(prices[i]);
		prices = [];
		prices.push({val: 50, name: "manpower"});
		prices.push({val: 15, name: "gold"});
		for(var i in tempPrices)
			prices.push(tempPrices[i]);
	}
	for(var i in prices)
		prices[i].displayVal = gamePage.getDisplayValueExt(prices[i].val);
	return prices;
}

getCumulativePrices = function(bldName, maxQuantity = 0, bldType = undefined){
	var prices = getPrices(bldName, 0, bldType);
	for(var i = 1; i < maxQuantity; i++){
		var pricesTemp = getPrices(bldName, i, bldType);
		for(var j in pricesTemp)
			for(var k in prices){
				if(prices[k].name == pricesTemp[j].name)
					prices[k].val += pricesTemp[j].val;
			}
	}
	for(var i in prices)
		prices[i].displayVal = gamePage.getDisplayValueExt(prices[i].val);
	return prices;
}

getCelestialEventChance = function(){
	var chanceRatio = 1;//calculating chance ratio for daily events
	if(gamePage.prestige.getPerk("chronomancy").researched)
		chanceRatio = 1.1;
	chanceRatio *= gamePage.getEffect("timeRatio") * .25 + 1;
	
	var chance = 25;//calculating chance of celestial events per day
	chance += gamePage.getEffect("starEventChance") * 10000;
	chance *= chanceRatio;
	if(gamePage.prestige.getPerk("astromancy").researched)
		chance *= 2;
	if(gamePage.bld.get("library").on <= 0)
		chance = 0;
	chance /= 100;//10,000 * 100% to bring it to percentages
	
	var autoChance = gamePage.getEffect("starAutoSuccessChance") * 100;//Auto-success chance
	if(gamePage.prestige.getPerk("astromancy").researched)
		autoChance *= 2;
	if(gamePage.ironWill && autoChance < 25)
		autoChance = 25;
	if(gamePage.workshop.get("seti").researched && autoChance < 100)
		autoChance = 100;
	
	var str = "Chance of celestial event per day: " + chance + "%\n ";
	str += "Chance for auto-success of event: " + autoChance + "%";
	return str;
}

getZebraTitaniumTrades = function(log = false){
	var titaniumPerTrade = gamePage.resPool.get("ship").value / 100 * 1.5 * 2 + 1.5;
	var maxTitanium = gamePage.resPool.get("titanium").maxValue;
	if(maxTitanium == 0)
		maxTitanium = Infinity;
	if(log)
		console.log("Titanium per Zebra trade: " + titaniumPerTrade);
	var maxNumTrades = maxTitanium / titaniumPerTrade;
	if(log)
		console.log("Trades to fill titanium cap from zero: " + Math.ceil(maxNumTrades));
	var numTrades = maxTitanium - gamePage.resPool.get("titanium").value;
	numTrades /= titaniumPerTrade;
	if(log)
		console.log("Number of zebra trades to fill titanium: " + Math.ceil(numTrades));
	return Math.ceil(numTrades);
}

getTCPerSacrifice = function(log = false){
	var numTCPerSacrifice = 1;
	numTCPerSacrifice += gamePage.getEffect("tcRefineRatio");
	if(log){
		console.log("TC from sacrifice all: " + (numTCPerSacrifice * Math.floor(gamePage.resPool.get("alicorn").value / 25)));
	}
	return numTCPerSacrifice;
}

getRelicPerTCRefine = function(log = false, numBlackNexus = -1, numBlackPyramids = -1){
    if(numBlackNexus == -1)
        numBlackNexus = gamePage.religion.getTU("blackNexus").on;
    var rrrPerBN = gamePage.religion.getTU("blackNexus").effects["relicRefineRatio"];
    if(numBlackPyramids == -1)
        numBlackPyramids = gamePage.religion.getZU("blackPyramid").val;
    var numRelics = 1 + (rrrPerBN * numBlackNexus) * numBlackPyramids;
    var prices;
    for(var i in gamePage.tabs)
        if(gamePage.tabs[i].tabName.toLowerCase() == "religion")
            prices = gamePage.tabs[i].refineTCBtn.model.prices;
    var maxPurchase = -1;
    for(var i in prices){
        var quantity = Math.floor(gamePage.resPool.get(prices[i].name).value / prices[i].val);
        if(quantity < maxPurchase || maxPurchase == -1)
            maxPurchase = quantity;
    }
    var maxRelics = numRelics * maxPurchase;
    var numRelicsWithBPPlus = 1 + (rrrPerBN * numBlackNexus) * (numBlackPyramids + 1);
    var maxRelicsWithBPPlus = numRelicsWithBPPlus * maxPurchase;
    var numRelicsWithBNPlus = 1 + ((rrrPerBN * numBlackNexus) + rrrPerBN) * numBlackPyramids;
    var maxRelicsWithBNPlus = numRelicsWithBNPlus * maxPurchase;
    if(log)
        console.log("Number of Black Pyramids: " + numBlackPyramids +
                  "\nNumber of Black Nexus: " + numBlackNexus +
                  "\nRelic refine ratio increase per Black Nexus: " + (100 * rrrPerBN) + "%" +
                  "\nRelics per refine: " + numRelics +
                  "\nRelics from Refine All: " + maxRelics +
                  "\nRelics per refine with one more Black Pyramid: " + numRelicsWithBPPlus +
                  "\nRelics from Refine All with one more Black Pyramid: " + maxRelicsWithBPPlus +
                  "\nRelics per refine with one more Black Nexus: " + numRelicsWithBNPlus +
                  "\nRelics from Refine All with one more Black Nexus: " + maxRelicsWithBNPlus);
    //Actual formula used in the game below - if this differs from above, there's a factor missing
    //If the game's formula shifts (unlikely), then this will have to be revisited. So would above anyways.
    return 1 + this.game.getEffect("relicRefineRatio") * this.game.religion.getZU("blackPyramid").val;
}

setCatnipArray = function(finalResult, theoreticalQuantity, actualQuantity, operation = "*"){
    actualQuantity = actualQuantity || theoreticalQuantity;
    for(var season in finalResult["theoretical"])
        for(var weather in finalResult["theoretical"][season]){
            switch(operation){
                case "+":
                    finalResult["theoretical"][season][weather] += theoreticalQuantity;
                    break;
                case "-":
                    finalResult["theoretical"][season][weather] -= theoreticalQuantity;
                    break;
                case "/":
                    finalResult["theoretical"][season][weather] /= theoreticalQuantity;
                    break;
                default:
                    finalResult["theoretical"][season][weather] *= theoreticalQuantity;
            }
        }
    for(var season in finalResult["actual"])
        for(var weather in finalResult["actual"][season]){
            switch(operation){
                case "+":
                    finalResult["actual"][season][weather] += actualQuantity;
                    break;
                case "-":
                    finalResult["actual"][season][weather] -= actualQuantity;
                    break;
                case "/":
                    finalResult["actual"][season][weather] /= actualQuantity;
                    break;
                default:
                    finalResult["actual"][season][weather] *= actualQuantity;
            }
        }
}

getCatnipInSeasons = function(log = false, numberOfFields = -1, numberOfFarmers = -1, numberOfAqueducts = -1, numberOfHydroponics = -1, numberOfKittens = -1, numberOfPastures = -1, numberOfUnicPast = -1){
    var finalResult = {theoretical: {},
                       actual: {}};
    var catnip = gamePage.resPool.get("catnip");
    //Buildings
    var theoreticalCatnipPerTickBase = gamePage.bld.get("field").effects["catnipPerTickBase"];
    var numFields = gamePage.bld.get("field").on;
    if(numberOfFields >= 0)
        numFields = numberOfFields;
    var theoreticalCatnipPerTickTotal = theoreticalCatnipPerTickBase * numFields;
    var actualCatnipPerTickTotal = gamePage.getEffect("catnipPerTickBase");
    if(log)
        console.log("---INITIAL CATH BUILDING PRODUCTION---" +
                  "\nCatnip per field per tick: " + theoreticalCatnipPerTickBase +
                  "\nNumber of fields: " + numFields +
                  "\nTotal theoretical catnip from fields per tick: " + theoreticalCatnipPerTickTotal +
                  "\nActual catnip from fields per tick: " + actualCatnipPerTickTotal);
    //Space ratio - does nothing. Skipping.
    //=========================================================================================
    //Add space catnip to normal - does nothing. Skipping.
    //=========================================================================================
    //Weather effects
    if(log)
        console.log("---SETTING UP SEASONS AND WEATHER---");
    var weather = {normal: 0,
                   warm: 0.15,
                   cold: -0.15};
    var seasons = gamePage.calendar.seasons;
    for(var i in seasons){
        finalResult["theoretical"][seasons[i].name] = {};
        finalResult["actual"][seasons[i].name] = {};
        for(var j in weather){
            finalResult["theoretical"][seasons[i].name][j] = (seasons[i].modifiers["catnip"] || 1) + weather[j];
            if(finalResult["theoretical"][seasons[i].name][j] < -0.95)
                finalResult["theoretical"][seasons[i].name][j] = -0.95;
            finalResult["theoretical"][seasons[i].name][j] *= theoreticalCatnipPerTickTotal;
            finalResult["actual"][seasons[i].name][j] = (seasons[i].modifiers["catnip"] || 1) + weather[j];
            if(finalResult["actual"][seasons[i].name][j] < -0.95)
                finalResult["actual"][seasons[i].name][j] = -0.95;
            finalResult["actual"][seasons[i].name][j] *= actualCatnipPerTickTotal;
        }
    }
    //Village job production
    var numFarmers = gamePage.village.getJob("farmer").value;
    if(numberOfFarmers >= 0)
        numFarmers = numberOfFarmers;
    var theoreticalVillageProduction = 1 * numFarmers;//1 catnip per tick per farmer
    var actualVillageProduction = gamePage.village.getResProduction()["catnip"] || 0;
    setCatnipArray(finalResult, theoreticalVillageProduction, actualVillageProduction, "+");
    if(log)
        console.log("---VILLAGE PRODUCTION (Adds to previous totals)---" +
                  "\nNumber of farmers in village: " + numFarmers +
                  "\nCatnip produced by farmers in theory (1 per tick per farmer): " + theoreticalVillageProduction +
                  "\nActual catnip produced by farmers: " + actualVillageProduction);
    //Village job production workshop modifiers
    var workshopJobModifier = gamePage.getEffect("catnipJobRatio");
    setCatnipArray(finalResult, theoreticalVillageProduction * workshopJobModifier,
                                actualVillageProduction * workshopJobModifier, "+");
    if(log)
        console.log("---VILLAGE PRODUCTION BONUS (Adds to previous totals)---" +
                  "\nModifier from workshop: " + workshopJobModifier +
                  "\nTheoretical bonus: " + (theoreticalVillageProduction * workshopJobModifier) +
                  "\nActual bonus: " + (actualVillageProduction * workshopJobModifier));
    //Production boost - doesn't do anything right now. Skipping.
    //=========================================================================================
    //Building and space production
    var aqueduct = gamePage.bld.get("aqueduct");
    var numAqueduct = aqueduct.on;
    if(numberOfAqueducts >= 0)
        numAqueduct = numberOfAqueducts;
    var aqueductRatio = aqueduct.stages[aqueduct.stage].effects["catnipRatio"];
    var hydroponics = gamePage.space.getBuilding("hydroponics");
    var numHydroponics = hydroponics.on;
    if(numberOfHydroponics >= 0)
        numHydroponics = numberOfHydroponics;
    var theoreticalBuildingRatio = aqueductRatio * numAqueduct;
    theoreticalBuildingRatio += hydroponics.effects["catnipRatio"] * numHydroponics;
    theoreticalBuildingRatio += 1;
    var actualBuildingRatio = 1 + gamePage.getEffect("catnipRatio");
    setCatnipArray(finalResult, theoreticalBuildingRatio, actualBuildingRatio);
    if(log)
        console.log("---CATH AND SPACE PRODUCTION MULTIPLIERS---" +
                  "\nNumber of Aqueducts: " + numAqueduct +
                  "\n-The following Aqueduct ratio will be zero if you've upgraded to Hydro Farms-" +
                  "\nMulitipler per Aqueduct: " + aqueductRatio +
                  "\nTotal multiplier from Aqueducts: " + (aqueductRatio * numAqueduct) +
                  "\nNumber of Hydroponics (space): " + numHydroponics +
                  "\nMultiplier per Hydroponics: " + hydroponics.effects["catnipRatio"] +
                  "\nTotal multiplier from Hydroponics: " + (hydroponics.effects["catnipRatio"] * numHydroponics) +
                  "\nFinal theoretical building ratio: x" + theoreticalBuildingRatio +
                  "\nActual building ratio: x" + actualBuildingRatio);
    //Religion modifiers - doesn't do anything right now. Skipping.
    //=========================================================================================
    //...Super Ratio? Doesn't seem to have anything for it. Skipping.
    //=========================================================================================
    //This would be steamworks here, but in the base it's a hack to only affect coal - skipping
    //=========================================================================================
    //Paragon bonus
    var paragonProd = 1 + gamePage.prestige.getParagonProductionRatio();
    if(gamePage.challenges.currentChallenge == "winterIsComing")//If we're in this challenge - after challenge rework,
        paragonProd = 0;                                        //it will need to be reworked
    setCatnipArray(finalResult, paragonProd);
    if(log)
        console.log("---PARAGON MULTIPLIER---" +
                  "\nParagon production ratio: " + (100 + 100 * paragonProd) + "%");
    //Paragon... Space production? Does nothing for catnip. Skipping.
    //=========================================================================================
    //Magnetos Boost - specifically does not affect catnip. Skipping.
    //=========================================================================================
    //Reactor production bonus - specifically does not affect catnip. Skipping.
    //=========================================================================================
    //SR Faith bonus
    var srBonus = 1 + gamePage.religion.getProductionBonus() / 100;
    setCatnipArray(finalResult, srBonus);
    if(log)
        console.log("---SOLAR REVOLUTION MULTIPLIER---" +
                  "\nSolar Revolution bonus: " + (100 * srBonus) + "%");
    //Cosmic radiation, most people will probably have this disabled
    if(!gamePage.opts.disableCMBR){
        setCatnipArray(finalResult,1 + gamePage.getCMBRBonus());
        if(log)
            console.log("---COSMIC RADIATION BONUS (offline progression)---" +
                      "\nCosmic Radiation Bonus Ratio: " + (100 + 100 * gamePage.getCMBRBonus()) + "%");
    }
    //Last section of paragon space production - does nothing. Skipping.
    //=========================================================================================
    //Automated production building (catnipPerTickProd) - does nothing. Skipping.
    //=========================================================================================
    //Automated space production, full bonus - does nothing. Skipping.
    //=========================================================================================
    //Cycle effects - set in space buildings, none of which produce catnip themselves
    //=========================================================================================
    //Cycle festival effects
    for(var season in finalResult["theoretical"])
        for(var weather in finalResult["theoretical"][season]){
            var tempEffect = {catnip: finalResult["theoretical"][season][weather]};
            gamePage.calendar.cycleEffectsFestival(tempEffect);
            finalResult["theoretical"][season][weather] = tempEffect["catnip"];
        }
    for(var season in finalResult["actual"])
        for(var weather in finalResult["actual"][season]){
            var tempEffect = {catnip: finalResult["actual"][season][weather]};
            gamePage.calendar.cycleEffectsFestival(tempEffect);
            finalResult["actual"][season][weather] = tempEffect["catnip"];
        }
    if(log)
        console.log("---CYCLE FESTIVAL EFFECTS---" +
                  "\nCharon is *1.5 to catnip. All others do nothing." +
                  "\nAre we in Charon right now? " + (gamePage.calendar.cycle == 0 ? "Yes" : "No"));
    //Building and space pertick - does nothing. Skipping.
    //=========================================================================================
    //Consumption
    //Theoretical
    var numKittens = gamePage.village.sim.kittens.length;
    if(numberOfKittens >= -1)
        numKittens = numberOfKittens;
    var theoreticalCatnipConsumption = -0.85 * numKittens;
    var pastures = gamePage.bld.get("pasture");
    var numPastures = pastures.on;
    if(numberOfPastures >= 0)
        numPastures = numberOfPastures;
    var unicPastures = gamePage.bld.get("unicornPasture");
    var numUnicPastures = unicPastures.on;
    if(numberOfUnicPast >= 0)
        numUnicPastures = numberOfUnicPast;
    var theoreticalCatnipConsReduction = pastures.effects["catnipDemandRatio"] * numPastures;
    theoreticalCatnipConsReduction += unicPastures.effects["catnipDemandRatio"] * numUnicPastures;
    theoreticalCatnipConsReduction = gamePage.getHyperbolicEffect(theoreticalCatnipConsReduction, 1);
    var theoreticalReducedCatnipConsReduction = theoreticalCatnipConsReduction;
    theoreticalCatnipConsumption *= 1 + theoreticalCatnipConsReduction
    var theoreticalHappinessModifier = 0;
    if(numKittens > 0 && gamePage.village.happiness > 1){
        var theoreticalHappinessConsumption = Math.max(gamePage.village.happiness - 1, 0);
        var theoreticalWorkerRatio = 1 + (gamePage.workshop.get("assistance").researched ? -0.25 : 0);
        if(gamePage.challenges.currentChallenge == "anarchy")
            theoreticalHappinessModifier = theoreticalCatnipConsumption * theoreticalHappinessConsumption *
                                       theoreticalWorkerRatio;
        else
            theoreticalHappinessModifier = theoreticalCatnipConsumption * theoreticalHappinessConsumption *
                                       theoreticalWorkerRatio *
                                       (1 - gamePage.village.getFreeKittens() / numKittens);
    }
    theoreticalCatnipConsumption += theoreticalHappinessModifier;
    //Actual
    var actualCatnipConsumption = gamePage.village.getResConsumption()["catnip"] || 0;
    actualCatnipConsumption *= 1 + gamePage.getEffect("catnipDemandRatio");
    var actualHappinessModifier = 0;
    if(numKittens > 0 && gamePage.village.happiness > 1){
        var actualHappinessConsumption = Math.max(gamePage.village.happiness - 1, 0);
        if(gamePage.challenges.currentChallenge == "anarchy")
            actualHappinessModifier = actualCatnipConsumption * actualHappinessConsumption *
                                       (1 + gamePage.getEffect("catnipDemandWorkerRatioGlobal"));
        else
            actualHappinessModifier = actualCatnipConsumption * actualHappinessConsumption *
                                       (1 + gamePage.getEffect("catnipDemandWorkerRatioGlobal")) *
                                       (1 - gamePage.village.getFreeKittens() / numKittens);
    }
    actualCatnipConsumption += actualHappinessModifier;
    setCatnipArray(finalResult, theoreticalCatnipConsumption, actualCatnipConsumption, "+");
    if(log)
        console.log("---VILLAGE KITTEN CONSUMPTION (Adds to previous total)---" +
                  "\nNumber of kittens: " + numKittens +
                  "\nTheoretical demand per kitten per tick: " + (-0.85) +
                  "\nTotal initial theoretical demand: " + (-0.85 * numKittens) +
                  "\nTotal initial actual demand: " + (gamePage.village.getResConsumption()["catnip"] || 0) +
                  "\nNumber of Pastures: " + numPastures +
                  "\n-The following Pasture ratio will be zero if you've upgraded to Solar Farms-" +
                  "\nReduction ratio per Pasture: " + pastures.effects["catnipDemandRatio"] +
                  "\nTotal preliminary reduction ratio for Pastures: " + (pastures.effects["catnipDemandRatio"] * numPastures) +
                  "\nNumber of Unicorn Pastures: " + numUnicPastures +
                  "\nReduction ratio per Unicorn Pasture: " + unicPastures.effects["catnipDemandRatio"] +
                  "\nTotal preliminary reduction ratio for Unicorn Pastures: " + (unicPastures.effects["catnipDemandRatio"] * numUnicPastures) +
                  "\nTotal preliminary reduction ratio: " + (pastures.effects["catnipDemandRatio"] * numPastures + unicPastures.effects["catnipDemandRatio"] * numUnicPastures) +
                  "\nFinal reduction ratio, after diminishing returns: " + theoreticalReducedCatnipConsReduction +
                  "\nActual reduction ratio after diminishing returns: " + gamePage.getEffect("catnipDemandRatio") +
                  "\nTheoretical catnip consumption after reduction ratio: " + ((1 + theoreticalReducedCatnipConsReduction) * (-0.85 * numKittens)) +
                  "\nActual catnip consumption after reduction ratio: " + ((gamePage.village.getResConsumption()["catnip"] || 0) * (1 + gamePage.getEffect("catnipDemandRatio"))) +
                  "\n===HAPPINESS IMPACT===" +
                  "\n    Happiness level: " + (100 * gamePage.village.happiness) + "%" +
                  "\n    Are we in the Anarchy challenge? " + (gamePage.challenges.currentChallenge == "anarchy" ? "Yes" : "No") +
                  "\n    Have we researched Robotic Assistance (-25% to happiness demand if so)? " + (gamePage.workshop.get("assistance").researched ? "Yes" : "No") +
                  "\n    Final theoretical happiness extra consumption: " + theoreticalHappinessModifier +
                  "\n    Final actual happiness consumption: " + actualHappinessModifier +
                  "\nFinal theoretical catnip consumption: " + theoreticalCatnipConsumption +
                  "\nFinal actual catnip consumption: " + actualCatnipConsumption);
    //Adjust from Per Tick to Per Second
    setCatnipArray(finalResult, gamePage.getRateUI());
    var currentWeather = gamePage.calendar.weather;
    if(currentWeather == null)
        currentWeather = "normal";
    if(log)
        console.log("---CONVERSION FROM TICKS TO SECONDS---" +
                  "\nNumber of ticks per second: " + gamePage.getRateUI() +
                  "\nCurrent Catnip per second: " + finalResult["actual"][gamePage.calendar.seasons[gamePage.calendar.season].name][currentWeather]);
    //Final result return
    return finalResult;
}

getParagonProductionBonus = function(amount = -1, burnedAmount = -1, numSephirots = -1){
	var percentBoost = 1.0 + numSephirots * .05;
	if(numSephirots == -1)
		percentBoost = 1.0 + gamePage.getEffect("paragonRatio");
	if(amount == -1)
		amount = gamePage.resPool.get("paragon").value;
	if(burnedAmount == -1)
		burnedAmount = gamePage.resPool.get("burnedParagon").value;
	
	var darkFutureYears = gamePage.calendar.year - 40000;
	
	var productionRatioParagon = (amount * 0.010) * percentBoost;
	productionRatioParagon = gamePage.getHyperbolicEffect(productionRatioParagon, 2 * percentBoost);

	var ratio = darkFutureYears >= 0 ? 4 : 1;
	var productionRatioBurnedParagon = burnedAmount * 0.010 * percentBoost;
	productionRatioBurnedParagon = gamePage.getHyperbolicEffect(productionRatioBurnedParagon, ratio * percentBoost);

	return 100 * (productionRatioParagon + productionRatioBurnedParagon);
}

getParagonStorageBonus = function(amount = -1, burnedAmount = -1, numSephirots = -1){
	var percentBoost = 1.0 + numSephirots * .05;
	if(numSephirots == -1)
		percentBoost = 1.0 + gamePage.getEffect("paragonRatio");
	if(amount == -1)
		amount = gamePage.resPool.get("paragon").value;
	if(burnedAmount == -1)
		burnedAmount = gamePage.resPool.get("burnedParagon").value;
	var darkFutureYears = gamePage.calendar.year - 40000;
	
	var paragonRatio = percentBoost;
	var storageRatio = (amount / 1000) * paragonRatio; //every 100 paragon will give a 10% bonus to the storage capacity
	if (darkFutureYears >= 0) 
		storageRatio += (burnedAmount / 500) * paragonRatio;
	else
		storageRatio += (burnedAmount / 2000) * paragonRatio;
	return 100 * storageRatio;
}

getTradeAmountAvg = function(race,log = false){
	var r = null;
	try{
		r = gamePage.diplomacy.get(race);
	}
	catch(e){
	}
	if(r){
		var ratio = gamePage.diplomacy.getTradeRatio()+ 1;
		var curSeason = gamePage.calendar.getCurSeason().name;
		var sells = [];
		for(var j in r.sells){
			var s = r.sells[j];
			var min = 0;
			var max = 0;
			if(r.name == "zebras" && s.name == "titanium"){
				var ships = gamePage.resPool.get("ship").value;
				var odds = Math.min(15 + ships * 0.35 , 100);
				var amt = 1.5 * ((ships / 100) * 2 + 1);
				min = amt;
				max = amt;
				sells[s.name] = amt;
				if(log){
					console.log(gamePage.resPool.get(s.name).title);
					console.log("\tOdds: " + odds + "%");
					console.log("\tMin amount: " + min);
					console.log("\tMax amount: " + max);
				}
			}
			else{
				var sratio = s.seasons[curSeason];
				var tratio = ratio;
				if(r.name == "leviathans")
					tratio *= (1 + 0.02 * r.energy);
				var val = sratio * s.value * (1 - s.delta / 2);
				max = val;
				max += Math.floor(s.value * sratio * s.delta);
				val *= tratio;
				min = val;
				max *= tratio;
				var amt = (min + max) / 2;
				amt *= s.chance / 100;
				sells[s.name] = amt;
				if(log){
					console.log(gamePage.resPool.get(s.name).title);
					console.log("\tOdds: " + s.chance + "%");
					console.log("\tMin amount: " + min);
					console.log("\tMax amount: " + max);
				}
			}
		}
		return sells;
	}
	return []
}

getBlazarsForShatterEngine = function(numRR = -1){
	if(numRR < 0)
		numRR = gamePage.time.getCFU("ressourceRetrieval").val;
	var uoPerYear = game.getResourcePerTick("unobtainium", true) * ( 1 / game.calendar.dayPerTick * game.calendar.daysPerSeason * 4);
	var tcPerTrade = getTradeAmountAvg("leviathans")["timeCrystal"];
	var neededUO = 5000 / tcPerTrade;
	var neededPerc = neededUO / uoPerYear;
	var basePerc = numRR * .01;
	var neededBlazars = Math.max(Math.ceil((neededPerc / basePerc - 1) / .02) , 0);
	return neededBlazars;
}

testTrade = function(race, numtrades = 1000){
	min = {};
	max = {};
	race = gamePage.diplomacy.get(race);
	if(race != null){
		for(var i = 0; i < numtrades; i++){
			tradeResults = gamePage.diplomacy.tradeInternal(race,true,null);
			for(var j in tradeResults){
				if(tradeResults[j] != 0){
					if(min[j] == undefined)
						min[j] = tradeResults[j];
					if(min[j] > tradeResults[j])
						min[j] = tradeResults[j];
					if(max[j] == undefined)
						max[j] = tradeResults[j];
					if(max[j] < tradeResults[j])
						max[j] = tradeResults[j];
				}
			}
		}
		gamePage.stats.getStat("totalTrades").val -= numtrades;
		gamePage.stats.getStatCurrent("totalTrades").val -= numtrades;
	}
	var combined = {};
	for(var i in min)
		combined[i] = {min: min[i], max: max[i]};
	return combined;
}

testTradeMultiple = function(race, numtrades = 1000){
	min = {};
	max = {};
	race = gamePage.diplomacy.get(race);
	if(race != null){
		tradeResults = gamePage.diplomacy.tradeMultiple(race,true,null);
		for(var j in tradeResults){
			if(tradeResults[j] != 0){
				if(min[j] == undefined)
					min[j] = tradeResults[j];
				if(min[j] > tradeResults[j])
					min[j] = tradeResults[j];
				if(max[j] == undefined)
					max[j] = tradeResults[j];
				if(max[j] < tradeResults[j])
					max[j] = tradeResults[j];
			}
		}
		gamePage.stats.getStat("totalTrades").val -= numtrades;
		gamePage.stats.getStatCurrent("totalTrades").val -= numtrades;
	}
	var combined = {};
	for(var i in min)
		combined[i] = {min: min[i], max: max[i]};
	return combined;
}

getRequiredResourcesAtReset = function(numChrono = -1, getScience = true, getWorkshop = true, log = 0, displayNames = true){
	chronospheres = gamePage.bld.getBuildingExt("chronosphere").meta.on;
	var chronos = numChrono;
	if(chronos < 0)
		chronos = chronospheres;
	if(chronos < 1)
		chronos = 1;
	if(log > 0){
		if(chronos == chronospheres)
			console.log("Using real number of chronospheres: " + chronos);
		else if(chronos == numChrono)
			console.log("Using hypothetical number of chronospheres: " + chronos);
		else
			console.log("Using default valid number of chronos: " + chronos);
	}
	var resources = {};
	if(getScience){
		if(log > 0)
			console.log("Gathering science prices...");
		var techs = gamePage.science.techs;
		for(var i in techs){
			var prices = techs[i].prices;
			for(var j in prices){
				if(resources[prices[j].name] == undefined)
					resources[prices[j].name] = 0;
				resources[prices[j].name] += prices[j].val;
			}
		}
	}
	if(getWorkshop){
		if(log > 0)
			console.log("Gathering workshop upgrade prices...");
		var workshops = gamePage.workshop.meta[0].meta;
		for(var i in workshops){
			var prices = workshops[i].prices;
			for(var j in prices){
				if(resources[prices[j].name] == undefined)
					resources[prices[j].name] = 0;
				resources[prices[j].name] += prices[j].val;
			}
		}
	}
	if(log > 0)
		console.log("Calculating chronosphere carryover...");
	var anachronomancy = gamePage.prestige.getPerk("anachronomancy").researched;
	var fluxCondensator = gamePage.workshop.get("fluxCondensator").researched;
	var saveRatio = 0.015 * chronos;
	if(!anachronomancy && log >= 0)
		console.log("Warning: You need Anachronomancy to carry over time crystals!")
	if(!fluxCondensator && log >= 0)
		console.log("Warning: You need Flux Condensator to carry over crafted resources!");
	var ignoreResources = ["kittens", "zebras", "unicorns", "alicorn", "tears", "furs", "ivory", "spice", "karma", "necrocorn", "gflops", "hashrates"];
	var finalCount = {};
	for(var i in resources){
		var res = gamePage.resPool.get(i);
		if(ignoreResources.indexOf(res.name) >= 0)
			continue;
		var value = 0;
		if(res.name == "timeCrystal")
			value = resources[i];
		else if(res.persists)
			value = resources[i];
		else{
			if(!res.craftable || res.name == "wood"){
				value = resources[i] / saveRatio;
				if(res.name == "void")
					value = Math.ceil(value);
			}
			else
				value = Math.pow(resources[i],2) / saveRatio / 100;
		}
		if(value > 0){
			if(displayNames)
				finalCount[res.title] = {"value": value,"displayValue": 0};
			else
				finalCount[res.name] = {"value": value,"displayValue": 0};
		}
	}
	if(log > 0)
		console.log("Calculating final display values...");
	for(var i in finalCount)
		finalCount[i].displayValue = gamePage.getDisplayValueExt(finalCount[i].value);
	return finalCount;
}

getNotFinishedResourcesForReset = function(){
	var needed = getRequiredResourcesAtReset(-1,true,true,-1,false);
	var finalCount = {};
	for(var i in needed){
		var res = gamePage.resPool.get(i);
		if(res.value < needed[i].value)
			finalCount[res.title] = {"needed": (needed[i].value - res.value),"displayValue": 0,"have": res.value,"total": needed[i].value};
	}
	for(var i in finalCount)
		finalCount[i].displayValue = gamePage.getDisplayValueExt(finalCount[i].needed);
	return finalCount;
}

generateTable = function(func, params, steps, numSteps){
	if(func.name != arguments.callee.name){
		var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;
		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		if(result === null)
			result = [];
		
		var vals = [];
		for(var i in params)
			vals[i] = params[i];
		
		result[result.length] = "Output";
		
		var finalized = [result];
		
		for(var i = 0; i <= numSteps; i++){
			finalized[finalized.length] = [];
			for(var j in vals)
				finalized[finalized.length - 1][j] = vals[j];
			var output = func.apply(this, vals);
			finalized[finalized.length - 1][finalized[finalized.length - 1].length] = output;
			for(var j in steps){
				if(steps[j] && steps[j] != 0)
					vals[j] += steps[j];
			}
		}
		return finalized;
	}
}

formatTable = function(table, headerNames = [], suffixes = [], wikiFormat = false){
	var maxLengths = [];
	for(var row in table){
		for(var col in table[row]){
			var length = 0;
			if(headerNames[col] && row == 0)
				table[row][col] = headerNames[col];
			var data = table[row][col];
			if(typeof(data) == "number")
				data = makeNiceString(data);
			data = data.toString();
			if(suffixes[col] && row > 0)
				data += suffixes[col];
			length = data.length;
			if(maxLengths[col]){
				if(maxLengths[col] <= length)
					maxLengths[col] = length + 1;
			}
			else
				maxLengths[col] = length + 1;				
		}
	}
	if(!wikiFormat){
		var output = "/";
		for(var i in maxLengths)
			output += Array(maxLengths[i] + 2).join("-");
		output = output.slice(0, -1) + "\\";
		for(var row in table){
			output += "\n |";
			if(row == 1){
				for(var i in maxLengths)
					output += Array(maxLengths[i] + 1).join("-") + "|";
				output += "\n |";
			}
			for(var col in table[row]){
				var data = table[row][col];
				if(typeof(data) == "number")
					data = makeNiceString(data);
				data = data.toString();
				if(suffixes[col] && row > 0)
					data += suffixes[col];
				output += (Array(maxLengths[col] + 1).join(" ") + data).slice(-1 * maxLengths[col]) + "|";
			}
		}
		output += "\n \\";
		for(var i in maxLengths)
			output += Array(maxLengths[i] + 2).join("-");
		output = output.slice(0, -1) + "/";
		return output;
	}
	var output = "";
	for(var row in table){
		if(output != "")
			output += "\n";
		output += "|";
		for(var col in table[row]){
			if(typeof(table[row][col]) == "number")
				output += "r {{" + (Array(maxLengths[col] + 1).join(" ") + makeNiceString(table[row][col]) + (suffixes[col]? suffixes[col] : "")).slice(-1 * maxLengths[col]) + "}}|";
			else
				output += (Array(maxLengths[col] + 1 + 6).join(" ") + table[row][col]).slice(-1 * maxLengths[col] - 6) + "|";
		}
	}
	return output;
}

//===========================================================================================
//AutoXML
//===========================================================================================

makeAutoXml = function(log = false){
	var techs = gamePage.science.techs;
	var resultString = "";
	for(var i in techs){
		if(log)
			console.log(techs[i].name);
		if(i!=0)
			resultString += "\n";
		var thisTech = "";
		thisTech += techs[i].name;
		thisTech += "|" + techs[i].label;
		thisTech += "*Prices"
		for(var j in techs[i].prices)
			thisTech += "|" + techs[i].prices[j].name + "-" + techs[i].prices[j].val;
		thisTech += "&Children";
		if(techs[i].unlocks){
			if(techs[i].unlocks.tech){
				thisTech += "*techs";
				for(var j in techs[i].unlocks.tech)
					thisTech += "|" + techs[i].unlocks.tech[j];
			}
		}
		resultString += thisTech;
	}
	return resultString;
}

//===========================================================================================
//WikiCookies
//===========================================================================================

addCookieRes = function(){
	var cookie = {//res
		name: "cookie",
		title: "WikiCookie",
		type: "rare",
		visible: true,
		calculatePerTick: false,
		aiCanDestroy: false,
		craftable: false,
		transient: true,
		persists: true,
		value: 1,
		unlocked: true,
		refundable: false
	};
	gamePage.resPool.resources.push(cookie);
	gamePage.resPool.resourceMap["cookie"] = cookie;
	gamePage.console.filters["cookie"] = {//console
		title: "WikiCookies",
		enabled: true,
		unlocked: false
	};
	for(var i in gamePage.bld.buildingGroups)//buildings
		if(gamePage.bld.buildingGroups[i].name == "other")
			gamePage.bld.buildingGroups[i].buildings.push("chatroom");
	gamePage.bld.cookieProgress = 0;
	gamePage.bld.buildingsData.push({
		name: "chatroom",
		label: "IRC Catroom",
		description: "Allowing kittens to talk to each other using the Internet Relay Cat",
		unlockRatio: 0.3,
		unlockable: true,
		prices: [
			{name: "cookie", val: 1}
		],
		priceRatio: 1.15,
		on: 0,
		val: 0,
		effects: {
			"inspiration": 0.0001,
			"cookieProgress": 0
		},
		earnCookie: function(amt = 1, cookiename = ""){
			if(cookiename == ""){
				var names = {//odds for each resource - each has so many pieces of the pie. Adding more makes the pie larger.
					"catnip": 1000,
					"wood": 900,
					"minerals": 700,
					"coal": 400,
					"iron": 500,
					"titanium": 200,
					"gold": 300,
					"oil": 500,
					"uranium": 75,
					"unobtainium": 10,
					"manpower": 900,
					"science": 1000,
					"culture": 1000,
					"faith": 500,
					"starchart": 1000,
					"antimatter": 50,
					"furs": 1000,
					"ivory": 1000,
					"spice": 1000,
					"unicorns": 100,
					"alicorns": 5,
					"necrocorns": 1,
					"tears": 25,
					"timeCrystal": 5,
					"relic": 2,
					"void": 1,
					"beam": 800,
					"slab": 600,
					"plate": 400,
					"steel": 300,
					"concrate": 200,
					"gear": 200,
					"alloy": 100,
					"eludium": 5,
					"scaffold": 700,
					"ship": 300,
					"tanker": 25,
					"kerosene": 300,
					"parchment": 800,
					"manuscript": 600,
					"compedium": 400,
					"blueprint": 200,
					"thorium": 10,
					"megalith": 200
				};
				var total = 0;
				for(var i in names){
					if(!gamePage.resPool.get(i).unlocked){
						odds = names[i];
						if(odds <= 50)
							odds = 0;
						odds = Math.sqrt(odds);
						odds /= 2;
						odds = Math.floor(odds);
						names[i] = odds;//allow potential to give you later resources, at a much reduced rate - anything under 25 initially won't get a chance
					}
					total += names[i];
				}
				var baseline = total;
				total += baseline;
				var which = Math.ceil(Math.random() * total);//spin the roulette wheel
				if(which > baseline){
					which -= baseline;
					for(var i in names)
						if(cookiename == ""){
							if(which <= names[i])
								cookiename = i;
							else
								which -= names[i];
						}
				}
			}
			if(cookiename != ""){
				var res = gamePage.resPool.get(cookiename);
				if(res){
					cookiename = res.title;
					gamePage.resPool.addResEvent(res.name,amt);
				}
				if(cookiename != "")
					cookiename += " cookie";
			}
			gamePage.resPool.get("cookie").unlocked=true;
			gamePage.resPool.addResEvent("cookie",amt);
			var earn = " earned ";
			if(amt < 0){
				earn = " lost ";
				amt = Math.abs(amt);
			}
			if(cookiename != ""){
				if(amt == 1)
					gamePage.msg("You" + earn + "one " + cookiename + "!","","cookie");
				else
					gamePage.msg("You" + earn + amt + " " + cookiename + "s!","","cookie");
			}
			else{
				if(amt == 1)
					gamePage.msg("You" + earn + "a WikiCookie!","","cookie");
				else
					gamePage.msg("You" + earn + gamePage.getDisplayValueExt(amt) + " WikiCookies!","","cookie");
			}
		},
		action: function(self, game){
			gamePage.bld.cookieProgress += self.effects["inspiration"] * self.on;
			if(gamePage.bld.cookieProgress >= 1){
				self.earnCookie(Math.floor(gamePage.bld.cookieProgress));
				gamePage.bld.cookieProgress -= Math.floor(gamePage.bld.cookieProgress);
			}
			self.effects["progress"] = gamePage.bld.cookieProgress * 100;
		},
		flavor: "Trout? My favorite!"
	});
	gamePage.bld.getPricesWithAccessor = function(bld) {
	 	var bldPrices = bld.get('prices');
		var ratio = this.getPriceRatioWithAccessor(bld);

		var prices = [];

		for (var i = 0; i< bldPrices.length; i++){
			prices.push({
				val: bldPrices[i].val * Math.pow(ratio, bld.get('val')),
				name: bldPrices[i].name
			});
			if(prices[prices.length - 1].name == "cookie")
				prices[prices.length - 1].val = Math.ceil(prices[prices.length - 1].val);
		}
	    return prices;
	 };
}

addCookieRes();

//===========================================================================================
//Notes for functions to keep in mind
//===========================================================================================

gamePage.getHyperbolicEffect(75000,100); // Gets diminishing returns. Input actual, limit to approach, and result will come out.
1 + gamePage.getResCraftRatio({name:"blueprint"}); // Gets how many of resource are produced per individual craft

//===========================================================================================
//Extra plain-text notes
//===========================================================================================

Time Crystals per sacrifice of 25 alicorns:
	unicornUtopia.val * 0.05 + sunspire.val * 0.1 + 1 -> This should be everything that affects it. Could be added to in the future.
	1 + game.getEffect("tcRefineRatio") -> This is how the game calculates it. This should equal the above number.

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

//===========================================================================================
//Quick chart of paragon worth-it tipping points
//===========================================================================================

/*Tipping point means it's worth it for the given effect as soon as you have the listed
amount.
For instance, Malkuth's "Prod" is at 618. That means that if you buy Malkuth when you have
618 paragon, your production will stay the same or go up. If you buy it before, it'll
decrease, and if you buy it after, it'll increase more.
Malkuth's "Storage" is at 10.5k. This means that your caps for resources will decrease if
you buy Malkuth before you have 10.5k paragon, and it will increase if you buy it after
10.5k. If you buy it with exactly 10.5k, it will stay the same.
*/

/-----------------------------------------------\
| Sephirot	|	Cost	|	Prod	|	Storage	|
| --------- | --------- | --------- | --------- |
| Malkuth	|	500		|	618		|	10.5k	|
| Yesod		|	750		|	880		|	16.5k	|
| Hod		|	1250	|	1394	|	28.75k	|
| Netzach	|	1750	|	1906	|	42k		|
| Tiferet	|	2500	|	2669	|	62.5k	|
| Gevurah	|	5000	|	5182	|	130k	|
| Chesed	|	7500	|	7695	|	202.5k	|
| Binah		|	15000	|	15209	|	420k	|
| Chokhmah	|	30000	|	30221	|	870k	|
| Keter		|	60000	|	60233	|	1.8M	|
\-----------------------------------------------/