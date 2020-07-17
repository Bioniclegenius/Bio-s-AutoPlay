autoGame = function(){
    autoPlay();
}
 
autoPlay = function(){
    for(var x in gamePage.bld.buildingGroups)
        for(var y in gamePage.bld.buildingGroups[x].buildings){
            var building=gamePage.bld.buildingGroups[x].buildings[y];
            if(gamePage.bld.getBuildingExt(building).meta.val<goals.getGoal(building))
                autoBuild(building);
        }
    if(gamePage.bld.getBuildingExt("field").meta.val==0)
        autoClick(0,"bonfire");
    for(var i in goals.res){
        if(goals.res[i].type=="resource"){
            if(goals.getAutoCraft(i)>0 && goals.getAutoCraft(i)<=100)
                autoCraftPerc(goals.res[i].name,goals.getAutoCraft(i));
        }
    }
    goals.resetCraftVals();
    extraHook();
    for(var i in goals.res){
        if(goals.res[i].type=="resource"){
            if(gamePage.resPool.get(goals.res[i].name).value<goals.getGoal(goals.res[i].name))
                autoCraftMin(goals.res[i].name);
        }
        if(goals.res[i].type=="science" && !goals.metGoal(i))
            autoClick(goals.res[i].name,"science");
        if(goals.res[i].type=="workshop" && !goals.metGoal(i))
            autoClick(goals.res[i].name,"workshop");
        if(goals.res[i].type=="space" && gamePage.space.getBuilding(goals.res[i].name).val<goals.getGoal(i))
            autoClick(goals.res[i].name,"space",goals.getMaxGoal(i))
        if(goals.res[i].type=="trade" && gamePage.diplomacy.get(goals.res[i].name).unlocked){
            var maxTrade=Math.floor(gamePage.resPool.get("manpower").value/50);
            maxTrade=Math.min(maxTrade,Math.floor(gamePage.resPool.get("gold").value/15));
            var buys=gamePage.diplomacy.get(goals.res[i].name).buys;
            for(var j in buys)
                maxTrade=Math.min(maxTrade,Math.floor(gamePage.resPool.get(buys[j].name).value/buys[j].val));
            if(maxTrade >= Math.abs(goals.getGoal(i)) && goals.getGoal(i)!=0 && maxTrade > 0){
				if(maxTrade > Math.abs(goals.getGoal(i)) && goals.getGoal(i) < 0)
					maxTrade = Math.abs(goals.getGoal(i));
                gamePage.diplomacy.tradeMultiple(gamePage.diplomacy.get(goals.res[i].name),maxTrade);
				if(goals.getGoal("log") == 2)
					console.log("Traded with "+gamePage.diplomacy.get(goals.res[i].name).title+" "+maxTrade+" time"+(maxTrade!=1?"s":"")+".");
            }
        }
        if(goals.res[i].type=="religion" && gamePage.religion.getRU(goals.res[i].name).val<goals.getGoal(i))
            autoClick(goals.res[i].name,"religion",goals.getMaxGoal(i));
        if(goals.res[i].type=="ziggurat" && gamePage.religion.getZU(goals.res[i].name).val<goals.getGoal(i))
            autoClick(goals.res[i].name,"religion",goals.getMaxGoal(i));
        if(goals.res[i].type=="transcend" && gamePage.religion.getTU(goals.res[i].name).val<goals.getGoal(i))
            autoClick(goals.res[i].name,"religion",goals.getMaxGoal(i));
        if(goals.res[i].type=="special"){
            if(goals.res[i].name=="feedLevi"){
                if(goals.getGoal(i)!=0 && gamePage.diplomacy.get("leviathans").unlocked && gamePage.resPool.get("necrocorn").value >= goals.getGoal("necrocorn")+1){
					var energyCap = gamePage.religion.getZU("marker").val * 5 + 5;
					if(gamePage.diplomacy.get("leviathans").energy < energyCap){
						gamePage.diplomacy.feedElders();
						if(goals.getGoal("log") != 0)
							console.log("Fed leviathans. New energy level: " + gamePage.diplomacy.get("leviathans").energy + "/" + energyCap);
					}
				}
            }
			if(goals.res[i].name=="autoUnicorn"){
				if(goals.getGoal(i)!=0){
					var buildings=["unicornPasture","unicornTomb","ivoryTower","ivoryCitadel","skyPalace","unicornUtopia","sunspire"]
					for(var j in buildings)
						goals.setGoal(buildings[j],0);
					goals.setGoal(getBestUniBuilding(),-1);
				}
			}
			if(goals.res[i].name=="autoHunt")
				if(autoFunc("manpower")&&goals.getGoal(i)!=0)
					gamePage.village.huntAll();
			if(goals.res[i].name=="autoPraise"){
				if(goals.getGoal("autoApoReset") != 0 && gamePage.religion.getProductionBonus() > goals.getGoal("autoApoReset") && autoFunc("faith")){
					gamePage.religionTab.resetFaithInternal(1.01);
					if(goals.getGoal("log") == 2)
						console.log("Apocrypha faith resetting...");
				}
				if(autoFunc("faith") && goals.getGoal("autoPraise") != 0)
					gamePage.religion.praise();
			}
			if(goals.res[i].name=="autoShatter"){
				if(goals.getGoal(i)!=0 && gamePage.time.heat == 0 && gamePage.resPool.get("timeCrystal").value >= goals.getGoal(i)){
					var cycleName = gamePage.calendar.cycles[gamePage.calendar.cycle].name;
					if(goals.res[cycleName] == undefined)
						cycleName += "11";
					var skipCycle = true;
					if(goals.res[cycleName] != undefined)
						skipCycle = (goals.getGoal(cycleName) != 0);
					if(gamePage.timeTab.visible && skipCycle){
						if(gamePage.timeTab.children[2].visible){
							var btn = gamePage.timeTab.children[2].children[0].children[0];
							if(btn.model==undefined){
								curTab=gamePage.ui.activeTabId;
								gamePage.ui.activeTabId = "Time";
								gamePage.ui.render();
								gamePage.ui.activeTabId = curTab;
								gamePage.ui.render();
								btn = gamePage.timeTab.children[2].children[0].children[0];
							}
							if(btn.model != undefined)
								btn.controller.doShatterAmt(btn.model,1,callback=function(result){if(result)btn.update();},goals.getGoal(i));
						}
					}
				}
			}
        }
    }
    if(gamePage.calendar.observeBtn)
        gamePage.calendar.observeHandler();
	manageJobs();
}

manageJobs = function(log = false){
	var jobs = goals.getType("job");
	for(var i = 0;i < jobs.length;i++)
		if(!gamePage.village.getJob(jobs[i].name).unlocked){
			jobs.splice(i,1);
			i -= 1;
		}
	if(log)
		console.log(jobs);
	for(var i in jobs){
		if(goals.getMaxGoal(jobs[i].name) - gamePage.village.getJob(goals.res[jobs[i].name].name).value < 0 && goals.res[jobs[i].name].val != -2)
			gamePage.village.sim.removeJob(goals.res[jobs[i].name].name);
	}
	var freeKittens = gamePage.village.getFreeKittens();
	if(freeKittens > 0){
		var maxdif = 1;
		var chosenJob = [];
		for(var i in jobs){
			var dif = goals.getMaxGoal(jobs[i].name) - gamePage.village.getJob(goals.res[jobs[i].name].name).value;
			if(dif == Infinity)
				dif = 1;
			if(dif > maxdif){
				maxdif = dif;
				chosenJob = [];
				chosenJob.push(jobs[i].name);
			}
			else if(dif == maxdif)
				chosenJob.push(jobs[i].name);
		}
		if(chosenJob.length > 1){
			jobs = [];
			for(var i in chosenJob)
				jobs.push(chosenJob[i]);
			var min = gamePage.village.getJob(goals.res[jobs[0]].name).value;
			chosenJob = jobs[0];
			for(var i in jobs)
				if(gamePage.village.getJob(goals.res[jobs[i]].name).value < min){
					min = gamePage.village.getJob(goals.res[jobs[i]].name).value;
					chosenJob = jobs[i];
				}
			gamePage.village.assignJob(goals.res[chosenJob]);
		}
		else if(chosenJob.length == 1)
			gamePage.village.assignJob(goals.res[chosenJob[0]]);
	}
}
 
roundThisNumber = function(num){
    num*=1000;
    num+=.5;
    num=Math.floor(num);
    num/=1000;
    return num;
}
 
getButton = function(tab, buttonName){
	for(var i in gamePage.tabs[tab].buttons){
		if(gamePage.tabs[tab].buttons[i].opts.building == buttonName)
			return parseInt(i);
	}
}

getBestUniBuilding = function(log=false){
	var validBuildings = ["unicornTomb","ivoryTower","ivoryCitadel","skyPalace","unicornUtopia","sunspire"];
	var pastureButton = getButton(0,"unicornPasture");
	var unicornsPerSecond = gamePage.getEffect("unicornsPerTickBase") * gamePage.getRateUI();
	var globalRatio = gamePage.getEffect("unicornsGlobalRatio")+1;
	var religionRatio = gamePage.getEffect("unicornsRatioReligion")+1;
	var paragonRatio = gamePage.prestige.getParagonProductionRatio()+1;
	var faithBonus = gamePage.religion.getProductionBonus()/100+1;
	var cycle = 1;
	if(gamePage.calendar.cycles[gamePage.calendar.cycle].festivalEffects["unicorns"]!=undefined)
		if(gamePage.prestige.getPerk("numeromancy").researched && gamePage.calendar.festivalDays)
			cycle=gamePage.calendar.cycles[gamePage.calendar.cycle].festivalEffects["unicorns"];
	var onZig = Math.max(gamePage.bld.getBuildingExt("ziggurat").meta.on,1);
	var total = unicornsPerSecond * globalRatio * religionRatio * paragonRatio * faithBonus * cycle;
	var baseUnicornsPerRift = 500 * (1 + gamePage.getEffect("unicornsRatioReligion") * 0.1);
	var riftChanceRatio = 1;
	if(gamePage.prestige.getPerk("unicornmancy").researched)
		riftChanceRatio *= 1.1;
	var baseRift = gamePage.getEffect("riftChance") * riftChanceRatio / (10000 * 2) * baseUnicornsPerRift;
	if(log){
		console.log("Unicorns per second: "+total);
		console.log("Base rift per second average: "+baseRift);
	}
	var bestAmoritization = Infinity;
	var bestBuilding = "";
	var pastureAmor = gamePage.bld.getBuildingExt("unicornPasture").meta.effects["unicornsPerTickBase"] * gamePage.getRateUI();
	pastureAmor = pastureAmor * globalRatio * religionRatio * paragonRatio * faithBonus * cycle;
	if(log){
		console.log("unicornPasture");
		console.log("\tBonus unicorns per second: "+pastureAmor);
	}
	pastureAmor = gamePage.tabs[0].buttons[pastureButton].model.prices[0].val / pastureAmor;
	if(log){
		var baseWait = gamePage.tabs[0].buttons[pastureButton].model.prices[0].val / total;
		var avgWait = gamePage.tabs[0].buttons[pastureButton].model.prices[0].val / (total + baseRift);
		console.log("\tMaximum time to build: " + gamePage.toDisplaySeconds(baseWait) + " | Average time to build: " + gamePage.toDisplaySeconds(avgWait));
		console.log("\tPrice: "+gamePage.tabs[0].buttons[pastureButton].model.prices[0].val+" | Amortization: "+gamePage.toDisplaySeconds(pastureAmor));
	}
	if(pastureAmor < bestAmoritization){
		bestAmoritization = pastureAmor;
		bestBuilding = "unicornPasture";
	}
	for(var i in gamePage.tabs[5].zgUpgradeButtons){
		var btn = gamePage.tabs[5].zgUpgradeButtons[i];
		if(validBuildings.indexOf(btn.id)!=-1){
			if(btn.model.visible){
				unicornPrice = 0;
				for(var j in btn.model.prices){
					if(btn.model.prices[j].name=="unicorns")
						unicornPrice += btn.model.prices[j].val;
					if(btn.model.prices[j].name=="tears")
						unicornPrice += btn.model.prices[j].val * 2500 / onZig;
				}
				var bld=gamePage.religion.getZU(btn.id);
				var relBonus = religionRatio;
				var riftChance = gamePage.getEffect("riftChance");
				for(var j in bld.effects){
					if(j=="unicornsRatioReligion")
						relBonus += bld.effects[j]
					if(j=="riftChance")
						riftChance += bld.effects[j];
				}
				var unicornsPerRift = 500 * ((relBonus -1) * 0.1 +1);
				var riftBonus = riftChance * riftChanceRatio / (10000 * 2) * unicornsPerRift;
				riftBonus -= baseRift;
				var amor = unicornsPerSecond * globalRatio * relBonus * paragonRatio * faithBonus * cycle;
				amor -= total;
				amor = amor + riftBonus;
				if(log){
					console.log(btn.id);
					console.log("\tBonus unicorns per second: "+amor);
				}
				amor = unicornPrice / amor;
				if(log){
					var baseWait = unicornPrice / total;
					var avgWait = unicornPrice / (total + baseRift);
					var amorSeconds = gamePage.toDisplaySeconds(amor);
					if(amorSeconds == "")
						amorSeconds = "NA";
					console.log("\tMaximum time to build: " + gamePage.toDisplaySeconds(baseWait) + " | Average time to build: " + gamePage.toDisplaySeconds(avgWait));
					console.log("\tPrice: "+unicornPrice + " | Amortization: "+amorSeconds);
				}
				if(amor < bestAmoritization)
					if(riftBonus > 0 || relBonus > religionRatio && unicornPrice > 0){
						bestAmoritization = amor;
						bestBuilding = btn.id;
					}
			}
		}
	}
	return bestBuilding;
}
 
extraHook = function(){
}
 
goals = {
    initialized: false,
    res: {},
    setup: function(){
        for(var i in gamePage.resPool.resources)
            this.res[gamePage.resPool.resources[i].name] = {
                name: gamePage.resPool.resources[i].name,
                val: 0,
                type: "resource",
                craftVal: 0,
                manVal: 0,
                blacklisted: false,
                autoCraftPerc: 0
            };
        for(var x in gamePage.bld.buildingGroups){
            for(var y in gamePage.bld.buildingGroups[x].buildings){
                var bld = gamePage.bld.getBuildingExt(gamePage.bld.buildingGroups[x].buildings[y]);
                var name = bld.meta.name;
                if(this.res[name] != null)
                    name=name + "2";
                this.res[name] = {
                    name: bld.meta.name,
                    val: 0,
                    type: "building"
                };
            }
        }
        for(var i in gamePage.science.techs){
            var name = gamePage.science.techs[i].name;
            if(this.res[name] != null)
                name=name + "3";
            this.res[name] = {
                name: gamePage.science.techs[i].name,
                val: 0,
                type: "science"
            };
        }
        for(var i in gamePage.workshop.meta[0].meta){
            var name = gamePage.workshop.meta[0].meta[i].name;
            if(this.res[name] != null)
                name = name + "4";
            this.res[name] = {
                name: gamePage.workshop.meta[0].meta[i].name,
                val: 0,
                type: "workshop"
            };
        }
        for(var i in gamePage.space.meta){
            for(var j in gamePage.space.meta[i].meta){
                var name = gamePage.space.meta[i].meta[j].name;
                if(this.res[name] != null)
                    name = name + "5";
                this.res[name] = {
                    name: gamePage.space.meta[i].meta[j].name,
                    val: 0,
                    type: "space"
                };
            }
        }
        for(var i in gamePage.diplomacy.races){
            var name = gamePage.diplomacy.races[i].name;
            if(this.res[name] != null)
                name = name + "6";
            this.res[name] = {
                name: gamePage.diplomacy.races[i].name,
                val: 0,
                type: "trade"
            };
        }
        for(var i in gamePage.religion.religionUpgrades){
            var name = gamePage.religion.religionUpgrades[i].name;
            if(this.res[name] != null)
                name = name + "7";
            this.res[name] = {
                name: gamePage.religion.religionUpgrades[i].name,
                val: 0,
                type: "religion"
            };
        }
        for(var i in gamePage.religion.zigguratUpgrades){
            var name = gamePage.religion.zigguratUpgrades[i].name;
            if(this.res[name] != null)
                name = name + "8";
            this.res[name] = {
                name: gamePage.religion.zigguratUpgrades[i].name,
                val: 0,
                type: "ziggurat"
            };
        }
        for(var i in gamePage.religion.transcendenceUpgrades){
            var name = gamePage.religion.transcendenceUpgrades[i].name;
            if(this.res[name] != null)
                name=name + "9";
            this.res[name] = {
                name: gamePage.religion.transcendenceUpgrades[i].name,
                val: 0,
                type: "transcend"
            };
        }
        for(var i in gamePage.village.jobs){
            var name = gamePage.village.jobs[i].name;
            if(this.res[name] != null)
                name = name + "10";
            this.res[name] = {
                name: gamePage.village.jobs[i].name,
                val: -2,
                type: "job"
            };
        }
		for(var i in gamePage.calendar.cycles){
			var name = gamePage.calendar.cycles[i].name;
			if(this.res[name] != null)
				name = name + "11";
			this.res[name] = {
				name: gamePage.calendar.cycles[i].name,
				val: 1,
				type: "cycle"
			};
		}
        this.res["feedLevi"] = {
            name: "feedLevi",
            val: 0,
            type: "special"
        };
        this.res["autoUnicorn"] = {
            name: "autoUnicorn",
            val: 0,
            type: "special"
        };
		this.res["autoHunt"] = {
			name: "autoHunt",
			val: 0,
			type: "special"
		};
		this.res["autoApoReset"] = {
			name: "autoApoReset",
			val: 0,
			type: "special"
		};
		this.res["autoPraise"] = {
			name: "autoPraise",
			val: 0,
			type: "special"
		};
		this.res["autoShatter"] = {
			name: "autoShatter",
			val: 0,
			type: "special"
		};
		this.res["log"] = {
			name: "log",
			val: 2,
			type: "special"
		};
		this.res["aiLevel"] = {
			name: "aiLevel",
			val: 0,
			type: "special"
		};
        this.initialized = true;
        this.res.field.val = 1;
        this.res.wood.blacklisted = true;
        this.res.beam.blacklisted = true;
        this.res.slab.blacklisted = true;
		this.res.plate.blacklisted = true;
        this.setAutoCraft("wood",25);
        this.setAutoCraft("beam",25);
        this.setAutoCraft("slab",25);
        this.setAutoCraft("plate",25);
    },
	getType: function(type){
		if(!this.initialized)
			this.setup();
		var types = [];
		for(var i in this.res)
			if(this.res[i].type == type)
				types.push({name: i, val: this.res[i].val});
		return types;
	},
    getGoal: function(resource){
        if(!this.initialized)
            this.setup();
        if(this.res[resource] != undefined){
            if(this.res[resource].type == "building" && this.res[resource].val == -1)
                return gamePage.bld.getBuildingExt(resource).meta.val + 1;
            if(this.res[resource].type == "resource"){
                var tempVal = this.res[resource].val;
                if(this.res[resource].val == -1)
                    tempVal = gamePage.resPool.get(resource).value + 1;
                if(tempVal < this.res[resource].craftVal)
                    tempVal = this.res[resource].craftVal;
                if(tempVal < this.res[resource].manVal)
                    tempVal = this.res[resource].manVal;
                return tempVal;
            }
            if(this.res[resource].type == "science" && this.res[resource].val == -1)
                return 1;
            if(this.res[resource].type == "space" && this.res[resource].val == -1)
                return gamePage.space.getBuilding(this.res[resource].name).val + 1;
            if(this.res[resource].type == "religion" && this.res[resource].val == -1){
                if(gamePage.religion.getRU(this.res[resource].name).noStackable)
                    return 1;
                return gamePage.religion.getRU(this.res[resource].name).val + 1;
            }
            if(this.res[resource].type == "ziggurat" && this.res[resource].val == -1)
                return gamePage.religion.getZU(this.res[resource].name).val + 1;
            if(this.res[resource].type == "transcend" && this.res[resource].val == -1)
                return gamePage.religion.getTU(this.res[resource].name).val + 1;
			if(this.res[resource].type == "job" && this.res[resource].val == -1)
				return gamePage.village.getJob(this.res[resource].name).value + 1;
            return this.res[resource].val;
        }
        return 0;
    },
    getRealGoal: function(resource){
        if(!this.initialized)
            this.setup();
        if(this.res[resource]!=undefined){
            returnZero=['building','resource','science','space','ziggurat','transcend'];
            if(returnZero.indexOf(this.res[resource].type) != -1 && this.res[resource].val == -1)
                return 0;
            if(this.res[resource].type == "religion" && this.res[resource].val == -1){
                if(gamePage.religion.getRU(this.res[resource].name).noStackable)
                    return 1;
                return 0;
            }
            return this.res[resource].val;
        }
        return 0;
    },
    setGoal: function(resource,value){
        if(!this.initialized)
            this.setup();
        if(this.res[resource] != undefined)
            this.res[resource].val = value;
		if(resource == "autoUnicorn"){
			var buildings = ["unicornPasture","unicornTomb","ivoryTower","ivoryCitadel","skyPalace","unicornUtopia","sunspire"]
			for(var j in buildings)
				goals.setGoal(buildings[j],0);
		}
        return this.res[resource];
    },
    setType: function(type,value){
        if(!this.initialized)
            this.setup();
        for(var i in this.res){
            if(this.res[i].type == type)
                this.setGoal(i,value);
        }
    },
    metGoal: function(resource){
        if(!this.initialized)
            this.setup();
        if(this.res[resource] != undefined){
            if(this.res[resource].type == "resource"){
                if(gamePage.resPool.get(this.res[resource].name).value >= this.getRealGoal(resource))
                    return true;
                return false;
            }
            if(this.res[resource].type == "building"){
                if(gamePage.bld.getBuildingExt(this.res[resource].name).meta.val >= this.res[resource].val)
                    return true;
                return false;
            }
            if(this.res[resource].type == "science"){
                if(this.res[resource].val > 0){
                    for(var i in gamePage.science.techs)
                        if(gamePage.science.techs[i].name == this.res[resource].name)
                            return gamePage.science.techs[i].researched;
                }
                return true;
            }
            if(this.res[resource].type == "workshop"){
                if(this.res[resource].val > 0){
                    for(var i in gamePage.workshop.meta[0].meta)
                        if(gamePage.workshop.meta[0].meta[i].name == this.res[resource].name)
                            return gamePage.workshop.meta[0].meta[i].researched;
                }
                return true;
            }
            if(this.res[resource].type == "space"){
                if(this.res[resource].val > 0){
                    if(gamePage.space.getBuilding(this.res[resource].name).val < this.getRealGoal(resource))
                        return false;
                }
                return true;
            }
            if(this.res[resource].type == "religion"){
                if(gamePage.religion.getRU(this.res[resource].name).val < this.getRealGoal(resource))
                    return false;
                return true;
            }
            if(this.res[resource].type == "ziggurat"){
                if(gamePage.religion.getZU(this.res[resource].name).val < this.getRealGoal(resource))
                    return false;
                return true;
            }
            if(this.res[resource].type == "transcend"){
                if(gamePage.religion.getTU(this.res[resource].name).val < this.getRealGoal(resource))
                    return false;
                return true;
            }
			if(this.res[resource].type == "job"){
				if(gamePage.village.getJob(this.res[resource].name).value < this.getRealGoal(resource))
					return false;
				return true;
			}
        }
        return true;
    },
    setAutoCraft: function(resource,percent){
        if(!this.initialized)
            this.setup();
        if(this.res[resource] != undefined){
            if(this.res[resource].type == "resource"){
                this.res[resource].autoCraftPerc = Math.max(Math.min(percent,100),0);
				return this.res[resource];
			}
        }
    },
    getAutoCraft: function(resource){
        if(!this.initialized)
            this.setup();
        if(this.res[resource] != undefined)
            if(this.res[resource].type == "resource")
                return this.res[resource].autoCraftPerc;
        return 0;
    },
    resetCraftVals: function(){
        if(!this.initialized)
            this.setup();
        for(var i in this.res){
            if(this.res[i].type == "resource")
                this.res[i].craftVal = 0;
        }
        var changed = true;
        while(changed){
            changed = false;
            for(var i in this.res){
                if(this.res[i].type == "resource"){
                    if(this.getGoal(i) > gamePage.resPool.get(this.res[i].name).value){
                        var craft = gamePage.workshop.getCraft(this.res[i].name);
                        if(craft != null){
                            for(var j in craft.prices){
                                var price = {
                                    name: craft.prices[j].name,
                                    val: craft.prices[j].val
                                };
                                price.val = Math.ceil(price.val * 1000) / 1000;
                                if(gamePage.workshop.getCraft(price.name) != null && this.res[price.name].blacklisted == false)
                                    if(this.getGoal(price.name)-this.getRealGoal(price.name)<price.val&&this.res[price.name].val>=0){
                                        this.res[price.name].craftVal=price.val+this.getRealGoal(price.name);
                                        changed=true;
                                    }
                            }
                        }
                    }
                }
                if(this.res[i].type=="building"){
                    if(this.getGoal(i)>gamePage.bld.getBuildingExt(this.res[i].name).meta.val){
                        var prices=gamePage.bld.getPrices(this.res[i].name);
                        if(prices!=null){
                            var canBuild=true;
                            for(var j in prices){
                                var price={
                                    name: prices[j].name,
                                    val: prices[j].val
                                };
                                if(gamePage.resPool.get(price.name)!=null)
                                    if(price.val>gamePage.resPool.get(price.name).maxValue&&gamePage.resPool.get(price.name).maxValue>0&&price.val>gamePage.resPool.get(price.name).value){
                                        canBuild=false;
                                        break;
                                    }
                            }
                            if(canBuild){
                                for(var j in prices){
                                    var price={
                                        name: prices[j].name,
                                        val: prices[j].val
                                    };
                                    price.val=Math.ceil(price.val*1000)/1000;
                                    if(gamePage.workshop.getCraft(price.name)!=null&&this.res[price.name].blacklisted==false)
                                        if(this.getGoal(price.name)<price.val&&this.res[price.name].val>=0){
                                            this.res[price.name].craftVal=price.val;
                                            changed=true;
                                        }
                                }
                            }
                        }
                    }
                }
                if(this.res[i].type=="space"){
                    if(this.getGoal(i)>gamePage.space.getBuilding(this.res[i].name).val){
                        var prices=gamePage.space.getBuilding(this.res[i].name).prices;
                        if(prices!=null){
                            var priceRatio=gamePage.space.getBuilding(this.res[i].name).priceRatio;
                            var reductionRatio = game.getHyperbolicEffect(game.getEffect("oilReductionRatio"), 0.75);
                            var num=gamePage.space.getBuilding(this.res[i].name).val;
                            for(var j in prices){
                                var price={
                                    name: prices[j].name,
                                    val: prices[j].val
                                };
                                if(price.name!=="oil"){
                                    price.val*=Math.pow(priceRatio,num);
                                }
                                else{
                                    price.val*=Math.pow(1.05,num);
                                    price.val*=(1-reductionRatio);
                                }
                                price.val=Math.ceil(price.val*1000)/1000;
                                if(gamePage.workshop.getCraft(price.name)!=null&&this.res[price.name].blacklisted==false)
                                    if(this.getGoal(price.name)<price.val&&this.res[price.name].val>=0){
                                        this.res[price.name].craftVal=price.val;
                                        changed=true;
                                    }
                            }
                        }
                    }
                }
                if(this.res[i].type=="ziggurat"){
                    if(this.getGoal(i)>gamePage.religion.getZU(this.res[i].name).val){
                        for(var j in gamePage.tabs[5].zgUpgradeButtons){
                            if(gamePage.tabs[5].zgUpgradeButtons[j].id==this.res[i].name && gamePage.tabs[5].zgUpgradeButtons[j].model.visible){
                                var prices=gamePage.tabs[5].zgUpgradeButtons[j].model.prices;
                                for(var k in prices){
                                    if(gamePage.workshop.getCraft(prices[k].name)!=null && this.res[prices[k].name].blacklisted==false){
                                        if(this.getGoal(prices[k].name)<prices[k].val&&this.res[prices[k].name].val>=0){
                                            this.res[prices[k].name].craftVal=prices[k].val;
                                            changed=true;
                                        }
                                    }
                                    else if(this.res[prices[k].name].blacklisted==false && prices[k].name=="tears"){
                                        if(this.getGoal(prices[k].name)<prices[k].val&&this.res[prices[k].name].val>=0){
                                            this.res[prices[k].name].craftVal=prices[k].val;
                                            changed=true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    getMaxGoal: function(resource){
        if(!this.initialized)
            this.setup();
        if(this.res[resource]==undefined)
            return 0;
        var val=this.res[resource].val;
        if(val==-1)
            return Infinity;
        var tempVal=0;
        if(this.res[resource].craftVal!=undefined)
            tempVal=this.res[resource].tempVal;
        val=Math.max(val,tempVal);
        if(this.res[resource].manVal!=undefined)
            tempVal=this.res[resource].manVal;
        val=Math.max(val,tempVal);
        return val;
    },
	export: function(){
		var str = "";
		var toSave=[];
		for(var i in goals.res){
			if(goals.res[i].val!=0 || goals.res[i].blacklisted || goals.res[i].autoCraftPerc || goals.res[i].craftVal || goals.res[i].manVal)
				toSave.push(i);
		}
		toSave.sort(function (a,b){return a.toLowerCase().localeCompare(b.toLowerCase())});
		for(var i in toSave){
			if(goals.res[ toSave[i] ].val!=0)
				str += "\ngoals.res[\"" + toSave[i] + "\"].val = " + goals.res[ toSave[i] ].val + ";";
			if(goals.res[ toSave[i] ].craftVal)
				str += "\ngoals.res[\"" + toSave[i] + "\"].craftVal = " + goals.res[ toSave[i] ].craftVal + ";";
			if(goals.res[ toSave[i] ].manVal)
				str += "\ngoals.res[\"" + toSave[i] + "\"].manVal = " + goals.res[ toSave[i] ].manVal + ";";
			if(goals.res[ toSave[i] ].autoCraftPerc)
				str += "\ngoals.res[\"" + toSave[i] + "\"].autoCraftPerc = " + goals.res[ toSave[i] ].autoCraftPerc + ";";
			if(goals.res[ toSave[i] ].blacklisted)
				str += "\ngoals.res[\"" + toSave[i] + "\"].blacklisted = true;";
		}
		str += "\n";
		return str;
	}
}
 
autoFunc = function(resource){
    var res=gamePage.resPool.get(resource);
    return (res.value>=res.maxValue);
}
 
autoCraftMin = function(resource){
    var res=gamePage.workshop.getCraft(resource);
    if(res!=null){
        var prices=gamePage.workshop.getCraftPrice(res);
        var canCraft=gamePage.resPool.get(resource).unlocked;
        if(res.value==res.maxValue)
            canCraft=false;
        var res0name=prices[0].name;
        var maxCount=Math.floor((gamePage.resPool.get(res0name).value-goals.getRealGoal(res0name))/prices[0].val);
        for(var i=0;i<prices.length;i++){
            if(gamePage.resPool.get(prices[i].name).value-goals.getRealGoal(prices[i].name)<prices[i].val)
                canCraft=false;
            var thisPrice=Math.floor((gamePage.resPool.get(prices[i].name).value-goals.getRealGoal(prices[i].name))/prices[i].val);
            if(thisPrice<maxCount)
                maxCount=thisPrice;
        }
        if(canCraft&&maxCount>0){
            if((goals.res[resource].val>0||goals.res[resource].craftVal>0||goals.res[resource].manVal>0)
                &&maxCount>Math.ceil((goals.getGoal(resource)-gamePage.resPool.get(resource).value)/(gamePage.workshop.game.getResCraftRatio(resource)+1)))
                maxCount=Math.ceil((goals.getGoal(resource)-gamePage.resPool.get(resource).value)/(gamePage.workshop.game.getResCraftRatio(resource)+1))
            gamePage.workshop.craft(resource,maxCount);
        }
    }
    if(resource == "tears"){
        if(gamePage.bld.getBuildingExt("ziggurat").meta.on > 0){
            var maxSacrifice = Math.floor(gamePage.resPool.get("unicorns").value/2500);
            var neededSacrifice = Math.ceil((goals.getGoal("tears") - gamePage.resPool.get("tears").value) / gamePage.bld.getBuildingExt("ziggurat").meta.on)
			if(neededSacrifice <= maxSacrifice && neededSacrifice > 0)
				gamePage.religionTab.sacrificeBtn.controller._transform(gamePage.religionTab.sacrificeBtn.model,neededSacrifice);
        }
    }
}
 
autoCraftPerc = function(resource,percent){
    var res=gamePage.workshop.getCraft(resource);
    var prices=gamePage.workshop.getCraftPrice(res);
    var canCraft=gamePage.resPool.get(resource).unlocked;
    if(res.value==res.maxValue)
        canCraft=false;
    for(var i=0;i<prices.length;i++){
        if(!autoFunc(prices[i].name))
            canCraft=false;
        if(Math.floor(gamePage.resPool.get(prices[i].name).maxValue*percent/100.0/prices[i].val<1))
            canCraft=false;
    }
    var res2=gamePage.resPool.get(prices[0].name);
    if(canCraft){
        gamePage.workshop.craft(resource,Math.floor(res2.maxValue*percent/100.0/prices[0].val));
    }
}
 
autoBuild = function(building){
    var prices=gamePage.bld.getPrices(building);
    var canBuild=gamePage.bld.getBuildingExt(building).meta.unlocked;
    for(var i=0;i<prices.length;i++){
        var res=gamePage.resPool.get(prices[i].name);
        if(res.value<prices[i].val)
            canBuild=false;
    }
    if(!gamePage.bld.getBuildingExt(building).meta.unlocked)
        canBuild=false;
    if(canBuild){
        btns=gamePage.tabs[0].buttons;
        for(var i=2;i<btns.length;i++){
            if(btns[i].model.metadata.name==building)
                autoClick(i,"bonfire",goals.getMaxGoal(building));
        }
    }
    return canBuild;
}
 
autoClick = function(buttonName,tabName="bonfire",goal=0){
    var curTab = gamePage.ui.activeTabId;
    var tab=-1;
    var button=-1;
    if(typeof(tabName)=="string"){
        for(var i in gamePage.tabs)
            if(gamePage.tabs[i].tabName.toLowerCase()==tabName.toLowerCase())
                tab=i;
    }
    else if(typeof(tabName)=="number"){
        if(tabName>=0 && tabName<gamePage.tabs.length)
            tab=tabName;
    }
    if(tab>=0){
        if(typeof(buttonName)=="string"){
            if(gamePage.tabs[tab].tabName.toLowerCase()!="space" && gamePage.tabs[tab].tabName.toLowerCase()!="religion"){
                for(var i in gamePage.tabs[tab].buttons)
                    if(gamePage.tabs[tab].buttons[i].id.toLowerCase()==buttonName.toLowerCase())
                        button=i;
            }
            else if(gamePage.tabs[tab].tabName.toLowerCase()=="religion"){
                var tempButtons = gamePage.tabs[tab].rUpgradeButtons;
                tempButtons=tempButtons.concat(gamePage.tabs[tab].zgUpgradeButtons);
                tempButtons=tempButtons.concat(gamePage.tabs[tab].children[0].children[0].children);
                for(var i in tempButtons){
                    if(tempButtons[i].id.toLowerCase()==buttonName.toLowerCase())
                        button=i;
                }
            }
            else if(gamePage.tabs[tab].tabName.toLowerCase()=="space"){
                var tempButtons = gamePage.tabs[tab].GCPanel.children;
                for(var i in gamePage.tabs[tab].planetPanels)
                    tempButtons=tempButtons.concat(gamePage.tabs[tab].planetPanels[i].children);
                for(var i in tempButtons)
                    if(tempButtons[i].id.toLowerCase()==buttonName.toLowerCase())
                        button=i;
            }
        }
        else if(typeof(buttonName)=="number"){
            if(buttonName>=0 && buttonName<gamePage.tabs[tab].buttons.length)
                button=buttonName;
        }
        if(button>=0){
            var btns=gamePage.tabs[tab].buttons;
            if(gamePage.tabs[tab].tabName.toLowerCase()=="space"){
                btns=gamePage.tabs[tab].GCPanel.children;
                for(var i in gamePage.tabs[tab].planetPanels)
                    btns=btns.concat(gamePage.tabs[tab].planetPanels[i].children);
            }
            else if(gamePage.tabs[tab].tabName.toLowerCase()=="religion"){
                btns=gamePage.tabs[tab].rUpgradeButtons;
                btns=btns.concat(gamePage.tabs[tab].zgUpgradeButtons);
                btns=btns.concat(gamePage.tabs[tab].children[0].children[0].children);
            }
            var prices=btns[button].model.prices;
            var canBuy=true;
            for(var i in prices)
                if(gamePage.resPool.get(prices[i].name).value<prices[i].val)
                    canBuy=false;
            if(btns[button].model.visible==false)
                canBuy=false;
            if(btns[button].enabled==false)
                canBuy=false;
            if(canBuy){
                if(curTab!=gamePage.tabs[tab].tabId){
                    gamePage.ui.activeTabId = gamePage.tabs[tab].tabId;
                    gamePage.ui.render();
                }
                btns[button].controller.buyItem(btns[button].model,1,
                    function(result){
                        if(result){
                            btns[button].update();
                            if(btns[button].model.name!=undefined){
								if(goals.getGoal("log") != 0){
									if(goals.getGoal("log") == 2){
										console.log(btns[button].model.name+" ("+gamePage.tabs[tab].tabName+")"+(goal!=0?" goal: "+goal:""));
									}
									else if(goals.getGoal("log") == 1){
										var quantity = 0;
										tabName = gamePage.tabs[tab].tabName.toLowerCase();
										if(tabName == "bonfire" || tabName == "religion" || tabName == "space")
											quantity = btns[button].model.metadata.val;
										else if(tabName == "science" || tabName == "workshop")
											quantity = (btns[button].model.metadata.researched ? 1 : 0);
										if((quantity == goal && goal != 0) || goal <= 0 || goal == Infinity)
											console.log(btns[button].model.name+" ("+gamePage.tabs[tab].tabName+")"+(goal!=0?" goal: "+goal:""));
									}
									if(tab!=0&&tab!=6)
										console.log("\t"+btns[button].model.description.replace("<br>","\n\t"))
								}
                            }
                        }
                    });
                if(curTab!=gamePage.ui.activeTabId)
                    gamePage.ui.activeTabId=curTab;
                gamePage.ui.render();
                return true;
            }
        }
    }
    if(curTab != gamePage.ui.activeTabId){
        gamePage.ui.activeTabId = curTab;
        gamePage.ui.render();
    }
    return false;
}
 
gamePage.timer.addEvent(autoGame,1);
